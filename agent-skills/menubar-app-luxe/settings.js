// Réglages MEGA PACK menu-bar : thème + langue persistés (localStorage partagé avec le panneau)

// i18n de la fenêtre Réglages (langue partagée avec le panneau via mgp.lang)
const I18N = {
  fr: { title: 'MEGA PACK — Réglages', h2: '⚡ MEGA PACK — Réglages', cat: 'Catalogue :', genFrom: '· généré depuis', theme: 'Thème', themeD: 'Appliqué au panneau et à cette fenêtre', dark: '🌙 Sombre', light: '☀️ Clair', lang: 'Langue', langD: 'Interface du panneau', gs: 'Recherche globale', gsD: 'Raccourci système (⌘Espace est réservé par Spotlight)', set: 'Réglages', setD: 'Ouvrir cette fenêtre', dllm: 'LLM par défaut', dllmD: '⌘⏎ dans le panneau ouvre ce chat', tgt: 'Destinations du clic droit', tgtD: 'Menu flottant sur un agent/skill : envoi en un clic vers plusieurs LLM (le premier est prioritaire)', tgtHint: 'Clique pour ajouter/retirer — ordre = priorité', auto: 'Lancement au démarrage', autoD: "Ouvre MEGA PACK à l'ouverture de session", fsc: 'Raccourcis favoris', fscD: '⌘1 à ⌘9 lancent les 9 premiers favoris (menu du ⚡ ouvert)', keep: '📌 Garder le panneau visible', keepD: 'Le panneau ne se masque plus quand tu cliques dans une autre fenêtre (aussi via le bouton 📌 du panneau)', arenaBus: '🎮 Bus d\'événements ARENA', arenaBusD: "Écrit en local l'activité (agents générés, prompts copiés…) pour le jeu MEGA PACK ARENA — rien ne quitte ta machine", arenaDir: '🎮 Dossier MEGA PACK ARENA', arenaDirD: 'Où se trouve le jeu (arena-app) — détection automatique sinon', arenaOpen: "Ouvrir l'arène", arenaChosen: '✓ Dossier ARENA enregistré', arenaBad: '✗ Dossier invalide (main.js introuvable)', arenaOpenErr: "✗ Arène introuvable — choisnis son dossier d'abord", pdir: '📁 Dossier MEGA PROMPT (.md)', pdirD: "Bibliothèque locale : skills/, agents/, perso/ — chaque prompt de l'app en fichier .md, avec le prompt d'activation prêt à coller", pdirChoose: 'Choisir', pdirOpen: 'Ouvrir', pdirSync: 'Générer tous les .md (catalogue + perso)', pdirSynced: (n, p) => `✓ ${n} fichiers .md générés — ${p}`, pdirTree: 'Arborescence : skills/<catégorie>/ · agents/<catégorie>/ · perso/<tag>/ + LISEZMOI.md', cfg: 'Configuration', cfgD: 'Favoris, récents et préférences en JSON', xp: 'Mes prompts ✍️', xpD: 'Télécharge tous tes prompts en Markdown', osel: 'Ouvrir la sélection', oselD: 'Dans le panneau : ⏎ copie · ⌘⏎ LLM par défaut · ⇧⏎ ChatGPT', tour: '🎓 Mode d\'emploi interactif', tourD: 'Revoit la visite guidée en 7 étapes : recherche, LLM, clic droit, Atelier, équipes…', tourBtn: 'Relancer la visite', saved: '✓ Enregistré', noCat: 'catalogue introuvable', intel: '🧠 Intelligence — génération IA (Atelier)', intelD: "Clé API pour générer agents & skills. Chiffrée par macOS — refusée si le chiffrement OS est indisponible (jamais stockée en clair) ; ou variable d'environnement (GROQ_API_KEY, OPENAI_API_KEY…)", apiSave: 'Enregistrer la clé', apiTest: 'Tester', apiModels: 'Modèles conseillés', apiSaved: '✓ Clé enregistrée', apiDeleted: 'Clé effacée', apiTesting: 'Test en cours…', apiOk: (m, l) => `✓ Connecté — ${m} (${l} ms)`, apiFail: '✗ Échec', health: '🩺 Santé API — état live des fournisseurs', healthD: 'Sonde chaque endpoint /models (même mécanisme que la cascade du mini-chat 💬) — état gardé 10 min en cache', healthBtn: 'Re-sonder', healthHint: '✓ = l\'endpoint répond avec ta clé · les routeurs locaux sont tentés même sans clé', healthSummary: (ok, total) => `✓ ${ok}/${total} fournisseurs opérationnels`, healthQ: (ok, total, q) => `✓ ${ok}/${total} opérationnels · 🚫 ${q} en quarantaine`, healthProbe: 'Sondage…', healthNoKey: 'sans clé', jr: '🛡 Journal — incidents & diagnostic', jrD: 'Exceptions, morts de process, échecs de chargement — horodatés, plafonnés 120 lignes. Le tray affiche ⚠️ quand un incident critique a moins de 30 min', jrCopy: 'Copier', jrClear: 'Purger', jrNone: 'Aucun incident enregistré — tout va bien ✓', jrCleared: '✓ Journal purgé', jrCopied: '✓ Journal copié', jrBadge: (n) => `⚠️ ${n} incident(s) récent(s) (< 30 min)` },
  en: { title: 'MEGA PACK — Settings', h2: '⚡ MEGA PACK — Settings', cat: 'Catalog:', genFrom: '· generated from', theme: 'Theme', themeD: 'Applied to the panel and this window', dark: '🌙 Dark', light: '☀️ Light', lang: 'Language', langD: 'Panel interface', gs: 'Global search', gsD: 'System shortcut (⌘Space is reserved by Spotlight)', set: 'Settings', setD: 'Open this window', dllm: 'Default LLM', dllmD: '⌘⏎ in the panel opens this chat', tgt: 'Right-click destinations', tgtD: 'Floating menu on an agent/skill: one-click send to several LLMs (first one wins priority)', tgtHint: 'Click to add/remove — order = priority', auto: 'Launch at startup', autoD: 'Open MEGA PACK at login', fsc: 'Favorite shortcuts', fscD: '⌘1 to ⌘9 launch the first 9 favorites (open ⚡ menu)', keep: '📌 Keep the panel visible', keepD: 'The panel no longer hides when you click another window (also via the panel 📌 button)', arenaBus: '🎮 ARENA event bus', arenaBusD: 'Writes your activity locally (agents generated, prompts copied…) for the MEGA PACK ARENA game — nothing leaves your machine', arenaDir: '🎮 MEGA PACK ARENA folder', arenaDirD: 'Where the game (arena-app) lives — auto-detected otherwise', arenaOpen: 'Open the Arena', arenaChosen: '✓ ARENA folder saved', arenaBad: '✗ Invalid folder (main.js not found)', arenaOpenErr: '✗ Arena not found — choose its folder first', pdir: '📁 MEGA PROMPT folder (.md)', pdirD: "Local library: skills/, agents/, perso/ — every prompt of the app as a .md file, with the activation prompt ready to paste", pdirChoose: 'Choose', pdirOpen: 'Open', pdirSync: 'Generate all .md files (catalog + custom)', pdirSynced: (n, p) => `✓ ${n} .md files generated — ${p}`, pdirTree: 'Tree: skills/<category>/ · agents/<category>/ · perso/<tag>/ + LISEZMOI.md', cfg: 'Configuration', cfgD: 'Favorites, recents and preferences as JSON', xp: 'My prompts ✍️', xpD: 'Download all your prompts as Markdown', osel: 'Open selection', oselD: 'In the panel: ⏎ copy · ⌘⏎ default LLM · ⇧⏎ ChatGPT', tour: '🎓 Interactive guide', tourD: 'Replays the 7-step guided tour: search, LLM, right-click, Workshop, teams…', tourBtn: 'Replay the tour', saved: '✓ Saved', noCat: 'catalog not found', intel: '🧠 Intelligence — AI generation (Workshop)', intelD: 'API key used to generate agents & skills. Encrypted by macOS — refused when OS encryption is unavailable (never stored in clear text); or use env variables (GROQ_API_KEY, OPENAI_API_KEY…)', apiSave: 'Save key', apiTest: 'Test', apiModels: 'Suggested models', apiSaved: '✓ Key saved', apiDeleted: 'Key cleared', apiTesting: 'Testing…', apiOk: (m, l) => `✓ Connected — ${m} (${l} ms)`, apiFail: '✗ Failed', health: '🩺 API Health — live provider status', healthD: 'Probes every /models endpoint (same mechanism as the 💬 mini-chat cascade) — state cached for 10 min', healthBtn: 'Re-probe', healthHint: '✓ = endpoint answers with your key · local routers are tried even without a key', healthSummary: (ok, total) => `✓ ${ok}/${total} providers operational`, healthQ: (ok, total, q) => `✓ ${ok}/${total} operational · 🚫 ${q} quarantined`, healthProbe: 'Probing…', healthNoKey: 'no key', jr: '🛡 Journal — incidents & diagnostics', jrD: 'Exceptions, dead processes, load failures — timestamped, capped at 120 lines. The tray shows ⚠️ when a critical incident is under 30 min old', jrCopy: 'Copy', jrClear: 'Clear', jrNone: 'No incident recorded — all clear ✓', jrCleared: '✓ Journal cleared', jrCopied: '✓ Journal copied', jrBadge: (n) => `⚠️ ${n} recent incident(s) (< 30 min)` },
};
let LANG = 'fr';
try { LANG = localStorage.getItem('mgp.lang') || 'fr'; } catch (e) {}
function applyLang() {
  const T = I18N[LANG] || I18N.fr;
  document.title = T.title;
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = T[el.dataset.i18n] || el.textContent; });
}
applyLang();

