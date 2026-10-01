#!/usr/bin/env python3
"""
Garde-fou anti-dérive des décomptes (v0.7.4).

Compare les décomptes RÉELS du disque — mêmes règles que build-interface.py :
  - skills = tout fichier SKILL.md sous skills/
  - agents = tout fichier .md sous agents/
— aux décomptes annoncés dans les docs (README, MEGA-PACK.md, INSTALL.txt…) et
aux artefacts générés (interface/catalog-full.js, menubar-app-luxe/test-app.sh).

Contexte : les docs ont longtemps annoncé 131/132 skills (réalité 133 au 23/09/2026),
puis 133 alors que le disque était passé à 136 (skills llm-provider-cascade,
headroom-compression, cognee-memory ajoutés pendant les versions 2.13→2.18 sans
régénération du catalogue). Ce script empêche que la dérive se reproduise : à chaque
skill/agent ajouté, les docs doivent suivre — sinon exit 1.

Usage :
  python3 scripts/verify-counts.py            # depuis la racine agent-skills/
  python3 scripts/verify-counts.py --update   # met à jour les décomptes obsolètes (docs ciblés)
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# ── Décomptes RÉELS (mêmes règles que build-interface.py) ──────────────────
real_skills = 0
for dirpath, _, filenames in os.walk("skills"):
    real_skills += sum(1 for fn in filenames if fn == "SKILL.md")
real_agents = 0
for dirpath, _, filenames in os.walk("agents"):
    real_agents += sum(1 for fn in filenames if fn.endswith(".md"))
real_experts = real_skills + real_agents

# ── Artefacts générés : catalog-full.js doit être régénéré, pas réécrit à la main ──
errors = []
catalog_meta = None
catalog_path = "interface/catalog-full.js"
if os.path.exists(catalog_path):
    code = open(catalog_path, encoding="utf-8").read()
    try:
        catalog = json.loads(re.search(r"const MEGA_CATALOG = (\{.*\});", code, re.S).group(1))
        catalog_meta = catalog["meta"]
        cat_skills, cat_agents = len(catalog["skills"]), len(catalog["agents"])
        if cat_skills != real_skills or cat_agents != real_agents:
            errors.append(
                f"{catalog_path} annonce {cat_skills} skills / {cat_agents} agents "
                f"mais le disque en a {real_skills} / {real_agents} → lance : python3 build-interface.py"
            )
    except Exception as e:
        errors.append(f"{catalog_path} illisible ({e})")
else:
    errors.append(f"{catalog_path} absent → lance : python3 build-interface.py")

# ── Catalogues embarqués inline (HTML non régénérés par build-interface.py) ──
# Leur bloc « // Skills: n | Agents: m » doit refléter le réel — sinon divergence.
for emb in ("interface/panel-demo-inline.html",):
    if os.path.exists(emb):
        txt = open(emb, encoding="utf-8").read()
        for m in re.finditer(r"// Skills: (\d+) \| Agents: (\d+)", txt):
            s_n, a_n = int(m.group(1)), int(m.group(2))
            if s_n != real_skills or a_n != real_agents:
                errors.append(
                    f"{emb} embarque un catalogue {s_n}/{a_n} (réel : {real_skills}/{real_agents}) "
                    f"→ resynchronise le bloc MEGA_CATALOG"
                )

# ── Docs : balayage des mentions « N skills » / « N experts » / « N items » ──
# Chaque mention trouvée doit égaler le décompte réel (les écarts datés d'une
# version passée — p. ex. « 133 skills installés » dans l'historique v0.7.3 —
# doivent être reformulés pour ne plus ressembler à un décompte courant).
DOC_FILES = [
    "README.md", "MEGA-PACK.md", "INSTALL.txt", "COMMANDES-ET-AGENTS.md",
    "plugin.json", ".codex-plugin/plugin.json", ".agents/plugins/marketplace.json",
    "menubar-app-luxe/README.md", "menubar-app/README.md", "menubar-app-v2/README.md",
    "interface/README-EN.md", "interface/LISEZMOI-INTERFACE.md",
    "interface/panel-demo-inline.html",
    "menubar-app/build-app.sh", "menubar-app-v2/build-app.sh",
]
PAT = re.compile(r"\b(\d{2,4})\s+(skills|experts|items|agents|workflows)\b")

def scan_file(path):
    """Retourne la liste (ligne_no, nombre, unité) dont le nombre diverge du réel."""
    if not os.path.exists(path):
        return None  # fichier absent : ignoré silencieusement
    out = []
    expected = {"skills": real_skills, "experts": real_experts, "items": real_experts,
                "agents": real_agents, "workflows": real_skills}
    for i, line in enumerate(open(path, encoding="utf-8"), 1):
        if '"desc"' in line:
            continue  # descriptions de skills tiers (« ce pack contient 103/818 skills ») :
                      # ces nombres décrivent le CONTENU d'un skill, pas le catalogue.
        for m in PAT.finditer(line):
            n, unit = int(m.group(1)), m.group(2)
            if unit in expected and n != expected[unit] and n >= 100:
                out.append((i, n, unit))
    return out

# Motifs génériques de rattrapage — DYNAMIQUES : toute valeur connue (ancien
# décompte) est remplacée par le réel du jour, donc --update reste correct après
# chaque évolution du disque (180→270→272→…). Complété par le mode divergence
# ci-dessous, qui réécrit tout nombre divergent quel qu'il soit.
_KNOWN_OLD_SKILLS = [180, 177, 136]
_KNOWN_OLD_EXPERTS = [411, 408, 323]
_KNOWN_OLD_PAIRS = [(180, 231), (177, 231), (136, 190)]
_COUNT_PAIRS = []
for _n in _KNOWN_OLD_SKILLS:
    _COUNT_PAIRS.append((rf"\b{_n} skills", f"{real_skills} skills"))
    _COUNT_PAIRS.append((rf"\b{_n} workflows", f"{real_skills} workflows"))
for _n in _KNOWN_OLD_EXPERTS:
    _COUNT_PAIRS.append((rf"\b{_n} experts", f"{real_experts} experts"))
    _COUNT_PAIRS.append((rf"\b{_n} items", f"{real_experts} items"))
for _s, _a in _KNOWN_OLD_PAIRS:
    _COUNT_PAIRS.append((rf"\b{_s} · {_a}\b", f"{real_skills} · {real_agents}"))
    _COUNT_PAIRS.append((rf"\b{_s}·{_a}\b", f"{real_skills}·{real_agents}"))
AUTO_FIX = [(p, _COUNT_PAIRS) for p in DOC_FILES]

# Unités attendues pour un remplacement divergent → réel.
_UNIT_REAL = {"skills": lambda: real_skills, "workflows": lambda: real_skills,
              "experts": lambda: real_experts, "items": lambda: real_experts,
              "agents": lambda: real_agents}

def fix_divergences(path):
    """Réécrit tout « N unité » divergent (hors lignes "desc") par le réel.
    Retourne le nombre de remplacements. Piloté par scan_file : dynamique par
    construction — plus jamais de liste d'anciens décomptes à entretenir."""
    stale = scan_file(path)
    if not stale:
        return 0
    lines = open(path, encoding="utf-8").readlines()
    bad = {i: [(n, unit) for (li, n, unit) in stale if li == i] for i, _, _ in stale}
    changed = 0
    for i, pairs in bad.items():
        for n, unit in pairs:
            real = _UNIT_REAL[unit]()
            # Remplace TOUTES les occurrences « N unité » de cette ligne
            # (une même ligne peut porter deux décomptes, ex. « 501 experts : 270 skills »).
            pat = re.compile(rf"\b{n}\s+{unit}\b")
            new_line, k = pat.subn(str(real) + " " + unit, lines[i - 1])
            if k:
                lines[i - 1] = new_line
                changed += k
    if changed:
        open(path, "w", encoding="utf-8").writelines(lines)
    return changed

