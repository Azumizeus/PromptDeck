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
        for m in PAT.finditer(line):
            n, unit = int(m.group(1)), m.group(2)
            if unit in expected and n != expected[unit] and n >= 100:
                out.append((i, n, unit))
    return out

AUTO_FIX = [
    ("README.md", [(r"\b133 skills", f"{real_skills} skills")]),
    ("INSTALL.txt", [(r"\b133 skills", f"{real_skills} skills"), (r"\b323 items", f"{real_experts} items"),
                     (r"\b323 experts", f"{real_experts} experts")]),
    ("COMMANDES-ET-AGENTS.md", [(r"\(133\)", f"({real_skills})"), (r"\b133 skills", f"{real_skills} skills")]),
    ("menubar-app-luxe/README.md", [(r"\b133 skills", f"{real_skills} skills"), (r"\b323 experts", f"{real_experts} experts")]),
]

if "--update" in sys.argv:
    for path, pairs in AUTO_FIX:
        if not os.path.exists(path):
            continue
        s = open(path, encoding="utf-8").read()
        for pat, repl in pairs:
            s = re.sub(pat, repl, s)
        open(path, "w", encoding="utf-8").write(s)
        print(f"  mis à jour : {path}")
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
