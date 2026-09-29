#!/usr/bin/env node
// Tests de scripts/validate-agents.js via l'env MGP_VALIDATE_ROOT (sandbox agents/ + catalogue).
// Style : node:test + assert, comme validate-versions-test.js. Run : node --test scripts/validate-agents-test.js
"use strict";

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const SCRIPT = path.join(__dirname, "validate-agents.js");

function sandbox(mutate) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mgp-validate-"));
  fs.mkdirSync(path.join(root, "agents", "design"), { recursive: true });
  fs.mkdirSync(path.join(root, "interface"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "agents", "alpha.md"),
    '---\nname: Alpha\ndescription: Agent alpha de test\nmode: subagent\ncolor: "#10b981"\n---\n\nCorps.\n',
  );
  fs.writeFileSync(
    path.join(root, "agents", "design", "beta.md"),
    "---\nname: Beta\ndescription: Agent beta de test\n---\n\nCorps.\n",
  );
  const catalog = {
    meta: { generated: "test", version: "0.0.0", skills: 0, agents: 2 },
    skills: [],
    agents: [
      { name: "Alpha", desc: "Agent alpha de test", category: "core", path: "agents/alpha.md", model: "", tools: "" },
      { name: "Beta", desc: "Agent beta de test", category: "design", path: "agents/design/beta.md", model: "", tools: "" },
    ],
  };
  fs.writeFileSync(
    path.join(root, "interface", "catalog-full.js"),
    "const MEGA_CATALOG = " + JSON.stringify(catalog) + ";\n",
  );
  if (mutate) mutate(root);
  return root;
}

function run(root) {
  return execFileSync(process.execPath, [SCRIPT], {
    env: { ...process.env, MGP_VALIDATE_ROOT: root },
    encoding: "utf8",
  });
}

function runFails(root) {
  try {
    execFileSync(process.execPath, [SCRIPT], {
      env: { ...process.env, MGP_VALIDATE_ROOT: root },
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (e) {
    return (e.stdout || "") + (e.stderr || "");
  }
  return null;
}

test("sandbox conforme : le validateur passe", () => {
  const out = run(sandbox(null));
  assert.match(out, /✅ validate-agents : 2 agents valides/);
  assert.match(out, /catalogue 2\/2 couvert/);
});

test("échec : champ hors liste blanche dans le frontmatter", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "alpha.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("mode: subagent", "mode: subagent\nemoji: 🚀"));
  }));
  assert.ok(out && /hors liste blanche : emoji/.test(out), out);
});

test("échec : name dupliqué", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "design", "beta.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("name: Beta", "name: Alpha"));
  }));
  assert.ok(out && /name dupliqué "Alpha"/.test(out), out);
});

test("échec : description absente", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "alpha.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace(/^description:.*\n/m, ""));
  }));
  assert.ok(out && /description absente/.test(out), out);
});

test("échec : mode invalide", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "alpha.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("mode: subagent", "mode: secondaire"));
  }));
  assert.ok(out && /mode "secondaire" invalide/.test(out), out);
});

test("échec : color invalide", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "alpha.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace('color: "#10b981"', "color: bleu-nuit"));
  }));
  assert.ok(out && /color "bleu-nuit" invalide/.test(out), out);
});

test("échec : agent absent du catalogue (0 manquant exigé)", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "gamma.md");
    fs.writeFileSync(p, "---\nname: Gamma\ndescription: Orphelin hors catalogue\n---\n\nCorps.\n");
  }));
  assert.ok(out && /manquant dans interface\/catalog-full\.js/.test(out), out);
});

test("échec : entrée fantôme dans le catalogue", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "interface", "catalog-full.js");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace(
      '"agents/design/beta.md"',
      '"agents/design/beta-disparu.md"',
    ));
  }));
  assert.ok(out && /entrée fantôme/.test(out), out);
});

test("échec : collision avec un built-in OpenCode", () => {
  const out = runFails(sandbox((root) => {
    const p = path.join(root, "agents", "alpha.md");
    fs.writeFileSync(p, fs.readFileSync(p, "utf8").replace("name: Alpha", "name: build"));
  }));
  assert.ok(out && /collisionne un built-in/.test(out), out);
});
