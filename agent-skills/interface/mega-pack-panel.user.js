// ==UserScript==
// @name         MEGA PACK Panel Luxe — Skills, Agents & Équipes pour tout LLM
// @namespace    mega-pack
// @version      2.4.1
// @description  Panneau flottant Édition Luxe dans une fenêtre macOS : 131 skills + 190 agents + 🕸 équipes + ✍️ prompts perso + ★ favoris, recherche instantanée, tooltip expert, clic droit multi-LLM, sélecteur de LLM par défaut, composeur ⌘-clic — injectable dans n'importe quelle conversation LLM (Claude, ChatGPT, Gemini, Perplexity, Mistral, OpenCode Web…)
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
      tabs: { all: 'Tout', skills: 'Skills', agents: 'Agents', teams: '🕸 Équipes', custom: '✍️ Perso', favs: '★ Favoris' },
      foot: 'Clic = injecter · ⏎ injecter · ⌘⏎ défaut · ⇧⏎ ChatGPT · ⌘-clic sélectionner',
      noResults: 'Aucun résultat — essaie un autre mot',
      empty: 'Catalogue vide — place catalog-full.js à côté du userscript.',
      injected: '✓ Injecté dans la conversation',
      copied: '✓ Copié',
      selected: 'sél.',
      compose: '✚ Composer ({n})',
      newp: '＋', newpTitle: 'Nouveau prompt ✍️',
      mName: 'Nom', mPrompt: 'Prompt', mSave: 'Enregistrer', mDel: 'Supprimer', mCancel: 'Annuler',
      count: (n) => n + ' résultat' + (n > 1 ? 's' : ''),
      llm: 'LLM',
      settings: '⚙ Réglages', settingsTitle: 'Réglages — LLM par défaut et destinations du clic droit',
      setLlm: 'LLM par défaut (⌘⏎)', setSend: 'Destinations du clic droit (dans l\'ordre)',
      setSendHint: 'Coche une ou plusieurs — l\'ordre des clics = priorité du menu',
      setDone: 'Enregistrer', setClose: 'Fermer',
      saved: '✓ Réglages enregistrés',
      sendTo: 'Envoyer à',
      copyPrompt: '⧉ Copier le prompt',
      favAdd: '★ Ajouter aux favoris', favDel: '☆ Retirer des favoris',
      tipSkill: 'SKILL — procédure d\'expertise. Clic : injecte.',
      tipAgent: 'AGENT — persona expert. Clic : injecte.',
      tipCustom: 'PROMPT PERSO — ton texte tel quel. Clic : injecte.',
      tipTeam: 'ÉQUIPE — orchestrateur + agents + workflow. Clic : injecte le protocole.',
      tipCat: 'Catégorie',
      agentsN: 'agents',
      orch: 'Orchestrateur',
      pSkill: function (x) { return 'Utilise le skill "' + x.name + '" (' + x.path + '). Charge et suis son SKILL.md strictement. ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Réponds toujours en français.'; },
      pAgent: function (x) { return 'Agis désormais comme l\'agent "' + x.name + '" (' + x.path + '). ' + ((x.desc_fr || x.desc || '')).slice(0, 200) + ' Adopte ce persona pour toute la conversation et réponds toujours en français.'; },
      pCustom: function (x) { return x.name + '\n\n' + (x.desc || ''); },
      pTeam: function (x) {
        const t = x._t;
        const ag = (t.agents || []).map(function (a) { return '### ' + a.name + (a.role ? ' — ' + a.role : '') + '\n' + (a.desc || '') + '\nPrompt système : ' + (a.system || ''); }).join('\n');
        const wf = (t.workflow || []).map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n');
        return '# Équipe multi-agents "' + (t.team || x.name) + '"\n' + (t.desc || '') +
          '\n\n## 👔 Super-orchestrateur — ' + ((t.orchestrator || {}).name || '') + '\n\n' + ((t.orchestrator || {}).system || '') +
          '\n\n## 👥 Agents\n' + ag + '\n\n## 🔁 Workflow\n' + wf +
          '\n\n---\nJoue le super-orchestrateur : distribue les tâches aux agents, consolide leurs livrables, arbitre les conflits et garantis la qualité du rapport final.\n';
      },
    },
    en: {
      btnTitle: 'MEGA PACK — Skills & Agents',
      search: 'Search a skill, an agent, a prompt…',
      tabs: { all: 'All', skills: 'Skills', agents: 'Agents', teams: '🕸 Teams', custom: '✍️ Custom', favs: '★ Favorites' },
      foot: 'Click = inject · ⏎ inject · ⌘⏎ default · ⇧⏎ ChatGPT · ⌘-click select',
      noResults: 'No results',
      empty: 'Empty catalog — place catalog-full.js next to the userscript.',
      injected: '✓ Injected into the conversation',
      copied: '✓ Copied',
      selected: 'sel.',
      compose: '✚ Compose ({n})',
      newp: '＋', newpTitle: 'New prompt ✍️',
      mName: 'Name', mPrompt: 'Prompt', mSave: 'Save', mDel: 'Delete', mCancel: 'Cancel',
      count: (n) => n + ' result' + (n > 1 ? 's' : ''),
      llm: 'LLM',
      settings: '⚙ Settings', settingsTitle: 'Settings — default LLM and right-click destinations',
      setLlm: 'Default LLM (⌘⏎)', setSend: 'Right-click destinations (in order)',
      setSendHint: 'Check one or more — click order = menu priority',
      setDone: 'Save', setClose: 'Close',
      saved: '✓ Settings saved',
      sendTo: 'Send to',
      copyPrompt: '⧉ Copy prompt',
      favAdd: '★ Add to favorites', favDel: '☆ Remove from favorites',
      tipSkill: 'SKILL — expertise procedure. Click: inject.',
      tipAgent: 'AGENT — expert persona. Click: inject.',
      tipCustom: 'CUSTOM PROMPT — your text as-is. Click: inject.',
      tipTeam: 'TEAM — orchestrator + agents + workflow. Click: inject the protocol.',
      tipCat: 'Category',
      agentsN: 'agents',
      orch: 'Orchestrator',
      pSkill: function (x) { return 'Use the skill "' + x.name + '" (' + x.path + '). Load and strictly follow its SKILL.md. ' + (x.desc || '').slice(0, 200); },
      pAgent: function (x) { return 'From now on, act as the agent "' + x.name + '" (' + x.path + '). ' + (x.desc || '').slice(0, 200) + ' Adopt this persona for the whole conversation.'; },
      pCustom: function (x) { return x.name + '\n\n' + (x.desc || ''); },
      pTeam: function (x) {
        const t = x._t;
        const ag = (t.agents || []).map(function (a) { return '### ' + a.name + (a.role ? ' — ' + a.role : '') + '\n' + (a.desc || '') + '\nSystem prompt: ' + (a.system || ''); }).join('\n');
        const wf = (t.workflow || []).map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n');
        return '# Multi-agent team "' + (t.team || x.name) + '"\n' + (t.desc || '') +
          '\n\n## 👔 Super-orchestrator — ' + ((t.orchestrator || {}).name || '') + '\n\n' + ((t.orchestrator || {}).system || '') +
          '\n\n## 👥 Agents\n' + ag + '\n\n## 🔁 Workflow\n' + wf +
          '\n\n---\nPlay the super-orchestrator: distribute tasks to agents, consolidate their deliverables, arbitrate conflicts, own the final report.\n';
      },
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
  function teams() { return store.get('teams', []); }
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
      teams().map(function (t) { return { x: { name: t.team || t.name, desc: t.desc, _t: t }, k: 'team' }; }),
      customs().map(function (x) { return { x: x, k: 'custom' }; })
    );
  }
  function lname(x) { return (LANG === 'fr' && x.name_fr) ? x.name_fr : x.name; }
  function ldesc(x) { return (LANG === 'fr' && x.desc_fr) ? x.desc_fr : (x.desc || ''); }
  function promptOf(it) {
    if (it.k === 'custom') return T().pCustom(it.x);
    if (it.k === 'team') return T().pTeam(it.x);
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

  // ── LLM par défaut (sélecteur, persisté) + destinations ───────────────────
  const LLMS = ['claude', 'chatgpt', 'perplexity', 'copilot', 'deepseek', 'zai', 'kimi', 'mammouth'];
  const LLM_LABEL = { claude: 'Claude', chatgpt: 'ChatGPT', perplexity: 'Perplexity', copilot: 'Copilot', deepseek: 'DeepSeek', zai: 'Z.ai', kimi: 'Kimi', mammouth: 'Mammouth' };
  function defaultLLM() { return store.get('defaultLLM', 'claude'); }

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
    if (!ed) { copy(txt); return 'clipboard'; }
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

  function copy(t) { navigator.clipboard.writeText(t).catch(function () {}); }
  const LLM_URLS = {
    claude: 'https://claude.ai/new?q=', chatgpt: 'https://chatgpt.com/?q=',
    perplexity: 'https://www.perplexity.ai/search?q=', copilot: 'https://copilot.microsoft.com/?q=',
    deepseek: 'https://chat.deepseek.com/?q=', zai: 'https://chat.z.ai/?q=', kimi: 'https://www.kimi.com/?q=', mammouth: 'https://mammouth.ai/',
  };
  function openLLM(kind, txt) {
    copy(txt); // le prompt est toujours copié, quelle que soit la destination
    const q = encodeURIComponent(txt);
    window.open((LLM_URLS[kind] || LLM_URLS.claude) + q, '_blank', 'noopener');
  }

  // ── CSS (fenêtre macOS + Édition Luxe) ────────────────────────────────────
  const CSS = `
  #mgp-btn{position:fixed;bottom:88px;right:20px;z-index:999999;width:52px;height:52px;border-radius:50%;
    background:linear-gradient(135deg,#9945ff,#14f195);border:none;cursor:pointer;font-size:22px;
    box-shadow:0 6px 24px rgba(153,69,255,.45);display:flex;align-items:center;justify-content:center;
    transition:transform .15s}
  #mgp-btn:hover{transform:scale(1.1)}
  #mgp-panel{position:fixed;bottom:148px;right:20px;z-index:999999;width:420px;max-width:94vw;height:74vh;
    background:#12131c;border:1px solid #31343f;border-radius:12px;display:none;flex-direction:column;
    box-shadow:0 24px 70px rgba(0,0,0,.6);font:13.5px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#eef0f6;overflow:hidden}
  #mgp-panel.open{display:flex}
  #mgp-panel.min{height:38px !important}
  #mgp-panel.min #mgp-head,#mgp-panel.min #mgp-qrow,#mgp-panel.min #mgp-tabs,#mgp-panel.min #mgp-selrow,
  #mgp-panel.min #mgp-list,#mgp-panel.min #mgp-foot,#mgp-panel.min #mgp-rsz{display:none !important}
  #mgp-rsz{position:absolute;top:0;left:0;width:16px;height:16px;cursor:nwse-resize;z-index:5}
  #mgp-rsz::after{content:'';position:absolute;bottom:3px;left:3px;width:8px;height:8px;
    border-left:2px solid #3a3e4c;border-bottom:2px solid #3a3e4c;border-radius:2px}
  #mgp-rsz:hover::after{border-color:#9945ff}
  /* barre titre macOS : 3 feux + titre + boutons */
  #mgp-macbar{height:38px;flex:none;background:linear-gradient(#262833,#1d1f28);border-bottom:1px solid #101018;
    display:flex;align-items:center;gap:8px;padding:0 12px;user-select:none}
  #mgp-macbar .lights{display:flex;gap:7px;flex:none}
  #mgp-macbar .l{width:12px;height:12px;border-radius:50%;border:none;padding:0;cursor:pointer;
    box-shadow:inset 0 0 0 .5px rgba(0,0,0,.3)}
  #mgp-macbar .l:hover{filter:brightness(1.2)}
  .l-close{background:#ff5f57}.l-min{background:#febc2e}.l-max{background:#28c840}
  #mgp-macbar .ttl{flex:1;text-align:center;font:600 12px/1 -apple-system,sans-serif;color:#9298a9;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #mgp-macbar .lx{display:flex;gap:6px;flex:none}
  #mgp-macbar .lx button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;
    font:600 10.5px/1 -apple-system,sans-serif;padding:4px 9px;border-radius:99px}
  #mgp-macbar .lx button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-set{font-size:13px;line-height:1}
  #mgp-setdlg{display:none;flex-direction:column;gap:10px}
  #mgp-setdlg.open{display:flex}
  #mgp-setdlg .sc{display:flex;flex-direction:column;gap:6px}
  #mgp-setdlg .sc b{font-size:11.5px;color:#a8adbd}
  #mgp-setdlg .hint{font-size:10.5px;color:#6b7080;font-weight:400}
  #mgp-setdlg .chips{display:flex;flex-wrap:wrap;gap:6px}
  #mgp-setdlg .chips button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:99px}
  #mgp-setdlg .chips button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .chips button.on{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-setdlg .srow{display:flex;gap:8px;justify-content:flex-end}
  #mgp-setdlg .srow button{border:1px solid #23252f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px}
  #mgp-setdlg .srow button.prim{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-setdlg .srow button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-head{padding:9px 14px;border-bottom:1px solid #23252f;display:flex;justify-content:space-between;align-items:center}
  #mgp-head b{font-size:12.5px;letter-spacing:.4px}
  #mgp-head .c{font-size:11px;color:#6b7080;margin-left:8px;font-variant-numeric:tabular-nums}
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
  #mgp-list{flex:1;overflow-y:auto;padding:0 8px 6px;position:relative}
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
  /* tooltip expert */
  #mgp-tip{position:fixed;z-index:1000001;max-width:280px;background:#14151c;border:1px solid #31343f;border-radius:12px;
    padding:10px 12px;box-shadow:0 18px 50px rgba(0,0,0,.5);display:none;pointer-events:none;
    font:12px/1.5 -apple-system,sans-serif;color:#eef0f6}
  #mgp-tip .tk{font-size:9.5px;font-weight:800;letter-spacing:1.2px;color:#14f195}
  #mgp-tip .tk.t-agent{color:#9945ff}
  #mgp-tip .tk.t-custom{color:#f5c518}
  #mgp-tip .tk.t-team{color:#14f195}
  #mgp-tip b.tn{display:block;font-size:12.5px;margin:3px 0}
  #mgp-tip p{margin:2px 0 0;color:#a8adbd}
  #mgp-tip .tc{display:block;margin-top:5px;font-size:10.5px;color:#6b7080}
  /* menu contextuel */
  #mgp-ctx{position:fixed;z-index:1000002;min-width:190px;background:#14151c;border:1px solid #31343f;border-radius:12px;
    padding:5px;box-shadow:0 18px 50px rgba(0,0,0,.55);display:none;font:12.5px/1.4 -apple-system,sans-serif;color:#eef0f6}
  #mgp-ctx .ch{font-size:11.5px;font-weight:700;padding:5px 9px 6px}
  #mgp-ctx .cs{font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#6b7080;padding:4px 9px 2px}
  #mgp-ctx button{display:block;width:100%;border:none;background:none;color:#a8adbd;cursor:pointer;text-align:left;
    font:inherit;font-size:12px;padding:6px 9px;border-radius:8px}
  #mgp-ctx button:hover{background:#191b24;color:#eef0f6}
  /* sélecteur LLM (barre du bas) */
  #mgp-foot{padding:8px 12px;border-top:1px solid #23252f;font-size:11px;color:#a8adbd;display:flex;gap:9px;align-items:center}
  #mgp-foot .n{margin-left:auto;color:#6b7080;font-variant-numeric:tabular-nums}
  #mgp-llmwrap{position:relative;flex:none}
  #mgp-llmbtn{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:600 10.5px/1 -apple-system,sans-serif;
    padding:4px 9px;border-radius:99px;white-space:nowrap}
  #mgp-llmbtn:hover,#mgp-llmmenu.open ~ #mgp-llmbtn{border-color:#14f195;color:#eef0f6}
  #mgp-llmbtn b{color:#14f195}
  #mgp-llmmenu{position:absolute;bottom:calc(100% + 8px);left:0;z-index:1000002;min-width:170px;background:#14151c;
    border:1px solid #31343f;border-radius:12px;padding:5px;box-shadow:0 18px 50px rgba(0,0,0,.55);display:none}
  #mgp-llmmenu.open{display:block}
  #mgp-llmmenu button{display:flex;width:100%;border:none;background:none;color:#a8adbd;cursor:pointer;text-align:left;
    font:inherit;font-size:12px;padding:6px 9px;border-radius:8px}
  #mgp-llmmenu button:hover{background:#191b24;color:#eef0f6}
  #mgp-llmmenu button.on{color:#14f195;font-weight:700}
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
    '<div id="mgp-macbar"><span class="lights">' +
      '<button class="l l-close" title="' + (LANG === 'fr' ? 'Fermer' : 'Close') + '"></button>' +
      '<button class="l l-min" title="' + (LANG === 'fr' ? 'Réduire' : 'Minimize') + '"></button>' +
      '<button class="l l-max" title="' + (LANG === 'fr' ? 'Élargir / réduire' : 'Widen / shrink') + '"></button>' +
      '</span><span class="ttl">⚡ MEGA PACK — Édition Luxe</span>' +
      '<span class="lx"><button id="mgp-set" title="' + T().settingsTitle + '">' + T().settings + '</button>' +
      '<button id="mgp-newp" title="' + T().newpTitle + '">' + T().newp + '</button>' +
      '<button id="mgp-lang">' + LANG.toUpperCase() + '</button></span></div>' +
    '<div id="mgp-head"><b>⚡ MEGA PACK</b><span class="c" id="mgp-counts"></span></div>' +
    '<div id="mgp-qrow"><span class="l">⌕</span><input id="mgp-q"></div>' +
    '<div id="mgp-tabs"></div>' +
    '<div id="mgp-selrow"></div>' +
    '<div id="mgp-list"></div>' +
    '<div id="mgp-foot"><span id="mgp-llmwrap"><button id="mgp-llmbtn"></button><span id="mgp-llmmenu"></span></span>' +
      '<span>' + T().foot + '</span><span class="n" id="mgp-n"></span></div>' +
    '<div id="mgp-setdlg"></div>' +
    '<div id="mgp-modal"><div id="mgp-mbox">' +
      '<h3>✍️ ' + (LANG === 'fr' ? 'Nouveau prompt' : 'New prompt') + '</h3>' +
      '<label>' + T().mName + '<input id="mgp-e-name" maxlength="60"></label>' +
      '<label>' + T().mPrompt + '<textarea id="mgp-e-txt" rows="7" maxlength="2000"></textarea></label>' +
      '<div id="mgp-erow"><button id="mgp-e-save">' + T().mSave + '</button><button id="mgp-e-del">' + T().mDel + '</button><span style="flex:1"></span><button id="mgp-e-x">' + T().mCancel + '</button></div>' +
    '</div></div>';

  const tip = document.createElement('div');
  tip.id = 'mgp-tip';
  const ctx = document.createElement('div');
  ctx.id = 'mgp-ctx';

  // ── Tooltip expert (survol) ────────────────────────────────────────────────
  let tipTimer = null, tipFor = null;
  function tipHtml(it) {
    const x = it.x, k = it.k;
    const kind = k === 'agent' ? T().tipAgent : k === 'custom' ? T().tipCustom : k === 'team' ? T().tipTeam : T().tipSkill;
    const kl = k === 'agent' ? 'AGENT' : k === 'custom' ? 'PERSO' : k === 'team' ? 'ÉQUIPE' : 'SKILL';
    const cat = x.category ? '<span class="tc">' + T().tipCat + ' : ' + String(x.category).replace(/-/g, ' ') + '</span>' : '';
    const teamLine = (k === 'team' && x._t)
      ? '<span class="tc">👥 ' + (x._t.agents || []).map(function (a) { return a.name; }).join(' · ') + '</span>' : '';
    const skills = (k === 'agent' && Array.isArray(x.skills) && x.skills.length)
      ? '<span class="tc">🧩 ' + x.skills.slice(0, 6).join(' · ') + '</span>' : '';
    return '<span class="tk t-' + k + '">' + kl + (isFav(x.name) ? ' ★' : '') + '</span>' +
      '<b class="tn">' + lname(x) + '</b>' +
      '<p>' + ldesc(x).slice(0, 300) + ((ldesc(x) || '').length > 300 ? '…' : '') + '</p>' + cat + skills + teamLine +
      '<span class="tc">' + kind + '</span>';
  }
  function showTip(el, it) {
    tip.innerHTML = tipHtml(it);
    tip.style.display = 'block';
    tipFor = it.x.name;
    const r = el.getBoundingClientRect(), tr = tip.getBoundingClientRect();
    let x = Math.max(8, Math.min(r.left + r.width / 2 - tr.width / 2, window.innerWidth - tr.width - 8));
    let y = r.top - tr.height - 8;
    if (y < 8) y = Math.min(r.bottom + 8, window.innerHeight - tr.height - 8);
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { tip.style.display = 'none'; tipFor = null; }

  // ── Menu contextuel (clic droit) ───────────────────────────────────────────
  function openCtx(el, it, cx, cy) {
    const x = it.x;
    const tgts = sendTargets().length ? sendTargets() : [defaultLLM()]; // repli : LLM par défaut
    const items = [].concat(
      '<span class="ch">' + lname(x) + '</span>',
      '<span class="cs">' + T().sendTo + '</span>',
      tgts.map(function (t) { return '<button data-t="' + t + '">▸ ' + (LLM_LABEL[t] || t) + '</button>'; }).join(''),
      '<span class="cs">···</span>',
      '<button data-a="copy">' + T().copyPrompt + '</button>',
      '<button data-a="fav">' + (isFav(x.name) ? T().favDel : T().favAdd) + '</button>'
    ).join('');
    ctx.innerHTML = items;
    ctx.style.display = 'block';
    const w = ctx.offsetWidth, h = ctx.offsetHeight;
    ctx.style.left = Math.max(6, Math.min(cx, window.innerWidth - w - 6)) + 'px';
    ctx.style.top = Math.max(6, Math.min(cy, window.innerHeight - h - 6)) + 'px';
    ctx.querySelectorAll('button').forEach(function (b) {
      b.onclick = function (ev) {
        ev.stopPropagation();
        hideCtx();
        if (b.dataset.t) openLLM(b.dataset.t, promptOf(it));
        else if (b.dataset.a === 'copy') { copy(promptOf(it)); flash(el, T().copied); }
        else if (b.dataset.a === 'fav') { toggleFav(x.name); render(); }
      };
    });
  }
  function hideCtx() { ctx.style.display = 'none'; }
  document.addEventListener('click', function (e) { if (!ctx.contains(e.target)) hideCtx(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideCtx(); });
  window.addEventListener('blur', function () { hideCtx(); hideTip(); });

  // ── Sélecteur de LLM (barre du bas) ───────────────────────────────────────
  function renderLlmBtn() {
    panel.querySelector('#mgp-llmbtn').innerHTML = '⌨ ' + T().llm + ' <b>' + (LLM_LABEL[defaultLLM()] || defaultLLM()) + '</b> ▾';
  }
  function renderLlmMenu() {
    const m = panel.querySelector('#mgp-llmmenu');
    m.innerHTML = LLMS.map(function (t) {
      return '<button data-t="' + t + '" class="' + (t === defaultLLM() ? 'on' : '') + '">' +
        (t === defaultLLM() ? '✓ ' : '▸ ') + (LLM_LABEL[t] || t) + '</button>';
    }).join('');
    m.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        store.set('defaultLLM', b.dataset.t);
        renderLlmBtn();
        m.classList.remove('open');
      };
    });
  }
  panel.querySelector('#mgp-llmbtn').onclick = function (e) {
    e.stopPropagation();
    const m = panel.querySelector('#mgp-llmmenu');
    if (m.classList.contains('open')) m.classList.remove('open');
    else { renderLlmMenu(); m.classList.add('open'); }
  };
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('#mgp-llmwrap')) panel.querySelector('#mgp-llmmenu').classList.remove('open');
  });

  function compute() {
    // Recherche par tags : découpe sur espaces, / et virgules (« ux/ui » = ux OU ui) ;
    // un item passe s'il correspond à au moins un token — multi-mots sans séparateur = ET.
    const raw = q.toLowerCase();
    const hasSep = /[\s,/]\s*/.test(raw.trim()) && /[\/|,]/.test(raw);
    const terms = hasSep ? raw.split(/[\s,/|]+/).filter(Boolean) : raw.split(/\s+/).filter(Boolean);
    let pool = ALL();
    if (tab === 'skills') pool = pool.filter(function (it) { return it.k === 'skill'; });
    else if (tab === 'agents') pool = pool.filter(function (it) { return it.k === 'agent'; });
    else if (tab === 'teams') pool = pool.filter(function (it) { return it.k === 'team'; });
    else if (tab === 'custom') pool = pool.filter(function (it) { return it.k === 'custom'; });
    else if (tab === 'favs') pool = pool.filter(function (it) { return isFav(it.x.name); });
    results = pool.filter(function (it) {
      const hay = (it.x.name + ' ' + lname(it.x) + ' ' + (it.x.category || '') + ' ' + ldesc(it.x)).toLowerCase();
      return hasSep ? terms.some(function (w) { return hay.indexOf(w) !== -1; })
                    : terms.every(function (w) { return hay.indexOf(w) !== -1; });
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
    const tabs = ['all', 'skills', 'agents', 'teams', 'custom', 'favs'];
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
        const ico = it.k === 'agent' ? '👤' : it.k === 'custom' ? '✍️' : it.k === 'team' ? '🕸' : '🛠';
        return '<div class="mgp-item k-' + it.k + (i === idx ? ' on' : '') + (sel.indexOf(it.x.name) !== -1 ? ' selc' : '') + '" data-i="' + i + '" data-n="' + it.x.name.replace(/"/g, '&quot;') + '">' +
          '<span class="ico">' + ico + '</span>' +
          '<span class="mid"><b>' + lname(it.x) + '</b><span class="d">' + ldesc(it.x).slice(0, 90) + '</span></span>' +
          (fav ? '<span class="fv">★</span>' : '') +
          '<button class="fb" title="★">' + (fav ? '★' : '☆') + '</button>' +
        '</div>';
      }).join('');
      list.querySelectorAll('.mgp-item').forEach(function (el) {
        const i = +el.dataset.i, it = results[i];
        el.onclick = function (ev) {
          if (ev.target.classList.contains('fb')) { toggleFav(it.x.name); render(); return; }
          if (ev.metaKey || ev.ctrlKey) {
            const n = it.x.name; const p = sel.indexOf(n);
            if (p >= 0) sel.splice(p, 1); else sel.push(n);
            renderSelRow(); render(); return;
          }
          activate(it, el);
        };
        el.oncontextmenu = function (ev) {
          ev.preventDefault(); hideTip();
          openCtx(el, it, ev.clientX, ev.clientY);
        };
        el.addEventListener('mouseenter', function () {
          clearTimeout(tipTimer);
          tipTimer = setTimeout(function () { showTip(el, it); }, 350);
        });
        el.addEventListener('mouseleave', function () {
          clearTimeout(tipTimer);
          setTimeout(function () { if (!tip.matches(':hover')) hideTip(); }, 120);
        });
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
  function openPanel() { panel.classList.add('open'); renderCounts(); renderTabs(); renderSelRow(); renderLlmBtn(); render(); panel.querySelector('#mgp-q').focus(); }
  function closePanel() { panel.classList.remove('open'); }
  // 🔴 fermer = ferme le panneau · 🟡 réduire = replie vers la barre titre · 🟢 élargir = cycle de tailles
  panel.querySelector('.l-close').onclick = closePanel;
  panel.querySelector('.l-min').onclick = function () {
    panel.classList.toggle('min');
    store.set('minimized', panel.classList.contains('min'));
  };
  if (store.get('minimized', false)) panel.classList.add('min');
  const SIZES = [[420, '74vh'], [560, '80vh'], [680, '90vh'], [420, '74vh']];
  let sizeIdx = store.get('sizeIdx', 0);
  panel.querySelector('.l-max').onclick = function () {
    sizeIdx = (sizeIdx + 1) % (SIZES.length - 1);
    store.set('sizeIdx', sizeIdx);
    panel.style.width = SIZES[sizeIdx][0] + 'px';
    panel.style.height = SIZES[sizeIdx][1];
  };
  if (sizeIdx > 0) { panel.style.width = SIZES[sizeIdx][0] + 'px'; panel.style.height = SIZES[sizeIdx][1]; }
  // ── Déplacement : glisser la barre titre ──────────────────────────────────
  (function () {
    const bar = panel.querySelector('#mgp-macbar');
    let sx = 0, sy = 0, sl = null, st = null, dragging = false;
    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return; // les boutons restent cliquables
      const r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top; dragging = true;
      panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px';
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      const l = Math.max(4, Math.min(e.clientX - sx + sl, window.innerWidth - 60));
      const t = Math.max(4, Math.min(e.clientY - sy + st, window.innerHeight - 40));
      panel.style.left = l + 'px'; panel.style.top = t + 'px';
    });
    bar.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      const r = panel.getBoundingClientRect();
      store.set('pos', { left: r.left, top: r.top });
    });
    const pos = store.get('pos', null);
    if (pos && pos.left != null) { panel.style.left = pos.left + 'px'; panel.style.top = pos.top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; }
  })();
  // ── Redimensionnement : poignée en haut à gauche (la fenêtre s'ouvre vers le bas-droite) ──
  (function () {
    const h = document.createElement('div'); h.id = 'mgp-rsz'; panel.appendChild(h);
    let sx = 0, sy = 0, sw = 0, sh = 0, rs = false;
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      const r = panel.getBoundingClientRect();
      sx = e.clientX; sy = e.clientY; sw = r.width; sh = r.height; rs = true;
      h.setPointerCapture(e.pointerId);
    });
    h.addEventListener('pointermove', function (e) {
      if (!rs) return;
      const w = Math.max(320, Math.min(sw + (sx - e.clientX), window.innerWidth - 24));
      const ht = Math.max(220, Math.min(sh + (sy - e.clientY), window.innerHeight - 24));
      panel.style.width = w + 'px'; panel.style.height = ht + 'px';
    });
    h.addEventListener('pointerup', function () { if (rs) { rs = false; store.set('customSize', { w: panel.offsetWidth, h: panel.offsetHeight }); } });
    const cs = store.get('customSize', null);
    if (cs) { panel.style.width = cs.w + 'px'; panel.style.height = cs.h + 'px'; }
  })();
  // ── Réglages (⚙) : LLM par défaut + destinations du clic droit ──────────
  const sendTargets = () => store.get('sendTargets', ['claude', 'chatgpt']);
  function renderSetDlg() {
    const dlg = panel.querySelector('#mgp-setdlg');
    const cur = defaultLLM();
    const tgts = sendTargets();
    dlg.innerHTML =
      '<div class="sc"><b>' + T().setLlm + '</b><span class="chips" id="mgp-s-llm">' +
        LLMS.map(function (t) { return '<button data-t="' + t + '" class="' + (t === cur ? 'on' : '') + '">' + (LLM_LABEL[t] || t) + '</button>'; }).join('') +
      '</span></div>' +
      '<div class="sc"><b>' + T().setSend + '</b><span class="hint">' + T().setSendHint + '</span>' +
        '<span class="chips" id="mgp-s-send">' +
        LLMS.map(function (t) { return '<button data-t="' + t + '" class="' + (tgts.indexOf(t) >= 0 ? 'on' : '') + '">' + (LLM_LABEL[t] || t) + '</button>'; }).join('') +
      '</span></div>' +
      '<div class="srow"><button id="mgp-s-close">' + T().setClose + '</button><button id="mgp-s-done" class="prim">' + T().setDone + '</button></div>';
    dlg.querySelectorAll('#mgp-s-llm button').forEach(function (b) {
      b.onclick = function () { store.set('defaultLLM', b.dataset.t); renderLlmBtn(); renderSetDlg(); };
    });
    dlg.querySelectorAll('#mgp-s-send button').forEach(function (b) {
      b.onclick = function () {
        const arr = sendTargets(); const p = arr.indexOf(b.dataset.t);
        if (p >= 0) arr.splice(p, 1); else arr.push(b.dataset.t);
        store.set('sendTargets', arr);
        renderSetDlg();
      };
    });
    dlg.querySelector('#mgp-s-close').onclick = function () { dlg.classList.remove('open'); };
    dlg.querySelector('#mgp-s-done').onclick = function () { dlg.classList.remove('open'); flash(panel.querySelector('#mgp-set'), T().saved); };
  }
  panel.querySelector('#mgp-set').onclick = function () {
    const dlg = panel.querySelector('#mgp-setdlg');
    if (dlg.classList.contains('open')) { dlg.classList.remove('open'); return; }
    renderSetDlg();
    dlg.classList.add('open');
  };
  btn.onclick = function () { panel.classList.contains('open') ? closePanel() : openPanel(); };
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
      if (e.metaKey || e.ctrlKey) openLLM(defaultLLM(), promptOf(it));
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
    panel.querySelector('#mgp-foot span:nth-child(2)').textContent = T().foot;
    if (panel.classList.contains('open')) { renderCounts(); renderTabs(); renderLlmBtn(); render(); }
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
  document.body.appendChild(tip);
  document.body.appendChild(ctx);
  applyLang();
})();
