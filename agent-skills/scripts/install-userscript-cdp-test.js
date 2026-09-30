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
