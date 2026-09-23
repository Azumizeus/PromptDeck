'use strict';
// Tests unitaires de la politique réseau Tier-3 (needs_validation run-1) :
// wrap sandbox-exec loopback-only sur macOS, passthrough --allow-network,
// refus (null) sur plateforme sans support, nettoyage du profil.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { networkWrapped, cleanupNetworkWrapper, NET_SB_PROFILE } = require('./run-evals.js');

const results = [];
const check = (cond, label) => {
  results.push([!!cond, label]);
  console.log(`${cond ? '✓' : '✗'} ${label}`);
};

check(NET_SB_PROFILE.includes('(deny network-outbound)'), 'profil : deny network-outbound global');
check(NET_SB_PROFILE.includes('(allow network-outbound (remote tcp "localhost:*"))'), 'profil : loopback TCP autorisé');
check(NET_SB_PROFILE.includes('(allow network-outbound (remote unix-socket))'), 'profil : unix sockets locaux autorisés');

{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'net-policy-test-'));
  const w = networkWrapped('claude', ['-p', '--verbose'], { tmpDir: tmp });
  check(!!w && w.sandboxed === true, 'macOS : la commande est wrappée par sandbox-exec');
  check(w.cmd === '/usr/bin/sandbox-exec', 'macOS : sandbox-exec système');
  check(w.args[0] === '-f' && w.args[1] === path.join(tmp, `agent-skills-net-${process.pid}.sb`), 'macOS : profil sandbox passé en -f');
  check(w.args[2] === 'claude' && w.args[3] === '-p' && w.args[4] === '--verbose', 'macOS : commande et arguments intacts derrière le wrapper');
  check(fs.existsSync(w.profilePath), 'macOS : le profil est écrit sur disque');
  check(fs.readFileSync(w.profilePath, 'utf8').includes('(deny network-outbound)'), 'macOS : le profil écrit contient le deny global');
  check((fs.statSync(w.profilePath).mode & 0o777) === 0o600, 'macOS : profil en permissions 0600');
  cleanupNetworkWrapper(w);
  check(!fs.existsSync(w.profilePath), 'macOS : profil nettoyé après usage');
  fs.rmSync(tmp, { recursive: true, force: true });
}

{
  const w = networkWrapped('claude', ['-p'], { allowNetwork: true });
  check(w && w.sandboxed === false && w.cmd === 'claude', '--allow-network : passthrough explicite sans sandbox');
}

{
  const w = networkWrapped('claude', ['-p'], { platform: 'linux' });
  check(w === null, 'plateforme sans support : null (refus côté runBehavioral)');
}

{
  // Le profil généré est syntaxiquement valide pour sandbox-exec : le laisser
  // compiler via la vraie sonde est couvert ailleurs ; ici on vérifie seulement
  // que "localhost" est utilisé (la syntaxe SBPL rejette une IP littérale).
  check(!NET_SB_PROFILE.includes('127.0.0.1'), 'profil : utilise "localhost" (SBPL rejette les IP littérales)');
}

const failed = results.filter((r) => !r[0]).length;
console.log(`\n${results.length - failed}/${results.length} checks OK${failed ? ` — ${failed} ÉCHEC(S)` : ' — PASS'}`);
process.exit(failed ? 1 : 0);
