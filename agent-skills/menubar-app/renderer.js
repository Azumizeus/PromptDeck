// MEGA PACK Menu Bar App — recherche globale et activation en 1 clic
// Chargé par index.html. Accès système via window.mgp (preload.js).

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
let LANG = localStorage.getItem('mgp.lang') || 'fr';

const I18N = {
  fr: {
    ph: '🔍 Rechercher…', all: 'Tout', skills: 'Skills', agents: 'Agents',
    composed: (n) => `🚀 ${n} sélectionnés — ⏎ pour ouvrir dans Claude, ⇧⏎ pour ChatGPT`,
    empty: 'Aucun résultat', sel: 'sél.', copyOk: (n) => `⚡ ${n} → prompt copié !`,
    themeOn: (t) => (t === 'light' ? '☀️ Thème clair' : '🌙 Thème sombre'),
    openClaude: '⏎ Ouvrir la sélection dans Claude', openGpt: '⇧⏎ Ouvrir dans ChatGPT',
    footShort: '↑↓ naviguer · ⏎ copier · ⌘⏎ ouvrir (LLM par défaut) · ⇧⏎ ChatGPT · ⌘, réglages · Échap fermer',
    hello: 'Bonjour !',
  },
  en: {
    ph: '🔍 Search…', all: 'All', skills: 'Skills', agents: 'Agents',
    composed: (n) => `🚀 ${n} selected — ⏎ open in Claude, ⇧⏎ open in ChatGPT`,
    empty: 'No results', sel: 'sel.', copyOk: (n) => `⚡ ${n} → prompt copied!`,
    themeOn: (t) => (t === 'light' ? '☀️ Light theme' : '🌙 Dark theme'),
    openClaude: '⏎ Open selection in Claude', openGpt: '⇧⏎ Open in ChatGPT',
    footShort: '↑↓ navigate · ⏎ copy · ⌘⏎ open (default LLM) · ⇧⏎ ChatGPT · ⌘, settings · Esc close',
    hello: 'Hello!',
  },
};
const T = () => I18N[LANG] || I18N.fr;

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

// ---------- DOM ----------
document.body.innerHTML = `
<div id="wrap">
  <div id="searchrow">
    <input id="q" type="text" placeholder="${T().ph}" autofocus>
    <button id="addc" title="${LANG === 'fr' ? 'Nouveau prompt personnalisé' : 'New custom prompt'}">＋</button>
    <button id="theme" title="theme">🌙</button>
    <button id="lang" title="langue">FR</button>
  </div>
  <div id="tabs">
    <div class="tb on" data-t="all">${T().all}</div>
    <div class="tb" data-t="fav">⭐</div>
    <div class="tb" data-t="skills">${T().skills}</div>
    <div class="tb" data-t="agents">${T().agents}</div>
    <div class="tb" data-t="custom">✍️</div>
    <div id="cnt"></div>
  </div>
  <div id="list"></div>
  <div id="foot">↑↓ naviguer · ⏎ copier · ⌘⏎ Claude · ⇧⏎ ChatGPT · ⌘, réglages · Échap fermer</div>
</div>
<div id="modal">
  <div id="mbox">
    <b>✍️ ${LANG === 'fr' ? 'Prompt personnalisé' : 'Custom prompt'}</b>
    <input id="e-name" placeholder="${LANG === 'fr' ? 'Nom (ex : Mon audit Solana)' : 'Name (e.g. My Solana audit)'}" maxlength="80">
    <input id="e-tag" placeholder="${LANG === 'fr' ? 'Tag / catégorie (ex : code, écriture) — optionnel' : 'Tag / category (e.g. code, writing) — optional'}" maxlength="40">
    <textarea id="e-txt" placeholder="${LANG === 'fr' ? 'Ton prompt — utilisé tel quel dans tous les LLM' : 'Your prompt — used as-is in every LLM'}"></textarea>
    <div id="mbtns">
      <button id="e-del" class="danger">🗑</button>
      <span style="flex:1"></span>
      <button id="e-cancel">${LANG === 'fr' ? 'Annuler' : 'Cancel'}</button>
      <button id="e-save" class="primary">${LANG === 'fr' ? 'Enregistrer' : 'Save'}</button>
    </div>
  </div>
</div>`;