const stats = document.getElementById('stats');
const themeSel = document.getElementById('theme');
const langSel = document.getElementById('lang');
const shortcutSel = document.getElementById('shortcut');
const dllmSel = document.getElementById('dllm');
const autostartCb = document.getElementById('autostart');
const favShortcutsCb = document.getElementById('favshortcuts');
const keepVisibleCb = document.getElementById('keepvisible');
const hoverPopupCb = document.getElementById('hoverpopup');
const arenaBusCb = document.getElementById('arenabus');
const arenaOpenBtn = document.getElementById('arenaOpen');
const arenaChooseBtn = document.getElementById('arenaChoose');
const saved = document.getElementById('saved');
const targetsBox = document.getElementById('targets');
const apiProv = document.getElementById('apiProv');
const apiKey = document.getElementById('apiKey');
const apiModel = document.getElementById('apiModel');
const apiSave = document.getElementById('apiSave');
const apiTest = document.getElementById('apiTest');
const apiDel = document.getElementById('apiDel');
const apiStatus = document.getElementById('apiStatus');
const apiModels = document.getElementById('apiModels');
const healthRefresh = document.getElementById('healthRefresh');
const healthSummary = document.getElementById('healthSummary');
const healthList = document.getElementById('healthList');
const tourBtn = document.getElementById('tourRestart');
const pdirPath = document.getElementById('pdirPath');
const pdirChoose = document.getElementById('pdirChoose');
const pdirOpen = document.getElementById('pdirOpen');
const pdirSync = document.getElementById('pdirSync');
const pdirStatus = document.getElementById('pdirStatus');