if "--update" in sys.argv:
    total = 0
    for path, pairs in AUTO_FIX:
        if not os.path.exists(path):
            continue
        s = open(path, encoding="utf-8").read()
        for pat, repl in pairs:
            s = re.sub(pat, repl, s)
        open(path, "w", encoding="utf-8").write(s)
        total += fix_divergences(path)
        print(f"  mis à jour : {path}")
    print(f"  ({total} divergence(s) réécrite(s) par le mode dynamique)")
    print("Relance sans --update pour vérifier.")
    sys.exit(0)

print(f"Réel du disque : {real_skills} skills · {real_agents} agents · {real_experts} experts")
problems = 0
for path in DOC_FILES:
    stale = scan_file(path)
    if stale:
        for line_no, n, unit in stale:
            print(f"  ✗ {path}:{line_no} annonce {n} {unit} (réel : "
                  f"{real_skills if unit == 'skills' else real_agents if unit == 'agents' else real_experts})")
            problems += 1

for err in errors:
    print(f"  ✗ {err}")
    problems += 1

if problems:
    print(f"\n❌ {problems} divergence(s) — mets à jour les docs (ou --update) puis régénère le catalogue.")
    sys.exit(1)
print("\n✅ Décomptes cohérents : docs ↔ interface/catalog-full.js ↔ disque")
