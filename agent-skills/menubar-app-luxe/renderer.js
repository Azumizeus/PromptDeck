// ══════════════════════════════════════════════════════════════════════════
//  MEGA PACK — Édition Luxe · renderer
//  Une liste sobre, noire, instantanée. Compréhensible en 3 secondes :
//  on cherche, on lit, on tire le prompt. Rien d'autre.
//
//  Raccourcis : ↑↓ naviguer · ⏎ copier · ⌘⏎ ouvrir (LLM par défaut) ·
//  ⇧⏎ ChatGPT · ⌥⏎ composer la sélection (⌘-clic) · ★ favori · ⌘, réglages
// ══════════════════════════════════════════════════════════════════════════

'use strict';

// ---------- Langue ----------
const LANG = (window.mgp.getPrefs() || {}).lang === 'en' ? 'en' : 'fr';
const T = LANG === 'fr' ? {
  ph: 'Rechercher un skill, un agent, un prompt…', all: 'Tout', skills: 'Skills',
  agents: 'Agents', perso: '✍️ Perso', favs: '★ Favoris', results: 'résultats',
  copy: '⧉ Copier', open: '⌘⏎ Ouvrir dans {x}', gpt: '⇧⏎ ChatGPT',
  empty: 'Aucun résultat — essaie un autre mot', recents: '🕘 Récents',
  selected: 'sél.', compose: '✚ Composer ({n})', newp: 'Nouveau prompt ✍️',
  noFav: (n) => `Pas de favori n°${n}`, hello: 'Bonjour ! Voici mon besoin : ',
  selHint: '⌘-clic pour sélectionner · ⌥⏎ compose les {n} sélectionnés',
  tipSkill: 'SKILL — active une procédure expertise. Clic : copie le prompt · clic droit : envoyer.',
  tipAgent: 'AGENT — adopte un persona expert. Clic : copie le prompt · clic droit : envoyer.',
  tipCustom: 'PROMPT PERSO — ton texte est envoyé tel quel. Clic : copie · clic droit : envoyer.',
  tipFav: '★ Favori — ⌘{n} le lance depuis le menu ⚡',
  sendTo: 'Envoyer à',
  copyPrompt: '⧉ Copier le prompt',
  favAdd: '★ Ajouter aux favoris', favDel: '☆ Retirer des favoris',
  mdCreate: '📄 Créer le fichier .md',
  mdCreated: (p) => `📄 Créé : ${p}`,
  mdErr: 'Échec fichier .md',
  tipCat: 'Catégorie',
  atelier: 'Atelier',
  atelierT: '🛠 Atelier — créer un agent ou un skill',
  atelierKind: 'Je crée', atelierKindA: '👤 Un agent (persona expert)', atelierKindS: '🛠 Un skill (procédure)',
  atelierIntent: "Ce qu'il doit faire", atelierIntentPh: 'Ex : un agent senior qui supervise la revue de code, coordonne les experts sécurité et perf, et rend un rapport priorisé…',
  atelierSenior: 'Niveau senior orchestrateur (supervise, coordonne, garantit la qualité)',
  atelierGen: "✨ Générer avec l'IA",
  atelierGenApi: 'Générer (API)',
  atelierSaving: 'Enregistrer',
  atelierList: 'Mes créations',
  atelierEmpty: 'Aucune création — décris un besoin puis génère.',
  atelierSending: 'Génération en cours…',
  atelierDone: (m, l) => `✓ Généré en ${(l / 1000).toFixed(1)} s · ${m || 'LLM'}`,
  atelierErr: 'Échec',
  atelierNeedApi: "Ajoute une clé API dans Réglages → Intelligence (ou variable d'environnement).",
  atelierDel: 'Supprimer', atelierExp: 'Exporter .md',
  agentOf: 'Système', skillOf: 'Procédure',
  needIntent: "Décris d'abord ce que la création doit faire.",
} : {
  ph: 'Search a skill, an agent, a prompt…', all: 'All', skills: 'Skills',
  agents: 'Agents', perso: '✍️ Custom', favs: '★ Favorites', results: 'results',
  copy: '⧉ Copy', open: '⌘⏎ Open in {x}', gpt: '⇧⏎ ChatGPT',
  empty: 'No results — try another word', recents: '🕘 Recent',
  selected: 'sel.', compose: '✚ Compose ({n})', newp: 'New prompt ✍️',
  noFav: (n) => `No favorite #${n}`, hello: 'Hello! Here is my need: ',
  selHint: '⌘-click to select · ⌥⏎ composes the {n} selected',
  tipSkill: 'SKILL — activates an expertise procedure. Click: copy prompt · right-click: send.',
  tipAgent: 'AGENT — adopts an expert persona. Click: copy prompt · right-click: send.',
  tipCustom: 'CUSTOM PROMPT — your text is sent as-is. Click: copy · right-click: send.',
  tipFav: '★ Favorite — ⌘{n} launches it from the ⚡ menu',
  sendTo: 'Send to',
  copyPrompt: '⧉ Copy prompt',
  favAdd: '★ Add to favorites', favDel: '☆ Remove from favorites',
  mdCreate: '📄 Create the .md file',
  mdCreated: (p) => `📄 Created: ${p}`,
  mdErr: 'Failed to create .md',
  tipCat: 'Category',
  atelier: 'Workshop',
  atelierT: '🛠 Workshop — build an agent or a skill',
  atelierKind: 'I am building', atelierKindA: '👤 An agent (expert persona)', atelierKindS: '🛠 A skill (procedure)',
  atelierIntent: 'What it should do', atelierIntentPh: 'E.g.: a senior agent supervising code review, coordinating security and perf experts, delivering a prioritized report…',
  atelierSenior: 'Senior orchestrator level (supervises, coordinates, owns quality)',
  atelierGen: '✨ Generate with AI',
  atelierGenApi: 'Generate (API)',
  atelierSaving: 'Save',
  atelierList: 'My creations',
  atelierEmpty: 'No creation yet — describe a need then generate.',
  atelierSending: 'Generating…',
  atelierDone: (m, l) => `✓ Generated in ${(l / 1000).toFixed(1)} s · ${m || 'LLM'}`,
  atelierErr: 'Failed',
  atelierNeedApi: 'Add an API key in Settings → Intelligence (or an environment variable).',
  atelierDel: 'Delete', atelierExp: 'Export .md',
  agentOf: 'System', skillOf: 'Procedure',
  needIntent: 'Describe first what your creation should do.',
};

