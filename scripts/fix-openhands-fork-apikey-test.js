#!/usr/bin/env node

'use strict';

// Tests for scripts/fix-openhands-fork-apikey.sh — repair of OpenHands
// conversations whose forked base_state.json lost the encrypted LLM api_key.
//
// The bash script is exercised end-to-end via spawnSync against a synthetic
// OH_DIR fixture in /tmp (no Docker needed: every run uses --no-restart or a
// dry-run, and docker is only required when the script must stop/restart the
// container). The Fernet token is generated with the same derivation the
// script assumes: sha256(secret-key.txt) → url-safe base64.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { afterEach, test } = require('node:test');

const SCRIPT = path.join(__dirname, 'fix-openhands-fork-apikey.sh');
const MASTER_SECRET = 'a'.repeat(64);
const MODEL_LIGHTNING = 'openai/nvidia/nemotron-3.5-lightning-30b-a3b';
const MODEL_SUPER = 'openai/nvidia/nemotron-3-super-120b-a12b';
const PLAINTEXT_KEY = 'nvapi-TESTKEY-1234567890';

const sandboxes = [];

// ─── Environment guards (skip, not fail, when prerequisites are absent) ──────

function hasPythonCryptography() {
  if (process.platform === 'win32') return false;
  const r = spawnSync('python3', ['-c', 'import cryptography'], { encoding: 'utf8' });
  return r.status === 0;
}

const ENV_SKIP = process.platform === 'win32' || !hasPythonCryptography()
  ? 'bash + python3 « cryptography » requis (absents sur cette machine)'
  : false;

// ─── Fixture helpers ─────────────────────────────────────────────────────────

