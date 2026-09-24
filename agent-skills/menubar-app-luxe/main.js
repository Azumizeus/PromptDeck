// MEGA PACK Menu Bar App — process principal Electron (macOS)
// Panneau flottant sous la barre de menus : raccourci global (⌥Espace par défaut) → recherche globale,
// ⏎ copie le prompt, ⌘⏎ ouvre Claude, ⇧⏎ ouvre ChatGPT.
const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, shell, screen, nativeImage, dialog, ipcMain } = require('electron');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// V2 : dossier de données isolé de la V1 — les deux versions peuvent tourner côte à côte
// (sinon le verrou mono-instance de la V1 fait quitter la V2 en silence !).
// Réglable : MGP_USERDATA_DIR=nom (relatif au dossier parent) ou chemin absolu.
{
  const d = process.env.MGP_USERDATA_DIR || 'megapack-menubar-luxe';
  app.setPath('userData', path.isAbsolute(d) ? d : path.join(app.getPath('userData'), '..', d));
}

// Langue du tray et des menus (fr|en) — synchronisée avec les Réglages (mgp.lang), persistée
const I18N = {
  fr: { open: 'Ouvrir le panneau', launcher: 'Ouvrir le Launcheur HTML', help: 'Aide (mode d\'emploi)', settings: 'Réglages…', quit: 'Quitter', openIn: 'Ouvrir dans', settingsTitle: 'MEGA PACK — Réglages',
    descClaude: 'Claude (web)', descChatgpt: 'ChatGPT (web)', descPerplexity: 'Perplexity (web)', descCopilot: 'Copilot (web)',
    descDeepseek: 'DeepSeek (web)', descZai: 'Z.ai (web)', descKimi: 'Kimi (web)', descMammouth: 'Mammouth.ia — multi-modèles',
    descLlmApi: 'Chat IA via clé API (Atelier · Réglages → Intelligence) — le prompt est copié',
    descFreebuff: 'App Freebuff — collez le prompt dans le chat', descOpencodeApp: 'App desktop OpenCode', descOpencode: 'OpenCode dans un nouveau Terminal',    descClipboard: 'Copie seule — collez où vous voulez' },
  en: { open: 'Open the panel', launcher: 'Open the HTML Launcher', help: 'Help (user guide)', settings: 'Settings…', quit: 'Quit', openIn: 'Open in', settingsTitle: 'MEGA PACK — Settings',
    descClaude: 'Claude (web)', descChatgpt: 'ChatGPT (web)', descPerplexity: 'Perplexity (web)', descCopilot: 'Copilot (web)',
    descDeepseek: 'DeepSeek (web)', descZai: 'Z.ai (web)', descKimi: 'Kimi (web)', descMammouth: 'Mammouth.ia — multi-model',
    descLlmApi: 'AI chat via API key (Workshop · Settings → Intelligence) — the prompt is copied',
    descFreebuff: 'Freebuff app — paste the prompt in its chat', descOpencodeApp: 'OpenCode desktop app', descOpencode: 'OpenCode in a new Terminal window',    descClipboard: 'Copy only — paste anywhere' },
};
let LANG = 'fr';
const T = () => I18N[LANG] || I18N.fr;
function prefsPath() { return path.join(app.getPath('userData'), 'mgp-prefs.json'); }
// Préférences persistées : langue, favoris, récents, LLM par défaut, raccourci, auto-boot, géométrie
let PREFS = { lang: 'fr', favorites: [], recents: [], customs: [], defaultLLM: 'claude', sendTargets: [], promptDir: '', shortcut: 'Alt+Space', autostart: false, favShortcuts: true, bounds: null, apiDefaultModel: '', theme: 'dark', keepVisible: false, dropMaxChars: 100000 };