// ---------- Catalogue + prefs ----------
const CAT = (window.mgp && window.mgp.catalog) || { meta: { version: '?' }, skills: [], agents: [] };
const S = CAT.skills || [], A = CAT.agents || [];
const SYS = (window.mgp.getPrefs && window.mgp.getPrefs()) || { favorites: [], recents: [], defaultLLM: 'claude', sendTargets: [] };
const SEND_TARGETS = (SYS.sendTargets || []).filter((t) => typeof t === 'string');
const HAS_API = SYS.hasApi || {};
let FAVS = new Set(SYS.favorites || []);
let CUSTOMS = (SYS.customs || []).slice();
const isFav = (n) => FAVS.has(n);
const LLM_LABEL = { claude: 'Claude', chatgpt: 'ChatGPT', perplexity: 'Perplexity', copilot: 'Copilot', deepseek: 'DeepSeek', zai: 'Z.ai', kimi: 'Kimi', mammouth: 'Mammouth' };
const TGT_META = { freebuff: 'Freebuff (app)', 'opencode-app': 'OpenCode (desktop)', opencode: 'OpenCode (terminal)', clipboard: LANG === 'fr' ? 'Presse-papiers' : 'Clipboard' };
const tgtLabel = (t) => TGT_META[t] || LLM_LABEL[t] || t;

// ---------- Prompts ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lname = (x) => LANG === 'en' ? (x.name_en || x.name) : (x.name_fr || x.name);
const ldesc = (x) => LANG === 'en' ? (x.desc_en || x.desc) : (x.desc_fr || x.desc);
function promptOf(x, k) {
  const n = lname(x), d = (ldesc(x) || '').trim();
  if (k === 'custom') return `${n}\n\n${d}`;
  if (k === 'agent') return `Agis désormais comme l'agent "${n}". ${d}\nUtilise cette expertise pour répondre à ma demande ci-dessous.\n\n`;
  return `Utilise le skill "${n}" (${CAT.meta?.name || 'MEGA PACK'}). ${d}\nApplique-le à ma demande ci-dessous.\n\n`;
}
const buildCombo = (items) => `Voici ${items.length} modules à appliquer ensemble :\n\n` + items.map((x, i) => `${i + 1}. **${lname(x)}** — ${(ldesc(x) || '').trim()}`).join('\n') + `\n\nCombine ces expertises pour traiter ma demande ci-dessous.\n\n`;

// ---------- État ----------
const TABS = ['all', 'skills', 'agents', 'custom', 'favs'];
let filter = 'all';            // all | skills | agents | custom | favs
let query = '';
let results = [];              // [{ x, k }]
let sel = new Set();           // noms sélectionnés (⌘-clic)
let idx = 0;

const $ = (id) => document.getElementById(id);

