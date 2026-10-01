#!/usr/bin/env node

"use strict";

const { execFileSync } = require("node:child_process");
const { readFileSync } = require("node:fs");

// ── Versionnage du dépôt : DEUX schémas coexistent (produits distincts) :
//      - plugin/marketplace : 0.7.x (plugin.json & co)
//      - anciens tags plugin : v1.1.0, v1.1.0-fusion (autre ligne produit)
//      - panneau MEGA PACK   : 2.13.x (interface/, hors de ce contrôle)
//    Règle : ne considérer que les tags SEMVER, les regrouper par ligne majeure
//    (le « schéma »), et n'échouer que si un manifest est EN RETARD sur le
//    dernier tag de SA ligne — être en avance (version locale fraîche) est OK.

const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

function parseSemver(tag) {
  const m = SEMVER_RE.exec(String(tag).trim());
  if (!m) return null;
  return {
    raw: m[0],
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    pre: m[4] ?? null,
  };
}

// Comparaison semver partielle : -1 si a<b, 1 si a>b, 0 sinon.
// Une prérelease (-suffix) est INFÉRIEURE à la version finale du même triplet.
function cmpSemver(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  if (a.patch !== b.patch) return a.patch < b.patch ? -1 : 1;
  if (a.pre === b.pre) return 0;
  if (a.pre === null) return 1;
  if (b.pre === null) return -1;
  return a.pre < b.pre ? -1 : a.pre > b.pre ? 1 : 0;
}

function listTags() {
  return execFileSync("git", ["tag", "--list"], { encoding: "utf8" })
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Dernier tag semver de la ligne majeure `major`. null si aucun.
function latestTagForMajor(tags, major) {
  const inLine = tags.map(parseSemver).filter((v) => v && v.major === major);
  if (!inLine.length) return null;
  return inLine.reduce((best, v) => (cmpSemver(v, best) > 0 ? v : best));
}

const manifestPaths = [
  "plugin.json",
  ".codex-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
];

function readManifestVersion(manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return manifest.version ?? manifest.plugins?.[0]?.version;
}

function checkManifest(manifestPath, tags) {
  const current = parseSemver(readManifestVersion(manifestPath));
  if (!current) {
    throw new Error(`${manifestPath} has non-semver version <${readManifestVersion(manifestPath)}>`);
  }
  const latest = latestTagForMajor(tags, current.major);
  if (!latest) {
    return { ok: true, note: `no semver tag in the v${current.major}.x line — nothing to compare` };
  }
  if (cmpSemver(current, latest) < 0) {
    throw new Error(`${manifestPath} is BEHIND: ${current.raw} < latest ${current.major}.x tag ${latest.raw}`);
  }
  return { ok: true, note: `${current.raw} >= ${latest.raw} (latest ${current.major}.x tag)` };
}

module.exports = { parseSemver, cmpSemver, latestTagForMajor, checkManifest, manifestPaths };

if (require.main === module) {
  const tags = listTags();
  for (const manifestPath of manifestPaths) {
    const res = checkManifest(manifestPath, tags);
    console.log(`✓ ${manifestPath}: ${res.note}`);
  }
  console.log("All plugin manifests are up to date (not behind their semver tag line).");
}
