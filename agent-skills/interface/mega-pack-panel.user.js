// ==UserScript==
// @name         MEGA PACK Panel — Skills & Agents pour tout LLM
// @namespace    mega-pack
// @version      2.2.0
// @description  Panneau flottant aligné sur l'Édition Luxe : 131 skills + 190 agents + ✍️ prompts perso + ★ favoris, recherche instantanée, clavier complet, composeur ⌘-clic — injectables dans n'importe quelle conversation LLM (Claude, ChatGPT, Gemini, Perplexity, Mistral, OpenCode Web…)
// @author       MEGA PACK
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // ── État + persistance locale (par site) ──────────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mgp.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mgp.' + k, JSON.stringify(v)); } catch (e) {} },
  };
  let LANG = store.get('lang', 'fr');

  const I18N = {
    fr: {
      btnTitle: 'MEGA PACK — Skills & Agents',
      search: 'Rechercher un skill, un agent, un prompt…',
      tabs: { all: 'Tout', skills: 'Skills', agents: 'Agents', custom: '✍️ Perso', favs: '★ Favoris' },
      foot: 'Clic = injecter · ⏎ injecter · ⌘⏎ Claude · ⇧⏎ ChatGPT · ⌘-clic sélectionner',
      noResults: 'Aucun résultat — essaie un autre mot',
      empty: 'Catalogue vide — place catalog-full.js à côté du userscript.',
      injected: '✓ Injecté dans la conversation',
      copied: '✓ Copié',
      selected: 'sél.',
      compose: '✚ Composer ({n})',
      newp: '＋', newpTitle: 'Nouveau prompt ✍️',
      mName: 'Nom', mPrompt: 'Prompt', mSave: 'Enregistrer', mDel: 'Supprimer', mCancel: 'Annuler',
      count: (n) => n + ' résultat' + (n > 1 ? 's' : ''),
      pSkill: function (x) { return 'Utilise le skill "' + x.name + '" (' + x.path + '). Charge et suis son SKILL.md strictement. ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Réponds toujours en français.'; },
      pAgent: function (x) { return 'Agis désormais comme l\'agent "' + x.name + '" (' + x.path + '). ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Adopte ce persona pour toute la conversation et réponds toujours en français.'; },
      pCustom: function (x) { return x.name + '\n\n' + (x.desc || ''); },
    },
    en: {
      btnTitle: 'MEGA PACK — Skills & Agents',
      search: 'Search a skill, an agent, a prompt…',
      tabs: { all: 'All', skills: 'Skills', agents: 'Agents', custom: '✍️ Custom', favs: '★ Favorites' },
      foot: 'Click = inject · ⏎ inject · ⌘⏎ Claude · ⇧⏎ ChatGPT · ⌘-click select',
      noResults: 'No results',
      empty: 'Empty catalog — place catalog-full.js next to the userscript.',
      injected: '✓ Injected into the conversation',
      copied: '✓ Copied',
      selected: 'sel.',
      compose: '✚ Compose ({n})',
      newp: '＋', newpTitle: 'New prompt ✍️',
      mName: 'Name', mPrompt: 'Prompt', mSave: 'Save', mDel: 'Delete', mCancel: 'Cancel',
      count: (n) => n + ' result' + (n > 1 ? 's' : ''),
      pSkill: function (x) { return 'Use the skill "' + x.name + '" (' + x.path + '). Load and strictly follow its SKILL.md. ' + (x.desc || '').slice(0, 200); },
      pAgent: function (x) { return 'From now on, act as the agent "' + x.name + '" (' + x.path + '). ' + (x.desc || '').slice(0, 200) + ' Adopt this persona for the whole conversation.'; },
      pCustom: function (x) { return x.name + '\n\n' + (x.desc || ''); },
    },
  };
  const T = function () { return I18N[LANG] || I18N.fr; };

  // Dossier d'où ce script a été chargé (bookmarklet / <script src>) — sert à
  // auto-charger catalog-full.js placé à côté quand le catalogue est absent.
  const HERE = (function () {
    try {
      const s = document.currentScript && document.currentScript.src;
      return s ? s.replace(/[^/]*$/, '') : '';
    } catch (e) { return ''; }
  })();
  let catalogTried = false;
  function ensureCatalog(then) {
    if (window.MEGA_CATALOG || catalogTried || !HERE) return false;
    catalogTried = true;
    const sc = document.createElement('script');
    sc.src = HERE + 'catalog-full.js';
    sc.onload = function () { then(); };
    (document.head || document.documentElement).appendChild(sc);
    return true;
  }

  // ── Données dérivées (aligné Édition Luxe) ────────────────────────────────
  function cat() { return window.MEGA_CATALOG || { skills: [], agents: [] }; }
  function customs() { return store.get('customs', []); }
  function favs() { return store.get('favs', []); }
  function isFav(n) { return favs().indexOf(n) !== -1; }
  function toggleFav(n) {
    const f = favs(); const i = f.indexOf(n);
    if (i >= 0) f.splice(i, 1); else f.push(n);
    store.set('favs', f); return i < 0;
  }
  function ALL() {
    const C = cat();
    return [].concat(
      C.skills.map(function (x) { return { x: x, k: 'skill' }; }),
      C.agents.map(function (x) { return { x: x, k: 'agent' }; }),
      customs().map(function (x) { return { x: x, k: 'custom' }; })
    );
  }
  function lname(x) { return (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name; }
  function ldesc(x) { return (LANG === 'fr' && x.desc_fr) ? x.desc_fr : (x.desc || ''); }
  function promptOf(it) {
    if (it.k === 'custom') return T().pCustom(it.x);
    if (it.k === 'agent') return T().pAgent(it.x);
    return T().pSkill(it.x);
  }
  function buildCombo(items) {
    const head = LANG === 'fr'
      ? 'Voici ' + items.length + ' modules à appliquer ensemble :\n\n'
      : 'Here are ' + items.length + ' modules to apply together:\n\n';
    const mid = items.map(function (it, i) { return (i + 1) + '. **' + lname(it.x) + '** — ' + ldesc(it.x).trim(); }).join('\n');
    const tail = LANG === 'fr'
      ? '\n\nCombine ces expertises pour traiter ma demande ci-dessous.\n\n'
      : '\n\nCombine these expertises to handle my request below.\n\n';
    return head + mid + tail;
  }

  // ── Insertion dans la zone de saisie du LLM ───────────────────────────────
  function findEditor() {
    const sels = [
      'div[contenteditable="true"]#prompt-textarea',
      'textarea[data-id="root"]',
      'textarea#prompt-textarea',
      'div[contenteditable="true"].ProseMirror',
      'div[contenteditable="true"].ql-editor',
      'div[contenteditable="true"]',
      'textarea[placeholder]',
      'textarea',
    ];
    for (const s of sels) {
      const els = document.querySelectorAll(s);
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width > 100 && r.height > 20) return el;
      }
    }
    return null;
  }

  function insertText(txt) {
    const ed = findEditor();
    if (!ed) { GMcopy(txt); return 'clipboard'; }
    ed.focus();
    if (ed.tagName === 'TEXTAREA' || ed.tagName === 'INPUT') {
      const set = Object.getOwnPropertyDescriptor(ed.__proto__, 'value');
      if (set && set.set) { set.set.call(ed, ed.value ? ed.value + '\n\n' + txt : txt); ed.dispatchEvent(new Event('input', { bubbles: true })); }
      else ed.value = ed.value ? ed.value + '\n\n' + txt : txt;
    } else {
      ed.focus();
      document.execCommand('insertText', false, (ed.textContent ? '\n\n' : '') + txt);
    }
    return 'editor';
  }

  function GMcopy(t) {
    navigator.clipboard.writeText(t);
  }
  function openLLM(kind, txt) {
    GMcopy(txt); // le prompt est toujours copié, quelle que soit la destination
    const q = encodeURIComponent(txt);
    const url = kind === 'chatgpt' ? 'https://chatgpt.com/?q=' + q : 'https://claude.ai/new?q=' + q;
    window.open(url, '_blank', 'noopener');
  }

  // ── CSS (aligné Édition Luxe) ──────────────────────────────────────────────
  const CSS = `
  #mgp-btn{position:fixed;bottom:88px;right:20px;z-index:999999;width:52px;height:52px;border-radius:50%;
    background:linear-gradient(135deg,#9945ff,#14f195);border:none;cursor:pointer;font-size:22px;
    box-shadow:0 6px 24px rgba(153,69,255,.45);display:flex;align-items:center;justify-content:center;
    transition:transform .15s}
  #mgp-btn:hover{transform:scale(1.1)}
  #mgp-panel{position:fixed;bottom:148px;right:20px;z-index:999999;width:400px;max-width:94vw;height:72vh;
    background:#12131c;border:1px solid #31343f;border-radius:14px;display:none;flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,.6);font:13.5px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#eef0f6;overflow:hidden}
  #mgp-panel.open{display:flex}
  #mgp-head{padding:11px 14px;border-bottom:1px solid #23252f;display:flex;justify-content:space-between;align-items:center}
  #mgp-head b{font-size:12.5px;letter-spacing:.4px}
  #mgp-head .c{font-size:11px;color:#6b7080;margin-left:8px;font-variant-numeric:tabular-nums}
  #mgp-close{background:none;border:none;color:#6b7080;font-size:18px;cursor:pointer}
  #mgp-close:hover{color:#eef0f6}
  #mgp-lang{background:none;border:1px solid #23252f;color:#a8adbd;font-size:10px;border-radius:99px;padding:3px 9px;cursor:pointer;font-weight:600}
  #mgp-lang:hover{border-color:#31343f;color:#eef0f6}
  #mgp-head>span{display:flex;align-items:center;gap:8px}
  #mgp-qrow{display:flex;align-items:center;gap:9px;margin:10px 14px 0;padding:9px 12px;background:#14151c;border:1px solid #23252f;border-radius:10px}
  #mgp-qrow:focus-within{border-color:#9945ff}
  #mgp-qrow .l{color:#6b7080;font-size:15px}
  #mgp-q{flex:1;background:none;border:none;outline:none;color:#eef0f6;font:inherit;font-size:14px}
  #mgp-q::placeholder{color:#6b7080}
  #mgp-tabs{display:flex;gap:4px;align-items:center;padding:10px 14px 9px;flex-wrap:wrap}
  .mgp-tab{padding:4px 9px;border-radius:99px;background:none;border:none;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;color:#a8adbd}
  .mgp-tab:hover{color:#eef0f6;background:#191b24}
  .mgp-tab.on{background:#191b24;color:#eef0f6}
  #mgp-selrow{display:flex;gap:8px;align-items:center;padding:0 14px 8px}
  #mgp-selrow:empty{display:none}
  #mgp-seln{font-size:11px;color:#14f195;font-variant-numeric:tabular-nums}
  #mgp-compose{border:none;background:linear-gradient(120deg,#9945ff,#14f195);color:#0b0c10;cursor:pointer;font:inherit;font-size:11px;font-weight:700;padding:4px 10px;border-radius:99px}
  #mgp-list{flex:1;overflow-y:auto;padding:0 8px 6px}
  #mgp-void{padding:34px 20px;text-align:center;color:#6b7080;font-size:12.5px}
  .mgp-item{display:flex;gap:11px;align-items:center;padding:8px 10px;border-radius:10px;cursor:pointer;position:relative}
  .mgp-item:hover,.mgp-item.on{background:#191b24}
  .mgp-item.on::before{content:'';position:absolute;left:0;top:9px;bottom:9px;width:2.5px;border-radius:2px;background:linear-gradient(120deg,#9945ff,#14f195)}
  .mgp-item.copied{background:rgba(20,241,149,.12)}
  .mgp-item .ico{font-size:15px;width:22px;text-align:center;flex:none}
  .mgp-item .mid{flex:1;min-width:0}
  .mgp-item b{font-size:13px;font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mgp-item .d{font-size:11.5px;color:#6b7080;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .mgp-item .fb{border:none;background:none;color:#6b7080;cursor:pointer;font-size:13px;padding:2px 3px;border-radius:6px;opacity:0;flex:none}
  .mgp-item:hover .fb,.mgp-item.on .fb{opacity:1}
  .mgp-item .fb:hover{color:#f5c518}
  .mgp-item .fv{color:#f5c518;font-size:11px;flex:none}
  .mgp-item.selc{background:rgba(153,69,255,.10)}
  .mgp-item.selc b{color:#c9a2ff}
  .mgp-foot{padding:8px 14px;border-top:1px solid #23252f;font-size:11px;color:#a8adbd;display:flex;gap:10px;align-items:center}
  .mgp-foot .n{margin-left:auto;color:#6b7080;font-variant-numeric:tabular-nums}
  #mgp-modal{position:fixed;inset:0;background:rgba(5,6,10,.55);display:none;align-items:center;justify-content:center;z-index:1000000}
  #mgp-modal.open{display:flex}
  #mgp-mbox{width:min(420px,92vw);background:#14151c;border:1px solid #31343f;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:11px;box-shadow:0 24px 70px rgba(0,0,0,.5);font:inherit;color:#eef0f6}
  #mgp-mbox h3{font-size:14px;margin:0}
  #mgp-mbox label{display:flex;flex-direction:column;gap:5px;font-size:11.5px;color:#a8adbd;font-weight:600}
  #mgp-mbox input,#mgp-mbox textarea{background:#191b24;border:1px solid #23252f;border-radius:8px;color:#eef0f6;font:inherit;padding:8px 10px;outline:none;resize:vertical}
  #mgp-mbox input:focus,#mgp-mbox textarea:focus{border-color:#9945ff}
  #mgp-erow{display:flex;gap:8px;align-items:center}
  #mgp-erow button{border:1px solid #23252f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px}
  #mgp-erow button:hover{border-color:#31343f;color:#eef0f6}
  #mgp-e-save{background:linear-gradient(120deg,#9945ff,#14f195);border:none;color:#0b0c10}
  #mgp-list::-webkit-scrollbar{width:8px}
  #mgp-list::-webkit-scrollbar-thumb{background:#31343f;border-radius:4px}
  `;

  // ── UI ─────────────────────────────────────────────────────────────────────
  let tab = 'all', q = '', idx = 0, results = [], sel = [];

  const btn = document.createElement('button');
  btn.id = 'mgp-btn';
  btn.title = T().btnTitle;
  btn.innerHTML = '⚡';

  const panel = document.createElement('div');
  panel.id = 'mgp-panel';
  panel.innerHTML =
    '<div id="mgp-head"><span><b>⚡ MEGA PACK</b><span class="c" id="mgp-counts"></span></span>' +
      '<span><button id="mgp-newp" title="' + T().newpTitle + '">' + T().newp + '</button><button id="mgp-lang">' + LANG.toUpperCase() + '</button><button id="mgp-close">✕</button></span></div>' +
    '<div id="mgp-qrow"><span class="l">⌕</span><input id="mgp-q"></div>' +
    '<div id="mgp-tabs"></div>' +
    '<div id="mgp-selrow"></div>' +
    '<div id="mgp-list"></div>' +
    '<div class="mgp-foot"><span>' + T().foot + '</span><span class="n" id="mgp-n"></span></div>' +
    '<div id="mgp-modal"><div id="mgp-mbox">' +
      '<h3>✍️ ' + (LANG === 'fr' ? 'Nouveau prompt' : 'New prompt') + '</h3>' +
      '<label>' + T().mName + '<input id="mgp-e-name" maxlength="60"></label>' +
      '<label>' + T().mPrompt + '<textarea id="mgp-e-txt" rows="7" maxlength="2000"></textarea></label>' +
      '<div id="mgp-erow"><button id="mgp-e-save">' + T().mSave + '</button><button id="mgp-e-del">' + T().mDel + '</button><span style="flex:1"></span><button id="mgp-e-x">' + T().mCancel + '</button></div>' +
    '</div></div>';

  function compute() {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    let pool = ALL();
    if (tab === 'skills') pool = pool.filter(function (it) { return it.k === 'skill'; });
    else if (tab === 'agents') pool = pool.filter(function (it) { return it.k === 'agent'; });
    else if (tab === 'custom') pool = pool.filter(function (it) { return it.k === 'custom'; });
    else if (tab === 'favs') pool = pool.filter(function (it) { return isFav(it.x.name); });
    results = pool.filter(function (it) {
      const hay = (it.x.name + ' ' + lname(it.x) + ' ' + (it.x.category || '') + ' ' + ldesc(it.x)).toLowerCase();
      return terms.every(function (w) { return hay.indexOf(w) !== -1; });
    });
    if (q) results.sort(function (a, b) {
      const pa = lname(a.x).toLowerCase().indexOf(q) === 0 ? 0 : 1;
      const pb = lname(b.x).toLowerCase().indexOf(q) === 0 ? 0 : 1;
      return pa - pb || lname(a.x).localeCompare(lname(b.x));
    });
    idx = Math.min(idx, Math.max(0, results.length - 1));
  }

  function renderTabs() {
    const tb = panel.querySelector('#mgp-tabs');
    const tabs = ['all', 'skills', 'agents', 'custom', 'favs'];
    tb.innerHTML = tabs.map(function (t) {
      return '<button class="mgp-tab' + (tab === t ? ' on' : '') + '" data-t="' + t + '">' + T().tabs[t] + '</button>';
    }).join('');
    tb.querySelectorAll('.mgp-tab').forEach(function (b) {
      b.onclick = function () { tab = b.dataset.t; idx = 0; renderTabs(); render(); };
    });
  }

  function renderSelRow() {
    const row = panel.querySelector('#mgp-selrow');
    if (!sel.length) { row.innerHTML = ''; return; }
    row.innerHTML = '<span id="mgp-seln">' + sel.length + ' ' + T().selected + '</span>' +
      '<button id="mgp-compose">' + T().compose.replace('{n}', sel.length) + '</button>';
    row.querySelector('#mgp-compose').onclick = function () {
      const items = sel.map(function (n) { return ALL().find(function (it) { return it.x.name === n; }); }).filter(Boolean);
      const where = insertText(buildCombo(items));
      flash(row, where === 'editor' ? T().injected : T().copied);
    };
  }

  function render() {
    compute();
    const list = panel.querySelector('#mgp-list');
    const C = cat();
    if (!results.length) {
      if (!C.skills.length && ensureCatalog(render)) return;
      list.innerHTML = '<div id="mgp-void">' + (C.skills.length ? T().noResults : T().empty) + '</div>';
    } else {
      list.innerHTML = results.map(function (it, i) {
        const fav = isFav(it.x.name);
        return '<div class="mgp-item k-' + it.k + (i === idx ? ' on' : '') + (sel.indexOf(it.x.name) !== -1 ? ' selc' : '') + '" data-n="' + it.x.name.replace(/"/g, '&quot;') + '">' +
          '<span class="ico">' + (it.k === 'agent' ? '👤' : it.k === 'custom' ? '✍️' : '🛠') + '</span>' +
          '<span class="mid"><b>' + lname(it.x) + '</b><span class="d">' + ldesc(it.x).slice(0, 90) + '</span></span>' +
          (fav ? '<span class="fv">★</span>' : '') +
          '<button class="fb" title="★">' + (fav ? '★' : '☆') + '</button>' +
        '</div>';
      }).join('');
      list.querySelectorAll('.mgp-item').forEach(function (el, i) {
        el.onclick = function (ev) {
          const it = results[i];
          if (ev.target.classList.contains('fb')) { toggleFav(it.x.name); render(); return; }
          if (ev.metaKey || ev.ctrlKey) {
            const n = it.x.name; const p = sel.indexOf(n);
            if (p >= 0) sel.splice(p, 1); else sel.push(n);
            renderSelRow(); render(); return;
          }
          activate(it, el);
        };
      });
      const on = list.querySelector('.mgp-item.on');
      if (on) on.scrollIntoView({ block: 'nearest' });
    }
    panel.querySelector('#mgp-n').textContent = T().count(results.length);
  }

  function activate(it, el) {
    const p = promptOf(it);
    const where = insertText(p);
    if (el) flash(el, where === 'editor' ? T().injected : T().copied);
  }

  function flash(el, msg) {
    const old = el.innerHTML;
    el.style.borderColor = '#14f195';
    const d = document.createElement('div');
    d.style.cssText = 'font-size:11px;color:#14f195;margin-top:5px;font-weight:600';
    d.textContent = msg;
    el.appendChild(d);
    setTimeout(function () { el.innerHTML = old; el.style.borderColor = ''; }, 1400);
  }

  function renderCounts() {
    const C = cat();
    panel.querySelector('#mgp-counts').textContent = C.skills.length + ' skills · ' + C.agents.length + ' agents';
  }

  // ── Modal ✍️ ───────────────────────────────────────────────────────────────
  let editing = null;
  function openModal(c) {
    editing = c ? c.name : null;
    panel.querySelector('#mgp-e-name').value = c ? c.name : '';
    panel.querySelector('#mgp-e-txt').value = c ? (c.desc || '') : '';
    panel.querySelector('#mgp-e-del').style.display = c ? '' : 'none';
    panel.querySelector('#mgp-modal').classList.add('open');
    panel.querySelector('#mgp-e-name').focus();
  }
  function closeModal() { panel.querySelector('#mgp-modal').classList.remove('open'); }
  panel.querySelector('#mgp-e-save').onclick = function () {
    const name = panel.querySelector('#mgp-e-name').value.trim();
    const desc = panel.querySelector('#mgp-e-txt').value.trim();
    if (!name || !desc) return;
    const cs = customs();
    const i = cs.findIndex(function (c) { return c.name === name; });
    if (i >= 0) cs[i] = { name: name, desc: desc }; else cs.push({ name: name, desc: desc });
    store.set('customs', cs);
    closeModal(); render();
  };
  panel.querySelector('#mgp-e-del').onclick = function () {
    if (!editing) return;
    store.set('customs', customs().filter(function (c) { return c.name !== editing; }));
    closeModal(); render();
  };
  panel.querySelector('#mgp-e-x').onclick = closeModal;
  panel.querySelector('#mgp-modal').addEventListener('click', function (e) { if (e.target.id === 'mgp-modal') closeModal(); });
  panel.querySelector('#mgp-e-txt').addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') panel.querySelector('#mgp-e-save').onclick();
  });

  // ── Ouverture / fermeture + clavier (aligné Luxe) ──────────────────────────
  function openPanel() { panel.classList.add('open'); renderCounts(); renderTabs(); renderSelRow(); render(); panel.querySelector('#mgp-q').focus(); }
  function closePanel() { panel.classList.remove('open'); }
  btn.onclick = function () { panel.classList.contains('open') ? closePanel() : openPanel(); };
  panel.querySelector('#mgp-close').onclick = closePanel;
  panel.querySelector('#mgp-newp').onclick = function () { openModal(null); };
  panel.querySelector('#mgp-q').oninput = function (e) { q = e.target.value; idx = 0; render(); };

  document.addEventListener('keydown', function (e) {
    if (!panel.classList.contains('open')) {
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === ',') { return; }
    const modalOpen = panel.querySelector('#mgp-modal').classList.contains('open');
    if (modalOpen) { if (e.key === 'Escape') closeModal(); return; }
    const inModal = e.target.closest && e.target.closest('#mgp-mbox');
    if (inModal) return;
    if (e.key === 'Escape') { closePanel(); e.preventDefault(); return; }
    if (e.target !== panel.querySelector('#mgp-q')) return; // le clavier global reste dispo ailleurs
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
      if (e.metaKey || e.ctrlKey) openLLM('claude', promptOf(it));
      else if (e.shiftKey) openLLM('chatgpt', promptOf(it));
      else if (e.altKey && sel.length) {
        const items = sel.map(function (n) { return ALL().find(function (x) { return x.x.name === n; }); }).filter(Boolean);
        insertText(buildCombo(items));
      }
      else activate(it);
    }
  });

  // Raccourci global d'ouverture : Ctrl+Shift+K
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      btn.click();
    }
  });

  // ── Bascule FR/EN (persistée) ──────────────────────────────────────────────
  function applyLang() {
    btn.title = T().btnTitle;
    panel.querySelector('#mgp-q').placeholder = T().search;
    panel.querySelector('#mgp-lang').textContent = LANG.toUpperCase();
    panel.querySelector('.mgp-foot span').textContent = T().foot;
    panel.querySelector('#mgp-newp').textContent = T().newp;
    panel.querySelector('#mgp-newp').title = T().newpTitle;
    if (panel.classList.contains('open')) { renderCounts(); renderTabs(); render(); }
  }
  panel.querySelector('#mgp-lang').onclick = function () {
    LANG = LANG === 'fr' ? 'en' : 'fr';
    store.set('lang', LANG);
    applyLang();
  };

  // ── Injection CSS + DOM ────────────────────────────────────────────────────
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  applyLang();
})();