// ---------- DOM ----------
document.body.innerHTML = `
<main id="app" role="application" aria-label="MEGA PACK">
  <header id="top">
    <span id="brand">⚡ <b>MEGA&nbsp;PACK</b></span>
    <span id="counts">${S.length} skills · ${A.length} agents</span>
    <span style="flex:1"></span>
    <button id="newp" title="${T.newp}" aria-label="${T.newp}">＋</button>
    <button id="langb" title="FR/EN" aria-label="FR/EN">${LANG === 'fr' ? 'FR' : 'EN'}</button>
  </header>
  <div id="searchrow">
    <span id="lupa" aria-hidden="true">⌕</span>
    <input id="q" type="text" role="searchbox" placeholder="${T.ph}" aria-label="${T.ph}"
      autocomplete="off" spellcheck="false" autofocus>
  </div>
  <nav id="tabs" role="tablist" aria-label="${LANG === 'fr' ? 'Catégories' : 'Categories'}">
    ${['all', 'skills', 'agents', 'custom', 'favs'].map((f) =>
      `<button role="tab" data-f="${f}" aria-selected="${f === 'all'}">${T[f === 'all' ? 'all' : f === 'skills' ? 'skills' : f === 'agents' ? 'agents' : f === 'custom' ? 'perso' : 'favs']}</button>`).join('')}
    <span style="flex:1"></span>
    <span id="sels" hidden></span>
    <button id="compose" hidden></button>
  </nav>
  <section id="list" role="listbox" aria-label="${T.results}"></section>
  <footer id="foot">
    <span>↑↓ <i>${LANG === 'fr' ? 'naviguer' : 'navigate'}</i></span>
    <span>⏎ <i>${LANG === 'fr' ? 'copier' : 'copy'}</i></span>
    <span>⌘⏎ <i>${LANG === 'fr' ? 'ouvrir' : 'open'}</i></span>
    <span>⇧⏎ ChatGPT</span>
    <span>★ <i>${LANG === 'fr' ? 'favori' : 'favorite'}</i></span>
    <span style="flex:1"></span>
    <button id="atb" title="${T.atelierT}" aria-haspopup="dialog">🛠 ${T.atelier}</button>
    <span id="cnt" role="status" aria-live="polite"></span>
  </footer>
  <div id="tip" role="tooltip" hidden></div>
  <div id="ctx" role="menu" hidden></div>
  <div id="toast" role="status" aria-live="polite" hidden></div>
  <div id="wmodal" role="dialog" aria-modal="true" aria-label="${T.atelierT}" hidden>
    <div id="wbox">
      <h3>${T.atelierT}</h3>
      <div class="wk">
        <span class="wl">${T.atelierKind}</span>
        <span class="wseg" role="radiogroup">
          <button id="w-agent" role="radio" aria-checked="true">${T.atelierKindA}</button>
          <button id="w-skill" role="radio" aria-checked="false">${T.atelierKindS}</button>
        </span>
      </div>
      <label class="wl2">${T.atelierIntent}
        <textarea id="w-intent" rows="3" maxlength="1200" placeholder="${T.atelierIntentPh}"></textarea>
      </label>
      <label class="wchk"><input type="checkbox" id="w-senior" checked> ${T.atelierSenior}</label>
      <div class="wact">
        <button id="w-gen" class="pri">${T.atelierGen}</button>
        <span style="flex:1"></span>
        <button id="w-x">${LANG === 'fr' ? 'Fermer' : 'Close'}</button>
      </div>
      <div class="wlist-h"><b>${T.atelierList}</b><span id="w-count" class="wmut"></span></div>
      <div id="w-list" role="list"></div>
    </div>
  </div>
  <div id="modal" role="dialog" aria-modal="true" aria-label="${T.newp}" hidden>
    <div id="mbox">
      <h3>✍️ ${LANG === 'fr' ? 'Nouveau prompt' : 'New prompt'}</h3>
      <label>${LANG === 'fr' ? 'Nom' : 'Name'}<input id="e-name" type="text" maxlength="60"></label>
      <label>${LANG === 'fr' ? 'Prompt' : 'Prompt'}<textarea id="e-txt" rows="7" maxlength="2000"></textarea></label>
      <div id="erow">
        <button id="e-save" class="pri">${LANG === 'fr' ? 'Enregistrer' : 'Save'}</button>
        <button id="e-del" hidden>${LANG === 'fr' ? 'Supprimer' : 'Delete'}</button>
        <span style="flex:1"></span>
        <button id="e-x">${LANG === 'fr' ? 'Annuler' : 'Cancel'}</button>
      </div>
    </div>
  </div>
</main>`;

