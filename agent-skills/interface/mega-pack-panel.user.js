// ==UserScript==
// @name         MEGA PACK Panel Luxe — Skills, Agents & Équipes pour tout LLM
// @namespace    mega-pack
// @version      2.8.2
// @description  Panneau flottant Édition Luxe dans une fenêtre macOS : 131 skills + 190 agents + 🕸 équipes + ✍️ prompts perso + ★ favoris, recherche instantanée, tooltip expert, clic droit multi-LLM, sélecteur de LLM par défaut, composeur ⌘-clic — injectable dans n'importe quelle conversation LLM (Claude, ChatGPT, Gemini, Perplexity, Mistral, OpenCode Web…)
// @author       MEGA PACK
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @connect      api.groq.com
// @connect      api.openai.com
// @connect      api.anthropic.com
// @connect      openrouter.ai
// @connect      api.mistral.ai
// @connect      api.cerebras.ai
// @connect      api.cohere.com
// @connect      generativelanguage.googleapis.com
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // ── État + persistance locale (par site) ──────────────────────────────────
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mgp.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mgp.' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('mgp.' + k); } catch (e) {} },
  };
  // 🔑 Clés API : stockées via GM_* (partagées entre TOUS les sites, hors localStorage du site)
  // Fallback localStorage si GM_* indisponible (page sans Tampermonkey, anciens gestionnaires)
  const gm = {
    get(k, d) { try { if (typeof GM_getValue === 'function') { const v = GM_getValue('mgp.' + k); return v === undefined ? d : v; } } catch (e) {} return store.get('gm.' + k, d); },
    set(k, v) { try { if (typeof GM_setValue === 'function') return void GM_setValue('mgp.' + k, v); } catch (e) {} store.set('gm.' + k, v); },
    del(k) { try { if (typeof GM_deleteValue === 'function') return void GM_deleteValue('mgp.' + k); } catch (e) {} store.del('gm.' + k); },
  };

  // ── 🧠 Atelier IA : fournisseurs (comme l'app, Réglages → Intelligence) ──
  const AI_PROVIDERS = [
    { id: 'groq', label: 'Groq (gratuit, ultra-rapide)', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', kind: 'openai' },
    { id: 'openai', label: 'OpenAI (GPT-4o…)', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', kind: 'openai' },
    { id: 'anthropic', label: 'Anthropic (Claude…)', url: 'https://api.anthropic.com/v1/messages', model: 'claude-3-5-haiku-latest', kind: 'anthropic' },
    { id: 'openrouter', label: 'OpenRouter (multi-modèles)', url: 'https://openrouter.ai/api/v1/chat/completions', model: 'anthropic/claude-3.5-haiku', kind: 'openai' },
    { id: 'mistral', label: 'Mistral AI', url: 'https://api.mistral.ai/v1/chat/completions', model: 'mistral-small-latest', kind: 'openai' },
    { id: 'cerebras', label: 'Cerebras (gratuit, rapide)', url: 'https://api.cerebras.ai/v1/chat/completions', model: 'llama-3.3-70b', kind: 'openai' },
    { id: 'gemini', label: 'Google Gemini', url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-1.5-flash', kind: 'openai' },
  ];
  function aiProvider() {
    const id = gm.get('ai.provider', 'groq');
    return AI_PROVIDERS.find(function (p) { return p.id === id; }) || AI_PROVIDERS[0];
  }
  function aiKey() { return String(gm.get('ai.key', '') || '').trim(); }
  function aiModel() { return String(gm.get('ai.model', '') || '').trim() || aiProvider().model; }
  function aiReady() { return !!aiKey(); }
  // Appel LLM unifié (GM_xmlhttpRequest → passe les CORS, nécessaire pour Anthropic)
  function aiGenerate(system, user, cb) {
    const p = aiProvider();
    const key = aiKey();
    if (!key) return cb({ error: 'nokey' });
    if (typeof GM_xmlhttpRequest !== 'function') return cb({ error: "GM_xmlhttpRequest indisponible — mets à jour le script dans Tampermonkey (>= 2.8.0, grants GM_* requis)" });
    const body = p.kind === 'anthropic'
      ? { model: aiModel(), max_tokens: 2048, system: system, messages: [{ role: 'user', content: user }] }
      : { model: aiModel(), max_tokens: 2048, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] };
    const headers = { 'Content-Type': 'application/json' };
    if (p.kind === 'anthropic') { headers['x-api-key'] = key; headers['anthropic-version'] = '2023-06-01'; headers['anthropic-dangerous-direct-browser-access'] = 'true'; }
    else headers['Authorization'] = 'Bearer ' + key;
    GM_xmlhttpRequest({
      method: 'POST', url: p.url, headers: headers, data: JSON.stringify(body), timeout: 60000,
      onload: function (r) {
        try {
          const j = JSON.parse(r.responseText);
          if (r.status >= 400) return cb({ error: (j.error && (j.error.message || j.error.type)) || ('HTTP ' + r.status) });
          const txt = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content)
            || (j.content && j.content[0] && j.content[0].text) || '';
          cb({ text: txt });
        } catch (e) { cb({ error: 'Réponse illisible (HTTP ' + r.status + ')' }); }
      },
      onerror: function () { cb({ error: 'Réseau bloqué — vérifie la connexion' }); },
      ontimeout: function () { cb({ error: 'Délai dépassé (60 s)' }); },
    });
  }
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
      setAi: '🧠 Intelligence — clé API', setAiD: 'Pour le bouton ✨ Générer : l\'IA rédige tes agents, skills et prompts',
      setAiProv: 'Fournisseur', setAiKey: 'Clé API', setAiModel: 'Modèle (option)', setAiSave: 'Enregistrer', setAiDel: 'Effacer',
      setAiOk: '✓ Clé enregistrée — ✨ Générer est actif dans le créateur ✍️', setAiCleared: 'Clé effacée', setAiPlaceholder: 'gsk_… / sk-… (stockée hors du site, partagée entre tes sites)',
      aiBtn: '✨ Générer avec l\'IA', aiBusy: '⏳ Génération…', aiDone: '✓ Généré — relis, ajuste puis enregistre',
      aiErr: '✗ Échec IA', aiNeedKey: 'Ajoute une clé API dans ⚙ Réglages → Intelligence',
      aiSys: 'Tu es un expert senior en création de prompts système pour agents IA et skills (procédures d\'expertise). Rédige en français clair et actionnable. Réponds UNIQUEMENT avec le contenu demandé, sans préambule ni balises markdown de code.',
      aiUser: 'Rédige le prompt (system-prompt complet, 150-350 mots) pour cet expert : « {NAME} ».\nBesoin décrit par l\'utilisateur : {DESC}',
      count: (n) => n + ' résultat' + (n > 1 ? 's' : ''),
      llm: 'LLM',
      settings: '⚙ Réglages', settingsTitle: 'Réglages — comme l\'app macOS',
      setTitle: '⚡ MEGA PACK — Réglages',
      setTheme: 'Thème', setThemeD: 'Appliqué au panneau, aux menus et à ce réglage',
      setLang: 'Langue', setLangD: 'Interface du panneau',
      setLlm: 'LLM par défaut', setLlmD: '⌘⏎ dans le panneau ouvre ce chat',
      setSend: 'Destinations du clic droit',
      setSendHint: 'Coche une ou plusieurs — l\'ordre des clics = priorité du menu « Envoyer à »',
      setFsc: 'Raccourcis favoris', setFscD: '⌘1 à ⌘9 injectent les 9 premiers favoris',
      setCfg: 'Configuration', setCfgD: 'Favoris, prompts perso, équipes et préférences en JSON',
      setExport: '⬇ Exporter', setImport: '⬆ Importer', setImported: '✓ Configuration importée', setImportErr: '✗ Fichier invalide',
      setXp: 'Mes prompts ✍️', setXpD: 'Télécharge tous tes prompts en Markdown',
      setXpBtn: '⬇ Exporter en .md', setXpNone: 'Aucun prompt perso',
      setTour: "🎓 Mode d'emploi interactif", setTourD: 'Revoit la visite guidée : recherche, onglets, LLM, clic droit…',
      setTourBtn: 'Relancer la visite',
      tourTitle: 'Visite guidée',
      tourSkip: 'Passer la visite', tourNext: 'Suivant →', tourDone: 'Terminer',
      tourStepN: (i, n) => 'Étape ' + i + '/' + n,
      setDone: 'Enregistrer', setClose: 'Fermer',
      saved: '✓ Réglages enregistrés',
      clipboard: 'Presse-papiers',
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
      setAi: '🧠 Intelligence — API key', setAiD: 'For the ✨ Generate button: the AI writes your agents, skills and prompts',
      setAiProv: 'Provider', setAiKey: 'API key', setAiModel: 'Model (optional)', setAiSave: 'Save', setAiDel: 'Clear',
      setAiOk: '✓ Key saved — ✨ Generate is active in the ✍️ creator', setAiCleared: 'Key cleared', setAiPlaceholder: 'gsk_… / sk-… (stored off-site, shared across your sites)',
      aiBtn: '✨ Generate with AI', aiBusy: '⏳ Generating…', aiDone: '✓ Generated — review, adjust, then save',
      aiErr: '✗ AI failed', aiNeedKey: 'Add an API key in ⚙ Settings → Intelligence',
      aiSys: 'You are a senior expert at writing system prompts for AI agents and skills (expertise procedures). Write in clear, actionable English. Reply ONLY with the requested content, no preamble, no code fences.',
      aiUser: 'Write the full system prompt (150-350 words) for this expert: "{NAME}".\nUser-described need: {DESC}',
      count: (n) => n + ' result' + (n > 1 ? 's' : ''),
      llm: 'LLM',
      settings: '⚙ Settings', settingsTitle: 'Settings — same as the macOS app',
      setTitle: '⚡ MEGA PACK — Settings',
      setTheme: 'Theme', setThemeD: 'Applied to the panel, menus and this dialog',
      setLang: 'Language', setLangD: 'Panel interface',
      setLlm: 'Default LLM', setLlmD: '⌘⏎ in the panel opens this chat',
      setSend: 'Right-click destinations',
      setSendHint: 'Check one or more — click order = “Send to” menu priority',
      setFsc: 'Favorite shortcuts', setFscD: '⌘1 to ⌘9 inject the first 9 favorites',
      setCfg: 'Configuration', setCfgD: 'Favorites, custom prompts, teams and preferences as JSON',
      setExport: '⬇ Export', setImport: '⬆ Import', setImported: '✓ Configuration imported', setImportErr: '✗ Invalid file',
      setXp: 'My prompts ✍️', setXpD: 'Download all your prompts as Markdown',
      setXpBtn: '⬇ Export as .md', setXpNone: 'No custom prompts',
      setTour: '🎓 Interactive guide', setTourD: 'Replays the guided tour: search, tabs, LLM, right-click…',
      setTourBtn: 'Replay the tour',
      tourTitle: 'Guided tour',
      tourSkip: 'Skip tour', tourNext: 'Next →', tourDone: 'Done',
      tourStepN: (i, n) => 'Step ' + i + '/' + n,
      setDone: 'Save', setClose: 'Close',
      saved: '✓ Settings saved',
      clipboard: 'Clipboard',
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
    if (kind === 'clipboard') return; // presse-papiers : la copie suffit
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
  #mgp-panel.min #mgp-list,#mgp-panel.min #mgp-foot,#mgp-panel.min #mgp-rsz,#mgp-panel.min #mgp-setdlg{display:none !important}
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
  #mgp-tourbtn{font-size:13px;line-height:1}
  #mgp-tourbtn:hover{border-color:#14f195 !important;color:#14f195 !important}
  #mgp-setdlg{display:none;flex-direction:column;gap:0;overflow-y:auto;max-height:calc(100% - 46px);margin:0 10px 10px;
    border:1px solid #31343f;border-radius:12px;background:#14151c}
  #mgp-setdlg.open{display:flex}
  #mgp-setdlg .sttl{font-size:13.5px;font-weight:700;padding:13px 14px 3px}
  #mgp-setdlg .shint{font-size:10.5px;color:#6b7080;padding:0 14px 10px;border-bottom:1px solid #23252f}
  #mgp-setdlg .row{display:flex;align-items:center;justify-content:space-between;gap:10px;
    padding:10px 14px;border-bottom:1px solid #23252f}
  #mgp-setdlg .row.col{flex-direction:column;align-items:stretch;gap:7px}
  #mgp-setdlg .row b{font-size:12.5px;font-weight:600}
  #mgp-setdlg .row .d{display:block;font-size:10.5px;color:#6b7080;font-weight:400;margin-top:2px}
  #mgp-setdlg select{background:#191b24;border:1px solid #31343f;border-radius:8px;color:#eef0f6;font:inherit;font-size:12px;padding:5px 9px;outline:none}
  #mgp-setdlg select:focus{border-color:#9945ff}
  #mgp-setdlg .hint{font-size:10.5px;color:#6b7080;font-weight:400}
  #mgp-setdlg .chips{display:flex;flex-wrap:wrap;gap:6px}
  #mgp-setdlg .chips button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:11.5px;font-weight:600;padding:5px 11px;border-radius:99px}
  #mgp-setdlg .chips button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .chips button.on{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-setdlg .srow{display:flex;gap:8px;justify-content:flex-end;padding:11px 14px}
  #mgp-setdlg .btn{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px}
  #mgp-setdlg .btn:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .srow button.prim{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-setdlg .srow button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-setdlg .sfoot{font-size:10.5px;color:#6b7080;padding:0 14px 11px;font-weight:400}
  /* ── Thème clair (aligné app macOS : body.light) ── */
  #mgp-panel.light{background:#f6f7fd;border-color:#dfe4f3;color:#131a2e}
  #mgp-panel.light #mgp-macbar{background:linear-gradient(#ffffff,#f0f1f9);border-bottom-color:#dfe4f3}
  #mgp-panel.light #mgp-macbar .ttl{color:#5d6885}
  #mgp-panel.light #mgp-macbar .lx button{border-color:#c5cfeb;color:#5d6885}
  #mgp-panel.light #mgp-macbar .lx button:hover{border-color:#9945ff;color:#131a2e}
  #mgp-panel.light #mgp-head{border-bottom-color:#dfe4f3}
  #mgp-panel.light #mgp-head .c{color:#5d6885}
  #mgp-panel.light #mgp-qrow,#mgp-panel.light .mgp-item:hover,#mgp-panel.light .mgp-item.on{background:#f4f6fd}
  #mgp-panel.light #mgp-qrow{border-color:#dfe4f3}
  #mgp-panel.light #mgp-q{color:#131a2e}
  #mgp-panel.light #mgp-q::placeholder{color:#5d6885}
  #mgp-panel.light .mgp-tab{color:#5d6885}
  #mgp-panel.light .mgp-tab:hover,#mgp-panel.light .mgp-tab.on{background:#eceefb;color:#131a2e}
  #mgp-panel.light .mgp-item b{color:#131a2e}
  #mgp-panel.light .mgp-item .d{color:#5d6885}
  #mgp-panel.light .mgp-item .fb,#mgp-panel.light .mgp-item .fv{color:#8a90a5}
  #mgp-panel.light .mgp-item .fb:hover,#mgp-panel.light .mgp-item .fv{color:#d4a017}
  #mgp-panel.light #mgp-foot{border-top-color:#dfe4f3;color:#5d6885}
  #mgp-panel.light #mgp-foot .n{color:#5d6885}
  #mgp-panel.light #mgp-llmbtn{border-color:#c5cfeb;color:#5d6885}
  #mgp-panel.light #mgp-llmbtn b{color:#0a9d68}
  #mgp-panel.light #mgp-llmmenu,body.mgp-light #mgp-ctx,body.mgp-light #mgp-tip{background:#ffffff;border-color:#c5cfeb;box-shadow:0 18px 50px rgba(20,25,50,.18)}
  #mgp-panel.light #mgp-llmmenu button,body.mgp-light #mgp-ctx button{color:#2c3556}
  #mgp-panel.light #mgp-llmmenu button:hover,body.mgp-light #mgp-ctx button:hover{background:#f4f6fd;color:#131a2e}
  body.mgp-light #mgp-tip p{color:#2c3556}
  body.mgp-light #mgp-tip .tc{color:#5d6885}
  #mgp-panel.light .mgp-item.selc{background:rgba(107,70,242,.08)}
  #mgp-panel.light .mgp-item.selc b{color:#6b46f2}
  #mgp-panel.light #mgp-setdlg{background:#ffffff;border-color:#dfe4f3}
  #mgp-panel.light #mgp-setdlg .row{border-bottom-color:#e8ebf7}
  #mgp-panel.light #mgp-setdlg .row .d,#mgp-panel.light #mgp-setdlg .hint,
  #mgp-panel.light #mgp-setdlg .shint,#mgp-panel.light #mgp-setdlg .sfoot{color:#5d6885}
  #mgp-panel.light #mgp-setdlg select,#mgp-panel.light #mgp-setdlg .chips button{background:#f4f6fd;border-color:#c5cfeb;color:#2c3556}
  #mgp-panel.light #mgp-setdlg .chips button.on{background:#6b46f2;border-color:#6b46f2;color:#fff}
  #mgp-panel.light #mgp-setdlg .btn{border-color:#c5cfeb;color:#2c3556}
  #mgp-panel.light #mgp-setdlg .srow button{border-color:#dfe4f3;color:#2c3556}
  #mgp-panel.light #mgp-setdlg .srow button.prim{background:#6b46f2;border-color:#6b46f2;color:#fff}
  /* visite guidée (alignée app : carte flottante + surbrillance de l'élément) */
  #mgp-tour{position:fixed;z-index:1000003;inset:0;display:none;background:rgba(5,6,10,.45)}
  #mgp-tour.open{display:block}
  #mgp-tourcard{position:absolute;max-width:330px;background:#14151c;border:1px solid #31343f;border-radius:14px;
    padding:14px 16px;box-shadow:0 24px 70px rgba(0,0,0,.55);font:13px/1.5 -apple-system,sans-serif;color:#eef0f6}
  #mgp-tourcard .tstepnum{font-size:10px;font-weight:800;letter-spacing:1px;color:#14f195;text-transform:uppercase}
  #mgp-tourcard h3{margin:4px 0 6px;font-size:14.5px}
  #mgp-tourcard p{margin:0 0 4px;color:#a8adbd;font-size:12.5px}
  #mgp-tourcard .thelp{color:#6b7080;font-size:11.5px}
  #mgp-tourcard .trow{display:flex;align-items:center;gap:8px;margin-top:11px}
  #mgp-tourcard .trow button{border:1px solid #31343f;background:none;color:#a8adbd;cursor:pointer;font:inherit;
    font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px}
  #mgp-tourcard .trow button:hover{border-color:#9945ff;color:#eef0f6}
  #mgp-tourcard .trow button.pri{background:#9945ff;border-color:#9945ff;color:#fff}
  #mgp-tourcard .trow .dots{display:flex;gap:4px;margin:0 auto}
  #mgp-tourcard .trow .dots i{width:6px;height:6px;border-radius:50%;background:#31343f}
  #mgp-tourcard .trow .dots i.on{background:#14f195}
  .mgp-tour-hl{position:relative;z-index:1000004;box-shadow:0 0 0 3px #14f195,0 0 24px rgba(20,241,149,.5) !important;border-radius:10px}
  body.mgp-light #mgp-tourcard{background:#ffffff;border-color:#c5cfeb;color:#131a2e}
  body.mgp-light #mgp-tourcard p{color:#2c3556}
  body.mgp-light #mgp-tourcard .thelp{color:#5d6885}
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
      '<span class="lx"><button id="mgp-tourbtn" title="' + T().tourTitle + '">🎓</button>' +
      '<button id="mgp-set" title="' + T().settingsTitle + '">' + T().settings + '</button>' +
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
      '<div id="mgp-erow"><button id="mgp-e-ai" title="' + T().setAiD + '">' + T().aiBtn + '</button><button id="mgp-e-save">' + T().mSave + '</button><button id="mgp-e-del">' + T().mDel + '</button><span style="flex:1"></span><button id="mgp-e-x">' + T().mCancel + '</button></div>' +
    '</div></div>';

  const tip = document.createElement('div');
  tip.id = 'mgp-tip';
  const ctx = document.createElement('div');
  ctx.id = 'mgp-ctx';
  const tour = document.createElement('div');
  tour.id = 'mgp-tour';
  tour.innerHTML = '<div id="mgp-tourcard">' +
    '<span class="tstepnum"></span><h3></h3><p></p><p class="thelp"></p>' +
    '<div class="trow"><button class="tskip"></button><span class="dots"></span><button class="tpri"></button></div>' +
    '</div>';

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
      x.path ? '<button data-a="reveal">📂 ' + (LANG === 'fr' ? 'Ouvrir le .md source' : 'Open source .md') + '</button>' : '',
      '<button data-a="md">📄 ' + (LANG === 'fr' ? 'Créer le .md (fiche + prompt)' : 'Create .md (sheet + prompt)') + '</button>',
      '<button data-a="copy">' + T().copyPrompt + '</button>',
      '<button data-a="fav">' + (isFav(x.name) ? T().favDel : T().favAdd) + '</button>',
      '<button data-t="clipboard">▸ ⧉ ' + T().clipboard + '</button>'
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
        else if (b.dataset.a === 'reveal') {
          // 📂 Ouvre le .md source du catalogue dans un nouvel onglet (github raw localement impossible)
          const url = 'https://github.com/Azumizeus/PromptDeck/blob/master/agent-skills/' + encodeURI(x.path).replace(/\/$/, '/SKILL.md').replace(/\.md$/, '.md').replace('skills/', 'skills/') + (x.path.endsWith('.md') ? '' : 'SKILL.md');
          const finalUrl = x.path.endsWith('.md')
            ? 'https://github.com/Azumizeus/PromptDeck/blob/master/agent-skills/' + encodeURI(x.path)
            : 'https://github.com/Azumizeus/PromptDeck/tree/master/agent-skills/' + encodeURI(x.path);
          window.open(finalUrl, '_blank');
        }
        else if (b.dataset.a === 'md') {
          // 📄 Crée la fiche .md (téléchargement — un userscript n'écrit pas sur le disque)
          const kindLabel = it.k === 'agent' ? 'agent' : 'skill';
          const md = '# 🛠 ' + (x.name_fr || x.name) + '\n\n> ' + (x.desc_fr || x.desc || '') + '\n\n- **Type** : ' + kindLabel + '\n- **Catégorie** : ' + (x.category || '—') + '\n\n## Prompt d\'activation\n\n```\n' + promptOf(it) + '\n```\n';
          const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob); a.download = (x.name_fr || x.name) + '.md';
          document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 400);
        }
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
    const cur = defaultLLM();
  panel.querySelector('#mgp-llmbtn').innerHTML = '⌨ ' + T().llm + ' <b>' + (cur === 'clipboard' ? T().clipboard : (LLM_LABEL[cur] || cur)) + '</b> ▾';
  }
  function renderLlmMenu() {
    const m = panel.querySelector('#mgp-llmmenu');
    m.innerHTML = LLMS.concat(['clipboard']).map(function (t) {
      const lb = t === 'clipboard' ? '⧉ ' + T().clipboard : (LLM_LABEL[t] || t);
      return '<button data-t="' + t + '" class="' + (t === defaultLLM() ? 'on' : '') + '">' +
        (t === defaultLLM() ? '✓ ' : '▸ ') + lb + '</button>';
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
  // ✨ Générer avec l'IA : remplit le prompt depuis le nom + une description libre
  panel.querySelector('#mgp-e-ai').onclick = function () {
    const btn = panel.querySelector('#mgp-e-ai');
    const name = panel.querySelector('#mgp-e-name').value.trim();
    const desc = panel.querySelector('#mgp-e-txt').value.trim();
    if (!name && !desc) { flash(panel.querySelector('#mgp-modal'), T().aiNeedKey === undefined ? '' : (LANG === 'fr' ? 'Donne au moins un nom ou décris le besoin' : 'Give at least a name or describe the need')); return; }
    if (!aiReady()) { flash(panel.querySelector('#mgp-modal'), T().aiNeedKey); return; }
    const old = btn.textContent;
    btn.disabled = true; btn.textContent = T().aiBusy;
    const user = T().aiUser.replace('{NAME}', name || desc.slice(0, 60)).replace('{DESC}', desc || name);
    aiGenerate(T().aiSys, user, function (r) {
      btn.disabled = false; btn.textContent = old;
      if (r.error) { flash(panel.querySelector('#mgp-modal'), T().aiErr + ' — ' + r.error); return; }
      panel.querySelector('#mgp-e-txt').value = String(r.text || '').trim().slice(0, 2000);
      flash(panel.querySelector('#mgp-modal'), T().aiDone);
    });
  };
  panel.querySelector('#mgp-modal').addEventListener('click', function (e) { if (e.target.id === 'mgp-modal') closeModal(); });
  panel.querySelector('#mgp-e-txt').addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') panel.querySelector('#mgp-e-save').onclick();
  });

  // ── Ouverture / fermeture + clavier (aligné Luxe) ──────────────────────────
  function openPanel() { panel.classList.add('open'); renderCounts(); renderTabs(); renderSelRow(); renderLlmBtn(); render(); panel.querySelector('#mgp-q').focus(); }
  // Raccourcis favoris ⌘1-9 : injecte les 9 premiers favoris (option ⚙)
  document.addEventListener('keydown', function (e) {
    if (!panel.classList.contains('open')) return; // comme l'app : ⚡ ouvert
    if (!(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
    const n = parseInt(e.key, 10);
    if (!n || n < 1 || n > 9) return;
    if (!store.get('favShortcuts', true)) return;
    const f = favs();
    if (n > f.length) return;
    const it = ALL().find(function (x) { return x.x.name === f[n - 1]; });
    if (!it) return;
    e.preventDefault();
    activate(it, null);
    flash(btn, '⌘' + n + ' → ' + lname(it.x));
  });
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
  // ── Réglages (⚙) — même panneau que l'app macOS ──────────────────────────
  const sendTargets = () => store.get('sendTargets', ['claude', 'chatgpt']);
  function theme() { return store.get('theme', 'dark'); }
  function isLight() { return theme() === 'light'; }
  function applyTheme() {
    panel.classList.toggle('light', isLight());
    document.body.classList.toggle('mgp-light', isLight());
  }
  function dlMd(name, txt, mime) {
    const b = new Blob([txt], { type: mime || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function buildSetDlg() {
    const dlg = panel.querySelector('#mgp-setdlg');
    const cur = defaultLLM();
    const tgts = sendTargets();
    const opts = LLMS.concat(['clipboard']).map(function (t) {
      const lb = t === 'clipboard' ? T().clipboard : (LLM_LABEL[t] || t);
      return '<option value="' + t + '"' + (t === cur ? ' selected' : '') + '>' + lb + '</option>';
    }).join('');
    dlg.innerHTML =
      '<span class="sttl">' + T().setTitle + '</span>' +
      '<span class="shint">' + (LANG === 'fr' ? 'Catalogue : ' : 'Catalog: ') + cat().skills.length + ' skills · ' + cat().agents.length + ' ' + T().agentsN + ' — ' + (LANG === 'fr' ? 'tout est enregistré automatiquement' : 'everything is saved automatically') + '</span>' +
      '<div class="row"><b>' + T().setTheme + '<span class="d">' + T().setThemeD + '</span></b>' +
        '<select id="mgp-s-theme"><option value="dark">🌙 ' + (LANG === 'fr' ? 'Sombre' : 'Dark') + '</option><option value="light"' + (isLight() ? ' selected' : '') + '>☀️ ' + (LANG === 'fr' ? 'Clair' : 'Light') + '</option></select></div>' +
      '<div class="row"><b>' + T().setLang + '<span class="d">' + T().setLangD + '</span></b>' +
        '<select id="mgp-s-lang"><option value="fr">🇫🇷 Français</option><option value="en"' + (LANG === 'en' ? ' selected' : '') + '>🇬🇧 English</option></select></div>' +
      '<div class="row"><b>' + T().setLlm + '<span class="d">' + T().setLlmD + '</span></b>' +
        '<select id="mgp-s-llm">' + opts + '</select></div>' +
      '<div class="row col"><b>' + T().setSend + '</b><span class="hint">' + T().setSendHint + '</span>' +
        '<span class="chips" id="mgp-s-send">' +
        LLMS.concat(['clipboard']).map(function (t) {
          const lb = t === 'clipboard' ? '⧉ ' + T().clipboard : (LLM_LABEL[t] || t);
          return '<button data-t="' + t + '" class="' + (tgts.indexOf(t) >= 0 ? 'on' : '') + '">' + lb + '</button>';
        }).join('') +
      '</span></div>' +
      '<div class="row"><b>' + T().setFsc + '<span class="d">' + T().setFscD + '</span></b>' +
        '<input type="checkbox" id="mgp-s-fsc" style="width:17px;height:17px;accent-color:#9945ff"' + (store.get('favShortcuts', true) ? ' checked' : '') + '></div>' +
      '<div class="row"><b>' + T().setCfg + '<span class="d">' + T().setCfgD + '</span></b>' +
        '<span style="display:flex;gap:6px"><button class="btn" id="mgp-s-exp">' + T().setExport + '</button><button class="btn" id="mgp-s-imp">' + T().setImport + '</button></span></div>' +
      '<div class="row"><b>' + T().setXp + '<span class="d">' + T().setXpD + '</span></b>' +
        '<button class="btn" id="mgp-s-xp">' + T().setXpBtn + '</button></div>' +
      '<div class="row col"><b>' + T().setAi + '<span class="d">' + T().setAiD + '</span></b>' +
        '<span class="chips" style="flex-wrap:wrap;gap:6px">' +
          '<select id="mgp-s-aiprov" style="flex:1;min-width:150px">' + AI_PROVIDERS.map(function (p) {
            return '<option value="' + p.id + '"' + (p.id === aiProvider().id ? ' selected' : '') + '>' + p.label + '</option>';
          }).join('') + '</select>' +
          '<input id="mgp-s-aikey" type="password" placeholder="' + T().setAiPlaceholder + '" value="' + (aiKey() ? '••••••••' : '') + '" style="flex:1;min-width:150px">' +
          '<input id="mgp-s-aimodel" placeholder="' + T().setAiModel + ' : ' + aiProvider().model + '" value="' + (gm.get('ai.model', '') || '') + '" style="flex:1;min-width:130px">' +
          '<button class="btn" id="mgp-s-aisave">' + T().setAiSave + '</button>' +
          (aiKey() ? '<button class="btn" id="mgp-s-aidel">' + T().setAiDel + '</button>' : '') +
        '</span></div>' +
      '<div class="srow"><button class="btn" id="mgp-s-close">' + T().setClose + '</button><button class="btn prim" id="mgp-s-done">' + T().setDone + '</button></div>' +
      '<span class="sfoot">⚙ ' + (LANG === 'fr' ? 'Stockage local du site — rien n\'est envoyé en ligne' : 'Local site storage — nothing is sent online') + '</span>';
    dlg.querySelector('#mgp-s-theme').onchange = function (e) { store.set('theme', e.target.value); applyTheme(); };
    dlg.querySelector('#mgp-s-lang').onchange = function (e) { LANG = e.target.value; store.set('lang', LANG); applyLang(); buildSetDlg(); };
    dlg.querySelector('#mgp-s-llm').onchange = function (e) { store.set('defaultLLM', e.target.value); renderLlmBtn(); };
    dlg.querySelectorAll('#mgp-s-send button').forEach(function (b) {
      b.onclick = function () {
        const arr = sendTargets(); const p = arr.indexOf(b.dataset.t);
        if (p >= 0) arr.splice(p, 1); else arr.push(b.dataset.t);
        store.set('sendTargets', arr);
        buildSetDlg();
      };
    });
    dlg.querySelector('#mgp-s-fsc').onchange = function (e) { store.set('favShortcuts', e.target.checked); };
    dlg.querySelector('#mgp-s-exp').onclick = function () {
      dlMd('megapack-config.json', JSON.stringify({
        version: 1, favs: favs(), customs: customs(), teams: teams(),
        defaultLLM: defaultLLM(), sendTargets: sendTargets(),
        favShortcuts: store.get('favShortcuts', true), theme: theme(), lang: LANG,
      }, null, 2), 'application/json');
    };
    dlg.querySelector('#mgp-s-imp').onclick = function () {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
      inp.onchange = function () {
        const f = inp.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = function () {
          try {
            const j = JSON.parse(rd.result);
            if (Array.isArray(j.favs)) store.set('favs', j.favs);
            if (Array.isArray(j.customs)) store.set('customs', j.customs);
            if (Array.isArray(j.teams)) store.set('teams', j.teams);
            if (typeof j.defaultLLM === 'string') store.set('defaultLLM', j.defaultLLM);
            if (Array.isArray(j.sendTargets)) store.set('sendTargets', j.sendTargets);
            if (typeof j.favShortcuts === 'boolean') store.set('favShortcuts', j.favShortcuts);
            if (j.theme === 'light' || j.theme === 'dark') { store.set('theme', j.theme); applyTheme(); }
            if (j.lang === 'fr' || j.lang === 'en') { LANG = j.lang; store.set('lang', LANG); applyLang(); }
            renderLlmBtn(); buildSetDlg(); flash(dlg, T().setImported);
          } catch (e) { flash(dlg, T().setImportErr); }
        };
        rd.readAsText(f);
      };
      inp.click();
    };
    dlg.querySelector('#mgp-s-aisave').onclick = function () {
      const k = dlg.querySelector('#mgp-s-aikey').value.trim();
      const m = dlg.querySelector('#mgp-s-aimodel').value.trim();
      if (k && k !== '••••••••') gm.set('ai.key', k);
      gm.set('ai.model', m);
      gm.set('ai.provider', dlg.querySelector('#mgp-s-aiprov').value);
      flash(dlg, aiReady() ? T().setAiOk : T().aiNeedKey);
      buildSetDlg();
    };
    const aidel = dlg.querySelector('#mgp-s-aidel');
    if (aidel) aidel.onclick = function () { gm.del('ai.key'); flash(dlg, T().setAiCleared); buildSetDlg(); };
    dlg.querySelector('#mgp-s-xp').onclick = function () {
      const cs = customs();
      if (!cs.length) { flash(dlg, T().setXpNone); return; }
      const md = '# Mes prompts ✍️ — MEGA PACK\n\n' + cs.map(function (c) {
        return '## ' + c.name + '\n\n' + (c.desc || '') + '\n';
      }).join('\n');
      dlMd('mes-prompts-megapack.md', md, 'text/markdown;charset=utf-8');
    };
    dlg.querySelector('#mgp-s-close').onclick = function () { dlg.classList.remove('open'); };
    dlg.querySelector('#mgp-s-done').onclick = function () { dlg.classList.remove('open'); flash(panel.querySelector('#mgp-set'), T().saved); };
  }
  panel.querySelector('#mgp-set').onclick = function () {
    const dlg = panel.querySelector('#mgp-setdlg');
    if (dlg.classList.contains('open')) { dlg.classList.remove('open'); return; }
    buildSetDlg();
    dlg.classList.add('open');
  };

  // ── 🎓 Visite guidée (alignée app : 7 étapes, surbrillance, relançable) ──
  function tourSteps() {
    const fr = LANG === 'fr';
    return [
      { title: fr ? '⚡ Bienvenue !' : '⚡ Welcome!', desc: fr ? '321 experts prêts à l\'emploi : 131 skills 🛠 et 190 agents 👤. Tape quelques lettres : la liste filtre instantanément.' : '321 ready-to-use experts: 131 skills 🛠 and 190 agents 👤. Type a few letters: the list filters instantly.', help: fr ? '💡 ↑↓ naviguent, ⏎ injecte dans la conversation.' : '💡 ↑↓ navigate, ⏎ injects into the conversation.', target: null },
      { title: fr ? '🗂 Les onglets' : '🗂 Tabs', desc: fr ? 'Tout, Skills, Agents, 🕸 Équipes, ✍️ Perso, ★ Favoris : chaque clic filtre le catalogue.' : 'All, Skills, Agents, 🕸 Teams, ✍️ Custom, ★ Favorites: each click filters the catalog.', help: fr ? '💡 ⌘-clic sélectionne plusieurs experts pour les composer ensemble (⌥⏎).' : '💡 ⌘-click selects several experts to compose them together (⌥⏎).', target: 'mgp-tabs' },
      { title: fr ? '⌨ Le LLM par défaut' : '⌨ The default LLM', desc: fr ? 'En bas, le bouton « ⌨ LLM » choisit la destination par défaut : Claude, ChatGPT, Perplexity… (règlable aussi dans ⚙).' : 'At the bottom, the « ⌨ LLM » button picks the default destination: Claude, ChatGPT, Perplexity… (also in ⚙).', help: fr ? '💡 ⌘⏎ envoie vers ce LLM · ⇧⏎ force ChatGPT.' : '💡 ⌘⏎ sends there · ⇧⏎ forces ChatGPT.', target: 'mgp-foot' },
      { title: fr ? '🖱 Le clic droit' : '🖱 Right-click', desc: fr ? 'Clic droit sur un expert : Envoyer à (tes destinations ⚙), ⧉ copier, ★ favori, presse-papiers.' : 'Right-click an expert: Send to (your ⚙ destinations), ⧉ copy, ★ favorite, clipboard.', help: fr ? '💡 Les destinations se choisissent dans ⚙ Réglages.' : '💡 Pick destinations in ⚙ Settings.', target: 'mgp-list' },
      { title: fr ? '🕸 Les équipes d\'experts' : '🕸 Expert teams', desc: fr ? 'Onglet 🕸 Équipes : une équipe = un super-orchestrateur + ses agents + un workflow. Un clic sur une équipe injecte le protocole complet dans la conversation : l\'orchestrateur distribue les tâches, les agents exécutent, lui consolide le rapport final.' : 'The 🕸 Teams tab: a team = a super-orchestrator + its agents + a workflow. Clicking a team injects the full protocol into the conversation: the orchestrator distributes tasks, agents execute, it consolidates the final report.', help: fr ? '💡 Survol d\'une équipe : la composition s\'affiche (orchestrateur, agents, workflow).' : '💡 Hover a team: the composition shows up (orchestrator, agents, workflow).', target: 'mgp-tabs' },
      { title: fr ? '🛠 Crée tes propres experts' : '🛠 Build your own experts', desc: fr ? 'Le bouton « ＋ » ouvre le créateur : décris un besoin, donne un tag, rédige le prompt — ton expert rejoint l\'onglet ✍️ Perso, exportable en .md depuis ⚙.' : 'The « ＋ » button opens the creator: describe a need, give it a tag, write the prompt — your expert joins the ✍️ Custom tab, exportable as .md from ⚙.', help: fr ? '💡 Les ✍️ se combinent aussi avec les experts du catalogue (⌘-clic + ⌥⏎).' : '💡 Custom prompts also compose with catalog experts (⌘-click + ⌥⏎).', target: 'mgp-newp' },
      { title: fr ? '★ Favoris & ⌘1-9' : '★ Favorites & ⌘1-9', desc: fr ? '★ sur une ligne = favori. Avec le panneau ouvert, ⌘1 à ⌘9 injectent tes 9 premiers favoris (option ⚙).' : '★ on a row = favorite. With the panel open, ⌘1-⌘9 inject your first 9 favorites (⚙ option).', help: fr ? '💡 La fenêtre se déplace (barre titre), se redimensionne (poignée) et se replie (🟡).' : '💡 The window drags (title bar), resizes (handle) and collapses (🟡).', target: 'mgp-foot' },
      { title: fr ? '⚙ Réglages complets' : '⚙ Full settings', desc: fr ? 'Thème clair/sombre, langue, LLM par défaut, destinations, export/import de ta config, export ✍️ en .md — comme l\'app macOS.' : 'Light/dark theme, language, default LLM, destinations, config export/import, ✍️ .md export — like the macOS app.', help: fr ? '💡 Tout est local : rien n\'est envoyé en ligne.' : '💡 Everything is local: nothing is sent online.', target: 'mgp-set' },
      { title: fr ? '✅ Tu sais tout !' : '✅ You are all set!', desc: fr ? 'Ctrl+Shift+K ouvre le panneau depuis n\'importe quelle page. Clic droit sur un expert pour l\'envoyer vers un LLM. Bonne exploration ! ⚡' : 'Ctrl+Shift+K opens the panel on any page. Right-click an expert to send it to an LLM. Happy exploring! ⚡', help: '', target: null },
    ];
  }
  let TOUR_I = 0;
  const TOUR_SEEN_KEY = 'tour.done';
  function tourShow(i) {
    const steps = tourSteps();
    TOUR_I = Math.max(0, Math.min(i, steps.length - 1));
    const st = steps[TOUR_I];
    tour.querySelector('.tstepnum').textContent = T().tourStepN(TOUR_I + 1, steps.length);
    tour.querySelector('h3').textContent = st.title;
    tour.querySelector('p').textContent = st.desc;
    tour.querySelector('.thelp').textContent = st.help || '';
    tour.querySelector('.dots').innerHTML = steps.map(function (_, j) { return '<i class="' + (j === TOUR_I ? 'on' : '') + '"></i>'; }).join('');
    tour.querySelector('.tpri').textContent = TOUR_I === steps.length - 1 ? T().tourDone : T().tourNext;
    tour.querySelector('.tskip').textContent = T().tourSkip;
    tour.classList.add('open');
    const card = tour.querySelector('#mgp-tourcard');
    card.style.left = Math.max(10, Math.min(window.innerWidth - 350, window.innerWidth / 2 - 165)) + 'px';
    card.style.top = Math.max(10, window.innerHeight / 2 - 120) + 'px';
    document.querySelectorAll('.mgp-tour-hl').forEach(function (n) { n.classList.remove('mgp-tour-hl'); });
    const el = st.target ? panel.querySelector('#' + st.target) : null;
    if (el && panel.classList.contains('open')) el.classList.add('mgp-tour-hl');
  }
  function tourAdvance() { if (TOUR_I >= tourSteps().length - 1) return tourEnd(); tourShow(TOUR_I + 1); }
  function tourEnd() {
    tour.classList.remove('open');
    document.querySelectorAll('.mgp-tour-hl').forEach(function (n) { n.classList.remove('mgp-tour-hl'); });
    store.set('tour.done', true);
  }
  tour.querySelector('.tpri').onclick = tourAdvance;
  tour.querySelector('.tskip').onclick = tourEnd;
  tour.addEventListener('click', function (e) { if (e.target === tour) tourEnd(); });
  document.addEventListener('keydown', function (e) {
    if (!tour.classList.contains('open')) return;
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); tourAdvance(); }
  });
  function tourMaybeStart() {
    if (!store.get('tour.done', false)) {
      panel.classList.add('open');
      renderCounts(); renderTabs(); renderLlmBtn(); render();
      tourShow(0);
    }
  }
  if (store.get('tour.done', false) === false) setTimeout(tourMaybeStart, 500);
  // Rangée 🎓 dans ⚙ — relance
  const tourRow = function () {
    return '<div class="row"><b>' + T().setTour + '<span class="d">' + T().setTourD + '</span></b>' +
      '<button class="btn" id="mgp-s-tour">▶ ' + T().setTourBtn + '</button></div>';
  };
  const _buildSetDlg = buildSetDlg;
  buildSetDlg = function () {
    _buildSetDlg();
    const dlg = panel.querySelector('#mgp-setdlg');
    dlg.querySelector('.row:nth-of-type(6)').insertAdjacentHTML('afterend', tourRow());
    dlg.querySelector('#mgp-s-tour').onclick = function () {
      dlg.classList.remove('open');
      tourShow(0);
    };
  };
  btn.onclick = function () { panel.classList.contains('open') ? closePanel() : openPanel(); };
  panel.querySelector('#mgp-tourbtn').onclick = function () { tourShow(0); };
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
  document.body.appendChild(tour);
  applyTheme();
  applyLang();
})();