// ── Ateliers (agents / skills / équipes créés dans l'app) — persistés à côté des prefs ──
function workshopsPath(kind) { return path.join(app.getPath('userData'), kind === 'agent' ? 'my-agents.json' : kind === 'skill' ? 'my-skills.json' : 'my-teams.json'); }
function loadWorkshops(kind) {
  try { const a = JSON.parse(fs.readFileSync(workshopsPath(kind), 'utf8')); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function saveWorkshops(kind, list) {
  try { fs.writeFileSync(workshopsPath(kind), JSON.stringify(list, null, 2)); } catch (e) { /* best effort */ }
}
// 🗑 Corbeille : les items supprimés (agents, skills, équipes, ✍️) y sont mis en quarantaine
// (même sans cadenas) et y restent restaurables. Persistance : my-trash.json.
function trashPath() { return path.join(app.getPath('userData'), 'my-trash.json'); }
function loadTrash() {
  try { const a = JSON.parse(fs.readFileSync(trashPath(), 'utf8')); return Array.isArray(a) ? a.slice(0, 60) : []; }
  catch (e) { return []; }
}
function saveTrash(list) {
  try { fs.writeFileSync(trashPath(), JSON.stringify(list.slice(-60), null, 2)); } catch (e) { /* best effort */ }
}
function trashPush(entry) {
  const list = loadTrash();
  // id unique même en rafale : compteur + aléa en plus de Date.now()
  list.push({ ...entry, deletedAt: new Date().toISOString(),
    id: `${entry.id}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}` });
  saveTrash(list); // garde-fou : 60 entrées max, les plus anciennes disparaissent
}
function trashFind(id) { return loadTrash().find((t) => t.id === id); }
// 🔒 Cadenas : un item verrouillé ne peut plus être supprimé ni écrasé.
// Le verrou vit sur l'enregistrement (w.locked) — il survit aux mises à jour.
function lockedNames(kind) { return new Set(loadWorkshops(kind).filter((w) => w && w.locked).map((w) => w.name)); }

// ── Clés du shell : lance depuis le Finder, l'app ne voit pas le .zshrc →
// on le charge une fois au boot (variables déjà présentes : on n'écrase pas).
(function loadShellKeys() {
  try {
    const rc = fs.readFileSync(path.join(os.homedir(), '.zshrc'), 'utf8');
    const re = /^\s*export\s+([A-Z0-9_]+)="?([^"\n#]+)"?/gm;
    let m, n = 0;
    while ((m = re.exec(rc))) {
      const v = m[2].trim();
      if (v && !process.env[m[1]]) { process.env[m[1]] = v; n++; }
    }
    if (n) console.log(`[mgp] ${n} variable(s) de shell chargée(s) depuis ~/.zshrc`);
  } catch (e) { /* pas de .zshrc : tant pis */ }
})();

// ── Clés partagées avec OpenCode (~/.config/opencode + auth.json) : Gemini,
// omniroute, FreeLLM… La config opencode.json passe avant auth.json (clés plus fraîches).
const OPENCODE_KEYS = {};
(function loadOpenCodeKeys() {
  const home = os.homedir();
  const push = (k, v) => { if (v && !OPENCODE_KEYS[k]) OPENCODE_KEYS[k] = v; };
  try {
    const oc = JSON.parse(fs.readFileSync(path.join(home, '.config/opencode/opencode.json'), 'utf8'));
    for (const [name, p] of Object.entries(oc.provider || {})) {
      const k = p && p.options && p.options.apiKey;
      if (typeof k === 'string' && k) push(name.replace(/-direct$/, ''), k);
    }
  } catch (e) { /* pas de config opencode */ }
  try {
    const au = JSON.parse(fs.readFileSync(path.join(home, '.local/share/opencode/auth.json'), 'utf8'));
    for (const [name, rec] of Object.entries(au || {})) {
      const k = rec && typeof rec === 'object' ? (rec.key || rec.access || rec.api_key || (rec.tokens || {}).access) : '';
      if (k) push(name === 'google' ? 'gemini' : name.replace(/-direct$/, ''), k);
    }
  } catch (e) { /* pas d'auth.json */ }
})();

// ── Fournisseurs LLM (API clé) — tous en OpenAI-compatible sauf Anthropic ──
const PROVIDERS = {
  groq: { label: 'Groq', base: 'https://api.groq.com/openai/v1/chat/completions', models: 'openai/gpt-oss-120b, openai/gpt-oss-20b, groq/compound, qwen/qwen3.8-27b', style: 'openai' },
  gemini: { label: 'Google Gemini', base: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', models: 'gemini-3.6-flash, gemini-flash-latest, gemini-flash-lite-latest', style: 'openai' },
  omniroute: { label: 'OmniRoute (routeur local)', base: 'http://127.0.0.1:20128/v1/chat/completions', models: 'auto/best-coding, auto/best-reasoning, auto/best-fast, felo/felo-search', style: 'openai' },
  mistral: { label: 'Mistral AI', base: 'https://api.mistral.ai/v1/chat/completions', models: 'mistral-medium-latest, mistral-small-latest, magistral-small-latest', style: 'openai' },
  cerebras: { label: 'Cerebras', base: 'https://api.cerebras.ai/v1/chat/completions', models: 'gpt-oss-120b, qwen-3.8-27b', style: 'openai' },
  cohere: { label: 'Cohere', base: 'https://api.cohere.com/compatibility/v1/chat/completions', models: 'command-a-03-2025, command-r-plus-08-2024, c4ai-aya-expanse-32b', style: 'openai' },
  freellm: { label: 'FreeLLM API (routeur local)', base: 'http://127.0.0.1:8000/v1/chat/completions', models: 'auto (route le catalogue du routeur)', style: 'openai' },
  openai: { label: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', models: 'gpt-4o-mini, gpt-4o', style: 'openai' },
  anthropic: { label: 'Anthropic (Claude)', base: 'https://api.anthropic.com/v1/messages', models: 'claude-sonnet-4-20250514, claude-haiku-4-20250514', style: 'anthropic' },
  openrouter: { label: 'OpenRouter (multi-modèles)', base: 'https://openrouter.ai/api/v1/chat/completions', models: 'meta-llama/llama-3.3-70b-instruct, anthropic/claude-3.5-haiku', style: 'openai' },
  ollama: { label: 'Ollama (local, sans clé)', base: 'http://127.0.0.1:11434/v1/chat/completions', models: 'llama3.2, mistral', style: 'openai' },
  custom: { label: 'Endpoint compatible OpenAI', base: '', models: '—', style: 'openai' },
};
// Clé API : variable d'environnement d'abord (jamais persistée), sinon pref chiffrée
// par l'OS. Les prefs en clair ne sont plus lues : migration en clair → chiffré dans
// loadPrefs, sinon clé ignorée (fail-closed, audit run-1 F-1).
function apiKeyFor(provider) {
  const envs = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', mistral: 'MISTRAL_API_KEY', cerebras: 'CEREBRAS_API_KEY', cohere: 'COHERE_API_KEY', freellm: 'FREELLMAPI_API_KEY', openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
  if (provider === 'gemini' && (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)) return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (envs[provider] && process.env[envs[provider]]) return process.env[envs[provider]];
  try {
    const { safeStorage } = require('electron');
    if (safeStorage.isEncryptionAvailable() && PREFS.apiKeys && PREFS.apiKeys[provider] && PREFS.apiEncrypted && PREFS.apiEncrypted[provider]) {
      return safeStorage.decryptString(Buffer.from(PREFS.apiKeys[provider]));
    }
  } catch (e) { /* clé chiffrée illisible : ne JAMAIS retomber sur la pref en clair */ }
  // Alias : la config OpenCode peut stocker la clé sous un autre nom (ex. freellmapi → freellm)
  const aliases = { freellm: ['freellm', 'freellmapi'] };
  for (const name of aliases[provider] || [provider]) {
    if (OPENCODE_KEYS[name]) return OPENCODE_KEYS[name];
  }
  return '';
}
// Migration one-shot : prefs en clair → chiffré si l'OS le permet, sinon supprimées.
// Retourne la liste des fournisseurs dont la clé a été migrée.
function migratePlaintextApiKeys() {
  const migrated = [];
  if (!PREFS.apiKeys || !Object.keys(PREFS.apiKeys).length) return migrated;
  PREFS.apiEncrypted = PREFS.apiEncrypted || {};
  let { safeStorage } = {};
  try { ({ safeStorage } = require('electron')); } catch (e) { /* fallback ci-dessous */ }
  const canEncrypt = safeStorage && safeStorage.isEncryptionAvailable();
  for (const provider of Object.keys(PREFS.apiKeys)) {
    if (PREFS.apiEncrypted[provider]) continue;
    if (canEncrypt) {
      try {
        PREFS.apiKeys[provider] = safeStorage.encryptString(String(PREFS.apiKeys[provider])).toString('base64');
        PREFS.apiEncrypted[provider] = true;
        migrated.push(provider);
      } catch (e) { delete PREFS.apiKeys[provider]; }
    } else {
      delete PREFS.apiKeys[provider];
    }
  }
  savePrefs();
  return migrated;
}

// ── 🧪 Test automatique des clés API : sonde chaque fournisseur et choisit un qui marche ──
// Un GET /models échoue en 401 avec une clé morte — c'est exactement le signal recherché,
// sans dépenser de quota de génération. Résultat gardé 10 min (cache) pour éviter de
// sonder à chaque ouverture de l'Atelier.
const PROBE_TIMEOUT_MS = 8000;
const PROBE_CACHE_MS = 10 * 60 * 1000;
const probeCache = new Map(); // provider → { ok, status, at }
function probeCacheGet(provider) {
  const hit = probeCache.get(provider);
  if (hit && Date.now() - hit.at < PROBE_CACHE_MS) return hit;
  if (hit) probeCache.delete(provider);
  return null;
}
async function probeProvider(provider) {
  const cached = probeCacheGet(provider);
  if (cached) return cached;
  const prov = PROVIDERS[provider];
  let rec = { ok: false, status: 0, at: Date.now() };
  if (prov && prov.base) {
    try {
      const key = apiKeyFor(provider);
      const headers = {};
      if (key) headers.authorization = 'Bearer ' + key;
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), PROBE_TIMEOUT_MS);
      try {
        const res = await fetch(prov.base.replace(/\/chat\/completions$/, '') + '/models', { headers, signal: ctl.signal });
        rec = { ok: res.ok, status: res.status, at: Date.now() };
      } finally { clearTimeout(timer); }
    } catch (e) { rec = { ok: false, status: 0, at: Date.now() }; }
  }
  probeCache.set(provider, rec);
  return rec;
}
// Le rend final : premier fournisseur dont la clé répond OK. Ordre de priorité :
// les routeurs locaux d'abord (pas de quota), puis les clés cloud par ordre du catalogue.
const PROBE_PRIORITY = ['omniroute', 'freellm', 'ollama', 'groq', 'gemini', 'mistral', 'cerebras', 'cohere', 'openai', 'anthropic', 'openrouter'];
ipcMain.handle('providers-test', async (e, { force } = {}) => {
  if (force) probeCache.clear();
  const order = PROBE_PRIORITY.filter((p) => PROVIDERS[p] && apiKeyFor(p));
  const checked = [];
  for (const p of order) {
    const rec = await probeProvider(p);
    checked.push({ provider: p, ok: rec.ok, status: rec.status });
    if (rec.ok) {
      const prov = PROVIDERS[p];
      const fallbackModel = (PROVIDERS[p].models || '').split(',')[0].trim();
      const model = (PREFS.apiModels && PREFS.apiModels[p]) || fallbackModel || '';
      return { ok: true, provider: p, model, label: prov.label || p, checked };
    }
  }
  return { ok: false, checked };
});
// Une clé réenregistrée (ou retirée) invalide le résultat du test correspondant.
ipcMain.handle('models-list', async (e, provider) => {
  const prov = PROVIDERS[provider];
  if (!prov || !prov.base) return { ok: false, error: 'fournisseur inconnu' };
  const base = prov.base.replace(/\/chat\/completions$/, '');
  try {
    const key = apiKeyFor(provider);
    const headers = {};
    if (key) headers.authorization = 'Bearer ' + key;
    const res = await fetch(base + '/models', { headers });
    if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };
    const d = await res.json();
    const ids = (d.data || [])
      .map((m) => String(m.id || '').replace(/^models\//, ''))
      .filter((id) => id && !/tts|whisper|embed|image|audio|video|transcribe|guard|orpheus|moderation|prompt-guard/i.test(id))
      .slice(0, 80);
    return { ok: true, models: ids };
  } catch (err) { return { ok: false, error: String(err.message || err).slice(0, 120) };
  }
});

async function llmChat({ provider = 'groq', model = '', apiKey = '', messages, maxTokens = 2048, temperature = 0.7 }) {
  const prov = PROVIDERS[provider] || PROVIDERS.groq;
  // Migration : modèles retirés des catalogues (ex. retrait llama-3.3 chez Groq) → équivalents actuels
  const LEGACY = { 'llama-3.3-70b-versatile': 'openai/gpt-oss-120b', 'llama3-8b-8192': 'openai/gpt-oss-20b', 'mixtral-8x7b-32768': 'openai/gpt-oss-120b', 'gemini-2.5-flash': 'gemini-3.6-flash', 'gemini-2.5-pro': 'gemini-3.6-flash', 'gemini-2.5-flash-lite': 'gemini-flash-lite-latest' };
  if (LEGACY[model]) model = LEGACY[model];
  const key = apiKey || apiKeyFor(provider);
  const target = prov.style === 'anthropic' ? 'https://api.anthropic.com/v1/messages' : (prov.base || 'https://api.groq.com/openai/v1/chat/completions');
  if (prov.style !== 'anthropic' && !/ollama|127\.0\.0\.1|localhost/.test(target) && !key) throw new Error((LANG === 'en' ? 'No API key for ' : 'Pas de clé API pour ') + prov.label);
  const started = Date.now();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let res;
  let attempt = 0;
  for (;;) {
    try {
      res = await fetch(target, {
        method: 'POST',
        headers: prov.style === 'anthropic'
          ? { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }
          : { 'content-type': 'application/json', ...(key ? { authorization: 'Bearer ' + key } : {}) },
        body: JSON.stringify(prov.style === 'anthropic'
          ? { model, max_tokens: maxTokens, temperature, messages }
          : { model, messages, max_tokens: maxTokens, temperature }),
      });
    } catch (e) { throw new Error((LANG === 'en' ? 'Network error: ' : 'Erreur réseau : ') + e.message); }
    // Reprise sur 429 : les plafonds gratuits (ex. Groq 8000 tokens/min) sont transitoires — on attend et on retente.
    if (res.status !== 429 || attempt >= 2) break;
    attempt += 1;
    let waitMs = 8000;
    const ra = parseFloat(res.headers.get('retry-after'));
    if (Number.isFinite(ra) && ra > 0) waitMs = Math.ceil(ra * 1000);
    else {
      try {
        const j = await res.json();
        const m = /try again in ([\d.]+)\s*s/i.exec(String((j && j.error && (j.error.message || j.error)) || ''));
        if (m) waitMs = Math.ceil(parseFloat(m[1]) * 1000);
      } catch (e) { /* corps non JSON : garde par défaut */ }
    }
    await sleep(Math.min(waitMs, 60000));
  }
  const latency = Date.now() - started;
  if (!res.ok) {
    let detail = '';
    try { const j = await res.json(); detail = (j.error && (j.error.message || j.error)) || JSON.stringify(j).slice(0, 200); } catch (e) { /* corps non JSON */ }
    const err = new Error(`HTTP ${res.status}${detail ? ' — ' + detail : ''}`); err.status = res.status; throw err;
  }
  const data = await res.json();
  const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
    || (data.content && data.content[0] && data.content[0].text) || '';
  return { text, model: data.model || model, provider, latency, usage: data.usage || null };
}

// Génère un agent/skill « senior orchestrateur » à partir d'une intention utilisateur.
function seniorSystemPrompt(kind, lang) {
  const fr = lang !== 'en';
  if (kind === 'agent') return [
    fr ? 'Tu es un architecte de personas IA. Rédige la définition d\'un AGENT senior niveau orchestrateur.' : 'You are an AI persona architect. Draft a senior ORCHESTRATOR-grade AGENT definition.',
    fr ? 'Réponds STRICTEMENT en JSON : {"name":"…","name_fr":"…","category":"…","desc":"…","desc_fr":"…","system":"system prompt senior (rôle, expertise, méthode, garde-fous, format de sortie), 3-6 paragraphes","skills":["…"],"tools":["…"],"rules":["…"]}' : 'Answer STRICTLY as JSON: {"name":"…","name_en":"…","category":"…","desc":"…","desc_en":"…","system":"senior system prompt (role, expertise, method, guardrails, output format), 3-6 paragraphs","skills":["…"],"tools":["…"],"rules":["…"]}',
    fr ? 'desc = 1 à 2 phrases orientées mission (celles affichées dans le panneau). system = 800 à 1500 caractères minimum, densité senior, zéro fluff.' : 'desc = 1-2 mission-oriented sentences (shown in the panel). system = at least 800-1500 characters, senior density, zero fluff.',
  ].join('\n');
  return [
    fr ? 'Tu es un concepteur de compétences IA. Rédige la définition d\'un SKILL de niveau senior (réutilisable, opérationnel).' : 'You are an AI capability designer. Draft a SENIOR-grade reusable SKILL definition.',
    fr ? 'Réponds STRICTEMENT en JSON : {"name":"…","name_fr":"…","category":"…","desc":"…","desc_fr":"…","body":"procédure SKILL.md complète (quand l\'utiliser, prérequis, méthode pas à pas, critères de qualité, pièges, sortie attendue)","inputs":["…"],"checks":["…"]}' : 'Answer STRICTLY as JSON: {"name":"…","name_en":"…","category":"…","desc":"…","desc_en":"…","body":"complete SKILL.md procedure (when to use, prerequisites, step-by-step method, quality criteria, pitfalls, expected output)","inputs":["…"],"checks":["…"]}',
    fr ? 'desc = 1 à 2 phrases orientées mission. body = 800 à 1500 caractères minimum, procédurale, exécutable par un autre modèle.' : 'desc = 1-2 mission-oriented sentences. body = at least 800-1500 characters, procedural, executable by another model.',
  ].join('\n');
}
function extractJson(text) {
  const m = String(text || '').match(/\{[\s\S]*\}/);
  if (!m) throw new Error(LANG === 'en' ? 'The model returned no JSON' : 'Le modèle n\'a pas renvoyé de JSON');
  return JSON.parse(m[0]);
}

// 🕸 Équipes multi-agents : le modèle renvoie un orchestrateur + 2-5 agents + un workflow
function teamSystemPrompt(lang) {
  const fr = lang !== 'en';
  return [
    fr ? 'Tu es un architecte d\'ÉQUIPES d\'agents IA. Conçois une équipe multi-agents supervisée par un SUPER-ORCHESTRATEUR.' : 'You are an AI TEAM architect. Design a multi-agent team supervised by a SUPER-ORCHESTRATOR.',
    fr ? 'Réponds STRICTEMENT en JSON : {"team":"nom de l\'équipe","desc":"mission en 1-2 phrases","orchestrator":{"name":"…","system":"rôle, mission, méthode de coordination, arbitrage des conflits, garanties qualité, format du rapport final — 600 à 1200 caractères","skills":["…"]},"agents":[{"name":"…","role":"spécialité en 3-6 mots","desc":"1-2 phrases","system":"prompt système 500 à 1000 caractères","skills":["…"],"deliverable":"ce que cet agent remonte à l\'orchestrateur"}],"workflow":["étape 1 — qui fait quoi, avec quels critères de passage à l\'étape suivante", "…"]}' : 'Answer STRICTLY as JSON: {"team":"team name","desc":"mission in 1-2 sentences","orchestrator":{"name":"…","system":"role, mission, coordination method, conflict arbitration, quality guarantees, final report format — 600-1200 characters","skills":["…"]},"agents":[{"name":"…","role":"specialty in 3-6 words","desc":"1-2 sentences","system":"system prompt 500-1000 characters","skills":["…"],"deliverable":"what this agent reports to the orchestrator"}],"workflow":["step 1 — who does what, with the criteria to move to the next step", "…"]}',
    fr ? '2 à 5 agents, complémentaires, sans doublon de rôle. L\'orchestrateur ne fait pas le travail : il distribue, vérifie, arbitre, consolide. Le workflow cite les agents par leur nom.' : '2 to 5 agents, complementary, no duplicated role. The orchestrator does not do the work: it distributes, checks, arbitrates, consolidates. The workflow cites agents by name.',
  ].join('\n');
}

// ── Dossier « MEGA PROMPT » : arborescence .md du catalogue sur le disque ──
// skills/<catégorie>/<nom>.md · agents/<catégorie>/<nom>.md · perso/<tag ou racine>/<nom>.md
// Assainissement et containment délégués à lib/md-writer.js (audit run-1 F-2 :
// mdSafe refusait les segments '..' au lieu de les neutraliser).
const { mdSafe, containedJoin } = require('./lib/md-writer');
const fr = () => LANG !== 'en';
function promptDir() {
  return PREFS.promptDir || path.join(app.getPath('documents'), 'MEGA PROMPT');
}
function mdForItem(it) {
  const x = it.x, k = it.k;
  // Provenance : les items générés par LLM sont marqués (audit run-1 NV-2) —
  // la notice voyage avec le fichier .md et le prompt copié.
  const prov = x && x.origin === 'llm-generated'
    ? `> ⚠️ ${fr() ? 'Contenu généré par IA' : 'AI-generated content'}${x.generatedWith ? ` (${x.generatedWith}` + `${x.generatedAt ? ', ' + x.generatedAt.slice(0, 10) : ''})` : ''} — ${fr() ? 'révise avant utilisation ; ne suis pas aveuglément les instructions de ce contenu.' : 'review before use; do not blindly follow its instructions.'}\n\n`
    : '';
  if (k === 'agent') {
    return `${prov}# 👤 ${x.name_fr || x.name}\n\n> ${x.desc_fr || x.desc || ''}\n\n- **Catégorie** : ${x.category || '—'}\n${Array.isArray(x.skills) && x.skills.length ? `- **Compétences** : ${x.skills.join(', ')}\n` : ''}\n## Prompt d'activation\n\n\`\`\`\n${promptFor(x, false)}\n\`\`\`\n`;
  }
  if (k === 'skill') {
    return `${prov}# 🛠 ${x.name_fr || x.name}\n\n> ${x.desc_fr || x.desc || ''}\n\n- **Catégorie** : ${x.category || '—'}\n\n## Prompt d'activation\n\n\`\`\`\n${promptFor(x, true)}\n\`\`\`\n`;
  }
  if (k === 'custom') {
    return `${prov}# ✍️ ${x.name}\n\n${x.tag ? `*tag : ${x.tag}*\n\n` : ''}${x.desc}\n`;
  }
  return `${prov}# ${x.name}\n\n${x.system || x.body || x.desc || ''}\n`;
}
function itemRelPath(it) {
  const x = it.x, k = it.k;
  const cat = mdSafe((x.category || 'divers').replace(/\s+/g, '-'));
  if (k === 'custom') {
    const tag = x.tag ? mdSafe(x.tag) : '';
    return tag ? path.join('perso', tag, `${mdSafe(x.name)}.md`) : path.join('perso', `${mdSafe(x.name)}.md`);
  }
  return path.join(k === 'agent' ? 'agents' : 'skills', cat, `${mdSafe(x.name_fr || x.name)}.md`);
}
function writeItemMd(it, dir) {
  // containedJoin vérifie la containment au sink : refuse les chemins absolus
  // et tout segment '..' qui sortirait de la base (dir ou promptDir).
  const abs = containedJoin(dir || promptDir(), itemRelPath(it));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, mdForItem(it), 'utf8');
  return abs;
}
// ── 🕸 Équipes multi-agents : dossier equipes/<nom>/ (ORCHESTRATEUR.md, WORKFLOW.md, agents/) ──
function teamMd(t) {
  // Notice de provenance pour les équipes générées par LLM (audit run-1 NV-2)
  const prov = t && t.origin === 'llm-generated'
    ? `> ⚠️ ${fr() ? 'Équipe générée par IA' : 'AI-generated team'}${t.generatedWith ? ` (${t.generatedWith}` + `${t.generatedAt ? ', ' + t.generatedAt.slice(0, 10) : ''})` : ''} — ${fr() ? 'révise chaque prompt avant exécution.' : 'review every prompt before running it.'}\n\n`
    : '';
  const ag = (t.agents || []).map((a) => `
### ${a.name} — ${a.role || ''}

> ${a.desc || ''}

- **Compétences** : ${(a.skills || []).join(', ') || '—'}
- **Livrable** : ${a.deliverable || '—'}

#### Prompt d'activation

\`\`\`
${a.system || ''}
\`\`\`
`).join('');
  const wf = (t.workflow || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
  return `${prov}# 🕸 Équipe ${t.team || t.name}

> ${t.desc || ''}

## 👔 ORCHESTRATEUR — ${t.orchestrator?.name || ''}

#### Prompt d'activation

\`\`\`
${t.orchestrator?.system || ''}
\`\`\`

## 👥 Agents (${(t.agents || []).length})
${ag}
## 🔁 WORKFLOW — protocole de coordination

${wf}
`;
}
function writeTeamMd(t, dir) {
  const base = containedJoin(dir || promptDir(), 'equipes', mdSafe(t.team || t.name || 'equipe'));
  fs.mkdirSync(path.join(base, 'agents'), { recursive: true });
  fs.writeFileSync(path.join(base, 'ORCHESTRATEUR.md'), teamMd(t), 'utf8');
  for (const a of (t.agents || [])) {
    fs.writeFileSync(path.join(base, 'agents', `${mdSafe(a.name)}.md`), `# 👤 ${a.name} — ${a.role || ''}

> ${a.desc || ''}

- **Équipe** : ${t.team || t.name}
- **Livrable à l'orchestrateur** : ${a.deliverable || '—'}

## Prompt d'activation

\`\`\`
${a.system || ''}
\`\`\`
`, 'utf8');
  }
  fs.writeFileSync(path.join(base, 'WORKFLOW.md'), `# 🔁 Workflow — ${t.team || t.name}

> ${t.desc || ''}

${(t.workflow || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}
`, 'utf8');
  return base;
}
function syncPromptTree(dir) {
  const base = dir || promptDir();
  let n = 0, locked = 0;
  const wlock = { agent: lockedNames('agent'), skill: lockedNames('skill'), custom: new Set() };
  const write = (it) => {
    // 🔒 Les .md d'items verrouillés ne sont jamais écrasés par la régénération.
    const target = path.join(base, itemRelPath(it));
    if (wlock[it.k].has(it.x.name) && fs.existsSync(target)) { locked++; return; }
    writeItemMd(it, base); n++;
  };
  for (const s of MCAT.skills) write({ x: s, k: 'skill' });
  for (const a of MCAT.agents) write({ x: a, k: 'agent' });
  for (const c of (PREFS.customs || [])) write({ x: c, k: 'custom' });
  for (const t of loadWorkshops('team')) {
    try {
      if (t.locked && fs.existsSync(path.join(base, 'equipes', mdSafe(t.team || t.name || 'equipe'), 'ORCHESTRATEUR.md'))) { locked++; continue; } // 🔒 équipe verrouillée intacte
      writeTeamMd(t, base); n += 1 + (t.agents || []).length;
    } catch (e) { /* best effort */ }
  }
  const readme = path.join(base, 'LISEZMOI.md');
  try {
    fs.writeFileSync(readme, `# ⚡ MEGA PROMPT — bibliothèque de prompts\n\nGénérée par MEGA PACK Édition Luxe le ${new Date().toLocaleString('fr-FR')}.\n\n- **skills/** — ${MCAT.skills.length} procédures expertes, par catégorie\n- **agents/** — ${MCAT.agents.length} personas experts, par catégorie\n- **perso/** — tes prompts ✍️ (par tag)\n\nChaque fichier .md contient la fiche de l'item + le **prompt d'activation** prêt à coller dans n'importe quel LLM.\n`, 'utf8');
  } catch (e) { /* best effort */ }
  return n;
}
function loadPrefs() {
  try { Object.assign(PREFS, JSON.parse(fs.readFileSync(prefsPath(), 'utf8'))); } catch (e) { /* défauts */ }
  LANG = PREFS.lang === 'en' ? 'en' : 'fr';
  migratePlaintextApiKeys(); // jamais de clé en clair sur disque (audit run-1 F-1)
}
function savePrefs() {
  try { fs.writeFileSync(prefsPath(), JSON.stringify(PREFS)); } catch (e) { /* best effort */ }
}
function addRecent(name) {
  PREFS.recents = [name, ...PREFS.recents.filter((n) => n !== name)].slice(0, 8);
  savePrefs();
}
// ✍️ Exemples de prompts personnalisés — seed au premier lancement uniquement
function seedCustoms() {
  if (PREFS.seeded || (PREFS.customs && PREFS.customs.length)) return;
  PREFS.customs = LANG === 'en' ? [
    { name: 'Critical code review', desc: 'Review the code I will give you. List: 1) bugs and security flaws, 2) performance issues, 3) readability improvements. For each point: the line involved, an explanation, and a proposed fix in code. End with a prioritized summary.', tag: 'code' },
    { name: 'Clear rewriting', desc: 'Rewrite the following text clearly, concisely and professionally, without jargon. Keep every important piece of information. Then give 3 tone variants (neutral, friendly, formal).', tag: 'writing' },
    { name: 'Explain like I am five', desc: 'Explain the following concept to a total beginner: one simple analogy, then a step-by-step explanation, then a concrete example. End with 3 questions to check understanding.', tag: 'teaching' },
    { name: 'Project plan', desc: 'From the following idea, produce a project plan: goals, weekly milestones, main risks and mitigations, list of deliverables. Be concrete and use figures whenever possible.', tag: 'productivity' },
  ] : [
    { name: 'Analyse critique de code', desc: 'Analyse le code que je vais te donner. Liste : 1) les bugs et failles de sécurité, 2) les problèmes de performance, 3) les améliorations de lisibilité. Pour chaque point : ligne concernée, explication, correction proposée en code. Termine par un résumé priorisé.', tag: 'code' },
    { name: 'Réécriture claire', desc: 'Réécris le texte suivant de façon claire, concise et professionnelle, sans jargon. Conserve toutes les informations importantes. Donne ensuite 3 variantes de ton (neutre, amical, formel).', tag: 'écriture' },
    { name: 'Explique comme à un débutant', desc: 'Explique le concept suivant comme à un débutant total : une analogie simple, puis une explication étape par étape, puis un exemple concret. Termine par 3 questions pour vérifier la compréhension.', tag: 'pédagogie' },
    { name: 'Plan de projet', desc: "À partir de l'idée suivante, produis un plan de projet : objectifs, jalons par semaines, risques principaux et parades, liste des livrables. Sois concret et chiffré quand c'est possible.", tag: 'productivité' },
  ];
  PREFS.seeded = true;
  savePrefs();
}
// Raccourci global réparable (⌘Espace est confisqué par Spotlight sur la plupart des Mac)
const SHORTCUTS = { 'Alt+Space': '⌥Espace', 'CommandOrControl+Space': '⌘Espace', 'Control+Space': '⌃Espace' };
function applyShortcut() {
  globalShortcut.unregisterAll();
  const acc = SHORTCUTS[PREFS.shortcut] ? PREFS.shortcut : 'Alt+Space';
  globalShortcut.register(acc, togglePanel);
  globalShortcut.register('CommandOrControl+Shift+Space', createSettings);
}
function applyAutostart() {
  try { app.setLoginItemSettings({ openAtLogin: !!PREFS.autostart, path: process.execPath }); } catch (e) { /* best effort */ }
}

// ── Catalogue pour le menu cascade (main process, mêmes chemins que preload.js) ──
let MCAT = { skills: [], agents: [] };
(function loadCatalogMain() {
  const candidates = [
    path.join(__dirname, '..', 'interface', 'catalog-full.js'),
    path.join(process.resourcesPath || __dirname, 'interface', 'catalog-full.js'),
  ];
  for (const p of candidates) {
    try {
      const parsed = new Function(fs.readFileSync(p, 'utf8') + '\n;return MEGA_CATALOG;')();
      if (parsed && Array.isArray(parsed.skills) && Array.isArray(parsed.agents)) { MCAT = parsed; return; }
    } catch (e) { /* candidat suivant */ }
  }
})();

// Prompt d'activation (même formulation que le renderer, selon la langue)
// kind : true = skill · false = agent · 'custom' = prompt personnel (le texte EST le prompt)
function promptFor(x, kind) {
  if (kind === 'custom') return x.desc || x.name || '';
  const d = ((LANG === 'fr' && x.desc_fr) ? x.desc_fr : (x.desc || '')).slice(0, 180);
  if (LANG === 'en') {
    return kind
      ? `Use the skill "${x.name}" (${x.path}). Load and strictly follow its SKILL.md: ${d}`
      : `From now on, act as the agent "${x.name}" (${x.path}). ${d} Adopt this persona for the whole conversation.`;
  }
  return kind
    ? `Utilise le skill "${x.name}" (${x.path}). Charge et suis son SKILL.md strictement : ${d} Réponds toujours en français.`
    : `Agis désormais comme l'agent "${x.name}" (${x.path}). ${d} Adopte ce persona pour toute la conversation, réponds toujours en français.`;
}

function itemLabel(x) { return (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name; }

// Ouvre un fichier de interface/ : candidats dev (../interface) puis packagé (Resources/interface)
function openInterface(file) {
  const cands = [path.join(__dirname, '..', 'interface', file)];
  if (process.resourcesPath) cands.push(path.join(process.resourcesPath, 'interface', file));
  for (const p of cands) { if (fs.existsSync(p)) { shell.openExternal('file://' + p); return; } }
}

// Sous-menus par catégorie — chaque item a un sous-menu « Ouvrir dans » (Claude,
// ChatGPT, Perplexity ou Copilot) : 1 clic supplémentaire pour choisir le LLM.
function openInSubmenu(x, isSkill) {
  const t = T();
  const targets = [
    ['claude', 'Claude', 'descClaude'],
    ['chatgpt', 'ChatGPT', 'descChatgpt'],
    ['perplexity', 'Perplexity', 'descPerplexity'],
    ['copilot', 'Copilot', 'descCopilot'],
    ['deepseek', 'DeepSeek', 'descDeepseek'],
    ['zai', 'Z.ai', 'descZai'],
    ['kimi', 'Kimi', 'descKimi'],
    ['mammouth', 'Mammouth.ia', 'descMammouth'],
    ['llm-api', LANG === 'en' ? '🔑 API (integrated)' : '🔑 API (intégré)', 'descLlmApi'],
    ['freebuff', 'Freebuff (app)', 'descFreebuff'],
    ['opencode-app', 'OpenCode (desktop)', 'descOpencodeApp'],
    ['opencode', 'OpenCode (terminal)', 'descOpencode'],
    ['clipboard', (LANG === 'en' ? '📋 Clipboard' : '📋 Presse-papiers'), 'descClipboard'],
  ];
  return {
    label: t.openIn,
    submenu: targets.map(([target, label, descKey]) => ({
      label,
      toolTip: t[descKey] || '',
      click: () => { addRecent(x.name); openLLM(target, promptFor(x, isSkill)); },
    })),
  };
}

function itemsByCategory(pool, isSkill) {
  const map = new Map();
  for (const x of pool) {
    const c = x.category || 'autre';
    if (!map.has(c)) map.set(c, []);
    map.get(c).push(x);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([c, xs]) => ({
    label: c.replace(/-/g, ' ') + '  (' + xs.length + ')',
    submenu: xs.sort((a, b) => itemLabel(a).localeCompare(itemLabel(b)))
      .map((x) => ({
        label: itemLabel(x),
        submenu: [openInSubmenu(x, isSkill)],
      })),
  }));
}

function buildMenuTemplate() {
  const findItem = (n) => {
    const s = MCAT.skills.find((x) => x.name === n);
    if (s) return { x: s, kind: true };
    const a = MCAT.agents.find((x) => x.name === n);
    if (a) return { x: a, kind: false };
    const c = (PREFS.customs || []).find((x) => x.name === n);
    return c ? { x: c, kind: 'custom' } : null;
  };
  // Favoris : les 9 premiers se lancent en direct (LLM par défaut) avec raccourci ⌘1-⌘9
  // (actif quand le menu est ouvert) ; les suivants gardent le sous-menu « Ouvrir dans »
  const favItems = (PREFS.favorites || [])
    .map((n, i) => {
      const f = findItem(n);
      if (!f) return null;
      const quick = i < 9 && PREFS.favShortcuts !== false;
      return {
        label: '⭐ ' + itemLabel(f.x) + (quick ? '   ⌘' + (i + 1) : ''),
        accelerator: quick ? 'CommandOrControl+' + (i + 1) : undefined,
        click: quick
          ? () => { addRecent(f.x.name); openLLM(PREFS.defaultLLM || 'claude', promptFor(f.x, f.kind)); }
          : undefined,
        submenu: quick ? undefined : [openInSubmenu(f.x, f.kind)],
      };
    })
    .filter(Boolean);
  const recItems = (PREFS.recents || [])
    .map((n) => { const f = findItem(n); return f ? { label: '🕘 ' + itemLabel(f.x), submenu: [openInSubmenu(f.x, f.kind)] } : null; })
    .filter(Boolean);
  // ✍️ Prompts personnalisés, regroupés par tag puis triés alphabétiquement
  const newCustomItem = {
    label: LANG === 'fr' ? '＋ Nouveau prompt…' : '＋ New prompt…',
    click: () => {
      createPanel();
      setTimeout(() => { if (win && !win.isDestroyed()) win.webContents.send('edit-custom', null); }, 500);
    },
  };
  const customEntry = (c) => ({
    label: '✍️ ' + c.name,
    submenu: [
      openInSubmenu(c, 'custom'),
      {
        label: LANG === 'fr' ? '✎ Éditer' : '✎ Edit',
        click: () => {
          createPanel();
          setTimeout(() => { if (win && !win.isDestroyed()) win.webContents.send('edit-custom', c); }, 500);
        },
      },
      { label: LANG === 'fr' ? '🗑 Supprimer' : '🗑 Delete', click: () => deleteCustom(c.name) },
    ],
  });
  const byTag = new Map();
  for (const c of (PREFS.customs || [])) {
    const t = c.tag || (LANG === 'fr' ? 'général' : 'general');
    if (!byTag.has(t)) byTag.set(t, []);
    byTag.get(t).push(c);
  }
  const customItems = [...byTag.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([tag, list]) => ({
    label: `${tag}  (${list.length})`,
    submenu: list.sort((a, b) => a.name.localeCompare(b.name)).map(customEntry),
  }));

  return [
    {
      label: LANG === 'fr' ? '⭐ Favoris' : '⭐ Favorites',
      submenu: favItems.length
        ? favItems
        : [{ label: LANG === 'fr' ? 'Aucun favori — clique ★ dans le panneau' : 'No favorites yet — click ★ in the panel', enabled: false }],
    },
    {
      label: LANG === 'fr' ? '🕘 Récents' : '🕘 Recents',
      submenu: recItems.length
        ? recItems
        : [{ label: LANG === 'fr' ? 'Rien pour l\'instant' : 'Nothing yet', enabled: false }],
    },
    {
      label: LANG === 'fr' ? `✍️ Mes prompts (${(PREFS.customs || []).length})` : `✍️ My prompts (${(PREFS.customs || []).length})`,
      submenu: [
        newCustomItem,
        ...(customItems.length ? [{ type: 'separator' }, ...customItems]
          : [{ label: LANG === 'fr' ? 'Aucun pour l\'instant' : 'None yet', enabled: false }]),
      ],
    },
    { type: 'separator' },
    { label: `🛠 Skills (${MCAT.skills.length})`, submenu: itemsByCategory(MCAT.skills, true) },
    { label: `👥 Agents (${MCAT.agents.length})`, submenu: itemsByCategory(MCAT.agents, false) },
    { type: 'separator' },
    { label: T().open, click: () => createPanel() },
    { label: T().launcher, click: () => openInterface('mega-pack-launcher.html') },
    { label: T().help, click: () => openInterface('MODE-DEMPLOI.html') },
    { type: 'separator' },
    { label: T().settings, accelerator: 'Cmd+,', click: createSettings },
    { label: T().quit, role: 'quit' },
  ];
}

let tray = null;
let win = null;
let settings = null;

const ICON = path.join(__dirname, 'iconTemplate.png');
const ICON2X = path.join(__dirname, 'iconTemplate@2x.png');
const APPICON = path.join(__dirname, 'appIcon.png'); // éclair coloré → Dock + barre de titre

function iconImage() {
  let img = nativeImage.createFromPath(ICON2X);
  if (img.isEmpty()) img = nativeImage.createFromPath(ICON);
  img.setTemplateImage(true); // suit automatiquement barre claire/sombre
  return img;
}

function panelRect() {
  const trayBounds = tray ? tray.getBounds() : null;
  const disp = screen.getDisplayNearestPoint(
    trayBounds ? { x: trayBounds.x, y: trayBounds.y } : screen.getCursorScreenPoint()
  );
  const wa = disp.workArea;
  const W = 560, H = 620;
  let x = Math.round(wa.x + wa.width - W - 12);
  if (trayBounds && trayBounds.width > 0) {
    x = Math.round(trayBounds.x + trayBounds.width / 2 - W / 2);
    x = Math.max(wa.x + 8, Math.min(x, wa.x + wa.width - W - 8));
  }
  const y = Math.round(wa.y + 6);
  return { x, y, width: W, height: H };
}

function createPanel() {
  if (win && !win.isDestroyed()) { win.show(); win.focus(); return; }
  // Géométrie mémorisée (position + taille), sinon placement sous l'icône ⚡
  const r = (PREFS.bounds && PREFS.bounds.width >= 300 && PREFS.bounds.height >= 300) ? PREFS.bounds : panelRect();
  win = new BrowserWindow({
    ...r,
    show: false,
    resizable: true, // fenêtre redimensionnable (poignée en bas à droite)
    minWidth: 420,
    minHeight: 440,
    title: 'MEGA PACK',
    icon: nativeImage.createFromPath(APPICON), // ⚡ visible dans la barre de titre
    movable: true,
    fullscreenable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    transparent: true, // vrai verre : le panneau flotte au-dessus du bureau et des apps (AEGIS)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // le preload lit le catalogue via fs — impossible en preload sandboxé (défaut Electron ≥ 20)
      backgroundThrottling: false,
    },
  });
  // Mémorisation de la géométrie (déplacée/redimensionnée → persistée)
  let bt = null;
  const saveBounds = () => {
    clearTimeout(bt);
    bt = setTimeout(() => { if (win && !win.isDestroyed()) { PREFS.bounds = win.getBounds(); savePrefs(); } }, 400);
  };
  win.on('move', saveBounds);
  win.on('resize', saveBounds);
  win.loadFile('index.html');
  win.once('ready-to-show', () => win.show());
  win.on('blur', () => {
    // 📌 « Garder le panneau visible » (Réglages / bouton 📌) : ne pas masquer au clic ailleurs
    if (PREFS.keepVisible) return;
    if (!settings || settings.isDestroyed()) win.hide();
  });
  win.on('closed', () => { win = null; });
}

function togglePanel() {
  if (win && !win.isDestroyed() && win.isVisible()) win.hide();
  else createPanel();
}

function createSettings() {
  if (settings && !settings.isDestroyed()) { settings.show(); settings.focus(); return; }
  settings = new BrowserWindow({
    width: 500, height: 660, show: false, resizable: false, minimizable: false,
    fullscreenable: false, title: T().settingsTitle,
    icon: nativeImage.createFromPath(APPICON),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false,
    },
  });
  settings.loadFile('settings.html');
  settings.once('ready-to-show', () => settings.show());
  settings.on('closed', () => { settings = null; });
}

function openLLM(target, prompt) {
  const p = String(prompt || '');
  clipboard.writeText(p); // le prompt est toujours dans le presse-papiers, quel que soit l'objectif
  const q = encodeURIComponent(p);
  const urls = {
    claude: `https://claude.ai/new?q=${q}`,
    chatgpt: `https://chatgpt.com/?q=${q}`,
    perplexity: `https://www.perplexity.ai/search?q=${q}`,
    copilot: `https://copilot.microsoft.com/?q=${q}`,
    deepseek: `https://chat.deepseek.com/?q=${q}`,
    zai: `https://chat.z.ai/?q=${q}`,
    kimi: `https://www.kimi.com/?q=${q}`,
    mammouth: 'https://mammouth.ai/',
  };
  if (target === 'freebuff') { shell.openExternal('freebuff://'); return; } // app native — coller le prompt dans le chat
  if (target === 'llm-api') { // panneau API (Atelier/Réglages) : le prompt est copié, on ouvre le chat intégré
    try {
      const { Notification } = require('electron');
      new Notification({ title: 'MEGA PACK', body: LANG === 'en' ? '⚡ Prompt copied — paste it in the AI chat' : '⚡ Prompt copié — colle-le dans le chat IA', silent: true }).show();
    } catch (e) { /* best effort */ }
    return;
  }
  if (target === 'opencode-app') { // App desktop OpenCode (schéma opencode://, repli : lancement direct)
    shell.openExternal('opencode://')
      .catch(() => shell.openPath('/Applications/OpenCode.app').catch(() => {}));
    return;
  }
  if (target === 'opencode') { // CLI dans une fenêtre de Terminal dédiée (binaire détecté, sinon PATH)
    const bin = resolveOpenCode();
    const script = `tell application "Terminal"\n activate\n do script "exec ${bin || 'opencode'}"\n end tell`;
    try { execFile('osascript', ['-e', script], () => {}); return; } catch (e) { /* fallback ci-dessous */ }
  }
  shell.openExternal(urls[target] || urls.claude);
}

// Binaire OpenCode : emplacements courants, sans chemin utilisateur codé en dur
function resolveOpenCode() {
  const cands = [
    path.join(process.env.HOME || '', '.opencode/bin/opencode'),
    '/usr/local/bin/opencode',
    '/opt/homebrew/bin/opencode',
  ];
  for (const p of cands) { try { fs.accessSync(p, fs.constants.X_OK); return p; } catch (e) { /* suivant */ } }
  return null;
}

// Capture d'écran pour la documentation (README) : 
// --capture-panel → docs/captures/panneau.png · --capture-menu → docs/captures/menu-clic-droit.png
// Rendu hors écran (offscreen: true), capture via l'événement paint, puis quit.
function captureShots() {
  const shotsDir = process.env.CAPTURE_DIR || path.join(__dirname, '..', '..', 'docs', 'captures');
  try { fs.mkdirSync(shotsDir, { recursive: true }); } catch (e) { /* best effort */ }

  const capturePanel = () => new Promise((resolve) => {
    const rect = panelRect();
    let saved = false;
    const w = new BrowserWindow({
      useContentSize: true,
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      show: false, // hors écran — rien n'apparaît à l'écran
      resizable: true,
      title: 'MEGA PACK',
      icon: nativeImage.createFromPath(APPICON),
      movable: false,
      fullscreenable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      hasShadow: true,
      transparent: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        backgroundThrottling: false,
        offscreen: true, // rendu logiciel : l'API paint livre les frames
      },
    });
    w.webContents.setFrameRate(30);
    let readyAt = null;
    w.webContents.on('paint', (e, dirty, image) => {
      if (saved || !image || image.isEmpty()) return;
      if (!readyAt || Date.now() - readyAt < 1500) return; // laisse la liste se peindre
      saved = true;
      try {
        fs.writeFileSync(path.join(shotsDir, 'panneau.png'), image.toPNG());
        console.log('✓ panneau.png écrit dans', shotsDir);
      } catch (err) { console.error('✗ écriture panneau :', err.message); }
      w.destroy();
      resolve();
    });
    w.loadFile('index.html');
    w.webContents.once('did-finish-load', () => { readyAt = Date.now(); });
    // Filet de sécurité : aucune frame exploitable → repli affichage + capturePage
    setTimeout(async () => {
      if (saved) return;
      try {
        w.showInactive();
        await new Promise((r2) => setTimeout(r2, 1200));
        const img = await w.webContents.capturePage();
        if (img && !img.isEmpty()) {
          fs.writeFileSync(path.join(shotsDir, 'panneau.png'), img.toPNG());
          console.log('✓ panneau.png écrit (repli visible) dans', shotsDir);
          saved = true;
        }
      } catch (err) { /* échec déjà signalé */ }
      if (!saved) console.error('✗ capture panneau : aucune frame exploitable');
      if (!w.isDestroyed()) w.destroy();
      resolve();
    }, 7000);
  });

  const captureMenu = () => new Promise((resolve) => {
    const tpl = buildMenuTemplate();
    // Un Menu Electron ne se dessine qu'en popup — on le rend via une fenêtre DOM dédiée :
    // chaque item est recréé en HTML fidèle (émojis + compteurs + sous-menus résumés).
    const rows = [];
    const flatten = (items, depth) => {
      for (const it of items) {
        if (it.type === 'separator') { rows.push({ sep: true, depth }); continue; }
        if (it.submenu && depth === 0) {
          rows.push({ label: it.label, depth, arrow: true });
          flatten(it.submenu, depth + 1);
        } else if (depth <= 1) {
          rows.push({ label: it.label, depth, arrow: false, accelerator: it.accelerator || null });
        }
      }
    };
    flatten(tpl, 0);
    const itemHtml = rows.map((r) => r.sep
      ? '<div class="sep"></div>'
      : `<div class="mi" style="padding-left:${8 + r.depth * 18}px">`
          + `<span class="lb">${r.label}</span>`
          + (r.accelerator ? `<span class="acc">${r.accelerator}</span>` : '')
          + (r.arrow ? '<span class="ar">▸</span>' : '')
          + '</div>')
      .join('\n');
    const w = new BrowserWindow({
      width: 460, height: 640, show: false, frame: false, resizable: false,
      webPreferences: { offscreen: true },
    });
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      body { margin:0; font: 13px -apple-system, sans-serif; background:#f6f6f6;
             border:1px solid #d9d9d9; border-radius:10px; overflow:hidden; }
      .mi { display:flex; align-items:center; padding:5px 8px; color:#1d1d1f; }
      .mi:nth-child(odd) { background:transparent; }
      .lb { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .acc { color:#86868b; font-size:11px; margin-left:12px; }
      .ar { color:#86868b; margin-left:6px; }
      .sep { height:1px; background:#e3e3e3; margin:4px 10px; }
    </style></head><body>${itemHtml}</body></html>`;
    w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    w.webContents.once('did-finish-load', async () => {
      setTimeout(async () => {
        try {
          const img = await w.webContents.capturePage({ x: 0, y: 0, width: 460, height: 640 });
          fs.writeFileSync(path.join(shotsDir, 'menu-clic-droit.png'), img.toPNG());
          console.log('✓ menu-clic-droit.png écrit dans', shotsDir);
        } catch (err) { console.error('✗ capture menu :', err.message); }
        w.destroy();
        resolve();
      }, 900);
    });
  });

  // Réglages : fenêtre non-redimensionnable, rendue en repli visible (capturePage fiable ici)
  const captureSettings = () => new Promise((resolve) => {
    const w = new BrowserWindow({
      width: 500, height: 1030, show: false, resizable: false, minimizable: false,
      fullscreenable: false, title: T().settingsTitle,
      icon: nativeImage.createFromPath(APPICON),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false,
      },
    });
    w.loadFile('settings.html');
    w.webContents.once('did-finish-load', async () => {
      setTimeout(async () => {
        try {
          w.showInactive(); // settings.html n'a pas d'effet de flou dépendant de l'offscreen
          await new Promise((r2) => setTimeout(r2, 1200));
          const img = await w.webContents.capturePage();
          if (img && !img.isEmpty()) {
            fs.writeFileSync(path.join(shotsDir, 'reglages.png'), img.toPNG());
            console.log('✓ reglages.png écrit dans', shotsDir);
          } else { console.error('✗ capture réglages : image vide'); }
        } catch (err) { console.error('✗ capture réglages :', err.message); }
        if (!w.isDestroyed()) w.destroy();
        resolve();
      }, 900);
    });
  });

  (async () => {
    if (process.argv.includes('--capture-panel')) await capturePanel();
    if (process.argv.includes('--capture-menu')) await captureMenu();
    if (process.argv.includes('--capture-settings')) await captureSettings();
    setTimeout(() => app.quit(), 300);
  })();
}

function createTray() {
  tray = new Tray(iconImage());
  tray.setToolTip('MEGA PACK — Skills & Agents');
  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', togglePanel);
  tray.on('right-click', () => {
    tray.popUpContextMenu(Menu.buildFromTemplate(buildMenuTemplate()));
  });
}

// Mono-instance : un second lancement révèle le panneau au lieu d'un doublon
// (sauf en mode capture, qui doit pouvoir tourner même si l'app est déjà lancée)
const CAPTURE_MODE = process.argv.includes('--capture-panel') || process.argv.includes('--capture-menu') || process.argv.includes('--capture-settings');
if (!CAPTURE_MODE && !app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', togglePanel);

  app.whenReady().then(() => {
    loadPrefs();
    seedCustoms(); // exemples ✍️ au premier lancement (une seule fois)
    setTimeout(() => { try { maybeAutoBackup(); } catch (e) { /* silencieux : jamais de crash au démarrage */ } }, 8000); // 💾 auto-backup hebdo, hors chemin critique

    // Icône ⚡ visible dans le Dock (l'app devient aussi retrouvable via ⌘Tab)
    if (process.platform === 'darwin' && app.dock) {
      try { app.dock.setIcon(nativeImage.createFromPath(APPICON)); } catch (e) { /* icône optionnelle */ }
    }

    applyShortcut(); // ⌥Espace par défaut (⌘Espace = Spotlight) · ⌘⇧Espace réglages
    applyAutostart();

    app.on('activate', () => createPanel());

    // ── Mode capture (docs/README) : rend la fenêtre/popup hors écran puis PNG ──
    if (process.argv.includes('--capture-panel') || process.argv.includes('--capture-menu') || process.argv.includes('--capture-settings')) {
      captureShots(); // pas de tray ni de panneau visible pendant une capture
    } else {
      createTray();
      createPanel();
    }
  });

  app.on('window-all-closed', (e) => { /* reste résident dans la menu bar */ });
}

// IPC
const { Notification } = require('electron');
ipcMain.on('copy', (e, text) => {
  clipboard.writeText(text);
  // Retour visuel : le panneau se cache à chaque copie, une notification confirme l'action
  try {
    new Notification({
      title: 'MEGA PACK',
      body: (LANG === 'en' ? '⚡ Prompt copied — paste it anywhere' : '⚡ Prompt copié — collez-le où vous voulez'),
      silent: true,
    }).show();
  } catch (err) { /* notification optionnelle */ }
});
ipcMain.on('hide', () => { if (win && !win.isDestroyed()) win.hide(); });
ipcMain.on('open-llm', (e, { target, prompt }) => {
  win && !win.isDestroyed() && win.hide();
  openLLM(target, prompt);
});
ipcMain.on('open-settings', createSettings);
ipcMain.on('restart-tour', () => {
  if (win && !win.isDestroyed()) {
    win.show();
    win.webContents.send('restart-tour');
  }
});
ipcMain.on('settings-changed', (e, { theme, lang, defaultLLM, sendTargets, autostart, favShortcuts, shortcut, keepVisible } = {}) => {
  LANG = lang === 'en' ? 'en' : 'fr';
  PREFS.lang = LANG;
  // 🐛 fix 2.9.6 : le thème choisi dans les Réglages n'était JAMAIS persisté — le panneau
  // relisait getPrefs().theme (toujours absent) et restait sombre.
  if (theme === 'light' || theme === 'dark') PREFS.theme = theme;
  if (defaultLLM) PREFS.defaultLLM = defaultLLM;
  if (Array.isArray(sendTargets)) PREFS.sendTargets = sendTargets.filter((t) => typeof t === 'string').slice(0, 12);
  if (typeof autostart === 'boolean') PREFS.autostart = autostart;
  if (typeof favShortcuts === 'boolean') PREFS.favShortcuts = favShortcuts;
  if (shortcut && SHORTCUTS[shortcut]) PREFS.shortcut = shortcut;
  if (typeof keepVisible === 'boolean') PREFS.keepVisible = keepVisible;
  savePrefs();
  applyShortcut();
  applyAutostart();
  if (tray) tray.setToolTip('MEGA PACK — Skills & Agents');
  if (settings && !settings.isDestroyed()) settings.setTitle(T().settingsTitle);
  // Propage thème + LLM par défaut au panneau (sélecteur du footer synchronisé entre fenêtres)
  if (win && !win.isDestroyed()) win.webContents.send('settings-changed', { theme: PREFS.theme, lang, defaultLLM: PREFS.defaultLLM, keepVisible: !!PREFS.keepVisible });
});
// Bouton 📌 du panneau : bascule « rester visible » sans passer par les Réglages
ipcMain.on('set-keep-visible', (e, on) => {
  PREFS.keepVisible = !!on;
  savePrefs();
  if (settings && !settings.isDestroyed()) settings.webContents.send('settings-changed', { theme: PREFS.theme, lang: LANG, keepVisible: PREFS.keepVisible });
});
ipcMain.on('get-prefs', (e) => {
  e.returnValue = { theme: PREFS.theme === 'light' ? 'light' : 'dark', keepVisible: !!PREFS.keepVisible, dropMaxChars: PREFS.dropMaxChars || 100000, defaultLLM: PREFS.defaultLLM, sendTargets: PREFS.sendTargets || [], shortcut: PREFS.shortcut, autostart: !!PREFS.autostart, favShortcuts: PREFS.favShortcuts !== false, favorites: PREFS.favorites, recents: PREFS.recents, customs: PREFS.customs, hasApi: Object.fromEntries(Object.keys(PROVIDERS).map((k) => [k, !!apiKeyFor(k)])), apiDefaultModel: PREFS.apiDefaultModel || '', workshopLocks: { agent: [...lockedNames('agent')], skill: [...lockedNames('skill')], team: [...lockedNames('team')], custom: [...(PREFS.customs || []).filter((c) => c && c.locked).map((c) => c.name)] } };
});
// Sélecteur du LLM dans la barre du bas : changement instantané, persisté, propagé
ipcMain.on('set-default-llm', (e, llm) => {
  if (typeof llm !== 'string' || !llm) return;
  PREFS.defaultLLM = llm;
  savePrefs();
  if (win && !win.isDestroyed()) win.webContents.send('settings-changed', { theme: PREFS.theme, lang: LANG, defaultLLM: PREFS.defaultLLM });
});

// ── Atelier : création d'agents & skills (persistance + génération IA) ──
const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'item';

ipcMain.handle('workshop-list', (e, kind) => loadWorkshops(kind === 'agent' ? 'agent' : 'skill'));
ipcMain.handle('workshop-delete', (e, { kind, name }) => {
  if (typeof name !== 'string' || !name) return false;
  const wk = kind === 'agent' ? 'agent' : 'skill';
  const list = loadWorkshops(wk);
  const i = list.findIndex((w) => w.name === name);
  if (i < 0) return false;
  if (list[i].locked) return { ok: false, locked: true }; // 🔒 protégé contre la suppression
  const [rec] = list.splice(i, 1);
  saveWorkshops(wk, list);
  trashPush({ id: `${wk}:${name}:${Date.now()}`, kind: wk, name, rec }); // 🗑 restaurable
  return true;
});
ipcMain.handle('workshop-export', async (e, { kind, name }) => {
  const w = loadWorkshops(kind === 'agent' ? 'agent' : 'skill').find((x) => x.name === name);
  if (!w) return false;
  const r = await dialog.showSaveDialog({
    title: (LANG === 'en' ? 'Export ' : 'Exporter ') + (kind === 'agent' ? 'agent' : 'skill'),
    defaultPath: `${slug(w.name)}-${kind === 'agent' ? 'agent' : 'skill'}.md`,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (r.canceled || !r.filePath) return false;
  const md = kind === 'agent'
    ? `# 👤 ${w.name}\n\n> ${w.desc || ''}\n\n- **Catégorie** : ${w.category || '—'}\n- **Compétences** : ${(w.skills || []).join(', ') || '—'}\n- **Outils** : ${(w.tools || []).join(', ') || '—'}\n\n## System prompt\n\n${w.system || ''}\n\n## Règles\n\n${(w.rules || []).map((x) => `- ${x}`).join('\n')}\n`
    : `# 🛠 ${w.name}\n\n> ${w.desc || ''}\n\n- **Catégorie** : ${w.category || '—'}\n- **Entrées** : ${(w.inputs || []).join(', ') || '—'}\n\n## Procédure (SKILL.md)\n\n${w.body || ''}\n\n## Vérifications\n\n${(w.checks || []).map((x) => `- ${x}`).join('\n')}\n`;
  try { fs.writeFileSync(r.filePath, md); return true; } catch (err) { return false; }
});

// ✏️ Atelier — lire, modifier et verrouiller une création (agent/skill)
// Enregistrement MERGE : les champs fournis écrasent, les autres sont conservés
// (origin, generatedAt, generatedWith, 🔒 locked, name_fr… ne sont jamais perdus).
ipcMain.handle('workshop-get', (e, { kind, name }) => {
  if (typeof name !== 'string' || !name) return null;
  return loadWorkshops(kind === 'agent' ? 'agent' : 'skill').find((w) => w.name === name) || null;
});
ipcMain.handle('workshop-save', (e, { kind, name, patch }) => {
  const wk = kind === 'agent' ? 'agent' : 'skill';
  if (typeof name !== 'string' || !name || !patch || typeof patch !== 'object' || Array.isArray(patch)) return { ok: false, error: 'requête invalide' };
  const list = loadWorkshops(wk);
  const i = list.findIndex((w) => w.name === name);
  if (i < 0) return { ok: false, error: 'introuvable' };
  // 🔒 verrouillé : seul le retrait du cadenas (patch { locked: false }) est accepté —
  // ni édition de contenu ni renommage. Le retrait passe par la confirmation de l'UI.
  if (list[i].locked) {
    const keys = Object.keys(patch);
    if (keys.length !== 1 || keys[0] !== 'locked' || patch.locked !== false) return { ok: false, error: 'locked' };
  }
  const rec = { ...list[i], ...patch };
  if (typeof rec.name === 'string') {
    const nn = slug(rec.name);
    if (nn !== name && list.some((w, j) => j !== i && w.name === nn)) return { ok: false, error: 'name-exists' };
    rec.name = nn;
  }
  // 🕘 Historique : champs modifiés + **avant-valeurs** (pour ⏪ Restaurer cette version).
  // 30 entrées max par item ; voyage avec l'enregistrement (sauvegarde incluse).
  const changed = Object.keys(patch).filter((k) => JSON.stringify(list[i][k]) !== JSON.stringify(patch[k]));
  const before = {};
  for (const k of changed) before[k] = list[i][k];
  rec.history = [{ at: new Date().toISOString(), action: 'edit', fields: changed, before }, ...(list[i].history || [])].slice(0, 30);
  list[i] = rec;
  saveWorkshops(wk, list);
  return { ok: true, item: rec };
});
// 🛠 Copie d'un item existant (catalogue, Atelier ou équipe) dans l'Atelier :
// dupliqué NON verrouillé, nom suffixé « (copie) » ; retourne l'enregistrement créé.
ipcMain.handle('workshop-create', (e, { kind, rec }) => {
  const wk = kind === 'agent' ? 'agent' : kind === 'skill' ? 'skill' : kind === 'team' ? 'team' : null;
  if (!wk || !rec || typeof rec !== 'object' || Array.isArray(rec)) return { ok: false, error: 'requête invalide' };
  const list = loadWorkshops(wk);
  const copy = JSON.parse(JSON.stringify(rec));
  copy.name = typeof copy.name === 'string' ? copy.name.trim().slice(0, 80) : '';
  if (wk === 'team') { copy.team = copy.team || copy.name; if (!copy.team) return { ok: false, error: 'requête invalide' }; }
  if (!copy.name) return { ok: false, error: 'requête invalide' };
  const nn = slug(copy.name);
  let final = nn, i = 2; // garantie d'unicité côté source de vérité
  while (list.some((w) => w.name === final || (wk === 'team' && w.team === final))) final = `${nn}-${i++}`;
  copy.name = final; if (wk === 'team') copy.team = final;
  delete copy.locked; // une copie n'est jamais verrouillée
  if (wk === 'agent' && !copy.system) return { ok: false, error: 'system vide' };
  if (wk === 'skill' && !copy.body) {
    // Copie d'un skill du catalogue : le prompt d'activation devient la procédure de départ (à éditer ensuite).
    copy.body = [copy.desc, copy.tags && copy.tags.length ? `Tags : ${copy.tags.join(', ')}` : ''].filter(Boolean).join('\n\n') || 'Procédure à compléter.';
  }
  list.push(copy);
  saveWorkshops(wk, list);
  return { ok: true, item: copy };
});
ipcMain.handle('workshop-lock', (e, { kind, name, locked }) => {
  const wk = kind === 'agent' ? 'agent' : kind === 'skill' ? 'skill' : kind === 'team' ? 'team' : null;
  if (!wk || typeof name !== 'string' || !name) return { ok: false, error: 'requête invalide' };
  const list = loadWorkshops(wk);
  const w = list.find((x) => (x.team || x.name) === name);
  if (!w) return { ok: false, error: 'introuvable' };
  w.locked = !!locked;
  saveWorkshops(wk, list);
  return { ok: true, locked: w.locked };
});

ipcMain.handle('llm-generate', async (e, payload) => {
  const p = payload || {};
  const kind = p.kind === 'agent' ? 'agent' : 'skill';
  const lang = p.lang === 'en' ? 'en' : 'fr';
  const intent = String(p.intent || '').slice(0, 60000); // mission aussi longue que voulu (60 000 car. max)
  if (!intent.trim()) return { ok: false, error: lang === 'en' ? 'Describe what the ' + kind + ' should do' : 'Décris ce que le ' + (kind === 'agent' ? 'agent doit faire' : 'skill doit faire') };
  const provider = PROVIDERS[p.provider] ? p.provider : 'groq';
  const model = String(p.model || '').trim().slice(0, 120) || (PREFS.apiModels && PREFS.apiModels[provider]) || (provider === 'groq' ? 'openai/gpt-oss-120b' : provider === 'freellm' ? 'auto' : '');
  const senior = !!p.senior;
  try {
    const userMsg = (lang === 'en'
      ? `Create a ${kind} for this need: « ${intent} »`
      : `Crée un ${kind === 'agent' ? 'agent' : 'skill'} pour ce besoin : « ${intent} »`)
      + (senior ? (lang === 'en' ? '\nSenior orchestrator level: it supervises complex workflows, coordinates other experts, assumes accountability for final quality.' : '\nNiveau senior orchestrateur : il supervise des flux complexes, coordonne d\'autres experts, répond de la qualité finale.') : '');
    const { text, model: usedModel, latency } = await llmChat({
      provider, model,
      messages: [
        { role: 'system', content: seniorSystemPrompt(kind, lang) },
        { role: 'user', content: userMsg },
      ],
    });
    const j = extractJson(text);
    const rec = {
      name: String(j.name || slug(intent)).trim().slice(0, 80),
      desc: String(j.desc || intent.slice(0, 180)).trim().slice(0, 400),
      category: String(j.category || (kind === 'agent' ? 'orchestration' : 'procedure')).trim().slice(0, 40),
      generatedAt: new Date().toISOString(),
      // Provenance persistée : l'item reste identifiable comme généré par LLM
      // partout où il est réutilisé (fichiers .md, prompt copié) — audit run-1 NV-2.
      origin: 'llm-generated',
      generatedWith: `${provider}/${usedModel}`,
    };
    if (kind === 'agent') {
      if (j.name_fr) rec.name_fr = String(j.name_fr).slice(0, 80);
      if (j.desc_fr) rec.desc_fr = String(j.desc_fr).slice(0, 400);
      rec.system = String(j.system || '').trim().slice(0, 8000);
      rec.skills = (Array.isArray(j.skills) ? j.skills : []).map((s) => String(s).slice(0, 80)).slice(0, 12);
      rec.tools = (Array.isArray(j.tools) ? j.tools : []).map((s) => String(s).slice(0, 80)).slice(0, 12);
      rec.rules = (Array.isArray(j.rules) ? j.rules : []).map((s) => String(s).slice(0, 200)).slice(0, 12);
      if (!rec.system) throw new Error(lang === 'en' ? 'Empty system prompt' : 'System prompt vide');
    } else {
      if (j.name_fr) rec.name_fr = String(j.name_fr).slice(0, 80);
      if (j.desc_fr) rec.desc_fr = String(j.desc_fr).slice(0, 400);
      rec.body = String(j.body || '').trim().slice(0, 8000);
      rec.inputs = (Array.isArray(j.inputs) ? j.inputs : []).map((s) => String(s).slice(0, 80)).slice(0, 12);
      rec.checks = (Array.isArray(j.checks) ? j.checks : []).map((s) => String(s).slice(0, 200)).slice(0, 12);
      if (!rec.body) throw new Error(lang === 'en' ? 'Empty procedure' : 'Procédure vide');
    }
    const list = loadWorkshops(kind);
    const i = list.findIndex((w) => w.name === rec.name);
    if (i >= 0) list[i] = rec; else list.push(rec);
    saveWorkshops(kind, list);
    return { ok: true, kind, item: rec, model: usedModel, latency };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
});

// ── Dossier MEGA PROMPT : choix, création .md, ouverture, synchro complète ──
ipcMain.handle('promptdir-get', () => promptDir());
ipcMain.handle('promptdir-choose', async () => {
  const r = await dialog.showOpenDialog({
    title: fr() ? 'Choisir le dossier MEGA PROMPT' : 'Choose the MEGA PROMPT folder',
    defaultPath: promptDir(),
    properties: ['openDirectory', 'createDirectory'],
  });
  if (r.canceled || !r.filePaths.length) return null;
  PREFS.promptDir = r.filePaths[0];
  savePrefs();
  return PREFS.promptDir;
});
ipcMain.handle('prompt-md-create', (e, it) => {
  try {
    if (!it || !it.x || !it.k) return { ok: false, error: 'item invalide' };
    const abs = writeItemMd(it);
    return { ok: true, path: abs };
  } catch (err) { return { ok: false, error: String(err.message || err) }; }
});
ipcMain.handle('prompt-dir-open', async (e, sub) => {
  const base = promptDir();
  try { fs.mkdirSync(base, { recursive: true }); } catch (err) { /* open suivra quand même */ }
  const target = (sub && typeof sub === 'string' && !sub.includes('..')) ? path.join(base, sub) : base;
  await shell.openPath(target);
  return true;
});
// 📂 Révèle dans le Finder le .md SOURCE d'un expert du catalogue (SKILL.md ou fiche agent)
ipcMain.handle('source-reveal', (e, p) => {
  try {
    if (!p || typeof p !== 'string' || p.includes('..')) return { ok: false, error: 'chemin invalide' };
    const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), '..', p);
    const norm = path.resolve(abs);
    const root = path.resolve(process.cwd(), '..'); // racine agent-skills
    if (!norm.startsWith(root)) return { ok: false, error: 'hors du dépôt' };
    if (!fs.existsSync(norm)) return { ok: false, error: 'fichier absent' };
    shell.showItemInFolder(norm); // ouvre le dossier parent ET sélectionne le fichier
    return { ok: true, path: norm };
  } catch (err) { return { ok: false, error: String(err.message || err) };
  }
});
ipcMain.handle('prompt-md-open', async (e, sub) => {
  // Ouvre le FICHIER .md dans l'éditeur par défaut (garde anti-traversal : pas de .., reste sous la racine)
  if (!sub || typeof sub !== 'string' || sub.includes('..')) return false;
  const target = path.join(promptDir(), sub);
  if (!target.startsWith(promptDir())) return false;
  await shell.openPath(target);
  return true;
});
ipcMain.handle('prompt-tree-sync', (e, dir) => {
  try { return { ok: true, count: syncPromptTree(dir) }; }
  catch (err) { return { ok: false, error: String(err.message || err) }; }
});
// ── Arborescence du dossier MEGA PROMPT : vue d'ensemble pour le popup clic droit ──
function treeOverview() {
  const root = promptDir();
  const tree = { root, groups: [] };
  const walk = (abs, rel, depth, bucket) => {
    let entries = [];
    try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (ent.name.startsWith('.')) continue;
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        const g = { kind: 'dir', name: ent.name, rel: r, depth, children: [] };
        bucket.push(g);
        if (depth < 4) walk(path.join(abs, ent.name), r, depth + 1, g.children);
      } else if (ent.name.toLowerCase().endsWith('.md')) {
        bucket.push({ kind: 'file', name: ent.name, rel: r, depth });
      }
    }
  };
  walk(root, '', 0, tree.groups);
  return tree;
}
ipcMain.handle('prompt-tree-overview', () => {
  try { return { ok: true, tree: treeOverview() }; }
  catch (err) { return { ok: false, error: String(err.message || err) }; }
});// 📋 Modèles d'équipes prêts à l'emploi : instanciés comme créations d'Atelier (éditables,
// non verrouillés, suffixe -2/-3 en cas de collision de nom).
const TEAM_TEMPLATES = {
  'revue-code': {
    desc: 'Revue de code multi-experts : analyse, sécurité, performance, rapport priorisé.',
    orchestrator: { name: 'Chef de revue', system: 'Tu coordonnes une revue de code. Tu distribues les diffs aux experts, collectes leurs findings, arbitres les priorités (bloquant / important / mineur) et rends un rapport final structuré avec actions concrètes.' },
    agents: [
      { name: 'Analyste code', role: 'analyse', desc: 'Lisibilité, structure, bugs potentiels', system: 'Tu analyses le code proposé : bugs, cas limites, lisibilité, nommage. Cite les lignes concernées.', deliverable: 'liste de findings code' },
      { name: 'Expert sécurité', role: 'sécurité', desc: 'Failles et entrées non fiables', system: 'Tu cherches les vulnérabilités du diff : injections, frontières de confiance, secrets. Un finding = preuve + impact + fix minimal.', deliverable: 'findings sécurité' },
      { name: 'Expert performance', role: 'performance', desc: 'Coûts et complexité', system: 'Tu repères les coûts cachés : complexité, allocations, N+1, I/O bloquant. Chiffré quand possible.', deliverable: 'findings perf' },
    ],
    workflow: ['Chaque expert analyse le diff et rend ses findings', 'Le chef de revue dédoublonne et priorise (bloquant/important/mineur)', 'Rapport final : findings, actions concrètes, fichiers concernés'],
  },
  veille: {
    desc: 'Veille d\'équipe : collecte, synthèse comparative, briefing actionnable.',
    orchestrator: { name: 'Chef de veille', system: 'Tu pilotes une veille thématique. Tu répartis les sources entre veilleurs, compares leurs synthèses, élimines les doublons et produis un briefing final : faits, tendances, ce qu\'il faut faire cette semaine.' },
    agents: [
      { name: 'Veilleur tech', role: 'collecte', desc: 'Nouveautés techniques du domaine', system: 'Tu collectes les nouveautés techniques notables de la période : versions, annonces, dépôts. Chaque item : quoi, pourquoi ça compte, source.', deliverable: 'liste factuelle' },
      { name: 'Synthétiseur', role: 'synthèse', desc: 'Tendances et comparaisons', system: 'Tu regroupes les items collectés en tendances, compares les options et signales ce qui est du bruit.', deliverable: 'tendances' },
      { name: 'Rédacteur briefing', role: 'rédaction', desc: 'Briefing court et actionnable', system: 'Tu rédiges un briefing de 10 lignes max : 3 faits clés, 1 tendance, 1 action concrète pour l\'équipe.', deliverable: 'briefing' },
    ],
    workflow: ['Les veilleurs collectent leurs items', 'Le synthétiseur regroupe et compare', 'Le rédacteur produit le briefing final'],
  },
  support: {
    desc: 'Support client : qualification, solution, réponse prête à envoyer.',
    orchestrator: { name: 'Chef support', system: 'Tu coordonnes le traitement d\'une demande support. Tu fais qualifier par un expert, tu fais préparer la réponse technique, puis tu valides la réponse finale : correcte, honnête, adaptée au client.' },
    agents: [
      { name: 'Qualifieur', role: 'analyse', desc: 'Catégorise et priorise la demande', system: 'Tu qualifies la demande : catégorie, sévérité, informations manquantes, environnement probable. Sortie : fiche de qualification.', deliverable: 'qualification' },
      { name: 'Technicien', role: 'solution', desc: 'Diagnostic et solution pas-à-pas', system: 'Tu proposes un diagnostic et une solution pas-à-pas, avec la ou les causes possibles. Si une information manque, liste les questions à poser.', deliverable: 'solution détaillée' },
      { name: 'Rédacteur réponse', role: 'rédaction', desc: 'Réponse client prête à envoyer', system: 'Tu rédiges la réponse client : claire, empathique, sans jargon inutile, avec les étapes et le délai. Pas de promesse invérifiable.', deliverable: 'réponse finale' },
    ],
    workflow: ['Qualification de la demande', 'Le technicien prépare diagnostic + solution', 'Le rédacteur produit la réponse, le chef support valide'],
  },
  lancement: {
    desc: 'Lancement produit : roadmap, annonce et communication, checklist de mise en ligne.',
    orchestrator: { name: 'Chef de lancement', system: 'Tu pilotes un lancement produit. Tu consolides la roadmap des trois experts, arbitres les priorités, valides le message d\'annonce et coches la checklist finale. Rien ne part sans que la checklist soit complète.' },
    agents: [
      { name: 'Roadmap', role: 'planification', desc: 'Plan de lancement daté et priorisé', system: 'Tu produis la roadmap du lancement : phases (beta, annonce, GA), dates, dépendances, critères de passage. Format : tableau simple.', deliverable: 'roadmap' },
      { name: 'Communication', role: 'com', desc: 'Annonce, posts, visuels à prévoir', system: 'Tu rédiges l\'annonce d\'identification (une phrase), le post de lancement (court) et la liste des canaux à activer avec l\'ordre de publication.', deliverable: 'kit de com' },
      { name: 'Checklist', role: 'QA', desc: 'Liste de mise en ligne vérifiable', system: 'Tu produis la checklist de mise en ligne : technique (tests, rollback, monitoring), juridique (mentions, CGU si besoin), support (FAQ, qui répond). Chaque ligne vérifiable par oui/non.', deliverable: 'checklist' },
    ],
    workflow: ['Roadmap validée par le chef de lancement', 'Communication rédige à partir de la roadmap validée', 'Checklist produite et cochée — lancement autorisé seulement si tout est ✓'],
  },
};
ipcMain.handle('team-from-template', (e, { key }) => {
  const tpl = TEAM_TEMPLATES[key];
  if (!tpl) return { ok: false, error: 'modèle inconnu' };
  const list = loadWorkshops('team');
  const label = key === 'revue-code' ? 'Revue de code' : key === 'veille' ? 'Veille' : 'Support';
  const base = slug(label);
  let nm = base, i = 2;
  while (list.some((t) => (t.team || t.name) === nm)) nm = `${base}-${i++}`;
  const rec = { name: nm, team: nm, desc: tpl.desc, orchestrator: JSON.parse(JSON.stringify(tpl.orchestrator)), agents: JSON.parse(JSON.stringify(tpl.agents)), workflow: [...tpl.workflow], createdAt: new Date().toISOString(), fromTemplate: key };
  list.push(rec);
  saveWorkshops('team', list);
  return { ok: true, item: rec };
});
// ⏪ Restaurer cette version : réapplique les avant-valeurs d'une entrée d'historique.
// L'état courant est d'abord journalisé (l'opération elle-même est réversible par un
// nouvel aller-retour) ; `at` identifie l'entrée (ISO unique par édition).
ipcMain.handle('workshop-restore-version', (e, { kind, name, at }) => {
  const wk = kind === 'agent' ? 'agent' : kind === 'skill' ? 'skill' : kind === 'team' ? 'team' : null;
  if (!wk || typeof name !== 'string' || !name || typeof at !== 'string' || !at) return { ok: false, error: 'requête invalide' };
  const list = loadWorkshops(wk);
  const i = list.findIndex((x) => (x.team || x.name) === name);
  if (i < 0) return { ok: false, error: 'introuvable' };
  if (list[i].locked) return { ok: false, error: 'locked' }; // 🔒 ôter le cadenas d'abord
  const entry = (list[i].history || []).find((h) => h.at === at);
  if (!entry || !entry.before) return { ok: false, error: 'entrée introuvable' };
  const rec = { ...list[i] };
  const nowChanged = Object.keys(entry.before).filter((k) => JSON.stringify(rec[k]) !== JSON.stringify(entry.before[k]));
  const nowBefore = {};
  for (const k of nowChanged) nowBefore[k] = rec[k];
  for (const k of nowChanged) rec[k] = entry.before[k];
  rec.history = [{ at: new Date().toISOString(), action: 'restore', fields: nowChanged, before: nowBefore, restoredTo: at }, ...(list[i].history || [])].slice(0, 30);
  list[i] = rec;
  saveWorkshops(wk, list);
  return { ok: true, item: rec, restoredFields: nowChanged };
});
ipcMain.handle('workshop-history', (e, { kind, name }) => {
  const wk = kind === 'agent' ? 'agent' : kind === 'skill' ? 'skill' : kind === 'team' ? 'team' : null;
  if (!wk || typeof name !== 'string' || !name) return [];
  const w = loadWorkshops(wk).find((x) => (x.team || x.name) === name);
  return (w && Array.isArray(w.history)) ? w.history : [];
});
ipcMain.handle('workshop-md-create', (e, { kind, name }) => {
  try {
    const w = loadWorkshops(kind === 'agent' ? 'agent' : 'skill').find((x) => x.name === name);
    if (!w) return { ok: false, error: 'création introuvable' };
    if (fs.existsSync(path.join(promptDir(), 'skills')) || fs.existsSync(path.join(promptDir(), 'agents'))) {
      // 🔒 Le .md existant d'un item verrouillé n'est jamais écrasé (garde au sink)
      const target = path.join(promptDir(), itemRelPath({ x: w, k: kind === 'agent' ? 'agent' : 'skill' }));
      if (w.locked && fs.existsSync(target)) return { ok: true, path: target, locked: true, skipped: true };
    }
    const abs = writeItemMd({ x: w, k: kind === 'agent' ? 'agent' : 'skill' });
    return { ok: true, path: abs };
  } catch (err) { return { ok: false, error: String(err.message || err) };
  }
});

// ── 🕸 Équipes multi-agents (super-orchestrateur + agents + workflow) ──
ipcMain.handle('team-list', () => loadWorkshops('team'));
// ▶ Exécution RÉELLE d'une mission : orchestrateur → agents (API) → rapport consolidé
ipcMain.handle('team-run', async (e, p) => {
  const payload = p || {};
  const t = payload.team || {};
  const lang = payload.lang === 'en' ? 'en' : 'fr';
  const fr = lang !== 'en';
  const mission = String(payload.mission || '').slice(0, 60000) || (fr ? 'Exécute la mission de l\'équipe.' : 'Execute the team mission.');
  const provider = PROVIDERS[payload.provider] ? payload.provider : 'groq';
  const model = String(payload.model || '').trim().slice(0, 120) || (PREFS.apiModels && PREFS.apiModels[provider]) || (provider === 'groq' ? 'openai/gpt-oss-120b' : provider === 'freellm' ? 'auto' : '');
  if (!apiKeyFor(provider) && provider !== 'ollama') return { ok: false, error: fr ? 'Ajoute une clé API dans Réglages → Intelligence' : 'Add an API key in Settings → Intelligence' };
  const call = async (system, user, maxTokens) => (await llmChat({ provider, model, maxTokens: maxTokens || 2048, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })).text;
  try {
    const t0 = Date.now();
    // 1) L'orchestrateur découpe la mission en tâches individuelles
    const planText = await call(
      t.orchestrator?.system || (fr ? 'Tu es un super-orchestrateur d\'équipe.' : 'You are a team super-orchestrator.'),
      (fr ? `Mission de l\'équipe : ${mission}\n\nAgents disponibles :\n` : `Team mission: ${mission}\n\nAvailable agents:\n`)
      + (t.agents || []).map((a) => `- ${a.name} (${a.role || fr ? 'agent' : 'agent'}) : ${a.desc || ''}${a.deliverable ? ` — ${fr ? 'livrable' : 'deliverable'} : ${a.deliverable}` : ''}`).join('\n')
      + '\n\n' + (fr ? 'Réponds STRICTEMENT en JSON : {"tasks":[{"agent":"nom exact de l\'agent","task":"sa tâche précise"}]}' : 'Answer STRICTLY as JSON: {"tasks":[{"agent":"exact agent name","task":"its precise task"}]}'),
      2048,
    );
    const plan = extractJson(planText);
    const tasks = (Array.isArray(plan.tasks) ? plan.tasks : []).slice(0, 10)
      .map((x) => ({ agent: String(x.agent || '').trim(), task: String(x.task || '').trim().slice(0, 2000) }))
      .filter((x) => x.agent && x.task);
    if (!tasks.length) throw new Error(fr ? 'Aucune tâche planifiée' : 'No task planned');
    // 2) Chaque agent exécute sa tâche (en parallèle, tolérant aux échecs individuels)
    const results = await Promise.all(tasks.map(async (tk) => {
      const a = (t.agents || []).find((x) => x.name === tk.agent)
        || (t.agents || []).find((x) => (x.name || '').toLowerCase() === tk.agent.toLowerCase());
      if (!a) return { agent: tk.agent, task: tk.task, output: `⚠ ${fr ? 'agent introuvable' : 'agent not found'} : ${tk.agent}` };
      try {
        const out = await call(
          a.system || (fr ? `Tu es l'agent ${a.name}.` : `You are agent ${a.name}.`),
          (fr ? `Ta tâche (mission d\'équipe) : ${tk.task}\nContexte global : ${mission}` : `Your task (team mission): ${tk.task}\nGlobal context: ${mission}`),
          2600,
        );
        return { agent: tk.agent, task: tk.task, output: out };
      } catch (err) { return { agent: tk.agent, task: tk.task, output: `⚠ ${fr ? 'échec' : 'failed'} : ${String(err.message || err)}` }; }
    }));
    // 3) L'orchestrateur consolide le rapport final
    const report = await call(
      t.orchestrator?.system || (fr ? 'Tu es un super-orchestrateur.' : 'You are a super-orchestrator.'),
      (fr ? `Mission : ${mission}\n\nLivrables des agents :\n\n` : `Mission: ${mission}\n\nAgent deliverables:\n\n`)
      + results.map((r) => `## ${r.agent}\nTâche : ${r.task}\n\n${r.output}`).join('\n\n---\n\n')
      + '\n\n' + (fr ? 'Rédige le RAPPORT FINAL consolidé : synthèse exécutive, points clés par agent, risques, prochaines actions. Markdown structuré.' : 'Write the consolidated FINAL REPORT: executive summary, key points per agent, risks, next actions. Structured markdown.'),
      4096,
    );
    return { ok: true, report, latency: Date.now() - t0, tasks: results.length, model: model };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
});
// 💾 Enregistrement du rapport de mission en .md (boîte de sauvegarde)
ipcMain.handle('report-save', async (e, { team, md } = {}) => {
  const r = await dialog.showSaveDialog({
    title: fr() ? 'Enregistrer le rapport de mission' : 'Save the mission report',
    defaultPath: `${slug(team || 'equipe')}-RAPPORT-${new Date().toISOString().slice(0, 10)}.md`,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (r.canceled || !r.filePath) return { ok: false };
  try { fs.writeFileSync(r.filePath, String(md || ''), 'utf8'); return { ok: true, path: r.filePath }; } catch (err) { return { ok: false, error: String(err.message || err) }; }
});
ipcMain.handle('team-delete', (e, name) => {
  if (typeof name !== 'string' || !name) return false;
  const list = loadWorkshops('team');
  const i = list.findIndex((t) => (t.team || t.name) === name);
  if (i < 0) return false;
  if (list[i].locked) return { ok: false, locked: true }; // 🔒 protégé contre la suppression
  const [rec] = list.splice(i, 1);
  saveWorkshops('team', list);
  trashPush({ id: `team:${name}:${Date.now()}`, kind: 'team', name, rec }); // 🗑 restaurable
  return true;
});
// ✏️ Édition d'une équipe : nom, description, orchestrateur, agents, workflow.
// Merge : workflow/agents/orchestrateur fournis remplacent, le reste (origin, 🔒…) est conservé.
ipcMain.handle('team-save', (e, { name, patch }) => {
  if (typeof name !== 'string' || !name || !patch || typeof patch !== 'object' || Array.isArray(patch)) return { ok: false, error: 'requête invalide' };
  const list = loadWorkshops('team');
  const i = list.findIndex((t) => (t.team || t.name) === name);
  if (i < 0) return { ok: false, error: 'introuvable' };
  if (list[i].locked) return { ok: false, error: 'locked' }; // 🔒 ôter le cadenas d'abord
  const rec = { ...list[i], ...patch };
  if (typeof rec.team === 'string') {
    rec.team = rec.team.trim().slice(0, 80) || name;
    if (rec.team !== name && list.some((t, j) => j !== i && (t.team || t.name) === rec.team)) return { ok: false, error: 'name-exists' };
  }
  rec.name = rec.team;
  // 🕘 Historique avec avant-valeurs (⏪) — même contrat que workshop-save
  const changed = Object.keys(patch).filter((k) => JSON.stringify(list[i][k]) !== JSON.stringify(patch[k]));
  const before = {};
  for (const k of changed) before[k] = list[i][k];
  rec.history = [{ at: new Date().toISOString(), action: 'edit', fields: changed, before }, ...(list[i].history || [])].slice(0, 30);
  list[i] = rec;
  saveWorkshops('team', list);
  return { ok: true, item: rec };
});
ipcMain.handle('team-export', async (e, name) => {
  const t = loadWorkshops('team').find((x) => (x.team || x.name) === name);
  if (!t) return false;
  const r = await dialog.showSaveDialog({
    title: LANG === 'en' ? 'Export team' : 'Exporter l\'équipe',
    defaultPath: `${slug(t.team || t.name)}-equipe.md`,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (r.canceled || !r.filePath) return false;
  try { fs.writeFileSync(r.filePath, teamMd(t)); return true; } catch (err) { return false; }
});
ipcMain.handle('team-md-create', (e, name) => {
  try {
    const t = loadWorkshops('team').find((x) => (x.team || x.name) === name);
    if (!t) return { ok: false, error: 'équipe introuvable' };
    const base = writeTeamMd(t);
    return { ok: true, path: base };
  } catch (err) { return { ok: false, error: String(err.message || err) }; }
});
ipcMain.handle('team-generate', async (e, p) => {
  const payload = p || {};
  const lang = payload.lang === 'en' ? 'en' : 'fr';
  const intent = String(payload.intent || '').slice(0, 60000); // mission aussi longue que voulu
  if (!intent.trim()) return { ok: false, error: lang === 'en' ? 'Describe the team mission' : 'Décris la mission de l\'équipe' };
  const provider = PROVIDERS[payload.provider] ? payload.provider : 'groq';
  const model = String(payload.model || '').trim().slice(0, 120) || (PREFS.apiModels && PREFS.apiModels[provider]) || (provider === 'groq' ? 'openai/gpt-oss-120b' : provider === 'freellm' ? 'auto' : '');
  if (!apiKeyFor(provider) && provider !== 'ollama') return { ok: false, error: lang === 'en' ? 'Add an API key in Settings → Intelligence' : 'Ajoute une clé API dans Réglages → Intelligence' };
  if (payload.saveApiChoice) {
    PREFS.apiProvider = provider;
    if (payload.model) PREFS.apiDefaultModel = String(payload.model).trim().slice(0, 120);
    savePrefs();
  }
  try {
    const userMsg = (lang === 'en' ? `Build the multi-agent team for this mission: « ${intent} »` : `Construis l\'équipe multi-agents pour cette mission : « ${intent} »`);
    const { text, model: usedModel, latency } = await llmChat({
      provider, model,
      maxTokens: 8192, // l'équipe complète (orchestrateur + agents + workflow) dépasse le plafond 2048 → JSON tronqué
      messages: [
        { role: 'system', content: teamSystemPrompt(lang) },
        { role: 'user', content: userMsg },
      ],
    });
    const j = extractJson(text);
    const team = {
      team: String(j.team || j.name || slug(intent)).trim().slice(0, 80),
      desc: String(j.desc || intent.slice(0, 200)).trim().slice(0, 400),
      generatedAt: new Date().toISOString(),
      origin: 'llm-generated', // provenance persistée — audit run-1 NV-2
      generatedWith: `${provider}/${usedModel}`,
      orchestrator: {
        name: String(j.orchestrator?.name || 'Orchestrateur').trim().slice(0, 80),
        system: String(j.orchestrator?.system || '').trim().slice(0, 8000),
        skills: (Array.isArray(j.orchestrator?.skills) ? j.orchestrator.skills : []).map((s) => String(s).slice(0, 80)).slice(0, 12),
      },
      agents: (Array.isArray(j.agents) ? j.agents : []).slice(0, 5).map((a) => ({
        name: String(a.name || 'agent').trim().slice(0, 80),
        role: String(a.role || '').trim().slice(0, 60),
        desc: String(a.desc || '').trim().slice(0, 400),
        system: String(a.system || '').trim().slice(0, 8000),
        skills: (Array.isArray(a.skills) ? a.skills : []).map((s) => String(s).slice(0, 80)).slice(0, 12),
        deliverable: String(a.deliverable || '').trim().slice(0, 200),
      })).filter((a) => a.name && a.system),
      workflow: (Array.isArray(j.workflow) ? j.workflow : []).map((s) => String(s).slice(0, 400)).slice(0, 10),
    };
    if (!team.orchestrator.system) throw new Error(lang === 'en' ? 'Empty orchestrator prompt' : 'Prompt orchestrateur vide');
    if (!team.agents.length) throw new Error(lang === 'en' ? 'The team has no agent' : 'L\'équipe n\'a aucun agent');
    const list = loadWorkshops('team');
    const i = list.findIndex((w) => (w.team || w.name) === team.team);
    if (i >= 0) list[i] = team; else list.push(team);
    saveWorkshops('team', list);
    return { ok: true, item: team, model: usedModel, latency };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
});

ipcMain.handle('llm-test', async (e, p) => {
  const provider = PROVIDERS[p && p.provider] ? p.provider : 'groq';
  try {
    const { text, model, latency } = await llmChat({
      provider,
      model: String((p && p.model) || '').trim() || (PREFS.apiModels && PREFS.apiModels[provider]) || (provider === 'groq' ? 'openai/gpt-oss-120b' : provider === 'freellm' ? 'auto' : ''),
      maxTokens: 12,
      temperature: 0,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    });
    return { ok: true, model, latency, sample: String(text).trim().slice(0, 40) };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
});
// 🧠 Clés API : stockées chiffrées quand l'OS le permet (safeStorage) — sinon refus
// (fail-closed, audit run-1 F-1 : plus de fallback silencieux en clair sur disque).
ipcMain.handle('api-set', (e, { provider, key, model } = {}) => {
  if (!PROVIDERS[provider]) return { ok: false, reason: 'unknown-provider' };
  probeCache.delete(provider); // la sonde re-testera la nouvelle clé (ou son absence)
  let refusal = null;
  PREFS.apiKeys = PREFS.apiKeys || {};
  if (key) {
    let encrypted = false;
    try {
      const { safeStorage } = require('electron');
      if (safeStorage.isEncryptionAvailable()) {
        PREFS.apiKeys[provider] = safeStorage.encryptString(key).toString('base64');
        PREFS.apiEncrypted = PREFS.apiEncrypted || {};
        PREFS.apiEncrypted[provider] = true;
        encrypted = true;
      }
    } catch (err) { /* refusal ci-dessous */ }
    if (!encrypted) {
      delete PREFS.apiKeys[provider];
      if (PREFS.apiEncrypted) delete PREFS.apiEncrypted[provider];
      refusal = 'no-os-encryption'; // clé rejetée, jamais écrite en clair
    }
  } else {
    delete PREFS.apiKeys[provider];
    if (PREFS.apiEncrypted) delete PREFS.apiEncrypted[provider];
  }
  if (typeof model === 'string') {
    PREFS.apiModels = PREFS.apiModels || {};
    if (model.trim()) PREFS.apiModels[provider] = model.trim().slice(0, 120); else delete PREFS.apiModels[provider];
  }
  savePrefs();
  return refusal ? { ok: false, reason: refusal } : { ok: true };
});
// ── 🗑 Corbeille : lister / restaurer / supprimer définitivement / vider ──
ipcMain.handle('trash-list', () => loadTrash().slice().reverse()); // plus récents d'abord
ipcMain.handle('trash-restore', (e, id) => {
  if (typeof id !== 'string' || !id) return { ok: false, error: 'requête invalide' };
  const list = loadTrash();
  const i = list.findIndex((t) => t.id === id);
  if (i < 0) return { ok: false, error: 'introuvable' };
  const entry = list[i];
  const wk = entry.kind === 'agent' ? 'agent' : entry.kind === 'skill' ? 'skill' : entry.kind === 'team' ? 'team' : entry.kind === 'custom' ? 'custom' : null;
  if (!wk || !entry.rec) return { ok: false, error: 'type inconnu' };
  if (wk === 'custom') {
    // ✍️ : pas de doublon de nom — l'entrée existante est écrasée (comportement d'avant suppression)
    const cs = (PREFS.customs || []).filter((c) => c.name !== entry.name);
    cs.push(entry.rec);
    PREFS.customs = cs;
    savePrefs();
  } else {
    const wl = loadWorkshops(wk);
    const rec = { ...entry.rec };
    if (rec.locked) rec.locked = false; // restauration = réengagement explicite, jamais un piège
    let nm = entry.name;
    if (wl.some((w) => (w.team || w.name) === nm)) { // collision : suffixe -2, -3…
      const base = nm.replace(/-\d+$/, '');
      let n = 2;
      while (wl.some((w) => (w.team || w.name) === `${base}-${n}`)) n++;
      nm = `${base}-${n}`;
    }
    rec.name = nm;
    if (wk === 'team') rec.team = nm;
    wl.push(rec);
    saveWorkshops(wk, wl);
  }
  list.splice(i, 1);
  saveTrash(list);
  return { ok: true, kind: wk, name: nm };
});
ipcMain.handle('trash-delete', (e, id) => {
  if (typeof id !== 'string' || !id) return false;
  const list = loadTrash();
  const i = list.findIndex((t) => t.id === id);
  if (i < 0) return false;
  list.splice(i, 1);
  saveTrash(list);
  return true;
});
ipcMain.handle('trash-empty', () => { saveTrash([]); return true; });

// ✍️ Prompts personnalisés : création/édition et suppression (persistés dans PREFS)
ipcMain.on('custom-save', (e, item) => {
  if (!item || typeof item.name !== 'string' || typeof item.desc !== 'string') return;
  const name = item.name.trim().slice(0, 80);
  const desc = item.desc.trim();
  if (!name || !desc) return;
  const prev = (PREFS.customs || []).find((c) => c.name === name);
  const rec = { name, desc, tag: (typeof item.tag === 'string' && item.tag.trim()) ? item.tag.trim().slice(0, 40) : (prev && prev.tag) || '' };
  // 🔒 verrou conservé : un custom verrouillé ne perd jamais son cadenas à l'édition
  if (item.locked === true || item.locked === false) rec.locked = !!item.locked;
  else if (prev && prev.locked) rec.locked = true;
  PREFS.customs = (PREFS.customs || []).filter((c) => c.name !== name);
  PREFS.customs.push(rec);
  savePrefs();
});
// Export de tous les ✍️ en un fichier Markdown (via boîte de sauvegarde)
ipcMain.handle('export-customs', async () => {
  const cs = PREFS.customs || [];
  if (!cs.length) return false;
  const r = await dialog.showSaveDialog({
    title: 'Exporter mes prompts',
    defaultPath: 'mes-prompts.md',
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  });
  if (r.canceled || !r.filePath) return false;
  const parts = cs.map((c) => `# ✍️ ${c.name}${c.tag ? `  ·  tag: ${c.tag}` : ''}\n\n${c.desc}\n`);
  try { fs.writeFileSync(r.filePath, parts.join('\n---\n\n')); return true; } catch (e) { return false; }
});
function deleteCustom(name) {
  const victim = (PREFS.customs || []).find((c) => c.name === name);
  if (victim && victim.locked) return; // 🔒 verrouillé : suppression refusée
  const cs = (PREFS.customs || []).filter((c) => c.name !== name);
  if (victim) trashPush({ id: `custom:${name}:${Date.now()}`, kind: 'custom', name, rec: victim });
  PREFS.customs = cs;
  PREFS.favorites = (PREFS.favorites || []).filter((n) => n !== name);
  savePrefs();
}
ipcMain.on('custom-delete', (e, name) => { if (typeof name === 'string' && name) deleteCustom(name); });
// Export / import de la configuration (favoris, récents, préférences) en JSON
// ── 💾 Sauvegarde portable : cadenas + corbeille + créations d'atelier dans un JSON daté ──
// Objectif : ne rien perdre en changeant de Mac. Le fichier contient l'état complet
// des ateliers (agents, skills, équipes, ✍️, corbeille) — les cadenas voyagent avec.
function buildBackupPayload() {
  return {
    format: 'megapack-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: app.getVersion ? app.getVersion() : '',
    workshops: { agent: loadWorkshops('agent'), skill: loadWorkshops('skill'), team: loadWorkshops('team') },
    customs: PREFS.customs || [],
    trash: loadTrash(),
  };
}
ipcMain.handle('backup-export', async () => {
  const r = await dialog.showSaveDialog({
    title: LANG === 'en' ? 'Export MEGA PACK backup (locks, trash, workshops)' : 'Sauvegarde MEGA PACK (cadenas, corbeille, ateliers)',
    defaultPath: `megapack-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePath) return false;
  try { fs.writeFileSync(r.filePath, JSON.stringify(buildBackupPayload(), null, 2)); return true; } catch (e) { return false; }
});
// ── 💾 Auto-backup hebdomadaire silencieux ──
// Un JSON complet (même format que la sauvegarde manuelle) est écrit dans
// <MEGA PROMPT>/backups/ chaque semaine si le dernier a plus de 7 jours.
// Rotation : les 4 plus récents sont gardés. Aucune fenêtre, aucun toast :
// l'utilisateur peut l'ignorer sans rien savoir.
const AUTO_BACKUP_KEEP = 4;
const AUTO_BACKUP_DAYS = 7;
function autoBackupDir() { return path.join(promptDir(), 'backups'); }
function lastAutoBackupAt() { return PREFS.autoBackupAt || ''; }
function writeAutoBackup() {
  try {
    const dir = autoBackupDir();
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `megapack-auto-${new Date().toISOString().slice(0, 10)}.json`);
    fs.writeFileSync(file, JSON.stringify(buildBackupPayload(), null, 2));
    // Rotation : garde les AUTO_BACKUP_KEEP fichiers auto- les plus récents
    const autos = fs.readdirSync(dir).filter((f) => f.startsWith('megapack-auto-') && f.endsWith('.json')).sort().reverse();
    for (const old of autos.slice(AUTO_BACKUP_KEEP)) { try { fs.unlinkSync(path.join(dir, old)); } catch (e) { /* best effort */ } }
    PREFS.autoBackupAt = new Date().toISOString();
    savePrefs();
    return { ok: true, file };
  } catch (err) { return { ok: false, error: String(err.message || err) };
  }
}
function maybeAutoBackup() {
  const last = lastAutoBackupAt();
  if (last) {
    const ageDays = (Date.now() - Date.parse(last)) / 86400000;
    if (!(ageDays >= AUTO_BACKUP_DAYS)) return { ok: false, skipped: true };
  }
  return writeAutoBackup();
}
ipcMain.handle('backup-status', () => ({ last: lastAutoBackupAt(), dir: autoBackupDir(), keep: AUTO_BACKUP_KEEP }));
ipcMain.handle('backup-auto-now', () => writeAutoBackup());

// Restauration : remplace les ateliers par ceux du fichier, dédoublonne par suffixe -2…,
// dé-verrouille à l'import (réengagement explicite), fusionne la corbeille.
ipcMain.handle('backup-import', async () => {
  const r = await dialog.showOpenDialog({
    title: LANG === 'en' ? 'Import a MEGA PACK backup' : 'Importer une sauvegarde MEGA PACK',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths || !r.filePaths[0]) return { ok: false, error: 'annulé' };
  try {
    const data = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
    if (!data || data.format !== 'megapack-backup' || !data.workshops) return { ok: false, error: 'format inconnu' };
    let restored = 0;
    for (const wk of ['agent', 'skill', 'team']) {
      const incoming = Array.isArray(data.workshops[wk]) ? data.workshops[wk] : [];
      const cur = loadWorkshops(wk);
      const names = new Set(cur.map((w) => (w.team || w.name)));
      for (const rec0 of incoming) {
        const rec = { ...rec0 };
        if (rec.locked) rec.locked = false; // jamais un piège au retour d'une sauvegarde
        let nm = wk === 'team' ? (rec.team || rec.name) : rec.name;
        if (!nm) continue;
        if (names.has(nm)) { const base = nm.replace(/-\d+$/, ''); let n = 2; while (names.has(`${base}-${n}`)) n++; nm = `${base}-${n}`; }
        rec.name = nm;
        if (wk === 'team') rec.team = nm;
        names.add(nm);
        cur.push(rec);
        restored++;
      }
      saveWorkshops(wk, cur);
    }
    // ✍️ : dédoublonnage par nom, les entrées importées complètent les existantes
    for (const c of (Array.isArray(data.customs) ? data.customs : [])) {
      if (c && c.name && !PREFS.customs.some((x) => x.name === c.name)) { PREFS.customs.push(c); restored++; }
    }
    savePrefs();
    // Corbeille : fusion par id (les entrées locales ont priorité)
    const tl = loadTrash();
    const ids = new Set(tl.map((t) => t.id));
    let trashAdded = 0;
    for (const t of (Array.isArray(data.trash) ? data.trash : [])) {
      if (t && t.id && !ids.has(t.id)) { tl.push(t); ids.add(t.id); trashAdded++; }
    }
    saveTrash(tl);
    return { ok: true, restored, trashAdded };
  } catch (err) { return { ok: false, error: String(err.message || err) };
  }
});

ipcMain.handle('export-config', async () => {
  const r = await dialog.showSaveDialog({
    title: 'Exporter la configuration MEGA PACK',
    defaultPath: 'megapack-config.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePath) return false;
  try { fs.writeFileSync(r.filePath, JSON.stringify(PREFS, null, 2)); return true; } catch (e) { return false; }
});
ipcMain.handle('import-config', async () => {
  const r = await dialog.showOpenDialog({
    title: 'Importer une configuration MEGA PACK',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (r.canceled || !r.filePaths.length) return false;
  try {
    const data = JSON.parse(fs.readFileSync(r.filePaths[0], 'utf8'));
    if (Array.isArray(data.favorites)) PREFS.favorites = data.favorites;
    if (Array.isArray(data.recents)) PREFS.recents = data.recents;
    if (Array.isArray(data.customs)) PREFS.customs = data.customs;
    if (data.lang === 'fr' || data.lang === 'en') { PREFS.lang = data.lang; LANG = data.lang; }
    if (data.defaultLLM) PREFS.defaultLLM = data.defaultLLM;
    if (Array.isArray(data.sendTargets)) PREFS.sendTargets = data.sendTargets.filter((t) => typeof t === 'string').slice(0, 12);
    if (data.shortcut && SHORTCUTS[data.shortcut]) PREFS.shortcut = data.shortcut;
    if (typeof data.autostart === 'boolean') PREFS.autostart = data.autostart;
    if (typeof data.favShortcuts === 'boolean') PREFS.favShortcuts = data.favShortcuts;
    savePrefs(); applyShortcut(); applyAutostart();
    if (win && !win.isDestroyed()) win.webContents.reload(); // le panneau relit getPrefs (favoris + customs)
    return true;
  } catch (e) { return false; }
});
ipcMain.on('add-recent', (e, name) => { if (typeof name === 'string' && name) addRecent(name); });
ipcMain.on('toggle-fav', (e, name) => {
  if (typeof name !== 'string' || !name) return;
  const i = PREFS.favorites.indexOf(name);
  if (i >= 0) PREFS.favorites.splice(i, 1); else PREFS.favorites.push(name);
  savePrefs();
});