const q = $('q'), list = $('list'), cnt = $('cnt'), sels = $('sels'), composeBtn = $('compose');

// ────────────────────────────────────────────────────────────────────────────
//  Tooltip flottant — survol d'un agent / skill / ✍️ : explication complète
// ────────────────────────────────────────────────────────────────────────────
const tip = $('tip');
let tipTimer = null, tipFor = null;
const tipKindLabel = (k) => k === 'agent' ? (LANG === 'fr' ? 'AGENT' : 'AGENT') : k === 'custom' ? (LANG === 'fr' ? 'PERSO' : 'CUSTOM') : 'SKILL';
function tipHtml(it) {
  const x = it.x, k = it.k;
  const favIdx = (SYS.favorites || []).indexOf(x.name);
  const kindLine = k === 'agent'
    ? T.tipAgent : k === 'custom' ? T.tipCustom : T.tipSkill;
  const cat = x.category ? `<span class="trow"><i>${T.tipCat}</i><b>${esc(x.category.replace(/-/g, ' '))}</b></span>` : '';
  const skills = (k === 'agent' && Array.isArray(x.skills) && x.skills.length)
    ? `<span class="trow"><i>🧩</i><b>${x.skills.slice(0, 6).map(esc).join(' · ')}</b></span>` : '';
  return `<span class="tkind t-${k}">${tipKindLabel(k)}${isFav(x.name) ? ' <b class="tf">★</b>' : ''}</span>
    <b class="tname">${esc(lname(x))}</b>
    <p class="tdesc">${esc((ldesc(x) || '').slice(0, 320))}${(ldesc(x) || '').length > 320 ? '…' : ''}</p>
    ${cat}${skills}
    <span class="thint">${kindLine}</span>
    ${favIdx >= 0 && favIdx < 9 && SYS.favShortcuts !== false ? `<span class="tfav">${T.tipFav.replace('{n}', favIdx + 1)}</span>` : ''}`;
}
function showTip(el, it) {
  tip.innerHTML = tipHtml(it);
  tip.hidden = false;
  tipFor = it.x.name;
  const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect(), app = $('app').getBoundingClientRect();
  let x = r.left + r.width / 2 - tr.width / 2;
  x = Math.max(app.left + 8, Math.min(x, app.right - tr.width - 8));
  let y = r.top - tr.height - 8;
  if (y < app.top + 6) y = Math.min(r.bottom + 8, app.bottom - tr.height - 6);
  tip.style.left = `${Math.round(x - app.left)}px`;
  tip.style.top = `${Math.round(y - app.top)}px`;
}
function hideTip() { tip.hidden = true; tipFor = null; }
list.addEventListener('mouseover', (e) => {
  const el = e.target.closest && e.target.closest('.it');
  if (!el) return;
  clearTimeout(tipTimer);
  const it = results[+el.dataset.i];
  if (!it) return;
  if (tipFor === it.x.name && !tip.hidden) return;
  tipTimer = setTimeout(() => showTip(el, it), 350); // délai : pas de tooltip en survol rapide
});
list.addEventListener('mouseout', (e) => {
  if (e.target.closest && e.target.closest('.it')) { clearTimeout(tipTimer); setTimeout(() => { if (!tip.matches(':hover')) hideTip(); }, 120); }
});
tip.addEventListener('mouseenter', hideTip); // le tooltip ne gêne jamais le clic