// ── Dossier MEGA PROMPT : chemin, choix, ouverture, génération complète ──
if (pdirPath) {
  window.mgp.promptDirGet().then((p) => { pdirPath.value = p || ''; });
  pdirChoose.onclick = async () => {
    const p = await window.mgp.promptDirChoose();
    if (p) { pdirPath.value = p; pdirStatus.textContent = ''; }
  };
  pdirOpen.onclick = () => window.mgp.promptDirOpen();
  pdirSync.onclick = async () => {
    pdirStatus.textContent = LANG === 'en' ? 'Generating…' : 'Génération…';
    const r = await window.mgp.promptTreeSync();
    pdirStatus.textContent = (r && r.ok) ? (I18N[LANG] || I18N.fr).pdirSynced(r.count, '') : `✗ ${(r && r.error) || '?'}`;
  };
}

// ── Destinations du clic droit (choix multiple, ordre = priorité) ──
const ALL_TARGETS = [
  ['claude', 'Claude'], ['chatgpt', 'ChatGPT'], ['perplexity', 'Perplexity'], ['copilot', 'Copilot'],
  ['deepseek', 'DeepSeek'], ['zai', 'Z.ai'], ['kimi', 'Kimi'], ['mammouth', 'Mammouth.ia'],
  ['manus', 'Manus (agent)'], ['noah', 'Noah'],
  ['claude-app', 'Claude (app macOS)'], ['claude-code', 'Claude Code (web)'],
  ['chrome', 'Chrome (onglet)'], ['brave', 'Brave (onglet)'],
  ['freebuff', 'Freebuff (app)'], ['opencode-app', 'OpenCode (desktop)'], ['opencode', 'OpenCode (terminal)'], ['clipboard', '📋 Presse-papiers'],
];
let sendTargets = [];
function renderTargets() {
  const T = I18N[LANG] || I18N.fr;
  targetsBox.innerHTML = ALL_TARGETS.map(([v, l]) =>
    `<button type="button" data-v="${v}" class="${sendTargets.includes(v) ? 'on' : ''}" aria-pressed="${sendTargets.includes(v)}">${l}</button>`).join('');
  targetsBox.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      const v = b.dataset.v;
      if (sendTargets.includes(v)) sendTargets = sendTargets.filter((t) => t !== v);
      else sendTargets.push(v);
      renderTargets();
      persist();
    };
  });
  document.getElementById('tgtHint').textContent = sendTargets.length
    ? `${T.tgtHint} — ${sendTargets.map((t) => (ALL_TARGETS.find(([v]) => v === t) || [null, t])[1]).join(' › ')}`
    : T.tgtHint;
}
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const exportCustomsBtn = document.getElementById('exportcustoms');

