#!/usr/bin/env python3
"""
Générateur d'interface MEGA PACK.
Régénère interface/catalog-full.js depuis skills/ et agents/ du maître.
Usage : python3 build-interface.py   (depuis la racine agent-skills/)
"""
import re, json, os

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


out = {
    "meta": {"generated": "2026-09-23", "version": "0.7.2",
             "skills": len(skills), "agents": len(agents)},
    "skills": [{"name": s["name"], "desc": s["desc"],
                "category": cat_skill(s["path"]), "path": s["path"]} for s in skills],
    "agents": [{"name": a["name"], "desc": a["desc"],
                "category": cat_agent(a["path"]), "path": a["path"],
                "model": a["model"], "tools": a["tools"]} for a in agents],
}

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

with open("interface/catalog-full.js", "w") as f:
    f.write("// Catalogue complet MEGA PACK v%s — généré par build-interface.py\n" % out["meta"]["version"])
    f.write("// Skills: %d | Agents: %d\n" % (len(skills), len(agents)))
    f.write("const MEGA_CATALOG = ")
    json.dump(out, f, ensure_ascii=False, indent=1)
    f.write(";\n")

# Synchronise aussi le catalogue embarqué du launcher HTML (source de vérité unique)
launcher_path = "interface/mega-pack-launcher.html"
if os.path.exists(launcher_path):
    with open(launcher_path, encoding="utf-8") as f:
        html = f.read()
    start = html.index("// Catalogue complet MEGA PACK")
    end = html.index("window.MEGA_CATALOG = MEGA_CATALOG;")
    new_block = (
        "// Catalogue complet MEGA PACK v%s — généré par build-interface.py\n" % out["meta"]["version"]
        + "// Skills: %d | Agents: %d\n" % (len(skills), len(agents))
        + "const MEGA_CATALOG = "
        + json.dumps(out, ensure_ascii=False, indent=1)
        + ";\n"
    )
    with open(launcher_path, "w", encoding="utf-8") as f:
        f.write(html[:start] + new_block + html[end:])
    print("OK — launcher synchronisé avec le catalogue")

print("OK — interface/catalog-full.js régénéré : %d skills, %d agents" % (len(skills), len(agents)))