// ────────────────────────────────────────────────────────────────────────────
//  Menu contextuel (clic droit) — envoi vers le(s) LLM choisis dans Réglages
// ────────────────────────────────────────────────────────────────────────────
const ctx = $('ctx');
function ctxHtml(it) {
  const x = it.x;
  const targets = SEND_TARGETS.length ? SEND_TARGETS : [SYS.defaultLLM || 'claude'];
  return `<span class="chead">${itEmoji(it.k)} ${esc(lname(x))}</span>
    <span class="csec">${T.sendTo}</span>
    ${targets.map((t) => `<button role="menuitem" data-t="${esc(t)}">▸ ${esc(tgtLabel(t))}</button>`).join('')}
    <span class="csep"></span>
    <button role="menuitem" data-a="md">${T.mdCreate}</button>
    <button role="menuitem" data-a="opendir">${LANG === 'fr' ? '📂 Ouvrir le dossier MEGA PROMPT' : '📂 Open MEGA PROMPT folder'}</button>
    <span class="csep"></span>
    <button role="menuitem" data-a="copy">${T.copyPrompt}</button>
    <button role="menuitem" data-a="fav">${isFav(x.name) ? T.favDel : T.favAdd}</button>`;
}
function openCtx(el, it, cx, cy) {
  ctx.innerHTML = ctxHtml(it);
  ctx.hidden = false;
  const app = $('app').getBoundingClientRect(), cr = ctx.getBoundingClientRect();
  let x = Math.max(app.left + 6, Math.min(cx, app.right - cr.width - 6));
  let y = Math.max(app.top + 6, Math.min(cy, app.bottom - cr.height - 6));
  ctx.style.left = `${Math.round(x - app.left)}px`;
  ctx.style.top = `${Math.round(y - app.top)}px`;
  ctx.querySelectorAll('button').forEach((b) => {
    b.onclick = () => {
      hideCtx();
      if (b.dataset.t) {
        window.mgp.addRecent && window.mgp.addRecent(it.x.name);
        window.mgp.openLLM(b.dataset.t, promptOf(it.x, it.k));
      } else if (b.dataset.a === 'md') {
        // Crée le fichier .md dans le dossier MEGA PROMPT puis montre le chemin
        window.mgp.promptMdCreate({ x: it.x, k: it.k }).then((r) => {
          if (r && r.ok) showToast(T.mdCreated(r.path), 'ok');
          else showToast(`${T.mdErr} — ${(r && r.error) || '?'}`, 'err');
        });
      } else if (b.dataset.a === 'opendir') {
        window.mgp.promptDirOpen();
      } else if (b.dataset.a === 'copy') activate(it);
      else if (b.dataset.a === 'fav') toggleFav(it.x.name);
    };
  });
}
function hideCtx() { ctx.hidden = true; }
document.addEventListener('click', (e) => { if (!ctx.hidden && !e.target.closest('#ctx')) hideCtx(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ctx.hidden) hideCtx(); });
window.addEventListener('blur', () => { hideCtx(); hideTip(); });

// ────────────────────────────────────────────────────────────────────────────
//  Toast — retour discret (génération IA, erreurs)
// ────────────────────────────────────────────────────────────────────────────
const toast = $('toast');
let toastTimer = null;
function showToast(msg, kind) {
  toast.textContent = msg;
  toast.className = kind === 'err' ? 'err' : kind === 'ok' ? 'ok' : '';
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3400);
}

// ---------- Données dérivées ----------
const ALL = [
  ...S.map((x) => ({ x, k: 'skill' })),
  ...A.map((x) => ({ x, k: 'agent' })),
  ...CUSTOMS.map((x) => ({ x, k: 'custom' })),
];
const findItem = (n) => ALL.find((i) => i.x.name === n);
const match = (it) => {
  if (!query) return true;
  const x = it.x;
  return (x.name + ' ' + lname(x) + ' ' + (x.category || '') + ' ' + (ldesc(x) || '')).toLowerCase().includes(query);
};
const byFilter = (it) => {
  if (filter === 'skills') return it.k === 'skill';
  if (filter === 'agents') return it.k === 'agent';
  if (filter === 'custom') return it.k === 'custom';
  if (filter === 'favs') return isFav(it.x.name);
  return true;
};
function compute() {
  results = ALL.filter(byFilter).filter(match);
  if (query) results.sort((a, b) => (lname(a.x).toLowerCase().startsWith(query) ? -1 : 0) - (lname(b.x).toLowerCase().startsWith(query) ? -1 : 0) || lname(a.x).localeCompare(lname(b.x)));
  idx = Math.min(idx, Math.max(0, results.length - 1));
}