try {
  themeSel.value = localStorage.getItem('mgp.theme') || 'dark';
  langSel.value = localStorage.getItem('mgp.lang') || 'fr';
} catch (e) { /* ok */ }

// Préférences système (main process) : raccourci, LLM par défaut, auto-boot
try {
  const P = window.mgp.getPrefs ? window.mgp.getPrefs() : {};
  if (P.shortcut) shortcutSel.value = P.shortcut;
  if (P.defaultLLM) dllmSel.value = P.defaultLLM;
  sendTargets = (P.sendTargets || []).filter((t) => typeof t === 'string');
  autostartCb.checked = !!P.autostart;
  if (typeof P.favShortcuts === 'boolean') favShortcutsCb.checked = P.favShortcuts;
  if (keepVisibleCb) keepVisibleCb.checked = !!P.keepVisible; // 📌 « garder le panneau visible »
  if (hoverPopupCb) hoverPopupCb.checked = P.hoverPopup !== false; // 🎈 popup flottant
  if (arenaBusCb) arenaBusCb.checked = P.arenaBus !== false; // 🎮 bus d'événements ARENA (ON par défaut)
} catch (e) { /* défauts */ }
renderTargets();

// Compte du catalogue : via le bridge IPC (window.mgp.catalog, déjà chargé par preload)
// d'abord — le fetch('../interface/') échoue en file:// (Electron) → « catalogue introuvable ».
(function () {
  const fill = (cat) => { stats.textContent = `${cat.skills.length} skills · ${cat.agents.length} agents · v${cat.meta.version}`; };
  try {
    if (window.mgp && window.mgp.catalog && Array.isArray(window.mgp.catalog.skills)) { fill(window.mgp.catalog); return; }
  } catch (e) { /* repli fetch ci-dessous */ }
  fetch('../interface/catalog-full.js')
    .then((r) => r.text())
    .then((code) => {
      const fn = new Function(code + '\n;return MEGA_CATALOG;');
      const cat = fn();
      fill(cat);
    })
    .catch(() => { stats.textContent = (I18N[LANG] || I18N.fr).noCat; });
})();