function fernetEncrypt(token) {
  // Same derivation as the script: Fernet(base64(sha256(master_secret))).
  const { createHash } = require('node:crypto');
  // The token is produced by python (Fernet) to guarantee format fidelity.
  const py = [
    "import base64, hashlib, sys",
    "from cryptography.fernet import Fernet",
    "master = sys.argv[1].encode()",
    "token = sys.argv[2].encode()",
    "f = Fernet(base64.urlsafe_b64encode(hashlib.sha256(master).digest()))",
    "print(f.encrypt(token).decode())",
  ].join('\n');
  const r = spawnSync('python3', ['-c', py, MASTER_SECRET, token], { encoding: 'utf8' });
  assert.equal(r.status, 0, 'python3 Fernet encryption failed: ' + r.stderr);
  return r.stdout.trim();
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function llmNode(model, extra = {}) {
  return { model, base_url: 'https://integrate.api.nvidia.com/v1', api_mode: 'auto', timeout: 300, ...extra };
}

function makeFixture({ withSecretKey = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-openhands-fork-apikey-test-'));
  sandboxes.push(root);
  if (withSecretKey) {
    const secretPath = path.join(root, 'agent-canvas', 'secret-key.txt');
    fs.mkdirSync(path.dirname(secretPath), { recursive: true });
    fs.writeFileSync(secretPath, MASTER_SECRET + '\n');
  }
  const token = withSecretKey ? fernetEncrypt(PLAINTEXT_KEY) : '';
  writeJson(path.join(root, 'profiles', 'nemotron.json'), {
    model: MODEL_LIGHTNING, api_key: token, base_url: 'https://integrate.api.nvidia.com/v1',
  });
  // A profile with the same model but an undecryptable token: must be
  // reported and ignored, never silently shadow the good profile.
  writeJson(path.join(root, 'profiles', 'broken.json'), {
    model: MODEL_LIGHTNING, api_key: 'gAAAAABdefinitely-broken', base_url: 'x',
  });
  // Broken fork: both agent LLM and condenser LLM lost their key.
  writeJson(path.join(root, 'agent-canvas', 'conversations', 'fork1', 'base_state.json'), {
    agent: { llm: llmNode(MODEL_LIGHTNING), condenser: { llm: llmNode(MODEL_LIGHTNING) } },
  });
  // Healthy conversation: must stay untouched.
  writeJson(path.join(root, 'agent-canvas', 'conversations', 'ok1', 'base_state.json'), {
    agent: {
      llm: llmNode(MODEL_LIGHTNING, { api_key: token }),
      condenser: { llm: llmNode(MODEL_LIGHTNING, { api_key: token }) },
    },
  });
  // Provider-connection node: keyless by design, must be ignored.
  writeJson(path.join(root, 'agent-canvas', 'conversations', 'prov1', 'base_state.json'), {
    agent: { llm: llmNode(MODEL_LIGHTNING, { api_key: null, provider_connection_id: 'abc' }) },
  });
  // Broken archived conversation: the archive must be covered too.
  writeJson(path.join(root, 'agent-canvas', 'conversations-archive', 'oldfork', 'base_state.json'), {
    agent: { llm: llmNode(MODEL_LIGHTNING), condenser: { llm: llmNode(MODEL_LIGHTNING) } },
  });
  return root;
}

function runScript(root, args = []) {
  return spawnSync('bash', [SCRIPT, ...args], {
    cwd: __dirname,
    encoding: 'utf8',
    env: { ...process.env, OH_DIR: root, CONTAINER: 'no-container-in-tests' },
  });
}

function backups(root) {
  const hits = [];
  for (const base of ['agent-canvas/conversations', 'agent-canvas/conversations-archive']) {
    const dir = path.join(root, base);
    if (!fs.existsSync(dir)) continue;
    for (const conv of fs.readdirSync(dir)) {
      const convDir = path.join(dir, conv);
      if (!fs.statSync(convDir).isDirectory()) continue;
      for (const f of fs.readdirSync(convDir)) {
        if (/^base_state\.json\.bak-fix-apikey-\d{8}-\d{6}$/.test(f)) hits.push(f);
      }
    }
  }
  return hits.sort();
}

afterEach(() => {
  for (const root of sandboxes.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ─── Detection (dry-run) ─────────────────────────────────────────────────────

test('dry-run detects broken forks with the exact profile and verifies decryption', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root);

  assert.equal(r.status, 0, r.stdout + r.stderr);
  // Both broken files listed, with the resolved exact profile and the decrypted
  // key prefix proving the Fernet verification actually ran.
  assert.match(r.stdout, /conversations\/fork1\/base_state\.json/);
  assert.match(r.stdout, /conversations-archive\/oldfork\/base_state\.json/);
  assert.match(r.stdout, /profil exact/);
  assert.match(r.stdout, /« nvapi-TE… »/);
  assert.match(r.stdout, /RÉSULTAT: 2 fichier\(s\) à réparer/);
  // The broken profile is reported and ignored instead of shadowing the good one.
  assert.match(r.stdout, /profil broken\.json .*token illisible/);
});

test('dry-run leaves every base_state.json untouched', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const fork = readJson(path.join(root, 'agent-canvas', 'conversations', 'fork1', 'base_state.json'));
  assert.equal(fork.agent.llm.api_key, undefined);
  assert.equal(fork.agent.condenser.llm.api_key, undefined);
  assert.equal(backups(root).length, 0);
});

// ─── Repair (--apply --no-restart) ───────────────────────────────────────────

test('apply re-injects the encrypted key into agent and condenser, sparing healthy and provider-connection files', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root, ['--apply', '--no-restart']);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const forkPath = path.join(root, 'agent-canvas', 'conversations', 'fork1', 'base_state.json');
  const fork = readJson(forkPath);
  const token = readJson(path.join(root, 'profiles', 'nemotron.json')).api_key;
  assert.equal(fork.agent.llm.api_key, token);
  assert.equal(fork.agent.condenser.llm.api_key, token);
  assert.equal(fork.agent.llm.model, MODEL_LIGHTNING); // model untouched without --set-model

  const archived = readJson(path.join(root, 'agent-canvas', 'conversations-archive', 'oldfork', 'base_state.json'));
  assert.equal(archived.agent.llm.api_key, token);

  const healthy = readJson(path.join(root, 'agent-canvas', 'conversations', 'ok1', 'base_state.json'));
  assert.equal(healthy.agent.llm.api_key, token); // same token: file content unchanged, just not rewritten

  const provider = readJson(path.join(root, 'agent-canvas', 'conversations', 'prov1', 'base_state.json'));
  assert.equal(provider.agent.llm.api_key, null); // provider connection stays keyless

  // One timestamped backup per repaired file, none for untouched files.
  const bks = backups(root);
  assert.equal(bks.length, 2);
  assert.ok(bks.every((b) => /^base_state\.json\.bak-fix-apikey-\d{8}-\d{6}$/.test(b)));

  // The repaired token must still decrypt (round-trip with the real cipher).
  const py = [
    "import base64, hashlib, json, sys",
    "from cryptography.fernet import Fernet",
    "master = open(sys.argv[1]).read().strip()",
    "f = Fernet(base64.urlsafe_b64encode(hashlib.sha256(master.encode()).digest()))",
    "d = json.load(open(sys.argv[2]))",
    "print(f.decrypt(d['agent']['llm']['api_key'].encode()).decode())",
  ].join('\n');
  const dec = spawnSync('python3', ['-c', py, path.join(root, 'agent-canvas', 'secret-key.txt'), forkPath], { encoding: 'utf8' });
  assert.equal(dec.status, 0, dec.stderr);
  assert.equal(dec.stdout.trim(), PLAINTEXT_KEY);
});

