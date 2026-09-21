// MEGA PACK V2 — Interface premium Solana · accessibilité maximale
// Design system : dégradé violet #9945FF → vert #14F195, thèmes sombre/clair/contraste,
// ARIA complet (tablist, listbox, dialog, live regions), focus visible, reduced-motion.

// ---------- Catalogue (fourni par le preload) ----------
const CAT = (window.mgp && window.mgp.catalog) || { meta: { version: '?' }, skills: [], agents: [] };
const S = CAT.skills, A = CAT.agents;
if (!window.mgp) {
  // Preload défaillant (sandbox, fichier manquant…) : message lisible au lieu d'une fenêtre grise
  document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = '<div style="padding:40px;font:14px -apple-system;color:#e8ecf4">' +
      '⚠️ Erreur interne : le preload n\'a pas pu se charger (catalogue indisponible).<br>' +
      'Relance l\'app ou régénère-la avec <code>npm run build</code>.</div>';
  });
}

// ---------- État ----------
let THEME = localStorage.getItem('mgp.theme') || 'dark';
let CONTRAST = localStorage.getItem('mgp.contrast') === '1';
let LANG = localStorage.getItem('mgp.lang') || 'fr';

const I18N = {
  fr: {
    ph: 'Rechercher un skill, un agent, un prompt…', all: 'Tout', skills: 'Skills', agents: 'Agents',
    composed: (n) => `🚀 ${n} sélectionnés — ⏎ copie le prompt combiné, ⌘⏎ l'ouvre dans ton LLM`,
    empty: 'Aucun résultat — essaie un autre mot-clé', sel: 'sél.', copyOk: (n) => `⚡ ${n} → prompt copié !`,
    copy: '⏎ Copier', openDef: (n) => `⌘⏎ Ouvrir dans ${n}`, openGpt: '⇧⏎ ChatGPT',
    footShort: '↑↓ naviguer · ⏎ copier · ⌘⏎ ouvrir (LLM par défaut) · ⇧⏎ ChatGPT · ⌘, réglages · Échap fermer',
    favOn: 'Retirer des favoris', favOff: 'Ajouter aux favoris', edit: 'Éditer ce prompt',
    settings: 'Réglages', newPrompt: 'Nouveau prompt personnalisé', theme: 'Thème sombre/clair',
    contrast: 'Contraste élevé', lang: 'Langue FR/EN', searchClear: 'Effacer la recherche',
    hello: 'Bonjour !',
  },
  en: {
    ph: 'Search a skill, an agent, a prompt…', all: 'All', skills: 'Skills', agents: 'Agents',
    composed: (n) => `🚀 ${n} selected — ⏎ copies the combined prompt, ⌘⏎ opens it in your LLM`,
    empty: 'No results — try another keyword', sel: 'sel.', copyOk: (n) => `⚡ ${n} → prompt copied!`,
    copy: '⏎ Copy', openDef: (n) => `⌘⏎ Open in ${n}`, openGpt: '⇧⏎ ChatGPT',
    footShort: '↑↓ navigate · ⏎ copy · ⌘⏎ open (default LLM) · ⇧⏎ ChatGPT · ⌘, settings · Esc close',
    favOn: 'Remove from favorites', favOff: 'Add to favorites', edit: 'Edit this prompt',
    settings: 'Settings', newPrompt: 'New custom prompt', theme: 'Dark/light theme',
    contrast: 'High contrast', lang: 'FR/EN language', searchClear: 'Clear search',
    hello: 'Hello!',
  },
};
const T = () => I18N[LANG] || I18N.fr;

// Libellé FR/EN du LLM par défaut (pour le bouton d'action)
const LLM_LABEL = { claude: 'Claude', chatgpt: 'ChatGPT', perplexity: 'Perplexity', copilot: 'Copilot', deepseek: 'DeepSeek', zai: 'Z.ai', kimi: 'Kimi', mammouth: 'Mammouth.ia', freebuff: 'Freebuff', 'opencode-app': 'OpenCode', opencode: 'OpenCode', clipboard: (LANG === 'fr' ? 'Presse-papiers' : 'Clipboard') };