// Version + date de build (build.json écrit par build-app.sh au packaging)
fetch('build.json')
  .then((r) => r.json())
  .then((b) => {
    const d = new Date(b.built);
    const ds = d.toLocaleDateString(LANG === 'fr' ? 'fr-FR' : 'en-US') + ' ' + d.toLocaleTimeString(LANG === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('buildinfo').textContent = `· v${b.version} (${b.arch}) ${ds} · Electron ${b.electron}`;
  })
  .catch(() => { document.getElementById('buildinfo').textContent = ''; }); // mode dev : absent

function persist() {
  try {
    localStorage.setItem('mgp.theme', themeSel.value);
    localStorage.setItem('mgp.lang', langSel.value);
  } catch (e) { /* ok */ }
  LANG = langSel.value;
  applyLang();
  document.body.className = themeSel.value === 'light' ? 'light' : '';
  window.mgp.onSettingsChange && window.mgp.onSettingsChange({
    theme: themeSel.value,
    lang: langSel.value,
    shortcut: shortcutSel.value,
    defaultLLM: dllmSel.value,
    sendTargets,
    autostart: autostartCb.checked,
    favShortcuts: favShortcutsCb.checked,
    keepVisible: keepVisibleCb.checked,
    hoverPopup: hoverPopupCb ? hoverPopupCb.checked : true,
    arenaBus: arenaBusCb ? arenaBusCb.checked : true,
  });
  saved.classList.add('show');
  setTimeout(() => saved.classList.remove('show'), 1200);
}
themeSel.onchange = persist;
langSel.onchange = persist;
shortcutSel.onchange = persist;
dllmSel.onchange = persist;
autostartCb.onchange = persist;
favShortcutsCb.onchange = persist;
if (keepVisibleCb) keepVisibleCb.onchange = persist;
if (arenaBusCb) arenaBusCb.onchange = persist;
// 🎈 fix 0.7.4 : le toggle « Popup flottant au survol » ne persistait JAMAIS —
// aucune liaison onchange (contrairement à keepVisible/arenaBus) : PREFS.hoverPopup
// restait bloqué et la case revenait à son état initial à chaque réouverture.
if (hoverPopupCb) hoverPopupCb.onchange = persist;
if (arenaOpenBtn) arenaOpenBtn.onclick = async () => {
  const r = await window.mgp.arenaOpen();
  if (!r || !r.ok) { saved.textContent = '✗ ' + (I18N[LANG] || I18N.fr).arenaOpenErr; saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500); }
};
if (arenaChooseBtn) arenaChooseBtn.onclick = async () => {
  const r = await window.mgp.arenaDirChoose();
  if (r && r.ok) { saved.textContent = '✓ ' + (I18N[LANG] || I18N.fr).arenaChosen; saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500); }
  else if (r && r.error === 'invalid') { saved.textContent = (I18N[LANG] || I18N.fr).arenaBad; saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500); }
};

