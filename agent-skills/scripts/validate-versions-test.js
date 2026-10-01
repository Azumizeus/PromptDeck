"use strict";

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const { parseSemver, cmpSemver, latestTagForMajor, checkManifest, manifestPaths } =
  require("./validate-versions.js");

test("parseSemver: tags semver avec ou sans préfixe v, prérelease, non-semver", () => {
  assert.deepEqual(parseSemver("0.7.4"), { raw: "0.7.4", major: 0, minor: 7, patch: 4, pre: null });
  assert.deepEqual(parseSemver("v1.1.0"), { raw: "v1.1.0", major: 1, minor: 1, patch: 0, pre: null });
  assert.deepEqual(parseSemver("v1.1.0-fusion"), { raw: "v1.1.0-fusion", major: 1, minor: 1, patch: 0, pre: "fusion" });
  assert.equal(parseSemver("v1.1.0-fusion").major, 1);
  assert.equal(parseSemver("abc"), null);
  assert.equal(parseSemver("1.2"), null);
  assert.equal(parseSemver(""), null);
});

test("cmpSemver: ordre semver complet, prérelease < finale", () => {
  assert.equal(cmpSemver(parseSemver("0.7.4"), parseSemver("0.7.3")), 1);
  assert.equal(cmpSemver(parseSemver("0.7.3"), parseSemver("0.7.4")), -1);
  assert.equal(cmpSemver(parseSemver("0.7.4"), parseSemver("0.7.4")), 0);
  assert.equal(cmpSemver(parseSemver("0.10.0"), parseSemver("0.9.9")), 1); // numérique, pas lexicographique
  assert.equal(cmpSemver(parseSemver("v1.1.0-fusion"), parseSemver("v1.1.0")), -1); // prérelease < finale
});

test("latestTagForMajor: isole la ligne majeure, ignore les autres schémas", () => {
  const tags = ["0.7.3", "0.7.4", "v1.1.0", "v1.1.0-fusion", "garbage-tag"];
  assert.equal(latestTagForMajor(tags, 0).raw, "0.7.4");
  assert.equal(latestTagForMajor(tags, 1).raw, "v1.1.0"); // finale > prérelease
  assert.equal(latestTagForMajor(tags, 2), null); // ligne inexistante
});

test("checkManifest: logique de retard via comparaison pure", () => {
  const tags = ["0.7.3", "0.7.4"];
  // En avance : manifest 0.7.5 > dernier tag 0.7.4 → pas en retard
  assert.ok(cmpSemver(parseSemver("0.7.5"), latestTagForMajor(tags, 0)) >= 0);
  // En retard : 0.7.2 < 0.7.4 → en retard
  assert.ok(cmpSemver(parseSemver("0.7.2"), latestTagForMajor(tags, 0)) < 0);
  // Ligne sans tag → null → checkManifest renverrait OK sans comparaison
  assert.equal(latestTagForMajor(tags, 5), null);
});

test("intégration dépôt réel : aucun manifest en retard sur sa ligne semver", () => {
  const tags = execFileSync("git", ["tag", "--list"], { encoding: "utf8" })
    .split("\n").map((t) => t.trim()).filter(Boolean);
  const { readFileSync } = require("node:fs");
  const readVersion = (p) => {
    const m = JSON.parse(readFileSync(p, "utf8"));
    return m.version ?? m.plugins?.[0]?.version;
  };
  for (const manifestPath of manifestPaths) {
    const current = parseSemver(readVersion(manifestPath));
    assert.ok(current, `${manifestPath} doit être semver`);
    const latest = latestTagForMajor(tags, current.major);
    if (!latest) continue; // pas de tag dans cette ligne → rien à comparer
    assert.ok(
      cmpSemver(current, latest) >= 0,
      `${manifestPath} (${current.raw}) ne doit pas être en retard sur ${latest.raw}`,
    );
  }
});
