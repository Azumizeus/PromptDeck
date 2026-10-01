#!/usr/bin/env python3
"""
Générateur d'interface MEGA PACK.
Régénère interface/catalog-full.js depuis skills/ et agents/ du maître.
Usage : python3 build-interface.py             (depuis la racine agent-skills/)
        python3 build-interface.py --self-test (test de préservation des champs, n'écrit rien)

🛡 Préservation des métadonnées (fix 0.7.4+ / doc AGENTS-SOURCE-DE-VERITE.md) :
les frontmatters des agents sont sur liste blanche (name/description/mode/color) —
les champs model/tools/emoji ont été retirés des .md. Une régénération naïve les
perdrait donc. Ce builder fusionne l'ANCIEN catalogue (mémoire) avec l'état du
DISQUE :
  - `model`, `tools`      : repris de l'ancienne entrée (même `path`) si le .md ne
                            les porte plus ; ce que le .md définit reste prioritaire ;
  - `name_fr`, `desc_fr`  : repris de l'ancienne entrée, puis complétés/écrasés par
                            interface/i18n-fr.json (canal officiel des traductions) ;
  - date de génération    : la date du jour, plus la version figée en tête de fichier.
"""
import re, json, os
from datetime import date

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)


def clean(text):
    return text.replace("\r\n", "\n").replace("\r", "\n")