// ---------- Rendu ----------
const itEmoji = (k) => k === 'agent' ? '👤' : k === 'custom' ? '✍️' : '🛠';
function render() {
  compute();
  if (!results.length) {
    list.innerHTML = `<div id="void">${T.empty}</div>`;
  } else {
    list.innerHTML = results.map((it, i) => {
      const n = it.x.name;
      return `<div class="it k-${it.k} ${i === idx ? 'on' : ''} ${sel.has(n) ? 'selc' : ''}" role="option"
        aria-selected="${i === idx}" data-i="${i}" data-n="${esc(n)}">
        <span class="ico">${itEmoji(it.k)}</span>
        <span class="mid"><b>${esc(lname(it.x))}</b><i>${esc((ldesc(it.x) || '').slice(0, 90))}</i></span>
        <span class="tail">
          ${isFav(n) ? '<span class="fv">★</span>' : ''}
          <button class="fb" title="${LANG === 'fr' ? 'Favori' : 'Favorite'}" aria-label="${LANG === 'fr' ? 'Favori' : 'Favorite'}">${isFav(n) ? '★' : '☆'}</button>
        </span>
      </div>`;
    }).join('');
  }
  cnt.textContent = `${results.length} ${T.results}`;
  const ns = sel.size;
  sels.hidden = !ns;
  composeBtn.hidden = !ns;
  if (ns) {
    sels.textContent = `${ns} ${T.selected}`;
    composeBtn.textContent = T.compose.replace('{n}', ns);
    composeBtn.title = T.selHint.replace('{n}', ns);
  }
  list.querySelectorAll('.it').forEach((el) => {
    const i = +el.dataset.i, it = results[i];
    el.onclick = (ev) => {
      if (ev.target.closest('.fb')) { toggleFav(it.x.name); return; }
      if (ev.metaKey || ev.ctrlKey) { sel.has(it.x.name) ? sel.delete(it.x.name) : sel.add(it.x.name); render(); return; }
      if (ev.altKey) { openSelection(SYS.defaultLLM || 'claude'); return; }
      activate(it, el);
    };
    // Clic droit : menu flottant d'envoi vers les LLM choisis dans Réglages
    el.oncontextmenu = (ev) => {
      ev.preventDefault();
      hideTip();
      openCtx(el, it, ev.clientX, ev.clientY);
    };
  });
  list.querySelector('.it.on')?.scrollIntoView({ block: 'nearest' });
}

// ---------- Actions ----------
function activate(it, el) {
  window.mgp.copy(promptOf(it.x, it.k));
  window.mgp.addRecent && window.mgp.addRecent(it.x.name);
  if (el) { el.classList.add('copied'); setTimeout(() => el.classList.remove('copied'), 500); }
}
function openSelection(target) {
  const items = [...sel].map((n) => findItem(n)).filter(Boolean);
  const prompt = items.length ? buildCombo(items.map((f) => ({ x: f.x, k: f.k })))
    : (q.value.trim() || T.hello);
  window.mgp.openLLM(target, prompt);
}
function toggleFav(name) {
  window.mgp.toggleFav && window.mgp.toggleFav(name);
  isFav(name) ? FAVS.delete(name) : FAVS.add(name);
  render();
}

// ---------- Modal ✍️ ----------
let editing = null;
function openModal(c) {
  editing = c ? c.name : null;
  $('e-name').value = c ? c.name : '';
  $('e-txt').value = c ? c.desc : '';
  $('e-del').hidden = !c;
  $('modal').hidden = false;
  $('e-name').focus();
}
function closeModal() { $('modal').hidden = true; }
$('newp').onclick = () => openModal(null);
$('e-x').onclick = closeModal;
$('e-save').onclick = () => {
  const name = $('e-name').value.trim(), desc = $('e-txt').value.trim();
  if (!name || !desc) return;
  window.mgp.customSave && window.mgp.customSave({ name, desc });
  const i = CUSTOMS.findIndex((c) => c.name === name);
  const rec = { name, desc };
  if (i >= 0) CUSTOMS[i] = rec; else CUSTOMS.push(rec);
  ALL.length = 0; ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })), ...CUSTOMS.map((x) => ({ x, k: 'custom' })));
  closeModal(); render();
};
$('e-del').onclick = () => {
  if (!editing) return;
  window.mgp.customDelete && window.mgp.customDelete(editing);
  CUSTOMS = CUSTOMS.filter((c) => c.name !== editing);
  ALL.length = 0; ALL.push(...S.map((x) => ({ x, k: 'skill' })), ...A.map((x) => ({ x, k: 'agent' })), ...CUSTOMS.map((x) => ({ x, k: 'custom' })));
  closeModal(); render();
};
$('e-txt').addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('e-save').onclick(); });
if (window.mgp.onEditCustom) window.mgp.onEditCustom((c) => openModal(c));

// ---------- Tabs + recherche ----------
$('tabs').querySelectorAll('[data-f]').forEach((b) => {
  b.onclick = () => {
    filter = b.dataset.f; idx = 0;
    $('tabs').querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    render();
  };
});
q.addEventListener('input', () => { query = q.value.trim().toLowerCase(); idx = 0; render(); });
$('langb').onclick = () => { window.mgp.onSettingsChange && window.mgp.onSettingsChange({ lang: LANG === 'fr' ? 'en' : 'fr' }); location.reload(); };
composeBtn.onclick = () => openSelection(SYS.defaultLLM || 'claude');

