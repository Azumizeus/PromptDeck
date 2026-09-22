// Réglages MEGA PACK menu-bar : thème + langue persistés (localStorage partagé avec le panneau)

// i18n de la fenêtre Réglages (langue partagée avec le panneau via mgp.lang)
const I18N = {
  fr: { title: 'MEGA PACK — Réglages', h2: '⚡ MEGA PACK — Réglages', cat: 'Catalogue :', genFrom: '· généré depuis', theme: 'Thème', themeD: 'Appliqué au panneau et à cette fenêtre', dark: '🌙 Sombre', light: '☀️ Clair', lang: 'Langue', langD: 'Interface du panneau', gs: 'Recherche globale', gsD: 'Raccourci système (⌘Espace est réservé par Spotlight)', set: 'Réglages', setD: 'Ouvrir cette fenêtre', dllm: 'LLM par défaut', dllmD: '⌘⏎ dans le panneau ouvre ce chat', tgt: 'Destinations du clic droit', tgtD: 'Menu flottant sur un agent/skill : envoi en un clic vers plusieurs LLM (le premier est prioritaire)', tgtHint: 'Clique pour ajouter/retirer — ordre = priorité', auto: 'Lancement au démarrage', autoD: "Ouvre MEGA PACK à l'ouverture de session", fsc: 'Raccourcis favoris', fscD: '⌘1 à ⌘9 lancent les 9 premiers favoris (menu du ⚡ ouvert)', pdir: '📁 Dossier MEGA PROMPT (.md)', pdirD: "Bibliothèque locale : skills/, agents/, perso/ — chaque prompt de l'app en fichier .md, avec le prompt d'activation prêt à coller", pdirChoose: 'Choisir', pdirOpen: 'Ouvrir', pdirSync: 'Générer tous les .md (catalogue + perso)', pdirSynced: (n, p) => `✓ ${n} fichiers .md générés — ${p}`, pdirTree: 'Arborescence : skills/<catégorie>/ · agents/<catégorie>/ · perso/<tag>/ + LISEZMOI.md', cfg: 'Configuration', cfgD: 'Favoris, récents et préférences en JSON', xp: 'Mes prompts ✍️', xpD: 'Télécharge tous tes prompts en Markdown', osel: 'Ouvrir la sélection', oselD: 'Dans le panneau : ⏎ copie · ⌘⏎ LLM par défaut · ⇧⏎ ChatGPT', saved: '✓ Enregistré', noCat: 'catalogue introuvable', intel: '🧠 Intelligence — génération IA (Atelier)', intelD: "Clé API pour générer agents & skills. Chiffrée par macOS si possible ; sinon variable d'environnement (GROQ_API_KEY, OPENAI_API_KEY…)", apiSave: 'Enregistrer la clé', apiTest: 'Tester', apiModels: 'Modèles conseillés', apiSaved: '✓ Clé enregistrée', apiDeleted: 'Clé effacée', apiTesting: 'Test en cours…', apiOk: (m, l) => `✓ Connecté — ${m} (${l} ms)`, apiFail: '✗ Échec' },
  en: { title: 'MEGA PACK — Settings', h2: '⚡ MEGA PACK — Settings', cat: 'Catalog:', genFrom: '· generated from', theme: 'Theme', themeD: 'Applied to the panel and this window', dark: '🌙 Dark', light: '☀️ Light', lang: 'Language', langD: 'Panel interface', gs: 'Global search', gsD: 'System shortcut (⌘Space is reserved by Spotlight)', set: 'Settings', setD: 'Open this window', dllm: 'Default LLM', dllmD: '⌘⏎ in the panel opens this chat', tgt: 'Right-click destinations', tgtD: 'Floating menu on an agent/skill: one-click send to several LLMs (first one wins priority)', tgtHint: 'Click to add/remove — order = priority', auto: 'Launch at startup', autoD: 'Open MEGA PACK at login', fsc: 'Favorite shortcuts', fscD: '⌘1 to ⌘9 launch the first 9 favorites (open ⚡ menu)', pdir: '📁 MEGA PROMPT folder (.md)', pdirD: "Local library: skills/, agents/, perso/ — every prompt of the app as a .md file, with the activation prompt ready to paste", pdirChoose: 'Choose', pdirOpen: 'Open', pdirSync: 'Generate all .md files (catalog + custom)', pdirSynced: (n, p) => `✓ ${n} .md files generated — ${p}`, pdirTree: 'Tree: skills/<category>/ · agents/<category>/ · perso/<tag>/ + LISEZMOI.md', cfg: 'Configuration', cfgD: 'Favorites, recents and preferences as JSON', xp: 'My prompts ✍️', xpD: 'Download all your prompts as Markdown', osel: 'Open selection', oselD: 'In the panel: ⏎ copy · ⌘⏎ default LLM · ⇧⏎ ChatGPT', saved: '✓ Saved', noCat: 'catalog not found', intel: '🧠 Intelligence — AI generation (Workshop)', intelD: 'API key used to generate agents & skills. Encrypted by macOS when possible; or use env variables (GROQ_API_KEY, OPENAI_API_KEY…)', apiSave: 'Save key', apiTest: 'Test', apiModels: 'Suggested models', apiSaved: '✓ Key saved', apiDeleted: 'Key cleared', apiTesting: 'Testing…', apiOk: (m, l) => `✓ Connected — ${m} (${l} ms)`, apiFail: '✗ Failed' },
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
  apiSave.onclick = () => {
    const key = apiKey.value.trim();
    if (!key) { apiStatusMsg(LANG === 'en' ? 'Paste a key first' : 'Colle d\'abord une clé', 'err'); return; }
    window.mgp.apiSet && window.mgp.apiSet({ provider: apiProv.value, key, model: apiModel.value.trim() });
    apiKey.value = '';
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
  window.mgp.onSettings(({ theme, lang }) => {
    themeSel.value = theme; langSel.value = lang;
    LANG = lang; applyLang();
    document.body.className = theme === 'light' ? 'light' : '';
  });
}
document.body.className = themeSel.value === 'light' ? 'light' : '';