test('apply is idempotent: a second pass finds nothing to repair', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  assert.equal(runScript(root, ['--apply', '--no-restart']).status, 0);
  const before = backups(root).length;

  const r = runScript(root);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /rien à réparer/);
  assert.match(r.stdout, /RÉSULTAT: 0 fichier\(s\) à réparer/);
  assert.equal(backups(root).length, before); // no new backups
});

// ─── Model switch filter ─────────────────────────────────────────────────────

test('--set-model --from-model switches only the matching model and reports the filtered-out node', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  // ok1 becomes a mixed file: lightning (targeted) + gemini (filtered out).
  writeJson(path.join(root, 'agent-canvas', 'conversations', 'ok1', 'base_state.json'), {
    agent: {
      llm: llmNode(MODEL_LIGHTNING),
      condenser: { llm: llmNode('gemini/gemini-3.5-flash-lite') },
    },
  });

  const r = runScript(root, [
    '--apply', '--no-restart',
    '--set-model', MODEL_SUPER,
    '--from-model', MODEL_LIGHTNING,
  ]);

  // The gemini node is deliberately left keyless: reported as a warning, not a failure.
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stderr, /attendu avec --from-model/);

  const ok1 = readJson(path.join(root, 'agent-canvas', 'conversations', 'ok1', 'base_state.json'));
  assert.equal(ok1.agent.llm.model, MODEL_SUPER);
  assert.ok(ok1.agent.llm.api_key && ok1.agent.llm.api_key.startsWith('gAAAAAB'));
  assert.equal(ok1.agent.condenser.llm.model, 'gemini/gemini-3.5-flash-lite');
  assert.equal(ok1.agent.condenser.llm.api_key, undefined);
});

// ─── JSON report (--json) ───────────────────────────────────────────────────

function parseJsonStdout(r) {
  return JSON.parse(r.stdout); // throws (and fails the test) on any non-JSON stdout
}

test('--json dry-run: stdout is a pure machine-readable report, logs go to stderr', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root, ['--json']);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const report = parseJsonStdout(r);
  assert.equal(report.ok, false); // broken files remain (dry-run never repairs)
  assert.equal(report.mode, 'dry-run');
  assert.equal(report.broken_file_count, 2);
  assert.deepEqual(report.profiles_verified, [MODEL_LIGHTNING]);
  assert.deepEqual(report.invalid_profiles, [{ source: 'broken.json', model: MODEL_LIGHTNING }]);
  assert.equal(report.remaining_broken_nodes, 4); // agent + condenser in both broken files

  const fork = report.files.find((f) => f.file.endsWith('conversations/fork1/base_state.json'));
  assert.deepEqual(fork.models, [MODEL_LIGHTNING]);
  assert.equal(fork.nodes, 2);
  assert.equal(fork.source, 'nemotron.json');
  assert.equal(fork.source_kind, 'exact-profile');
  assert.equal(fork.repaired, false);
  assert.equal(fork.set_model, undefined);

  // Human-readable chatter (scan logs) must NOT leak into the JSON stream.
  assert.doesNotMatch(r.stdout, /▸|🩹|RÉSULTAT/);
  assert.match(r.stderr, /profil broken\.json .*token illisible/);
});

