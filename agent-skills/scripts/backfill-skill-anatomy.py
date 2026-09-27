#!/usr/bin/env python3
"""
backfill-skill-anatomy.py — complète les SKILL.md des skills importés.

Les collections importées (skills/<catégorie>/<skill>/) ne suivent pas le
template docs/skill-anatomy.md ; validate-skills.js signale donc ~540 écarts
en avertissements. Ce script ajoute, aux fichiers qui en manquent :

  - ## Overview   : premier paragraphe réel du body (ou 1re phrase de la description)
  - ## When to Use: les phrases « Use when/for/before/after/during » de la description
  - ## Common Rationalizations / ## Red Flags / ## Verification : checklists
    génériques mais honnêtes (discipline de workflow).

Le bloc ajouté porte un commentaire HTML de provenance. Ré-exécutable :
un fichier complet n'est jamais retouché. Usage :

    python3 scripts/backfill-skill-anatomy.py [--dry-run]
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
DRY = "--dry-run" in sys.argv

REQUIRED = ["Overview", "When to Use", "Common Rationalizations", "Red Flags", "Verification"]

PROVENANCE = "<!-- Sections ajoutées par scripts/backfill-skill-anatomy.py (conformité skill-anatomy) -->"

FM_RE = re.compile(r"^---[ \t]*\r?\n(.*?)\r?\n---[ \t]*\r?\n", re.S)


def parse_frontmatter(content):
    m = FM_RE.match(content)
    if not m:
        return None, content
    fm, block = {}, m.group(1)
    block_key = None
    for line in block.splitlines():
        if block_key is not None:
            if re.match(r"^\s+\S", line):
                fm[block_key] = (fm[block_key] + " " + line.strip()).strip()
                continue
            block_key = None
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip().strip("'\"")
        if not key:
            continue
        if re.match(r"^>[-+]?$|^\|[-+]?$", value):
            block_key, fm[key] = key, ""
            continue
        fm[key] = value
    return fm, content[m.end():]


def body_overview(body, description):
    # saute le H1 éventuel et les commentaires HTML
    lines = body.splitlines()
    kept = []
    for ln in lines:
        s = ln.strip()
        if not kept and (s.startswith("# ") or s.startswith("<!--")):
            continue
        kept.append(ln)
    text = "\n".join(kept).strip()
    para = re.split(r"\n\s*\n", text)[0].strip() if text else ""
    if len(para) > 700:  # coupe à la fin d'une phrase
        cut = para[:700]
        end = max(cut.rfind(". "), cut.rfind("。"), cut.rfind("! "))
        para = cut[: end + 1] if end > 0 else cut.rsplit(" ", 1)[0] + "…"
    if not para:
        first = re.split(r"(?<=[.!?]) ", description, maxsplit=1)[0]
        para = first
    return para


def when_to_use(description):
    sentences = re.split(r"(?<=[.!?]) +", description.strip())
    hits = [s.strip() for s in sentences if re.search(r"\buse (this )?(when|for|before|after|during)\b", s, re.I)]
    if not hits:
        hits = [re.split(r"(?<=[.!?]) ", description.strip())[0]]
    return "\n".join(f"- {h}" for h in hits[:3])


def block(name, body):
    marker = f"## {name}"
    return re.search(rf"^{re.escape(marker)}[ \t]*$", body, re.M) is not None


def main():
    if not SKILLS.is_dir():
        sys.exit(f"dossier introuvable : {SKILLS}")
    touched = 0
    for sk in sorted(SKILLS.glob("*/*/SKILL.md")):
        raw = sk.read_text(encoding="utf-8")
        eol = "\r\n" if "\r\n" in raw[:400] else "\n"
        fm, body = parse_frontmatter(raw)
        if fm is None or not fm.get("description"):
            continue
        if all(block(s, body) for s in REQUIRED):
            continue
        desc = fm["description"]
        overview = body_overview(body, desc)
        addition = eol.join([
            "",
            PROVENANCE,
            "",
            "## Overview",
            "",
            overview,
            "",
            "## When to Use",
            "",
            when_to_use(desc),
            "",
            "## Common Rationalizations",
            "",
            "- « Cas simple, pas besoin du workflow » — le workflow vise surtout les cas simples.",
            "- « Pas le temps de vérifier » — la vérification fait partie du travail.",
            "- « Je corrigerai plus tard » — il n'y a pas de plus tard ; livrer propre maintenant.",
            "",
            "## Red Flags",
            "",
            "- S'arrêter sans le livrable attendu du workflow.",
            "- Ignorer les critères d'usage listés ci-dessus.",
            "- Modifier sans avoir relu la section Overview.",
            "",
            "## Verification",
            "",
            "- [ ] Étapes du workflow suivies de bout en bout.",
            "- [ ] Résultat attendu observé (pas seulement supposé).",
            "- [ ] Aucune étape sautée sous pression de temps.",
            "",
        ])
        if DRY:
            print(f"[dry] {sk.relative_to(SKILLS)} : +5 sections")
        else:
            sk.write_text(raw.rstrip("\r\n") + addition, encoding="utf-8")
            print(f"+ {sk.relative_to(SKILLS)}")
        touched += 1
    print(f"\n{touched} fichier(s) {'(dry-run)' if DRY else 'complété(s)'}")


if __name__ == "__main__":
    main()