// ---------- Clavier ----------
document.addEventListener('keydown', (e) => {
  if (!$('modal').hidden) {
    if (e.key === 'Escape') { closeModal(); return; }
    return;
  }
  if (!$('wmodal').hidden) {
    if (e.key === 'Escape') { closeWorkshop(); return; }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { wgen.onclick(); return; }
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === ',') { window.mgp.openSettings(); return; }
  if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
    const f = findItem((SYS.favorites || [])[+e.key - 1]);
    if (f) { e.preventDefault(); window.mgp.openLLM(SYS.defaultLLM || 'claude', promptOf(f.x, f.k)); }
    return;
  }
  if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, results.length - 1); render(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); render(); }
  else if (e.key === 'Home') { e.preventDefault(); idx = 0; render(); }
  else if (e.key === 'End') { e.preventDefault(); idx = results.length - 1; render(); }
  else if (e.key === 'PageDown') { e.preventDefault(); idx = Math.min(idx + 10, results.length - 1); render(); }
  else if (e.key === 'PageUp') { e.preventDefault(); idx = Math.max(idx - 10, 0); render(); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    const it = results[idx];
    if (!it) return;
    if (e.metaKey || e.ctrlKey) window.mgp.openLLM(SYS.defaultLLM || 'claude', promptOf(it.x, it.k));
    else if (e.shiftKey) window.mgp.openLLM('chatgpt', promptOf(it.x, it.k));
    else if (e.altKey) openSelection(SYS.defaultLLM || 'claude');
    else activate(it);
  } else if (e.key === 'Escape') {
    if (q.value) { q.value = ''; query = ''; render(); }
    else window.mgp.hide();
  } else if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1 && document.activeElement !== q) {
    q.focus(); // l'utilisateur tape : la recherche capte tout
  }
});

// ---------- Thème ----------
function applyTheme() {
  const dark = (window.mgp.getPrefs() || {}).theme !== 'light';
  document.body.classList.toggle('light', !dark);
}
try { window.mgp.onSettings(({ theme, lang: l }) => { if (l && l !== LANG) location.reload(); applyTheme(); }); } catch (e) {}
applyTheme();

// ────────────────────────────────────────────────────────────────────────────
//  🛠 Atelier — créer ses agents & skills, générés par IA (clé API)
// ────────────────────────────────────────────────────────────────────────────
const W = { kind: 'agent', items: [], busy: false };
const wmodal = $('wmodal'), wlist = $('w-list'), wcount = $('w-count'), wgen = $('w-gen'), wintent = $('w-intent');
async function refreshWorkshop() {
  if (!window.mgp.workshopList) return;
  try {
    const [ag, sk] = await Promise.all([window.mgp.workshopList('agent'), window.mgp.workshopList('skill')]);
    W.items = [
      ...(ag || []).map((x) => ({ x, k: 'agent' })),
      ...(sk || []).map((x) => ({ x, k: 'skill' })),
    ];
  } catch (e) { W.items = []; }
  renderWorkshop();
}
function renderWorkshop() {
  const n = W.items.length;
  wcount.textContent = n ? String(n) : '';
  wlist.innerHTML = n
    ? W.items.map((it, i) => {
      const det = it.k === 'agent'
        ? `${T.agentOf} · ${((it.x.system || '').length / 1000).toFixed(1)}k car.${(it.x.skills || []).length ? ' · 🧩 ' + it.x.skills.length : ''}`
        : `${T.skillOf} · ${((it.x.body || '').length / 1000).toFixed(1)}k car.${(it.x.checks || []).length ? ' · ✓ ' + it.x.checks.length : ''}`;
      return `<div class="wit" role="listitem" data-i="${i}">
        <span class="wico">${itEmoji(it.k)}</span>
        <span class="wmid"><b>${esc(lname(it.x))}</b><i>${esc((ldesc(it.x) || '').slice(0, 80))}</i><u>${esc(det)}</u></span>
        <span class="wact2">
          <button data-a="export" title="${T.atelierExp}" aria-label="${T.atelierExp}">⬇</button>
          <button data-a="del" title="${T.atelierDel}" aria-label="${T.atelierDel}">🗑</button>
        </span>
      </div>`;
    }).join('')
    : `<div class="wempty">${T.atelierEmpty}</div>`;
  wlist.querySelectorAll('.wit button').forEach((b) => {
    b.onclick = async () => {
      const it = W.items[+b.closest('.wit').dataset.i];
      if (b.dataset.a === 'del') {
        await window.mgp.workshopDelete(it.k, it.x.name);
        showToast(it.k === 'agent' ? (LANG === 'fr' ? '🗑 Agent supprimé' : '🗑 Agent deleted') : (LANG === 'fr' ? '🗑 Skill supprimé' : '🗑 Skill deleted'), 'ok');
        refreshWorkshop();
      } else {
        const ok = await window.mgp.workshopExport(it.k, it.x.name);
        if (ok) showToast(LANG === 'fr' ? '✓ Exporté en .md' : '✓ Exported as .md', 'ok');
      }
    };
  });
}
function setWkind(kind) {
  W.kind = kind;
  $('w-agent').setAttribute('aria-checked', String(kind === 'agent'));
  $('w-skill').setAttribute('aria-checked', String(kind === 'skill'));
}
$('w-agent').onclick = () => setWkind('agent');
$('w-skill').onclick = () => setWkind('skill');
function openWorkshop() {
  wmodal.hidden = false;
  refreshWorkshop();
  wintent.focus();
}
function closeWorkshop() { wmodal.hidden = true; }
$('atb').onclick = openWorkshop;
$('w-x').onclick = closeWorkshop;

