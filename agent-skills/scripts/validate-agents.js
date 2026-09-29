#!/usr/bin/env node
// 🛡 Validateur des agents — source de vérité (voir docs/AGENTS-SOURCE-DE-VERITE.md).
// Vérifie, sur agents/ vs interface/catalog-full.js :
//   1. chaque .md a un frontmatter avec name + description ;
//   2. frontmatter sur LISTE BLANCHE (name/description/mode/color) — un champ inconnu
//      bloque le chargement de TOUS les agents dans OpenCode ;
//   3. `name` unique dans tout le repo et sans collision avec les built-ins OpenCode ;
//   4. `mode` ∈ {primary, subagent, all} quand présent, `color` hex ou enum quand présent ;
//   5. couverture exacte : le catalogue référence chaque fichier (0 manquant, 0 fantôme).
// Usage : node scripts/validate-agents.js        (exit 1 à la première famille d'erreurs)
//         node scripts/validate-agents.js --quiet (résumé seul)
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = process.env.MGP_VALIDATE_ROOT
  ? path.resolve(process.env.MGP_VALIDATE_ROOT)
  : path.join(__dirname, "..");
const AGENTS = path.join(ROOT, "agents");
const CATALOG = path.join(ROOT, "interface", "catalog-full.js");

const ALLOWED_KEYS = new Set(["name", "description", "mode", "color"]);
const MODES = new Set(["primary", "subagent", "all"]);
const COLOR_HEX = /^#[0-9a-fA-F]{6}$/;
const COLOR_ENUM = new Set(["primary", "secondary", "accent", "success", "warning", "error", "info"]);
const OC_BUILTINS = new Set(["build", "plan", "general", "explore", "compaction", "summary", "title"]);

const quiet = process.argv.includes("--quiet");
const errors = [];

function readCatalog() {
  const src = fs.readFileSync(CATALOG, "utf8");
  const sandbox = {};
  // Le catalogue déclare `const MEGA_CATALOG = {...}` — eval isolé, aucun accès réseau/disque.
  eval(src.replace(/^const /, "var ") + ";sandbox.C = MEGA_CATALOG;");
  return sandbox.C;
}

function listAgentFiles(dir, base) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    const rel = base ? base + "/" + e.name : e.name;
    if (e.isDirectory()) out.push(...listAgentFiles(p, rel));
    else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out.sort();
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = { keys: {}, unknown: [] };
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!km) continue;
    const key = km[1];
    if (!ALLOWED_KEYS.has(key)) { fm.unknown.push(key); continue; }
    fm.keys[key] = km[2].trim().replace(/^["']|["']$/g, "");
  }
  return fm;
}

const files = listAgentFiles(AGENTS, "");
const catalog = readCatalog();
const catPaths = new Set(catalog.agents.map((a) => a.path));

// 1-4 : frontmatter de chaque fichier
const seenNames = new Map();
for (const rel of files) {
  const abs = path.join(AGENTS, rel);
  const text = fs.readFileSync(abs, "utf8");
  const fm = parseFrontmatter(text);
  const where = "agents/" + rel;
  if (!fm) { errors.push(`${where}: frontmatter absent`); continue; }
  if (fm.unknown.length) errors.push(`${where}: champ(s) hors liste blanche : ${fm.unknown.join(", ")}`);
  const name = fm.keys.name;
  if (!name) errors.push(`${where}: champ name absent du frontmatter`);
  else if (seenNames.has(name)) errors.push(`${where}: name dupliqué "${name}" (déjà dans ${seenNames.get(name)})`);
  else seenNames.set(name, rel);
  if (!fm.keys.description) errors.push(`${where}: description absente`);
  const mode = fm.keys.mode;
  if (mode !== undefined && !MODES.has(mode)) errors.push(`${where}: mode "${mode}" invalide (primary|subagent|all)`);
  const color = fm.keys.color;
  if (color !== undefined && !COLOR_HEX.test(color) && !COLOR_ENUM.has(color)) {
    errors.push(`${where}: color "${color}" invalide (hex #rrggbb ou ${[...COLOR_ENUM].join("/")})`);
  }
  if (name && OC_BUILTINS.has(name)) errors.push(`${where}: name "${name}" collisionne un built-in OpenCode`);
}

// 5 : couverture catalogue ↔ disque
const missingInCatalog = files.filter((f) => !catPaths.has("agents/" + f));
const ghosts = catalog.agents.map((a) => a.path).filter((p) => !fs.existsSync(path.join(ROOT, p)));
for (const f of missingInCatalog) errors.push(`catalogue : agents/${f} manquant dans interface/catalog-full.js`);
for (const g of ghosts) errors.push(`catalogue : entrée fantôme ${g} (fichier absent du disque)`);
if (catalog.agents.length !== files.length) {
  errors.push(`catalogue : ${catalog.agents.length} entrées ≠ ${files.length} fichiers agents/`);
}

if (errors.length) {
  if (!quiet) for (const e of errors) console.log("  ✗ " + e);
  console.log(`❌ validate-agents : ${errors.length} erreur(s) — ${files.length} fichiers, catalogue ${catalog.agents.length} entrées`);
  process.exit(1);
}
console.log(`✅ validate-agents : ${files.length} agents valides, noms uniques, frontmatter conforme, catalogue ${catalog.agents.length}/${files.length} couvert`);