// ── Intelligence : clé API + test de connexion (via main process) ──
const MODELS_HINT = {
  groq: 'Modèles conseillés : openai/gpt-oss-120b · openai/gpt-oss-20b · groq/compound · qwen/qwen3.8-27b',
  gemini: 'Modèles conseillés : gemini-3.6-flash · gemini-flash-latest · gemini-flash-lite-latest (clé partagée avec OpenCode si configurée)',
  omniroute: 'Routeur local omniroute sur 127.0.0.1:20128 — modèles auto/best-coding, auto/best-reasoning… (clé récupérée depuis OpenCode)',
  mistral: 'Modèles conseillés : mistral-medium-latest · mistral-small-latest · magistral-small-latest',
  cerebras: 'Modèles conseillés : gpt-oss-120b · qwen-3.8-27b',
  cohere: 'Modèles conseillés : command-a-03-2025 · command-r-plus-08-2024 · c4ai-aya-expanse-32b',
  freellm: 'Routeur local FreeLLM/omniroute sur 127.0.0.1:20128 — modèle « auto » : il route tout le catalogue (laisser le champ vide)',
  openai: 'Modèles conseillés : gpt-4o-mini · gpt-4o',
  anthropic: 'Modèles conseillés : claude-sonnet-4-20250514 · claude-haiku-4-20250514',
  openrouter: 'Modèles : meta-llama/llama-3.3-70b-instruct · anthropic/claude-3.5-haiku…',
  ollama: 'Modèles locaux : llama3.2 · mistral (Ollama doit tourner sur 127.0.0.1:11434)',
  custom: 'Endpoint OpenAI-compatible (base URL + modèle, la clé reste sur ta machine)',
};
function apiStatusMsg(msg, cls) { apiStatus.textContent = msg; apiStatus.className = cls || ''; }
if (apiSave) {
  apiProv.onchange = () => { apiModels.textContent = MODELS_HINT[apiProv.value] || ''; apiStatusMsg(''); };
  apiModels.textContent = MODELS_HINT[apiProv.value] || '';
  apiSave.onclick = async () => {
    const key = apiKey.value.trim();
    if (!key) { apiStatusMsg(LANG === 'en' ? 'Paste a key first' : 'Colle d\'abord une clé', 'err'); return; }
    const r = (window.mgp.apiSet && await window.mgp.apiSet({ provider: apiProv.value, key, model: apiModel.value.trim() })) || {};
    apiKey.value = '';
    if (r && r.ok === false) {
      apiStatusMsg(LANG === 'en'
        ? '✗ Key refused: OS-level encryption unavailable — use an environment variable (GROQ_API_KEY, OPENAI_API_KEY…), the key is never stored in clear text'
        : '✗ Clé refusée : chiffrement OS indisponible — utilise une variable d\'environnement (GROQ_API_KEY, OPENAI_API_KEY…), la clé n\'est jamais stockée en clair', 'err');
      return;
    }
    apiStatusMsg((I18N[LANG] || I18N.fr).apiSaved, 'ok');
  };
  apiDel.onclick = () => {
    window.mgp.apiSet && window.mgp.apiSet({ provider: apiProv.value, key: '' });
    apiStatusMsg((I18N[LANG] || I18N.fr).apiDeleted, 'ok');
  };
  apiTest.onclick = async () => {
    const T = I18N[LANG] || I18N.fr;
    apiStatusMsg(T.apiTesting, '');
    const r = await window.mgp.llmTest({ provider: apiProv.value, model: apiModel.value.trim() });
    if (r && r.ok) apiStatusMsg(T.apiOk(r.model || apiProv.value, r.latency || 0), 'ok');
    else apiStatusMsg(`${T.apiFail} — ${(r && r.error) || '?'}`, 'err');
  };
}