def parse_skill(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        text = clean(f.read(4000))
    m = re.search(r'^---\n(.*?)\n---', text, re.S)
    if not m:
        return None
    fm = m.group(1)
    name = re.search(r'(?m)^name:\s*(.+?)\s*$', fm)
    desc = re.search(r'(?m)^description:\s*(.+?)\s*$', fm)
    name = name.group(1).strip() if name else os.path.basename(os.path.dirname(path))
    d = desc.group(1).strip().strip('"').strip("'") if desc else ""
    if d.startswith(">") or d.startswith("|") or d == "":
        m2 = re.search(r'(?m)^description:\s*[>|]?\s*\n((?:\s{2,}.*\n)+)', fm)
        if m2:
            d = " ".join(l.strip() for l in m2.group(1).splitlines())
    return {"name": name, "desc": d[:300], "path": path.replace("SKILL.md", "")}


def parse_agent(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        text = clean(f.read(3000))
    m = re.search(r'^---\n(.*?)\n---', text, re.S)
    name = os.path.basename(path).replace(".md", "")
    desc = model = tools = ""
    if m:
        fm = m.group(1)
        n = re.search(r'(?m)^name:\s*(.+?)\s*$', fm)
        d = re.search(r'(?m)^description:\s*(.+?)\s*$', fm)
        mo = re.search(r'(?m)^model:\s*(.+?)\s*$', fm)
        t = re.search(r'(?m)^tools:\s*(.+?)\s*$', fm)
        if n:
            name = n.group(1).strip()
        if d:
            desc = d.group(1).strip().strip('"').strip("'")
        if mo:
            model = mo.group(1).strip()
        if t:
            tools = t.group(1).strip()
    if not desc:
        body = text[m.end():] if m else text
        for line in body.splitlines():
            s = line.strip()
            if s and not s.startswith("#") and not s.startswith("---"):
                desc = s
                break
    return {"name": name, "desc": desc[:300], "path": path, "model": model, "tools": tools}


skills = []
for dirpath, _, filenames in os.walk("skills"):
    for fn in filenames:
        if fn == "SKILL.md":
            s = parse_skill(os.path.join(dirpath, fn))
            if s:
                skills.append(s)

agents = []
for dirpath, _, filenames in os.walk("agents"):
    for fn in filenames:
        if fn.endswith(".md"):
            agents.append(parse_agent(os.path.join(dirpath, fn)))

skills.sort(key=lambda x: x["path"])
agents.sort(key=lambda x: x["path"])


def cat_skill(path):
    parts = path.split("/")
    return parts[1] if len(parts) > 2 else "core"


def cat_agent(path):
    parts = path.split("/")
    return parts[1] if len(parts) > 2 else "core"


# ── Mémoire : l'ancien catalogue sert de source pour model/tools/FR ─────────
CATALOG_PATH = "interface/catalog-full.js"
old_agents = {}
old_skills = {}
try:
    with open(CATALOG_PATH, encoding="utf-8") as f:
        _src = f.read()
    # Le fichier est du JS : extraire le JSON strict entre `const MEGA_CATALOG = ` et le `;` final.
    _m = re.search(r'const MEGA_CATALOG = (.*);\s*\Z', _src, re.S)
    if not _m:
        raise ValueError("const MEGA_CATALOG introuvable")
    _old = json.loads(_m.group(1))
    old_agents = {a["path"]: a for a in _old.get("agents", [])}
    old_skills = {s["path"]: s for s in _old.get("skills", [])}
except FileNotFoundError:
    print("WARN — ancien catalogue absent : première génération, rien à préserver")
except Exception as e:
    print("WARN — ancien catalogue illisible :", e)

out = {
    "meta": {"generated": date.today().isoformat(), "version": "0.8.0",
             "skills": len(skills), "agents": len(agents)},
    "skills": [{"name": s["name"], "desc": s["desc"],
                "category": cat_skill(s["path"]), "path": s["path"]} for s in skills],
    "agents": [{"name": a["name"], "desc": a["desc"],
                "category": cat_agent(a["path"]), "path": a["path"],
                "model": a["model"], "tools": a["tools"]} for a in agents],
}

# Préservation model/tools : ce que le disque définit reste prioritaire, sinon mémoire.
restored = 0
for item in out["agents"]:
    prev = old_agents.get(item["path"])
    if not prev:
        continue
    if not item["model"] and prev.get("model"):
        item["model"] = prev["model"]
        restored += 1
    if not item["tools"] and prev.get("tools"):
        item["tools"] = prev["tools"]
        restored += 1
    # FR depuis l'ancien catalogue (sera écrasé par i18n-fr.json si présent)
    if prev.get("name_fr") and "name_fr" not in item:
        item["name_fr"] = prev["name_fr"]
    if prev.get("desc_fr") and "desc_fr" not in item:
        item["desc_fr"] = prev["desc_fr"]

# FR skills depuis l'ancien catalogue (le builder ne lit pas les traductions du disque)
for item in out["skills"]:
    prev = old_skills.get(item["path"])
    if prev:
        if prev.get("name_fr") and "name_fr" not in item:
            item["name_fr"] = prev["name_fr"]
        if prev.get("desc_fr") and "desc_fr" not in item:
            item["desc_fr"] = prev["desc_fr"]

# Fusionne les traductions FR optionnelles (interface/i18n-fr.json)
# Format : { "nom-catalogue": {"name": "Nom FR", "desc": "Description FR"}, ... }
i18n_path = "interface/i18n-fr.json"
i18n = {}
if os.path.exists(i18n_path):
    try:
        with open(i18n_path, encoding="utf-8") as f:
            i18n = json.load(f)
    except Exception as e:
        print("WARN — i18n-fr.json illisible :", e)
applied = 0
for _lst in ("skills", "agents"):
    for _item in out[_lst]:
        _tr = i18n.get(_item["name"])
        if _tr:
            if _tr.get("name"):
                _item["name_fr"] = _tr["name"]
            if _tr.get("desc"):
                _item["desc_fr"] = _tr["desc"]
            applied += 1
print("i18n FR : %d traduction(s) appliquée(s)" % applied)
print("préservation : %d champ(s) model/tools restaurés depuis l'ancien catalogue" % restored)


def write_outputs():
    with open(CATALOG_PATH, "w") as f:
        f.write("// Catalogue complet MEGA PACK v%s — généré par build-interface.py\n" % out["meta"]["version"])
        f.write("// Skills: %d | Agents: %d\n" % (len(skills), len(agents)))
        f.write("const MEGA_CATALOG = ")
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write(";\n")

    # Synchronise aussi les catalogues embarqués HTML (source de vérité unique) :
    # launcher + banc d'essai inline (mêmes marqueurs début/fin).
    new_block = (
        "// Catalogue complet MEGA PACK v%s — généré par build-interface.py\n" % out["meta"]["version"]
        + "// Skills: %d | Agents: %d\n" % (len(skills), len(agents))
        + "const MEGA_CATALOG = "
        + json.dumps(out, ensure_ascii=False, indent=1)
        + ";\n"
    )
    for emb_path in ("interface/mega-pack-launcher.html", "interface/panel-demo-inline.html"):
        if not os.path.exists(emb_path):
            continue
        with open(emb_path, encoding="utf-8") as f:
            html = f.read()
        if "// Catalogue complet MEGA PACK" not in html or "window.MEGA_CATALOG = MEGA_CATALOG;" not in html:
            print("WARN — %s : marqueurs de catalogue introuvables, non synchronisé" % emb_path)
            continue
        start = html.index("// Catalogue complet MEGA PACK")
        end = html.index("window.MEGA_CATALOG = MEGA_CATALOG;")
        with open(emb_path, "w", encoding="utf-8") as f:
            f.write(html[:start] + new_block + html[end:])
        print("OK — %s synchronisé avec le catalogue" % emb_path)


if "--self-test" in os.sys.argv:
    # 🧪 Auto-test : rejoue la fusion sur un état en mémoire et échoue si un champ
    # préservable serait perdu. N'écrit RIEN.
    if not old_agents and not old_skills:
        print("❌ SELF-TEST IMPOSSIBLE — ancien catalogue illisible ou absent, rien à comparer")
        raise SystemExit(2)
    checked = 0
    problems = []
    for item in out["agents"]:
        prev = old_agents.get(item["path"])
        if not prev:
            continue
        for field in ("model", "tools", "name_fr", "desc_fr"):
            if prev.get(field):
                checked += 1
                if not item.get(field):
                    problems.append("%s : %s perdu (présent dans l'ancien catalogue)" % (item["path"], field))
    for item in out["skills"]:
        prev = old_skills.get(item["path"])
        if not prev:
            continue
        for field in ("name_fr", "desc_fr"):
            if prev.get(field):
                checked += 1
                if not item.get(field):
                    problems.append("%s : %s perdu (présent dans l'ancien catalogue)" % (item["path"], field))
    if not checked:
        print("❌ SELF-TEST VACUEUX — 0 champ comparable entre l'ancien et le nouveau catalogue")
        raise SystemExit(2)
    if problems:
        print("❌ SELF-TEST ÉCHOUÉ — %d champ(s) seraient perdus :" % len(problems))
        for p in problems[:10]:
            print("   ✗ " + p)
        raise SystemExit(1)
    print("✅ SELF-TEST OK — %d champ(s) model/tools/FR comparés, tous préservés (%d agents, %d skills)" % (checked, len(out["agents"]), len(out["skills"])))
    raise SystemExit(0)

write_outputs()
print("OK — interface/catalog-full.js régénéré : %d skills, %d agents" % (len(skills), len(agents)))
