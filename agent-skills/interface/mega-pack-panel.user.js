// ==UserScript==
// @name         MEGA PACK Panel — Skills & Agents pour tout LLM
// @namespace    mega-pack
// @version      1.3.0
// @description  Panneau flottant bilingue FR/EN : 131 skills + 190 agents injectables dans n'importe quelle conversation LLM (Claude, ChatGPT, Gemini, Perplexity, Mistral, OpenCode Web…)
// @author       MEGA PACK
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // Garde anti-doublon : si le bouton existe déjà (ou qu'une instance tourne),
  // le script a déjà été injecté — Tampermonkey + <script>/bookmarklet sur la
  // même page, favori cliqué 2 fois, 2 userscripts MEGA PACK installés ensemble…
  // NB : @noframes ci-dessus empêche en plus l'injection dans les iframes
  // (artifacts Claude, canvas ChatGPT…) — 2e cause classique de boutons en double.
  if (document.getElementById('mgp-btn') || window.__MEGA_PACK_ACTIVE__) return;
  window.__MEGA_PACK_ACTIVE__ = true;

  // ── Catalogue (lu au moment du rendu, pas à l'injection) ──────────────────
  // Pour le catalogue complet, charger interface/catalog-full.js AVANT ce script
  // ou définir window.MEGA_CATALOG. Une const globale n'existe pas sur window.
  function cat() { return window.MEGA_CATALOG || { skills: [], agents: [] }; }

  // ── Langue FR/EN (persistée, partagée avec le launcher via localStorage) ──
  let LANG = 'fr';
  try { LANG = localStorage.getItem('mgp.lang') || 'fr'; } catch (e) {}
  const I18N = {
    fr: {
      btnTitle: 'MEGA PACK — Skills & Agents (131 skills · 190 agents)',
      search: 'Rechercher skill / agent…',
      foot: 'Clic = injecte le prompt dans la conversation · sinon copie dans le presse-papiers',
      noResults: 'Aucun résultat',
      empty: 'Catalogue vide — place catalog-full.js à côté du userscript ou installe le catalogue via <code>window.MEGA_CATALOG</code>.',
      injected: '✓ Injecté dans la conversation',
      copied: '✓ Copié (pas de zone de texte trouvée)',
      pSkill: function (x) { return 'Utilise le skill "' + x.name + '" (' + x.path + '). Charge et suis son SKILL.md strictement. ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Réponds toujours en français.'; },
      pAgent: function (x) { return 'Agis désormais comme l\'agent "' + x.name + '" (' + x.path + '). ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Adopte ce persona pour toute la conversation et réponds toujours en français.'; },
    },
    en: {
      btnTitle: 'MEGA PACK — Skills & Agents (131 skills · 190 agents)',
      search: 'Search skill / agent…',
      foot: 'Click = inject the prompt into the conversation · otherwise copies to the clipboard',
      noResults: 'No results',
      empty: 'Empty catalog — place catalog-full.js next to the userscript or install the catalog via <code>window.MEGA_CATALOG</code>.',
      injected: '✓ Injected into the conversation',
      copied: '✓ Copied (no text box found)',
      pSkill: function (x) { return 'Use the skill "' + x.name + '" (' + x.path + '). Load and strictly follow its SKILL.md. ' + (x.desc || '').slice(0, 200); },
      pAgent: function (x) { return 'From now on, act as the agent "' + x.name + '" (' + x.path + '). ' + (x.desc || '').slice(0, 200) + ' Adopt this persona for the whole conversation.'; },
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

  const CSS = `
  #mgp-btn{position:fixed;bottom:88px;right:20px;z-index:999999;width:52px;height:52px;border-radius:50%;
    background:linear-gradient(135deg,#7c6cff,#5b8cff);border:none;cursor:pointer;font-size:22px;
    box-shadow:0 6px 24px rgba(124,108,255,.45);display:flex;align-items:center;justify-content:center;
    transition:transform .15s}
  #mgp-btn:hover{transform:scale(1.1)}
  #mgp-panel{position:fixed;bottom:148px;right:20px;z-index:999999;width:380px;max-width:94vw;height:70vh;
    background:#11151f;border:1px solid #252d40;border-radius:14px;display:none;flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,.6);font:13px -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e8ecf4;overflow:hidden}
  #mgp-panel.open{display:flex}
  #mgp-head{padding:12px 14px;border-bottom:1px solid #252d40;display:flex;justify-content:space-between;align-items:center;background:#161b28}
  #mgp-head b{font-size:14px}
  #mgp-close{background:none;border:none;color:#8b94a8;font-size:18px;cursor:pointer}
  #mgp-lang{background:none;border:1px solid #252d40;color:#8b94a8;font-size:10px;border-radius:99px;padding:3px 9px;cursor:pointer;font-weight:600}
  #mgp-lang:hover{border-color:#7c6cff;color:#e8ecf4}
  #mgp-head span{display:flex;align-items:center;gap:8px}
  #mgp-q{width:100%;padding:10px 12px;background:#161b28;border:1px solid #252d40;border-radius:8px;color:#e8ecf4;outline:none;font-size:13px;box-sizing:border-box}
  #mgp-q:focus{border-color:#7c6cff}
  #mgp-tabs{display:flex;gap:6px;padding:10px 12px 0}
  .mgp-tab{padding:6px 14px;border-radius:99px;background:#161b28;border:1px solid #252d40;cursor:pointer;font-size:12px;color:#8b94a8}
  .mgp-tab.on{background:#7c6cff;color:#fff;border-color:#7c6cff;font-weight:600}
  #mgp-list{flex:1;overflow-y:auto;padding:12px}
  .mgp-item{background:#161b28;border:1px solid #252d40;border-radius:10px;padding:10px 12px;margin-bottom:8px;cursor:pointer;transition:border-color .12s}
  .mgp-item:hover{border-color:#7c6cff}
  .mgp-item b{font-size:13px;display:block;margin-bottom:3px}
  .mgp-item span{font-size:11px;color:#8b94a8;line-height:1.35;display:block}
  .mgp-item .cat{font-size:9px;background:#1c2233;padding:2px 7px;border-radius:99px;color:#8b94a8;display:inline-block;margin-bottom:5px}
  .mgp-foot{padding:10px 14px;border-top:1px solid #252d40;font-size:11px;color:#8b94a8;text-align:center}
  #mgp-list::-webkit-scrollbar{width:8px}
  #mgp-list::-webkit-scrollbar-thumb{background:#252d40;border-radius:4px}
  `;

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

  function promptSkill(x) { return T().pSkill(x); }
  function promptAgent(x) { return T().pAgent(x); }

  // ── UI ─────────────────────────────────────────────────────────────────────
  let tab = 'skills', q = '';

  const btn = document.createElement('button');
  btn.id = 'mgp-btn';
  btn.title = 'MEGA PACK — Skills & Agents (131 skills · 190 agents)';
  btn.innerHTML = '⚡';

  const panel = document.createElement('div');
  panel.id = 'mgp-panel';
  panel.innerHTML =
    '<div id="mgp-head"><b>⚡ MEGA PACK</b><span><button id="mgp-lang">FR</button><button id="mgp-close">✕</button></span></div>' +
    '<div style="padding:10px 12px 0"><input id="mgp-q" placeholder="' + T().search + '"></div>' +
    '<div id="mgp-tabs">' +
      '<div class="mgp-tab" data-t="skills">🛠 Skills</div>' +
      '<div class="mgp-tab" data-t="agents">👥 Agents</div>' +
    '</div>' +
    '<div id="mgp-list"></div>' +
    '<div class="mgp-foot">' + T().foot + '</div>';

  function render() {
    const list = panel.querySelector('#mgp-list');
    const C = cat();
    const pool = tab === 'skills' ? C.skills : C.agents;
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const items = pool.filter(function (x) {
      const hay = (x.name + ' ' + (x.desc || '') + ' ' + x.category + ' ' + (x.name_fr || '') + ' ' + (x.desc_fr || '')).toLowerCase();
      return terms.every(function (w) { return hay.indexOf(w) !== -1; });
    }).slice(0, 80);
    if (!items.length) {
      if (!pool.length && ensureCatalog(render)) return;
      list.innerHTML = '<div style="text-align:center;color:#8b94a8;padding:40px 10px">' +
        (C.skills.length ? T().noResults : T().empty) + '</div>';
      return;
    }
    list.innerHTML = items.map(function (x) {
      var nm = (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name;
      var ds = (LANG === 'fr' && x.desc_fr) ? x.desc_fr : (x.desc || '');
      return '<div class="mgp-item" data-n="' + x.name.replace(/"/g, '&quot;') + '">' +
        '<span class="cat">' + ((LANG === 'fr' && x.name_fr) ? '🇫🇷 ' : '') + x.category + '</span>' +
        '<b>' + (tab === 'skills' ? '🛠 ' : '👤 ') + nm + '</b>' +
        '<span>' + ds.slice(0, 140) + '</span></div>';
    }).join('');
    list.querySelectorAll('.mgp-item').forEach(function (el) {
      el.onclick = function () {
        const name = el.dataset.n;
        const x = pool.find(function (p) { return p.name === name; });
        if (!x) return;
        const p = tab === 'skills' ? promptSkill(x) : promptAgent(x);
        const where = insertText(p);
        flash(el, where === 'editor' ? T().injected : T().copied);
      };
    });
  }

  function flash(el, msg) {
    const old = el.innerHTML;
    el.style.borderColor = '#00d4aa';
    const d = document.createElement('div');
    d.style.cssText = 'font-size:11px;color:#00d4aa;margin-top:5px;font-weight:600';
    d.textContent = msg;
    el.appendChild(d);
    setTimeout(function () { el.innerHTML = old; el.style.borderColor = ''; }, 1400);
  }

  btn.onclick = function () { panel.classList.toggle('open'); if (panel.classList.contains('open')) render(); };
  panel.querySelector('#mgp-close').onclick = function () { panel.classList.remove('open'); };
  panel.querySelector('#mgp-q').oninput = function (e) { q = e.target.value; render(); };
  panel.querySelectorAll('.mgp-tab').forEach(function (t) {
    t.onclick = function () {
      tab = t.dataset.t;
      panel.querySelectorAll('.mgp-tab').forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      render();
    };
  });

  // Bascule FR/EN (persistée)
  function applyLang() {
    btn.title = T().btnTitle;
    panel.querySelector('#mgp-q').placeholder = T().search;
    panel.querySelector('#mgp-lang').textContent = LANG.toUpperCase();
    panel.querySelector('.mgp-foot').textContent = T().foot;
    if (panel.classList.contains('open')) render();
  }
  panel.querySelector('#mgp-lang').onclick = function () {
    LANG = LANG === 'fr' ? 'en' : 'fr';
    try { localStorage.setItem('mgp.lang', LANG); } catch (e) {}
    applyLang();
  };

  // Injection CSS + DOM
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  document.body.appendChild(btn);
  document.body.appendChild(panel);
  applyLang();

  // Raccourci clavier : Ctrl+Shift+K
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      btn.click();
    }
  });
})();