wgen.onclick = async (payload) => {
  if (W.busy) return;
  const intent = String((payload && payload.intent) || wintent.value || '').trim();
  if (!intent) { showToast(T.needIntent, 'err'); wintent.focus(); return; }
  const anyKey = HAS_API.groq || HAS_API.openai || HAS_API.anthropic || HAS_API.openrouter || HAS_API.custom || HAS_API.ollama || Object.values(HAS_API).some(Boolean);
  if (!anyKey) { showToast(T.atelierNeedApi, 'err'); return; }
  W.busy = true;
  wgen.disabled = true;
  wgen.textContent = T.atelierSending;
  const res = await window.mgp.llmGenerate(payload ? { ...payload, kind: payload.kind || W.kind, intent } : { kind: W.kind, intent, senior: $('w-senior').checked, lang: LANG });
  W.busy = false;
  wgen.disabled = false;
  wgen.textContent = T.atelierGen;
  if (res && res.ok) {
    wintent.value = '';
    showToast(T.atelierDone(res.model, res.latency || 0), 'ok');
    if (window.__mgp && window.__mgp.wgenResolve) { window.__mgp.wgenResolve(res); window.__mgp.wgenResolve = null; }
    refreshWorkshop();
    // La création devient un citoyen du panneau (recherche, favoris, envoi)
    const rec = res.item;
    const pool = W.kind === 'agent' ? A : S;
    const inCat = pool.some((x) => x.name === rec.name);
    if (!inCat) { pool.push(rec); ALL.push({ x: rec, k: W.kind }); }
    render();
  } else {
    showToast(`${T.atelierErr} — ${(res && res.error) || '?'}`, 'err');
    if (window.__mgp && window.__mgp.wgenResolve) { window.__mgp.wgenResolve(res); window.__mgp.wgenResolve = null; }
  }
};
wintent.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') wgen.onclick(); });

render();

// ---------- Instrumentation (tests) ----------
window.__mgp = {
  list: () => results,
  filters: () => filter,
  select: (f) => { filter = f; render(); },
  search: (s) => { query = String(s || '').toLowerCase(); q.value = query; render(); return results.length; },
  selection: () => [...sel],
  toggleSel: (n) => { sel.has(n) ? sel.delete(n) : sel.add(n); render(); },
  nav: (d) => { idx = d > 0 ? Math.min(idx + 1, results.length - 1) : Math.max(idx - 1, 0); render(); return idx; },
  current: () => results[idx] || null,
  copy: () => activate(results[idx]),
  openLLM: () => window.mgp.openLLM(SYS.defaultLLM || 'claude', promptOf(results[idx].x, results[idx].k)),
  openCustom: (n) => { const c = CUSTOMS.find((x) => x.name === n); if (c) openModal(c); },
  tooltip: () => ({ hidden: tip.hidden, for: tipFor, text: tip.textContent }),
  ctx: () => ({ hidden: ctx.hidden, buttons: [...ctx.querySelectorAll('button')].map((b) => b.dataset.t || b.dataset.a) }),
  openCtxAt: (i) => { const el = list.querySelector(`.it[data-i="${i}"]`) || list.children[i] || { getBoundingClientRect: () => ({ left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 }) }; if (results[i]) openCtx(el, results[i], 200, 200); },
  workshop: () => W,
  openWorkshop: () => openWorkshop(),
  setWkind: (k) => setWkind(k),
  workshopItems: () => W.items,
  wgenResolve: null,
  saveCustom: (name, desc) => { $('e-name').value = name; $('e-txt').value = desc; $('e-save').onclick(); },
  deleteCustom: (name) => { const c = CUSTOMS.find((x) => x.name === name); if (c) openModal(c); $('e-del').onclick(); },
  generateRaw: (payload) => wgen.onclick(payload),
  counts: () => ({ all: ALL.length, skills: S.length, agents: A.length, customs: CUSTOMS.length, favs: FAVS.size }),
  tabs: () => TABS.slice(),
};