const $ = (id) => document.getElementById(id);
const q = $('q'), list = $('list'), cnt = $('cnt');
let mode = 'all', sel = new Set(), results = [];

// Préférences système (favoris, récents, LLM par défaut) — fournis par le main process
const SYS = (window.mgp.getPrefs && window.mgp.getPrefs()) || { favorites: [], recents: [], defaultLLM: 'claude' };
const FAVS = new Set(SYS.favorites || []);
const isFav = (name) => FAVS.has(name);
let CUSTOMS = (SYS.customs || []).slice(); // ✍️ prompts personnalisés (sync via IPC)

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{font:13px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
#wrap{display:flex;flex-direction:column;height:100vh;background:var(--bg);color:var(--txt)}
:root{--bg:#0b0e14;--card:#161b28;--card2:#1c2233;--border:#252d40;--txt:#e8ecf4;--mut:#8b94a8;--acc:#7c6cff;--acc2:#00d4aa}
body.light{--bg:#f4f6fb;--card:#fff;--card2:#eef1f8;--border:#d9deeb;--txt:#1a2030;--mut:#5b6478;--acc:#5b46e8;--acc2:#00a985}
#searchrow{display:flex;gap:6px;padding:8px;border-bottom:1px solid var(--border);background:var(--card)}
#q{flex:1;background:var(--card2);border:1px solid var(--border);color:var(--txt);padding:7px 10px;border-radius:8px;font-size:13px;outline:none}
#q:focus{border-color:var(--acc)}
#searchrow button{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:var(--card2);color:var(--txt);cursor:pointer;font-size:12px}
#lang{width:auto!important;padding:0 8px}
#tabs{display:flex;gap:6px;padding:8px 8px 6px}
.tb{padding:4px 12px;border-radius:99px;background:var(--card);border:1px solid var(--border);color:var(--mut);cursor:pointer;font-size:12px;user-select:none}
.tb.on{background:var(--acc);border-color:var(--acc);color:#fff;font-weight:600}
#cnt{margin-left:auto;font-size:11px;color:var(--mut);align-self:center}
#list{flex:1;overflow-y:auto;padding:0 8px 8px}
.it{display:flex;gap:8px;align-items:flex-start;padding:7px 9px;border-radius:9px;cursor:pointer;border:1px solid transparent}
.fv{background:none;border:none;color:var(--mut);font-size:14px;cursor:pointer;padding:0 2px;line-height:1.2}
.fv.on{color:#f5c518}
.it .bd{flex:1;min-width:0}
.it:hover,.it.on{background:var(--card);border-color:var(--acc)}
.it .nm{font-weight:600;font-size:12.5px}
.it .ds{font-size:11px;color:var(--mut);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.it .ct{font-size:9.5px;color:var(--mut);background:var(--card2);border:1px solid var(--border);border-radius:99px;padding:1px 7px;white-space:nowrap}
.it .ck{margin-left:auto;font-size:11px;color:var(--acc2);white-space:nowrap}
#foot{padding:6px 10px;border-top:1px solid var(--border);color:var(--mut);font-size:10.5px;background:var(--card)}
body.light #foot{background:var(--card2)}
.ev{background:none;border:none;color:var(--mut);font-size:11px;cursor:pointer;padding:0 3px}
.ev:hover{color:var(--acc)}
#modal{display:none;position:fixed;inset:0;background:rgba(4,6,12,.62);z-index:50;align-items:center;justify-content:center}
#mbox{display:flex;flex-direction:column;gap:8px;width:min(480px,92vw);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;box-shadow:0 18px 50px rgba(0,0,0,.5)}
#mbox b{font-size:13px}
#e-name,#e-txt{background:var(--card2);border:1px solid var(--border);color:var(--txt);border-radius:8px;padding:8px 10px;font:inherit;outline:none}
#e-name:focus,#e-txt:focus{border-color:var(--acc)}
#e-txt{min-height:150px;resize:vertical}
#mbtns{display:flex;gap:8px;align-items:center}
#mbtns button{border:1px solid var(--border);background:var(--card2);color:var(--txt);border-radius:7px;padding:6px 14px;font:inherit;cursor:pointer}
#mbtns .primary{background:var(--acc);border-color:var(--acc);color:#fff;font-weight:600}
#mbtns .danger{color:#e5484d;border-color:#e5484d55}
`;
const st = document.createElement('style');
st.textContent = CSS;
document.head.appendChild(st);

function applyTheme() {
  document.body.className = THEME === 'light' ? 'light' : '';
  $('theme').textContent = THEME === 'light' ? '☀️' : '🌙';
}
function applyLang() {
  $('lang').textContent = LANG.toUpperCase();
  q.placeholder = T().ph;
  document.querySelectorAll('.tb').forEach((b) => {
    if (b.dataset.t === 'all') b.textContent = T().all;
    if (b.dataset.t === 'skills') b.textContent = T().skills;
    if (b.dataset.t === 'agents') b.textContent = T().agents;
  });
}

function render() {
  const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
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
    return;
  }
  list.innerHTML = results.map(({ x, a }, i) => `
    <div class="it ${i === 0 ? 'on' : ''}" data-i="${i}" data-k="${x.name}">
      <button class="fv ${isFav(x.name) ? 'on' : ''}" data-f="${x.name}" title="favori">${isFav(x.name) ? '★' : '☆'}</button>
      <div class="bd"><div><span class="nm">${a === 'custom' ? '✍️' : a ? '👤' : '🛠'} ${lname(x)}</span> ${a === 'custom' ? `<button class="ev" data-e="${x.name}" title="éditer">✎</button>` : ''}<span class="ct">${a === 'custom' ? (x.tag || (LANG === 'fr' ? 'perso' : 'custom')) : x.category}</span></div>
      <div class="ds">${ldesc(x)}</div></div>
      ${sel.has(x.name) ? '<span class="ck">✓</span>' : ''}
    </div>`).join('');
  const foot = $('foot');
  foot.textContent = sel.size
    ? T().composed(sel.size)
    : T().footShort;
  list.querySelectorAll('.it').forEach((el) => {
    el.onclick = (ev) => {
      const fb = ev.target.closest('.fv');
      if (fb) { // ★/☆ : bascule favori, sans activer l'item
        ev.stopPropagation();
        const n = fb.dataset.f;
        if (FAVS.has(n)) FAVS.delete(n); else FAVS.add(n);
        window.mgp.toggleFav && window.mgp.toggleFav(n);
        fb.classList.toggle('on'); fb.textContent = FAVS.has(n) ? '★' : '☆';
        if (mode === 'fav') render();
        return;
      }
      const eb = ev.target.closest('.ev');
      if (eb) { // ✎ : éditer le prompt personnalisé
        ev.stopPropagation();
        openEditor(CUSTOMS.find((c) => c.name === eb.dataset.e));
        return;
      }
      activate(results[+el.dataset.i]);
    };
  });
  list.querySelector('.it.on')?.scrollIntoView({ block: 'nearest' });
}

function activate({ x, a }) {
  const p = a === 'custom' ? (x.desc || x.name || '') : a ? promptAgent(x) : promptSkill(x);
  window.mgp.copy(p);
  window.mgp.addRecent && window.mgp.addRecent(x.name); // alimente « 🕘 Récents » du menu clic droit
  flash(T().copyOk(x.name));
}
function flash(msg) {
  const foot = $('foot');
  foot.textContent = msg;
  foot.style.color = 'var(--acc2)';
  setTimeout(() => { foot.style.color = ''; render(); }, 1500);
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
      document.querySelectorAll('.tb').forEach((x) => x.classList.toggle('on', x.dataset.t === 'custom'));
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
  idx = Math.min(items.length - 1, Math.max(0, idx + d));
  items[idx].classList.add('on');
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
    if (el) activate(results[+el.dataset.i]);
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
document.querySelectorAll('.tb').forEach((b) => {
  b.onclick = () => {
    mode = b.dataset.t;
    document.querySelectorAll('.tb').forEach((x) => x.classList.remove('on'));
    b.classList.add('on');
    idx = 0; render();
  };
});
$('theme').onclick = () => {
  THEME = THEME === 'light' ? 'dark' : 'light';
  localStorage.setItem('mgp.theme', THEME); applyTheme();
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
