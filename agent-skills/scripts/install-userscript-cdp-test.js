"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

// Ces tests n'ouvrent ni navigateur ni CDP : ils valident la logique pure du
// script d'installation (parsing des options, ordre des regex de labels, et le
// JS injecté dans ask.html généré par buildAskClickScript).
const mod = require("./install-userscript-cdp.js");

// Compile le JS injecté par buildAskClickScript en fonction (document, probe).
function compileInjectedClick(probe) {
  return new Function("document", "probe", "return (" + mod.buildAskClickScript({ probe }) + ")");
}

test("parseArgs: valeurs par défaut", () => {
  const o = mod.parseArgs([]);
  assert.equal(o.file, null);
  assert.equal(o.probeOnly, false);
  assert.equal(o.reload, false);
  assert.equal(o.port, 9223);
});

test("parseArgs: premier non-option = chemin du .user.js + options booléennes", () => lectureContreSchedule());

function lectureContreSchedule() {
  const o = mod.parseArgs(["/tmp/mon.user.js", "--probe-only", "--reload"]);
  assert.equal(o.file, "/tmp/mon.user.js");
  assert.equal(o.probeOnly, true);
  assert.equal(o.reload, true);
}

test("parseArgs: --port 9300 (séparé) et --port=9300 (collé)", () => {
  assert.equal(mod.parseArgs(["--port", "9300"]).port, 9300);
  assert.equal(mod.parseArgs(["--port=9300"]).port, 9300);
  assert.equal(mod.parseArgs(["--port", "abc"]).port, 9223); // invalide → défaut
});

test("INSTALL_LABELS: Réinstaller d'abord, tous les libellés connus couverts", () => {
  const first = mod.INSTALL_LABELS[0];
  assert.ok(first.test("Réinstaller"), "la 1re regex doit matcher « Réinstaller »");
  const labels = ["Mettre à jour", "Réinstaller", "Installer", "Reinstall", "Replace"];
  for (const l of labels) {
    assert.ok(mod.INSTALL_LABELS.some((re) => re.test(l)), `aucune regex pour « ${l} »`);
  }
  // « Annuler » et « Désactiver les mises à jour » ne doivent PAS déclencher
  // une installation :
  for (const l of ["Annuler", "Désactiver les mises à jour"]) {
    assert.ok(!mod.INSTALL_LABELS.some((re) => re.test(l)), `« ${l} » ne doit pas matcher`);
  }
});

test("buildAskClickScript: JS généré valide (compilation) et interpolation probe", () => {
  assert.ok(/\bfalse\b/.test(mod.buildAskClickScript({ probe: false })));
  assert.ok(/\btrue\b/.test(mod.buildAskClickScript({ probe: true })));
  assert.doesNotThrow(() => compileInjectedClick(false));
  assert.doesNotThrow(() => compileInjectedClick(true));
});

test("click: clique « Réinstaller » (input base64) et pas « Annuler »", () => {
  const fn = compileInjectedClick(false);
  // DOM minimal avec ids base64 comme dans le vrai ask.html.
  const reinstall = { tagName: "INPUT", id: "input_TWV0dHJlIOAgam91cl91bmRlZmluZWQ_bu", value: "Réinstaller", click() { this.clicked = true; } };
  const cancel = { tagName: "INPUT", id: "input_QW5udWxlcl9idQ", value: "Annuler", click() { this.clicked = true; } };
  const emptyBtn = { tagName: "BUTTON", id: "", value: "", textContent: "", click() { this.clicked = true; } };
  const els = [reinstall, cancel, emptyBtn];
  const fakeDoc = { querySelectorAll: () => els };

  const rep = fn(fakeDoc, false);
  assert.equal(rep.clicked, "Réinstaller");
  assert.ok(reinstall.clicked);
  assert.ok(!cancel.clicked, "« Annuler » ne doit pas être cliqué");
  assert.equal(rep.buttons.length, 2); // le <button> vide est filtré
  assert.deepEqual(rep.buttons.map((b) => b.label), ["Réinstaller", "Annuler"]);
});

test("click: « Mettre à jour » cliqué sur première installation", () => {
  const fn = compileInjectedClick(false);
  const update = { tagName: "INPUT", id: "input_TWV0dHJlIOAgam91cl91bmRlZmluZWQ_bu", value: "Mettre à jour", click() { this.clicked = true; } };
  const cancel = { tagName: "INPUT", id: "input_QW5udWxlcl9idQ", value: "Annuler", click() { this.clicked = true; } };
  const fakeDoc = { querySelectorAll: () => [update, cancel] };

  const rep = fn(fakeDoc, false);
  assert.equal(rep.clicked, "Mettre à jour");
  assert.ok(update.clicked);
});

test("click: mode probe — aucun clic, boutons listés", () => {
  const fn = compileInjectedClick(true);
  const reinstall = { tagName: "INPUT", id: "input_X1JlaW5zdGFsbGVyX2lk", value: "Réinstaller", click() { this.clicked = true; } };
  const fakeDoc = { querySelectorAll: () => [reinstall] };

  const rep = fn(fakeDoc, true);
  assert.equal(rep.clicked, null);
  assert.ok(!reinstall.clicked, "le mode probe ne doit jamais cliquer");
  assert.deepEqual(rep.buttons.map((b) => b.label), ["Réinstaller"]);
});

// ── --verify : extraction et comparaison des versions ──

test("localBundleVersion: @version extrait du bundle réel", () => {
  const v = mod.localBundleVersion(require("path").join(__dirname, "..", "interface", "mega-pack-panel-full.user.js"));
  assert.match(v, /^\d+\.\d+\.\d+$/, "@version du bundle doit être x.y.z, got: " + v);
});

test("localBundleVersion: null si pas de @version", () => {
  const os = require("node:os");
  const fs = require("node:fs");
  const tmp = require("path").join(os.tmpdir(), "mgp-no-version-" + Date.now() + ".user.js");
  fs.writeFileSync(tmp, "// ==UserScript==\n// @name test\n// ==/UserScript==\n");
  try { assert.equal(mod.localBundleVersion(tmp), null); }
  finally { fs.unlinkSync(tmp); }
});

test("parseArgs: --verify reconnu", () => {
  assert.equal(mod.parseArgs(["--verify"]).verify, true);
  assert.equal(mod.parseArgs([]).verify, false);
});

test("version TM: extraction indicative + décision par includes (version collée à la taille)", () => {
  // La ligne réelle du dashboard colle version et taille : « …LLM2.13.2341 KB… ».
  // La regex indicative peut déborder (2.13.2341), mais la décision --verify
  // repose sur includes(versionLocale) qui, lui, est exact.
  const rows = ["…1MEGA PACK Panel Luxe — Skills, Agents & Équipes pour tout LLM2.13.2341 KB1 min…"];
  const extract = (rs) => { for (const r of rs) { const m = r.match(/(\d+\.\d+\.\d+)(?!\d)/); if (m) return m[1]; } return null; };
  const local = "2.13.2";
  assert.equal(rows.some((r) => r.includes(local)), true, "includes doit trouver 2.13.2 dans la ligne collée");
  assert.equal(extract(rows), "2.13.2341", "l'extraction indicative peut déborder — non décisionnelle");
  assert.equal(extract(["MEGA PACK sans numéro"]), null);
  // Ancienne version installée : includes échoue → verify doit échouer.
  const oldRows = ["MEGA PACK Panel Luxe2.12.0 341 KB"];
  assert.equal(oldRows.some((r) => r.includes(local)), false);
});