// ── 🩺 Santé API : état live de tous les fournisseurs (même sonde que la cascade) ──
const HEALTH_ORDER = ['omniroute', 'freellm', 'ollama', 'groq', 'cerebras', 'mistral', 'cohere', 'gemini', 'openai', 'anthropic', 'openrouter'];
const HEALTH_LABEL = { omniroute: 'OmniRoute (local)', freellm: 'FreeLLM (local)', ollama: 'Ollama (local)', groq: 'Groq', cerebras: 'Cerebras', mistral: 'Mistral', cohere: 'Cohere', gemini: 'Google Gemini', openai: 'OpenAI', anthropic: 'Anthropic', openrouter: 'OpenRouter' };
async function refreshHealth(force) {
  if (!window.mgp.apiHealth || !healthList) return;
  const T = I18N[LANG] || I18N.fr;
  healthSummary.textContent = T.healthProbe;
  // 🚫 état de quarantaine en parallèle de la sonde (lève le bouton « Lever » si besoin)
  let quarantine = {};
  try { quarantine = (await window.mgp.quarantineState()) || {}; } catch (e) { /* pont absent */ }
  const r = await window.mgp.apiHealth(force);
  const res = (r && r.results) || {};
  const entries = HEALTH_ORDER.filter((p) => res[p]);
  const okCount = entries.filter((p) => res[p].ok).length;
  const qCount = Object.keys(quarantine).length;
  healthSummary.textContent = qCount ? (T.healthQ ? T.healthQ(okCount, entries.length, qCount) : T.healthSummary(okCount, entries.length)) : T.healthSummary(okCount, entries.length);
  healthList.innerHTML = '';
  entries.forEach((p) => {
    const it = res[p];
    const q = quarantine[p];
    const line = document.createElement('div');
    line.className = 'healthline ' + (it.ok ? 'ok' : 'ko') + (q ? ' q' : '');
    let detail, mark;
    if (q) {
      // 🚫 en quarantaine : minutes restantes au lieu du simple ✗
      mark = '🚫';
      const min = Math.max(1, Math.round(q.remainingMs / 60000));
      detail = (LANG === 'en' ? 'quarantined — ' : 'en quarantaine — encore ') + min + ' min (' + q.fails + (LANG === 'en' ? ' failures' : ' échecs') + ')';
    } else {
      mark = it.ok ? '✓' : '✗';
      detail = it.ok
        ? (it.latency ? it.latency + ' ms' : '')
        : (it.hasKey ? 'HTTP ' + (it.status || 'réseau') : (LANG === 'en' ? T.healthNoKey : T.healthNoKey));
    }
    line.innerHTML = '<span class="mark">' + mark + '</span><span class="pname">' + (HEALTH_LABEL[p] || p) +
      '</span><span class="pinfo">' + detail + '</span><span class="pkey">' + (it.hasKey ? '🔑' : '·') + '</span>' +
      (q ? '<button class="btn qlift" data-p="' + p + '">↩ ' + (LANG === 'en' ? 'Lift' : 'Lever') + '</button>' : '');
    line.title = q
      ? (LANG === 'en' ? '3 consecutive failures — the cascade tries this provider last for 10 min' : '3 échecs consécutifs — la cascade ne le tente qu\'en dernier recours pendant 10 min')
      : it.hasKey
        ? (LANG === 'en' ? 'Key configured (env / OpenCode auth.json / keychain)' : 'Clé configurée (env / auth.json OpenCode / trousseau)')
        : (LANG === 'en' ? 'No key found — the cascade still tries local routers' : 'Aucune clé trouvée — la cascade tente quand même les routeurs locaux');
    healthList.appendChild(line);
  });
  // boutons « Lever » : lève la quarantaine puis rafraîchit
  healthList.querySelectorAll('.qlift').forEach((b) => {
    b.onclick = async () => {
      try { await window.mgp.quarantineLift(b.dataset.p); } catch (e) { /* pont absent */ }
      refreshHealth(false);
    };
  });
}
if (healthRefresh) healthRefresh.onclick = () => refreshHealth(true);
refreshHealth(false);

