// MEGA PACK Menu Bar App — process principal Electron (macOS)
// Panneau flottant sous la barre de menus : raccourci global (⌥Espace par défaut) → recherche globale,
// ⏎ copie le prompt, ⌘⏎ ouvre Claude, ⇧⏎ ouvre ChatGPT.
const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, shell, screen, nativeImage, dialog } = require('electron');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    descFreebuff: 'App Freebuff — collez le prompt dans le chat', descOpencodeApp: 'App desktop OpenCode', descOpencode: 'OpenCode dans un nouveau Terminal',    descClipboard: 'Copie seule — collez où vous voulez' },
  en: { open: 'Open the panel', launcher: 'Open the HTML Launcher', help: 'Help (user guide)', settings: 'Settings…', quit: 'Quit', openIn: 'Open in', settingsTitle: 'MEGA PACK — Settings',
    descClaude: 'Claude (web)', descChatgpt: 'ChatGPT (web)', descPerplexity: 'Perplexity (web)', descCopilot: 'Copilot (web)',
    descDeepseek: 'DeepSeek (web)', descZai: 'Z.ai (web)', descKimi: 'Kimi (web)', descMammouth: 'Mammouth.ia — multi-model',
    descFreebuff: 'Freebuff app — paste the prompt in its chat', descOpencodeApp: 'OpenCode desktop app', descOpencode: 'OpenCode in a new Terminal window',    descClipboard: 'Copy only — paste anywhere' },
};
let LANG = 'fr';
const T = () => I18N[LANG] || I18N.fr;
function prefsPath() { return path.join(app.getPath('userData'), 'mgp-prefs.json'); }
// Préférences persistées : langue, favoris, récents, LLM par défaut, raccourci, auto-boot, géométrie
let PREFS = { lang: 'fr', favorites: [], recents: [], customs: [], defaultLLM: 'claude', sendTargets: [], promptDir: '', shortcut: 'Alt+Space', autostart: false, favShortcuts: true, bounds: null };