test('--json apply: repaired flags, remaining at zero, set_model reported', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root, ['--apply', '--no-restart', '--json', '--set-model', MODEL_SUPER, '--from-model', MODEL_LIGHTNING]);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const report = parseJsonStdout(r);
  assert.equal(report.ok, true);
  assert.equal(report.mode, 'apply');
  assert.equal(report.remaining_broken_nodes, 0);
  for (const f of report.files) {
    assert.equal(f.repaired, true);
    assert.equal(f.set_model, MODEL_SUPER);
  }
});

test('--json with --from-model leaves filtered nodes out and stays ok:true with a warning', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  writeJson(path.join(root, 'agent-canvas', 'conversations', 'mixed', 'base_state.json'), {
    agent: {
      llm: llmNode(MODEL_LIGHTNING),
      condenser: { llm: llmNode('gemini/gemini-3.5-flash-lite') },
    },
  });

  const r = runScript(root, ['--apply', '--no-restart', '--json', '--set-model', MODEL_SUPER, '--from-model', MODEL_LIGHTNING]);
  assert.equal(r.status, 0, r.stdout + r.stderr);

  const report = parseJsonStdout(r);
  assert.equal(report.ok, true); // expected with --from-model
  assert.ok(report.remaining_broken_nodes >= 1); // the gemini node, deliberately untouched
  assert.match(r.stderr, /attendu avec --from-model/);
});

test('--json on failure emits {"ok":false,"error"} and exits 1', { skip: ENV_SKIP }, () => {
  const root = makeFixture({ withSecretKey: false });
  const r = runScript(root, ['--json']);
  assert.equal(r.status, 1);

  const report = parseJsonStdout(r);
  assert.equal(report.ok, false);
  assert.match(report.error, /clé maître introuvable/);
});

test('default (non --json) output is unchanged: no JSON object on stdout', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /"broken_file_count"/);
  assert.match(r.stdout, /RÉSULTAT: 2 fichier\(s\) à réparer/);
});

// ─── Failure modes ───────────────────────────────────────────────────────

test('fails with a clear message when the master secret key file is missing', { skip: ENV_SKIP }, () => {
  const root = makeFixture({ withSecretKey: false });
  const r = runScript(root);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /clé maître introuvable/);
});

test('fails with exit 2 on an unknown option', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root, ['--nope']);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /option inconnue : --nope/);
});

test('--help prints the documented usage without touching the fixture', { skip: ENV_SKIP }, () => {
  const root = makeFixture();
  const r = runScript(root, ['--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /fix-openhands-fork-apikey\.sh —/);
  assert.match(r.stdout, /--apply/);
  assert.match(r.stdout, /--set-model/);
  assert.equal(backups(root).length, 0);
});

// ─── Regression guard: real data ─────────────────────────────────────────────

test('reports zero broken conversations on the real ~/.openhands data (when present)', { skip: ENV_SKIP }, () => {
  const realDir = path.join(os.homedir(), '.openhands');
  if (!fs.existsSync(path.join(realDir, 'agent-canvas', 'secret-key.txt'))) return; // no OpenHands on this machine

  const r = spawnSync('bash', [SCRIPT], {
    cwd: __dirname,
    encoding: 'utf8',
    env: { ...process.env, OH_DIR: realDir },
  });
  // Dry-run must always exit 0 on real data, and must never modify anything.
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.doesNotMatch(r.stderr, /⚠️/);
});
