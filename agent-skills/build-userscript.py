#!/usr/bin/env python3
"""Génère interface/mega-pack-panel-full.user.js : le panneau MEGA PACK avec
le catalogue complet EMBARQUÉ dedans — installable dans Tampermonkey (ou
l'extension Safari « Userscripts ») sans fichier externe ni serveur.

Usage :  python3 build-userscript.py    (depuis agent-skills/)
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
INT = os.path.join(HERE, "interface")

with open(os.path.join(INT, "catalog-full.js")) as f:
    catalog = f.read().strip()

with open(os.path.join(INT, "mega-pack-panel.user.js")) as f:
    panel = f.read()

# Le bloc de métadonnées doit rester tout en haut pour Tampermonkey.
MARK = "// ==/UserScript=="
end = panel.index(MARK) + len(MARK)
header, body = panel[:end], panel[end:]

# Version FULL : nom + description mis à jour dans les métadonnées.
# (la @version est héritée telle quelle du panel de base — garder les deux en sync)
header = header.replace(
    "// @name         MEGA PACK Panel — Skills & Agents pour tout LLM",
    "// @name         MEGA PACK Panel FULL — catalogue embarqué",
).replace(
    "// @description  Panneau flottant activable par bouton : 131 skills + 190 agents injectables comme prompts dans n'importe quelle conversation LLM (Claude, ChatGPT, Gemini, Perplexity, Mistral, OpenCode Web…)",
    "// @description  Panneau flottant avec catalogue complet embarqué : 131 skills + 190 agents injectables dans n'importe quelle conversation LLM — aucun fichier externe requis.",
)

full = (
    header
    + "\n\n// ── Catalogue complet embarqué (généré par build-userscript.py) ───────────\n"
    + catalog
    + "\nwindow.MEGA_CATALOG = MEGA_CATALOG; // une const globale n'existe pas sur window\n"
    + body
)

out = os.path.join(INT, "mega-pack-panel-full.user.js")
with open(out, "w") as f:
    f.write(full)

print("OK — %s (%d Ko)" % (out, os.path.getsize(out) // 1024))