// 🛡 Journal : affichage repliable + copier + purger (même fichier que le main process)
const journalView = document.getElementById('journalView');
const journalStatus = document.getElementById('journalStatus');
async function refreshJournal(open) {
  if (!journalView || !window.mgp.journalGet) return;
  const r = await window.mgp.journalGet();
  const T2 = I18N[LANG] || I18N.fr;
  const lines = String(r.text || '').split('\n').filter((l) => l !== '');
  journalView.textContent = lines.length ? lines.slice(-40).join('\n') : (T2.jrNone || '');
  if (open) journalView.style.display = journalView.style.display === 'none' ? 'block' : (lines.length ? 'block' : 'none');
  else journalView.style.display = lines.length ? 'block' : 'none';
  if (journalStatus) journalStatus.textContent = r.recent > 0 ? (T2.jrBadge ? T2.jrBadge(r.recent) : '⚠️ ' + r.recent) : '';
}
const journalCopyBtn = document.getElementById('journalCopy');
const journalClearBtn = document.getElementById('journalClear');
if (journalCopyBtn) journalCopyBtn.onclick = async () => {
  const r = await window.mgp.journalGet();
  window.mgp.copy(r.text || '');
  const T2 = I18N[LANG] || I18N.fr;
  if (journalStatus) { journalStatus.textContent = T2.jrCopied; setTimeout(() => refreshJournal(false), 1200); }
};
if (journalClearBtn) journalClearBtn.onclick = async () => {
  await window.mgp.journalClear();
  const T2 = I18N[LANG] || I18N.fr;
  if (journalStatus) journalStatus.textContent = T2.jrCleared;
  refreshJournal(false);
};
refreshJournal(false);

// 🎓 Relance de la visite guidée (via le panneau)
if (tourBtn) {
  tourBtn.onclick = () => {
    window.mgp.restartTour && window.mgp.restartTour();
    saved.textContent = '🎓 ' + (LANG === 'en' ? 'Tour restarted in the panel' : 'Visite relancée dans le panneau');
    saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
  };
}

// Export / import de la configuration (JSON) via le main process
if (window.mgp.exportConfig) {
  exportBtn.onclick = async () => {
    if (await window.mgp.exportConfig()) {
      saved.textContent = '✓ ' + (LANG === 'en' ? 'Config exported' : 'Config exportée');
      saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
    }
  };
  importBtn.onclick = async () => {
    if (await window.mgp.importConfig()) {
      try {
        const P = window.mgp.getPrefs();
        if (P.shortcut) shortcutSel.value = P.shortcut;
        if (P.defaultLLM) dllmSel.value = P.defaultLLM;
        if (Array.isArray(P.sendTargets)) { sendTargets = P.sendTargets; renderTargets(); }
        autostartCb.checked = !!P.autostart;
        if (typeof P.favShortcuts === 'boolean') favShortcutsCb.checked = P.favShortcuts;
        if (P.lang) { langSel.value = P.lang; LANG = P.lang; applyLang(); }
      } catch (e) {}
      saved.textContent = '✓ ' + (LANG === 'en' ? 'Config imported' : 'Config importée');
      saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
    }
  };
  exportCustomsBtn.onclick = async () => {
    const ok = await window.mgp.exportCustoms();
    saved.textContent = ok ? '✓ ' + (LANG === 'en' ? 'Prompts exported (.md)' : 'Prompts exportés (.md)')
                           : (LANG === 'en' ? 'No prompts to export' : 'Aucun prompt à exporter');
    saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
  };
}

if (window.mgp && window.mgp.onSettings) {
  window.mgp.onSettings(({ theme, lang, keepVisible }) => {
    themeSel.value = theme; langSel.value = lang;
    if (typeof keepVisible === 'boolean' && keepVisibleCb) keepVisibleCb.checked = keepVisible; // bouton 📌 du panneau ↔ réglages
    if (typeof hoverPopup === 'boolean' && hoverPopupCb) hoverPopupCb.checked = hoverPopup;
    if (typeof keepVisible === 'boolean' && arenaBusCb) { /* resync bus via import de config */ }
    LANG = lang; applyLang();
    document.body.className = theme === 'light' ? 'light' : '';
  });
}
// Menu tray → « ⌨️ Changer le raccourci… » : met en évidence le select du raccourci
if (window.mgp && window.mgp.onGotoShortcut) {
  window.mgp.onGotoShortcut(() => {
    shortcutSel.scrollIntoView({ block: 'center', behavior: 'smooth' });
    shortcutSel.focus();
    shortcutSel.style.outline = '2px solid var(--acc)';
    setTimeout(() => { shortcutSel.style.outline = ''; }, 2500);
  });
}
document.body.className = themeSel.value === 'light' ? 'light' : '';
