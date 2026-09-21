#!/usr/bin/env python3
"""Complète interface/i18n-fr.json avec les entrées manquantes du catalogue.

Chaque entrée manquante est ajoutée avec desc vide ("") — il ne reste qu'à
remplir les traductions, puis relancer `python3 build-interface.py`.

Usage :  python3 build-i18n-template.py    (depuis la racine agent-skills/)
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

# Lit le catalogue généré
with open("interface/catalog-full.js", encoding="utf-8") as f:
    code = f.read()
code = re.sub(r"^//.*$", "", code, flags=re.M)
catalog = json.loads(code[code.index("{"):code.rindex("}") + 1])

path = "interface/i18n-fr.json"
try:
    with open(path, encoding="utf-8") as f:
        i18n = json.load(f)
except Exception:
    i18n = {}

added = 0
for lst in ("skills", "agents"):
    for item in catalog[lst]:
        if item["name"] not in i18n:
            i18n[item["name"]] = {"name": None, "desc": ""}
            added += 1

# Tri : entrées non traduites (desc vide) en premier, puis alpha
def sort_key(kv):
    return (kv[1].get("desc", "") != "", kv[0].lower())

i18n = dict(sorted(i18n.items(), key=sort_key))

with open(path, "w", encoding="utf-8") as f:
    json.dump(i18n, f, ensure_ascii=False, indent=2)
    f.write("\n")

total = len(i18n)
todo = sum(1 for v in i18n.values() if not v.get("desc"))
print("OK — %d entrée(s) ajoutée(s) · total %d · restant à traduire : %d" % (added, total, todo))