// ── Ateliers (agents / skills créés dans l'app) — persistés à côté des prefs ──
function workshopsPath(kind) { return path.join(app.getPath('userData'), kind === 'agent' ? 'my-agents.json' : 'my-skills.json'); }
function loadWorkshops(kind) {
  try { const a = JSON.parse(fs.readFileSync(workshopsPath(kind), 'utf8')); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function saveWorkshops(kind, list) {
  try { fs.writeFileSync(workshopsPath(kind), JSON.stringify(list, null, 2)); } catch (e) { /* best effort */ }
}

// ── Fournisseurs LLM (API clé) — tous en OpenAI-compatible sauf Anthropic ──
const PROVIDERS = {
  groq: { label: 'Groq', base: 'https://api.groq.com/openai/v1/chat/completions', models: 'llama-3.3-70b-versatile, llama3-8b-8192, mixtral-8x7b-32768', style: 'openai' },
  openai: { label: 'OpenAI', base: 'https://api.openai.com/v1/chat/completions', models: 'gpt-4o-mini, gpt-4o', style: 'openai' },
  anthropic: { label: 'Anthropic (Claude)', base: 'https://api.anthropic.com/v1/messages', models: 'claude-sonnet-4-20250514, claude-haiku-4-20250514', style: 'anthropic' },
  openrouter: { label: 'OpenRouter (multi-modèles)', base: 'https://openrouter.ai/api/v1/chat/completions', models: 'meta-llama/llama-3.3-70b-instruct, anthropic/claude-3.5-haiku', style: 'openai' },
  ollama: { label: 'Ollama (local, sans clé)', base: 'http://127.0.0.1:11434/v1/chat/completions', models: 'llama3.2, mistral', style: 'openai' },
  custom: { label: 'Endpoint compatible OpenAI', base: '', models: '—', style: 'openai' },
};
// Clé API : variable d'environnement d'abord (jamais persistée), sinon pref chiffrable par l'OS
function apiKeyFor(provider) {
  const envs = { groq: 'GROQ_API_KEY', openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
  if (envs[provider] && process.env[envs[provider]]) return process.env[envs[provider]];
  try {
    const { safeStorage } = require('electron');
    if (safeStorage.isEncryptionAvailable() && PREFS.apiKeys && PREFS.apiKeys[provider]) {
      return safeStorage.decryptString(Buffer.from(PREFS.apiKeys[provider]));
    }
  } catch (e) { /* repli : pref en clair */ }
  return (PREFS.apiKeys && PREFS.apiKeys[provider]) || '';
}

async function llmChat({ provider = 'groq', model = '', apiKey = '', messages, maxTokens = 2048, temperature = 0.7 }) {
  const prov = PROVIDERS[provider] || PROVIDERS.groq;
  const key = apiKey || apiKeyFor(provider);
  const target = prov.style === 'anthropic' ? 'https://api.anthropic.com/v1/messages' : (prov.base || 'https://api.groq.com/openai/v1/chat/completions');
  if (prov.style !== 'anthropic' && !/ollama|127\.0\.0\.1|localhost/.test(target) && !key) throw new Error((LANG === 'en' ? 'No API key for ' : 'Pas de clé API pour ') + prov.label);
  const started = Date.now();
  let res;
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

// ── Dossier « MEGA PROMPT » : arborescence .md du catalogue sur le disque ──
// skills/<catégorie>/<nom>.md · agents/<catégorie>/<nom>.md · perso/<tag ou racine>/<nom>.md
const fr = () => LANG !== 'en';
function promptDir() {
  return PREFS.promptDir || path.join(app.getPath('documents'), 'MEGA PROMPT');
}
const mdSafe = (s) => String(s || '').replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'sans-nom';
function mdForItem(it) {
  const x = it.x, k = it.k;
  if (k === 'agent') {
    return `# 👤 ${x.name_fr || x.name}\n\n> ${x.desc_fr || x.desc || ''}\n\n- **Catégorie** : ${x.category || '—'}\n${Array.isArray(x.skills) && x.skills.length ? `- **Compétences** : ${x.skills.join(', ')}\n` : ''}\n## Prompt d'activation\n\n\`\`\`\n${promptFor(x, false)}\n\`\`\`\n`;
  }
  if (k === 'skill') {
    return `# 🛠 ${x.name_fr || x.name}\n\n> ${x.desc_fr || x.desc || ''}\n\n- **Catégorie** : ${x.category || '—'}\n\n## Prompt d'activation\n\n\`\`\`\n${promptFor(x, true)}\n\`\`\`\n`;
  }
  if (k === 'custom') {
    return `# ✍️ ${x.name}\n\n${x.tag ? `*tag : ${x.tag}*\n\n` : ''}${x.desc}\n`;
  }
  return `# ${x.name}\n\n${x.system || x.body || x.desc || ''}\n`;
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
  const abs = path.join(dir || promptDir(), itemRelPath(it));
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, mdForItem(it), 'utf8');
  return abs;
}
function syncPromptTree(dir) {
  const base = dir || promptDir();
  let n = 0;
  for (const s of MCAT.skills) { writeItemMd({ x: s, k: 'skill' }, base); n++; }
  for (const a of MCAT.agents) { writeItemMd({ x: a, k: 'agent' }, base); n++; }
  for (const c of (PREFS.customs || [])) { writeItemMd({ x: c, k: 'custom' }, base); n++; }
  const readme = path.join(base, 'LISEZMOI.md');
  try {
    fs.writeFileSync(readme, `# ⚡ MEGA PROMPT — bibliothèque de prompts\n\nGénérée par MEGA PACK Édition Luxe le ${new Date().toLocaleString('fr-FR')}.\n\n- **skills/** — ${MCAT.skills.length} procédures expertes, par catégorie\n- **agents/** — ${MCAT.agents.length} personas experts, par catégorie\n- **perso/** — tes prompts ✍️ (par tag)\n\nChaque fichier .md contient la fiche de l'item + le **prompt d'activation** prêt à coller dans n'importe quel LLM.\n`, 'utf8');
  } catch (e) { /* best effort */ }
  return n;
}
function loadPrefs() {
  try { Object.assign(PREFS, JSON.parse(fs.readFileSync(prefsPath(), 'utf8'))); } catch (e) { /* défauts */ }
  LANG = PREFS.lang === 'en' ? 'en' : 'fr';
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
      width: 500, height: 660, show: false, resizable: false, minimizable: false,
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
const { ipcMain, Notification } = require('electron');
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
ipcMain.on('settings-changed', (e, { theme, lang, defaultLLM, sendTargets, autostart, favShortcuts, shortcut } = {}) => {
  LANG = lang === 'en' ? 'en' : 'fr';
  PREFS.lang = LANG;
  if (defaultLLM) PREFS.defaultLLM = defaultLLM;
  if (Array.isArray(sendTargets)) PREFS.sendTargets = sendTargets.filter((t) => typeof t === 'string').slice(0, 12);
  if (typeof autostart === 'boolean') PREFS.autostart = autostart;
  if (typeof favShortcuts === 'boolean') PREFS.favShortcuts = favShortcuts;
  if (shortcut && SHORTCUTS[shortcut]) PREFS.shortcut = shortcut;
  savePrefs();
  applyShortcut();
  applyAutostart();
  if (tray) tray.setToolTip('MEGA PACK — Skills & Agents');
  if (settings && !settings.isDestroyed()) settings.setTitle(T().settingsTitle);
  if (win && !win.isDestroyed()) win.webContents.send('settings-changed', { theme, lang });
});
ipcMain.on('get-prefs', (e) => {
  e.returnValue = { defaultLLM: PREFS.defaultLLM, sendTargets: PREFS.sendTargets || [], shortcut: PREFS.shortcut, autostart: !!PREFS.autostart, favShortcuts: PREFS.favShortcuts !== false, favorites: PREFS.favorites, recents: PREFS.recents, customs: PREFS.customs, hasApi: Object.fromEntries(Object.keys(PROVIDERS).map((k) => [k, !!apiKeyFor(k)])) };
});

// ── Atelier : création d'agents & skills (persistance + génération IA) ──
const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'item';

ipcMain.handle('workshop-list', (e, kind) => loadWorkshops(kind === 'agent' ? 'agent' : 'skill'));
ipcMain.handle('workshop-delete', (e, { kind, name }) => {
  if (typeof name !== 'string' || !name) return false;
  const list = loadWorkshops(kind === 'agent' ? 'agent' : 'skill');
  const i = list.findIndex((w) => w.name === name);
  if (i < 0) return false;
  list.splice(i, 1);
  saveWorkshops(kind === 'agent' ? 'agent' : 'skill', list);
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

ipcMain.handle('llm-generate', async (e, payload) => {
  const p = payload || {};
  const kind = p.kind === 'agent' ? 'agent' : 'skill';
  const lang = p.lang === 'en' ? 'en' : 'fr';
  const intent = String(p.intent || '').slice(0, 2000);
  if (!intent.trim()) return { ok: false, error: lang === 'en' ? 'Describe what the ' + kind + ' should do' : 'Décris ce que le ' + (kind === 'agent' ? 'agent doit faire' : 'skill doit faire') };
  const provider = PROVIDERS[p.provider] ? p.provider : 'groq';
  const model = String(p.model || '').trim().slice(0, 120) || (PREFS.apiModels && PREFS.apiModels[provider]) || (provider === 'groq' ? 'llama-3.3-70b-versatile' : '');
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
ipcMain.handle('prompt-tree-sync', (e, dir) => {
  try { return { ok: true, count: syncPromptTree(dir) }; }
  catch (err) { return { ok: false, error: String(err.message || err) }; }
});
ipcMain.handle('workshop-md-create', (e, { kind, name }) => {
  try {
    const w = loadWorkshops(kind === 'agent' ? 'agent' : 'skill').find((x) => x.name === name);
    if (!w) return { ok: false, error: 'création introuvable' };
    const abs = writeItemMd({ x: w, k: kind === 'agent' ? 'agent' : 'skill' });
    return { ok: true, path: abs };
  } catch (err) { return { ok: false, error: String(err.message || err) }; }
});

ipcMain.handle('llm-test', async (e, p) => {
  const provider = PROVIDERS[p && p.provider] ? p.provider : 'groq';
  try {
    const { text, model, latency } = await llmChat({
      provider,
      model: String((p && p.model) || '').trim() || (PREFS.apiModels && PREFS.apiModels[provider]) || (provider === 'groq' ? 'llama-3.3-70b-versatile' : ''),
      maxTokens: 12,
      temperature: 0,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
    });
    return { ok: true, model, latency, sample: String(text).trim().slice(0, 40) };
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  }
});
// 🧠 Clés API : stockées chiffrées quand l'OS le permet (safeStorage), sinon en clair dans prefs
ipcMain.handle('api-set', (e, { provider, key, model } = {}) => {
  if (!PROVIDERS[provider]) return false;
  PREFS.apiKeys = PREFS.apiKeys || {};
  try {
    const { safeStorage } = require('electron');
    if (key && safeStorage.isEncryptionAvailable()) {
      PREFS.apiKeys[provider] = safeStorage.encryptString(key).toString('base64');
      PREFS.apiEncrypted = PREFS.apiEncrypted || {};
      PREFS.apiEncrypted[provider] = true;
    } else if (key) {
      PREFS.apiKeys[provider] = key;
    } else {
      delete PREFS.apiKeys[provider];
      if (PREFS.apiEncrypted) delete PREFS.apiEncrypted[provider];
    }
  } catch (err) {
    if (key) PREFS.apiKeys[provider] = key; else delete PREFS.apiKeys[provider];
  }
  if (typeof model === 'string') {
    PREFS.apiModels = PREFS.apiModels || {};
    if (model.trim()) PREFS.apiModels[provider] = model.trim().slice(0, 120); else delete PREFS.apiModels[provider];
  }
  savePrefs();
  return true;
});
// ✍️ Prompts personnalisés : création/édition et suppression (persistés dans PREFS)
ipcMain.on('custom-save', (e, item) => {
  if (!item || typeof item.name !== 'string' || typeof item.desc !== 'string') return;
  const name = item.name.trim().slice(0, 80);
  const desc = item.desc.trim();
  if (!name || !desc) return;
  PREFS.customs = (PREFS.customs || []).filter((c) => c.name !== name);
  PREFS.customs.push({ name, desc, tag: (typeof item.tag === 'string' && item.tag.trim()) ? item.tag.trim().slice(0, 40) : '' });
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
  PREFS.customs = (PREFS.customs || []).filter((c) => c.name !== name);
  PREFS.favorites = (PREFS.favorites || []).filter((n) => n !== name);
  savePrefs();
}
ipcMain.on('custom-delete', (e, name) => { if (typeof name === 'string' && name) deleteCustom(name); });
// Export / import de la configuration (favoris, récents, préférences) en JSON
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