// Libellés localisés : le catalogue fournit name_fr / desc_fr pour chaque item
const lname = (x) => (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name;
const ldesc = (x) => (LANG === 'fr' && x.desc_fr) ? x.desc_fr : (x.desc || '');

// ---------- Prompts ----------
function promptSkill(x) {
  return LANG === 'en'
    ? `Use the skill "${x.name}" (${x.path}). Load and strictly follow its SKILL.md: ${ldesc(x).slice(0, 180)}`
    : `Utilise le skill "${x.name}" (${x.path}). Charge et suis son SKILL.md strictement : ${ldesc(x).slice(0, 180)} Réponds toujours en français.`;
}
function promptAgent(x) {
  return LANG === 'en'
    ? `From now on, act as the agent "${x.name}" (${x.path}). ${ldesc(x).slice(0, 180)} Adopt this persona for the whole conversation and start by asking me the right questions.`
    : `Agis désormais comme l'agent "${x.name}" (${x.path}). ${ldesc(x).slice(0, 180)} Adopte ce persona pour toute la conversation, réponds toujours en français et commence par me poser les bonnes questions.`;
}
function buildCombo(items) {
  const sk = items.filter((x) => S.find((s) => s.name === x.name));
  const ag = items.filter((x) => A.find((a) => a.name === x.name));
  const cu = items.filter((x) => !S.find((s) => s.name === x.name) && !A.find((a) => a.name === x.name)); // ✍️ personnalisés
  const L = LANG === 'en';
  let p = L ? '# MEGA PACK — Combined prompt\n\n' : '# MEGA PACK — Prompt composé\n\n';
  if (ag.length) p += (L ? '## Agent personas to adopt\n' : "## Personas d'agents à adopter\n")
    + ag.map((a) => `- **${a.name}** : ${a.desc}`).join('\n') + '\n\n';
  if (cu.length) p += (L ? '## Custom prompts to apply as-is\n' : '## Prompts personnalisés à appliquer tels quels\n')
    + cu.map((c) => `- **${c.name}** : ${c.desc}`).join('\n') + '\n\n';
  if (sk.length) p += (L ? '## Skills to load and strictly follow\n' : '## Skills à charger et suivre strictement\n')
    + sk.map((s) => `- **${s.name}** (${s.path}) : ${s.desc}`).join('\n') + '\n\n';
  p += L
    ? '## Instructions\n1. Load each listed SKILL.md before acting.\n2. Adopt the listed personas for the conversation.\n3. Apply the workflows in order, without skipping steps.\n4. Confirm what you have loaded before starting.'
    : '## Instructions\n1. Charge chaque SKILL.md listé avant d\'agir.\n2. Adopte les personas listés pour la conversation.\n3. Applique les workflows dans l\'ordre, sans en sauter d\'étapes.\n4. Confirme ce que tu as chargé avant de commencer.\n5. Réponds toujours en français.';
  return p;
}

// ---------- DOM V2 ----------
document.body.innerHTML = `
<div id="wrap">
  <header id="head">
    <div id="brand"><span id="logo" aria-hidden="true">⚡</span><span id="btitle">MEGA PACK <b>V2</b></span></div>
    <div id="searchrow">
      <span id="qico" aria-hidden="true">🔍</span>
      <input id="q" type="text" role="searchbox" aria-label="${T().ph}" placeholder="${T().ph}" autofocus
             autocomplete="off" spellcheck="false">
      <button id="clr" title="${T().searchClear}" aria-label="${T().searchClear}" hidden>✕</button>
      <span id="sep" aria-hidden="true"></span>
      <button id="addc" title="${T().newPrompt}" aria-label="${T().newPrompt}">＋</button>
      <button id="theme" title="${T().theme}" aria-label="${T().theme}">🌙</button>
      <button id="ctrst" title="${T().contrast}" aria-label="${T().contrast}" aria-pressed="false">◐</button>
      <button id="lang" title="${T().lang}" aria-label="${T().lang}">FR</button>
    </div>
    <div id="tabs" role="tablist" aria-label="${LANG === 'fr' ? 'Filtres' : 'Filters'}">
      <div class="tb on" role="tab" aria-selected="true" data-t="all" tabindex="0">${T().all}</div>
      <div class="tb" role="tab" aria-selected="false" data-t="fav" tabindex="0" title="⭐">⭐</div>
      <div class="tb" role="tab" aria-selected="false" data-t="skills" tabindex="0">${T().skills}</div>
      <div class="tb" role="tab" aria-selected="false" data-t="agents" tabindex="0">${T().agents}</div>
      <div class="tb" role="tab" aria-selected="false" data-t="custom" tabindex="0" title="✍️">✍️</div>
      <div id="cnt" role="status" aria-live="polite"></div>
    </div>
  </header>
  <main id="list" role="listbox" aria-label="${LANG === 'fr' ? 'Résultats' : 'Results'}"></main>
  <footer id="foot">
    <span id="hint"></span>
    <span id="acts">
      <button id="btnopen" class="ghost" title="${T().openGpt}">⇧⏎ ChatGPT</button>
      <button id="btnopen2" class="primary"></button>
      <button id="btncopy" class="primary"></button>
    </span>
  </footer>
</div>
<div id="modal" role="dialog" aria-modal="true" aria-labelledby="mtitle">
  <div id="mbox">
    <b id="mtitle">✍️ ${LANG === 'fr' ? 'Prompt personnalisé' : 'Custom prompt'}</b>
    <label for="e-name">${LANG === 'fr' ? 'Nom' : 'Name'}</label>
    <input id="e-name" placeholder="${LANG === 'fr' ? 'Mon audit Solana' : 'My Solana audit'}" maxlength="80">
    <label for="e-tag">${LANG === 'fr' ? 'Tag / catégorie — optionnel' : 'Tag / category — optional'}</label>
    <input id="e-tag" placeholder="${LANG === 'fr' ? 'code, écriture…' : 'code, writing…'}" maxlength="40">
    <label for="e-txt">${LANG === 'fr' ? 'Prompt' : 'Prompt'}</label>
    <textarea id="e-txt" placeholder="${LANG === 'fr' ? 'Ton prompt — utilisé tel quel dans tous les LLM' : 'Your prompt — used as-is in every LLM'}"></textarea>
    <div id="mbtns">
      <button id="e-del" class="danger" aria-label="${LANG === 'fr' ? 'Supprimer' : 'Delete'}">🗑</button>
      <span style="flex:1"></span>
      <button id="e-cancel">${LANG === 'fr' ? 'Annuler' : 'Cancel'}</button>
      <button id="e-save" class="primary">${LANG === 'fr' ? 'Enregistrer' : 'Save'}</button>
    </div>
  </div>
</div>`;

const $ = (id) => document.getElementById(id);
const q = $('q'), list = $('list'), cnt = $('cnt'), hint = $('hint');
let mode = 'all', sel = new Set(), results = [];

// Préférences système (favoris, récents, LLM par défaut) — fournis par le main process
const SYS = (window.mgp.getPrefs && window.mgp.getPrefs()) || { favorites: [], recents: [], defaultLLM: 'claude' };
const FAVS = new Set(SYS.favorites || []);
const isFav = (name) => FAVS.has(name);
let CUSTOMS = (SYS.customs || []).slice(); // ✍️ prompts personnalisés (sync via IPC)

// ---------- Design system V2 — Solana premium ----------
const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{font:13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
:root{
  --bg:#07090f;--bg2:#0a0d16;--card:#101426;--card2:#151b30;--card3:#1b2240;
  --border:#1e2743;--border2:#2b3557;
  --txt:#f2f5fc;--txt2:#c9d0e2;--mut:#7e89a6;
  --vio:#9945ff;--grn:#14f195;--acc:#8f6dff;--acc2:#14f195;--amber:#f5c518;--danger:#ff5c72;
  --grad:linear-gradient(120deg,#9945ff,#7c6cff 50%,#14f195);
  --gradsoft:linear-gradient(120deg,rgba(153,69,255,.15),rgba(20,241,149,.08));
  --shadow:0 8px 28px rgba(0,0,0,.45);
  --r:12px;--rs:9px;
}
body.light{
  --bg:#f6f7fd;--bg2:#eef0fa;--card:#ffffff;--card2:#f4f6fd;--card3:#e9edfa;
  --border:#dfe4f3;--border2:#c5cfeb;
  --txt:#131a2e;--txt2:#2c3556;--mut:#5d6885;
  --acc:#6b46f2;--acc2:#0aa67c;--amber:#b98a00;
  --shadow:0 8px 28px rgba(30,40,90,.12);
}
body.contrast{
  --bg:#000;--bg2:#000;--card:#0d0d15;--card2:#101018;--card3:#191926;
  --border:#5e6a92;--border2:#93a2d4;
  --txt:#fff;--txt2:#f1f3fa;--mut:#d3d9e8;
}
#wrap{display:flex;flex-direction:column;height:100vh;background:var(--bg);color:var(--txt)}
#head{background:var(--bg2);border-bottom:1px solid var(--border)}
#brand{display:flex;align-items:center;gap:7px;padding:9px 12px 0}
#logo{font-size:14px;filter:drop-shadow(0 0 6px rgba(153,69,255,.8))}
#btitle{font-size:11px;font-weight:700;letter-spacing:.12em;color:var(--mut)}
#btitle b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
#searchrow{display:flex;gap:6px;align-items:center;padding:7px 10px}
#qico{opacity:.55;font-size:12px}
#q{flex:1;background:var(--card);border:1.5px solid var(--border);color:var(--txt);padding:8px 11px;border-radius:10px;font-size:13.5px;outline:none;transition:border-color .15s,box-shadow .15s}
#q::placeholder{color:var(--mut)}
#q:focus{border-color:var(--vio);box-shadow:0 0 0 3px rgba(153,69,255,.22)}
#clr{background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px;padding:4px}
#sep{width:1px;height:20px;background:var(--border2);margin:0 2px}
#searchrow button{min-width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--txt2);cursor:pointer;font-size:12.5px;transition:transform .1s,border-color .15s}
#searchrow button:hover{border-color:var(--vio);transform:translateY(-1px)}
#lang{width:auto!important;padding:0 9px;font-weight:600}
#tabs{display:flex;gap:6px;padding:2px 10px 9px;align-items:center}
.tb{padding:4px 13px;border-radius:99px;background:var(--card);border:1px solid var(--border);color:var(--mut);cursor:pointer;font-size:12px;user-select:none;transition:all .15s}
.tb:hover{color:var(--txt2);border-color:var(--border2)}
.tb.on{background:var(--gradsoft);border-color:var(--vio);color:var(--txt);font-weight:700;box-shadow:inset 0 0 0 1px rgba(153,69,255,.35)}
#cnt{margin-left:auto;font-size:11px;color:var(--mut);font-variant-numeric:tabular-nums}
#list{flex:1;overflow-y:auto;padding:8px 10px;display:flex;flex-direction:column;gap:5px}
#list::-webkit-scrollbar{width:10px}
#list::-webkit-scrollbar-thumb{background:var(--card3);border-radius:99px;border:2.5px solid var(--bg)}
#list::-webkit-scrollbar-thumb:hover{background:var(--border2)}
.it{position:relative;display:flex;gap:9px;align-items:center;padding:8px 10px 8px 14px;border-radius:var(--r);cursor:pointer;border:1px solid var(--border);background:var(--card);transition:border-color .12s,background .12s,transform .08s}
.it::before{content:'';position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:99px;background:var(--vio)}
.it[data-k2="agent"]::before{background:var(--grn)}
.it[data-k2="custom"]::before{background:var(--amber)}
.it:hover{border-color:var(--border2);background:var(--card2)}
.it.on{background:var(--gradsoft);border-color:var(--vio)}
.it.on::before{top:0;bottom:0;box-shadow:0 0 10px rgba(153,69,255,.55)}
.it.sel{border-color:var(--acc2)}
.it.flash{animation:pulse .8s ease}
@keyframes pulse{0%{background:var(--gradsoft);border-color:var(--acc2);transform:scale(1.006)}100%{}}
.ick{display:flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:6px;border:1.5px solid var(--border2);color:transparent;font-size:11px;flex-shrink:0;transition:all .12s}
.it.sel .ick{background:var(--grad);border-color:transparent;color:#fff}
.ihd{display:flex;gap:6px;align-items:center;min-width:0}
.it .nm{font-weight:650;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.it .ct{font-size:9.5px;color:var(--mut);background:var(--card2);border:1px solid var(--border);border-radius:99px;padding:1px 7px;white-space:nowrap}
.it .ds{font-size:11px;color:var(--mut);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;margin-top:1px}
.ibd{flex:1;min-width:0}
.fv,.ev{background:none;border:none;color:var(--mut);font-size:14px;cursor:pointer;padding:0 2px;line-height:1.2;flex-shrink:0}
.fv.on{color:var(--amber)}
.fv:hover,.ev:hover{color:var(--acc);transform:scale(1.1)}
#foot{display:flex;gap:10px;align-items:center;padding:7px 10px;border-top:1px solid var(--border);background:var(--bg2)}
#hint{flex:1;color:var(--mut);font-size:10.5px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hint.ok{color:var(--acc2);font-weight:600}
#acts{display:flex;gap:6px;flex-shrink:0}
#acts button{border:1px solid var(--border2);background:var(--card);color:var(--txt2);border-radius:9px;padding:6px 13px;font:inherit;font-size:11.5px;font-weight:600;cursor:pointer;transition:transform .1s,box-shadow .15s}
#acts button:hover{transform:translateY(-1px);box-shadow:var(--shadow)}
#acts .primary{background:var(--grad);border-color:transparent;color:#fff}
#acts .ghost{background:transparent}
:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--vio)}
#modal{display:none;position:fixed;inset:0;background:rgba(3,5,10,.68);backdrop-filter:blur(3px);z-index:50;align-items:center;justify-content:center}
#mbox{display:flex;flex-direction:column;gap:5px;width:min(500px,92vw);background:var(--card);border:1px solid var(--border2);border-radius:14px;padding:16px;box-shadow:var(--shadow)}
#mbox b{font-size:13.5px;margin-bottom:4px}
#mbox label{font-size:11px;color:var(--mut);margin-top:6px}
#e-name,#e-tag,#e-txt{background:var(--card2);border:1.5px solid var(--border);color:var(--txt);border-radius:9px;padding:8px 10px;font:inherit;outline:none}
#e-name:focus,#e-tag:focus,#e-txt:focus{border-color:var(--vio);box-shadow:0 0 0 3px rgba(153,69,255,.2)}
#e-txt{min-height:150px;resize:vertical}
#mbtns{display:flex;gap:8px;align-items:center;margin-top:10px}
#mbtns button{border:1px solid var(--border2);background:var(--card2);color:var(--txt);border-radius:9px;padding:7px 16px;font:inherit;font-weight:600;cursor:pointer}
#mbtns .primary{background:var(--grad);border-color:transparent;color:#fff}
#mbtns .danger{color:var(--danger);border-color:rgba(255,92,114,.4)}
body.contrast #foot,body.contrast #head{background:#000}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}
@media (prefers-contrast: more){:root{--border:#4a5478;--border2:#7c8ab8;--mut:#aab3c9}}
`;
const st = document.createElement('style');
st.textContent = CSS;
document.head.appendChild(st);

function applyTheme() {
  document.body.classList.toggle('light', THEME === 'light');
  document.body.classList.toggle('contrast', CONTRAST);
  document.documentElement.style.colorScheme = THEME === 'light' ? 'light' : 'dark';
  $('theme').textContent = THEME === 'light' ? '☀️' : '🌙';
  $('ctrst').setAttribute('aria-pressed', CONTRAST ? 'true' : 'false');
}
function applyLang() {
  document.documentElement.lang = LANG;
  $('lang').textContent = LANG.toUpperCase();
  q.placeholder = T().ph;
  q.setAttribute('aria-label', T().ph);
  document.querySelectorAll('.tb').forEach((b) => {
    if (b.dataset.t === 'all') b.textContent = T().all;
    if (b.dataset.t === 'skills') b.textContent = T().skills;
    if (b.dataset.t === 'agents') b.textContent = T().agents;
  });
  $('btnopen2').textContent = T().openDef(LLM_LABEL[SYS.defaultLLM] || SYS.defaultLLM);
  $('btncopy').textContent = T().copy;
}

function render() {
  const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
  $('clr').hidden = !q.value;
  let pool = [];
  if (mode === 'all' || mode === 'fav') pool.push(...[...S, ...A, ...CUSTOMS].filter((x) => isFav(x.name)).map((x) => ({ x, a: A.find((ag) => ag.name === x.name) ? true : (CUSTOMS.some((c) => c.name === x.name) ? 'custom' : false) })));
  if (mode === 'all' || mode === 'custom') pool.push(...CUSTOMS.map((x) => ({ x, a: 'custom' })));
  if (mode === 'all' || mode === 'skills') pool.push(...S.map((x) => ({ x, a: false })));
  if (mode === 'all' || mode === 'agents') pool.push(...A.map((x) => ({ x, a: true })));
  if (terms.length) {
    pool = pool.filter(({ x }) => {
      // recherche dans les deux langues (FR + EN)
      const hay = (x.name + ' ' + (x.name_fr || '') + ' ' + (x.desc || '') + ' ' + (x.desc_fr || '') + ' ' + (x.category || x.tag || '')).toLowerCase();
      return terms.every((w) => hay.includes(w));
    });
  }
  pool.sort((p, c) => lname(p.x).localeCompare(lname(c.x)));
  results = pool.slice(0, 80);
  cnt.textContent = `${pool.length} · ${sel.size} ${T().sel}`;
  if (!results.length) {
    list.innerHTML = `<div style="padding:30px;text-align:center;color:var(--mut)">${T().empty}</div>`;
    updFoot();
    return;
  }
  list.innerHTML = results.map(({ x, a }, i) => {
    const kind = a === 'custom' ? 'custom' : a ? 'agent' : 'skill';
    const ico = a === 'custom' ? '✍️' : a ? '👤' : '🛠';
    return `
    <div class="it ${i === 0 ? 'on' : ''} ${sel.has(x.name) ? 'sel' : ''}" role="option" aria-selected="${i === 0}"
         aria-label="${ico} ${lname(x)}${sel.has(x.name) ? (LANG === 'fr' ? ', sélectionné' : ', selected') : ''}"
         data-i="${i}" data-k="${x.name}" data-k2="${kind}">
      <span class="ick" aria-hidden="true">✓</span>
      <div class="ibd">
        <div class="ihd"><span class="nm">${ico} ${lname(x)}</span>
          <span class="ct">${a === 'custom' ? (x.tag || (LANG === 'fr' ? 'perso' : 'custom')) : x.category}</span>
          ${a === 'custom' ? `<button class="ev" data-e="${x.name}" title="${T().edit}" aria-label="${T().edit}">✎</button>` : ''}
        </div>
        <div class="ds">${ldesc(x)}</div>
      </div>
      <button class="fv ${isFav(x.name) ? 'on' : ''}" data-f="${x.name}"
              title="${isFav(x.name) ? T().favOn : T().favOff}" aria-label="${isFav(x.name) ? T().favOn : T().favOff}"
              aria-pressed="${isFav(x.name)}">${isFav(x.name) ? '★' : '☆'}</button>
    </div>`;
  }).join('');
  updFoot();
  list.querySelectorAll('.it').forEach((el) => {
    el.onclick = (ev) => {
      const fb = ev.target.closest('.fv');
      if (fb) { // ★/☆ : bascule favori, sans activer l'item
        ev.stopPropagation();
        const n = fb.dataset.f;
        if (FAVS.has(n)) FAVS.delete(n); else FAVS.add(n);
        window.mgp.toggleFav && window.mgp.toggleFav(n);
        fb.classList.toggle('on'); fb.textContent = FAVS.has(n) ? '★' : '☆';
        fb.setAttribute('aria-pressed', FAVS.has(n));
        if (mode === 'fav') render();
        return;
      }
      const eb = ev.target.closest('.ev');
      if (eb) { // ✎ : éditer le prompt personnalisé
        ev.stopPropagation();
        openEditor(CUSTOMS.find((c) => c.name === eb.dataset.e));
        return;
      }
      activate(results[+el.dataset.i], el);
    };
  });
  list.querySelector('.it.on')?.scrollIntoView({ block: 'nearest' });
}

// Pied : texte contextuel + boutons d'action (souris ET clavier)
function updFoot() {
  hint.textContent = sel.size ? T().composed(sel.size) : T().footShort;
  hint.classList.toggle('ok', !!sel.size);
  $('btnopen2').textContent = sel.size
    ? `⌘⏎ ${LANG === 'fr' ? 'Ouvrir la sélection' : 'Open selection'}`
    : T().openDef(LLM_LABEL[SYS.defaultLLM] || SYS.defaultLLM);
}

function activate({ x, a }, el) {
  const p = a === 'custom' ? (x.desc || x.name || '') : a ? promptAgent(x) : promptSkill(x);
  window.mgp.copy(p);
  window.mgp.addRecent && window.mgp.addRecent(x.name); // alimente « 🕘 Récents » du menu clic droit
  if (el) { el.classList.add('sel', 'flash'); setTimeout(() => el.classList.remove('flash'), 800); } // feedback visuel d'activation
  flash(T().copyOk(x.name));
}
function flash(msg) {
  hint.textContent = msg;
  hint.classList.add('ok');
  setTimeout(() => { hint.classList.remove('ok'); render(); }, 1500);
}

// ---------- ✍️ Éditeur de prompts personnalisés ----------
let editingName = null;
function openEditor(item) {
  editingName = item ? item.name : null;
  $('e-name').value = item ? item.name : '';
  $('e-tag').value = item ? (item.tag || '') : '';
  $('e-txt').value = item ? item.desc : '';
  $('e-del').style.display = item ? '' : 'none';
  $('modal').style.display = 'flex';
  $('e-name').focus();
}
$('addc').onclick = () => openEditor(null);
$('e-cancel').onclick = () => { $('modal').style.display = 'none'; };
$('e-save').onclick = () => {
  const name = $('e-name').value.trim().slice(0, 80);
  const desc = $('e-txt').value.trim();
  const tag = ($('e-tag').value || '').trim().slice(0, 40);
  if (!name || !desc) return;
  window.mgp.customSave && window.mgp.customSave({ name, desc, tag });
  const rec = { name, desc, tag };
  const i = CUSTOMS.findIndex((c) => c.name === editingName);
  if (i >= 0) CUSTOMS[i] = rec; else CUSTOMS.push(rec);
  $('modal').style.display = 'none';
  if (mode === 'custom' || mode === 'all' || mode === 'fav') render();
};
$('e-del').onclick = () => {
  if (!editingName) return;
  window.mgp.customDelete && window.mgp.customDelete(editingName);
  CUSTOMS = CUSTOMS.filter((c) => c.name !== editingName);
  FAVS.delete(editingName);
  $('modal').style.display = 'none';
  render();
};
$('e-txt').addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('e-save').onclick();
  if (e.key === 'Escape') $('modal').style.display = 'none';
});
if (window.mgp.onEditCustom) window.mgp.onEditCustom((c) => openEditor(c)); // « ✎ Éditer » du menu ⚡

// ---------- 📥 Import .md / .txt par glisser-déposer ----------
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = [...((e.dataTransfer && e.dataTransfer.files) || [])].filter((f) => /\.(md|txt)$/i.test(f.name));
  if (!files.length) return;
  (async () => {
    let n = 0;
    for (const f of files) {
      try {
        const text = (await f.text()).replace(/\r\n/g, '\n').trim().slice(0, 20000);
        if (!text) continue;
        const base = (f.name.replace(/\.(md|txt)$/i, '').slice(0, 80)) || 'Prompt importé';
        let name = base, k = 2;
        while (CUSTOMS.some((c) => c.name === name)) name = `${base} (${k++})`; // pas d'écrasement
        const rec = { name, desc: text };
        window.mgp.customSave && window.mgp.customSave(rec);
        CUSTOMS.push(rec);
        n++;
      } catch (err) { /* fichier illisible : ignoré */ }
    }
    if (n) {
      mode = 'custom';
      document.querySelectorAll('.tb').forEach((x) => { x.classList.toggle('on', x.dataset.t === 'custom'); x.setAttribute('aria-selected', x.dataset.t === 'custom'); });
      render();
      flash(LANG === 'en' ? `⚡ ${n} prompt(s) imported` : `⚡ ${n} prompt(s) importé(s)`);
    }
  })();
});

// ---------- Navigation clavier ----------
let idx = 0;
function move(d) {
  const items = list.querySelectorAll('.it');
  if (!items.length) return;
  items[idx]?.classList.remove('on');
  items[idx]?.setAttribute('aria-selected', 'false');
  idx = Math.min(items.length - 1, Math.max(0, idx + d));
  items[idx].classList.add('on');
  items[idx].setAttribute('aria-selected', 'true');
  items[idx].scrollIntoView({ block: 'nearest' });
}
q.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
  else if (e.key === 'Enter' && (e.metaKey || e.shiftKey)) {
    e.preventDefault(); openSelection(e.shiftKey ? 'chatgpt' : (SYS.defaultLLM || 'claude'));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const el = list.querySelector('.it.on');
    if (el) activate(results[+el.dataset.i], el);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.mgp.hide();
  if ((e.metaKey || e.ctrlKey) && e.key === ',') window.mgp.openSettings();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && document.activeElement !== q) {
    e.preventDefault(); results.forEach(({ x }) => sel.add(x.name)); render();
  }
});

function openSelection(target) {
  const items = [...sel].map((n) => S.find((s) => s.name === n) || A.find((a) => a.name === n) || CUSTOMS.find((c) => c.name === n)).filter(Boolean);
  const prompt = items.length ? buildCombo(items)
    : (q.value.trim() ? q.value.trim() : T().hello);
  window.mgp.openLLM(target, prompt);
}

// ---------- Événements ----------
q.addEventListener('input', () => { idx = 0; render(); });
$('clr').onclick = () => { q.value = ''; idx = 0; render(); q.focus(); };
document.querySelectorAll('.tb').forEach((b) => {
  const pick = () => {
    mode = b.dataset.t;
    document.querySelectorAll('.tb').forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
    b.classList.add('on');
    b.setAttribute('aria-selected', 'true');
    idx = 0; render();
  };
  b.onclick = pick;
  b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }); // tabs activables au clavier
});
$('btncopy').onclick = () => { // bouton Copier : sélection si présente, sinon item courant
  const el = list.querySelector('.it.on');
  if (sel.size) openSelection('clipboard');
  else if (el) activate(results[+el.dataset.i], el);
};
$('btnopen2').onclick = () => openSelection(SYS.defaultLLM || 'claude');
$('btnopen').onclick = () => openSelection('chatgpt');
$('theme').onclick = () => {
  THEME = THEME === 'light' ? 'dark' : 'light';
  localStorage.setItem('mgp.theme', THEME); applyTheme();
};
$('ctrst').onclick = () => {
  CONTRAST = !CONTRAST;
  localStorage.setItem('mgp.contrast', CONTRAST ? '1' : '0'); applyTheme();
};
$('lang').onclick = () => {
  LANG = LANG === 'fr' ? 'en' : 'fr';
  localStorage.setItem('mgp.lang', LANG); applyLang(); render();
};

applyTheme(); applyLang(); render();

// Sync depuis la fenêtre Réglages (langue : re-render complet)
if (window.mgp.onSettings) {
  window.mgp.onSettings(({ theme, lang }) => {
    THEME = theme; LANG = lang;
    try { localStorage.setItem('mgp.theme', THEME); localStorage.setItem('mgp.lang', LANG); } catch (e) {}
    applyTheme(); applyLang(); render();
  });
}
