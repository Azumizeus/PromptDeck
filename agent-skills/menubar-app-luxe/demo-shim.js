// Démo navigateur : shim window.mgp (le renderer de l'app ne change pas d'un octet)
(function () {
  'use strict';
  const KEY = 'mgp.prefs.luxe';
  const DEFAULTS = { lang: 'fr', theme: 'dark', favorites: [], recents: [], customs: [], defaultLLM: 'claude', sendTargets: ['chatgpt', 'claude', 'clipboard'], hasApi: { groq: true, gemini: true, omniroute: true, mistral: true, cerebras: true, cohere: true }, apiDefaultModel: 'openai/gpt-oss-120b' };
  let prefs;
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    stored.hasApi = Object.assign({}, DEFAULTS.hasApi, stored.hasApi); // nouveaux fournisseurs toujours pris en compte
    prefs = Object.assign({}, DEFAULTS, stored);
  }
  catch (e) { prefs = Object.assign({}, DEFAULTS); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} };
  // const au top-level = liaison globale lexical (pas window.MEGA_CATALOG)
  const CAT = typeof MEGA_CATALOG !== 'undefined' ? MEGA_CATALOG : { meta: {}, skills: [], agents: [] };
  // Équipes de démonstration (persistance localStorage)
  // Migration : modèles retirés des catalogues (ex. retrait llama-3.3 chez Groq)
  const LEGACY_MODELS = { 'llama-3.3-70b-versatile': 'openai/gpt-oss-120b', 'llama3-8b-8192': 'openai/gpt-oss-20b', 'mixtral-8x7b-32768': 'openai/gpt-oss-120b' };
  if (prefs.apiDefaultModel && LEGACY_MODELS[prefs.apiDefaultModel]) { prefs.apiDefaultModel = LEGACY_MODELS[prefs.apiDefaultModel]; save(); }
  const TEAMS_KEY = 'mgp.teams.luxe';
  const loadTeams = () => { try { return JSON.parse(localStorage.getItem(TEAMS_KEY) || '[]'); } catch (e) { return []; } };
  const saveTeams = (a) => { try { localStorage.setItem(TEAMS_KEY, JSON.stringify(a)); } catch (e) {} };
  const DEMO_TREE = { root: 'MEGA PROMPT (démo)', groups: [
    { kind: 'dir', name: 'skills', rel: 'skills', depth: 0, children: [
      { kind: 'dir', name: 'développement', rel: 'skills/développement', depth: 1, children: [
        { kind: 'file', name: 'Conception d API et d interfaces.md', rel: 'skills/développement/Conception d API.md', depth: 2 },
        { kind: 'file', name: 'Revue de code experte.md', rel: 'skills/développement/Revue de code.md', depth: 2 },
      ] },
      { kind: 'dir', name: 'écriture', rel: 'skills/écriture', depth: 1, children: [
        { kind: 'file', name: 'Réécriture claire.md', rel: 'skills/écriture/Réécriture claire.md', depth: 2 },
      ] },
    ] },
    { kind: 'dir', name: 'agents', rel: 'agents', depth: 0, children: [
      { kind: 'dir', name: 'orchestration', rel: 'agents/orchestration', depth: 1, children: [
        { kind: 'file', name: 'Super orchestrateur.md', rel: 'agents/orchestration/Super orchestrateur.md', depth: 2 },
      ] },
    ] },
    { kind: 'dir', name: 'equipes', rel: 'equipes', depth: 0, children: [] },
    { kind: 'file', name: 'LISEZMOI.md', rel: 'LISEZMOI.md', depth: 0 },
  ] };
  window.mgp = {
    catalog: CAT,
    copy: (t) => { window.__mgpClip = String(t); try { navigator.clipboard.writeText(String(t)).catch(() => {}); } catch (e) {} },
    hide: () => {},
    openLLM: (target, prompt) => {
      window.__mgpClip = String(prompt || '');
      const u = { claude: 'https://claude.ai/new?q=', chatgpt: 'https://chatgpt.com/?q=' };
      try { window.open((u[target] || u.claude) + encodeURIComponent(prompt || ''), '_blank', 'noopener'); } catch (e) {}
    },
    openSettings: () => {}, onSettings: null, onSettingsChange: () => {},
    getPrefs: () => prefs,
    addRecent: (n) => { prefs.recents = [n, ...prefs.recents.filter((x) => x !== n)].slice(0, 30); save(); },
    toggleFav: (n) => { const i = prefs.favorites.indexOf(n); i >= 0 ? prefs.favorites.splice(i, 1) : prefs.favorites.push(n); save(); },
    customSave: (item) => { const i = prefs.customs.findIndex((c) => c.name === item.name); i >= 0 ? prefs.customs[i] = item : prefs.customs.push(item); save(); },
    customDelete: (n) => { prefs.customs = prefs.customs.filter((c) => c.name !== n); save(); },
    onEditCustom: null,
    // ── Atelier / équipes / arborescence : stubs de démo (aucun appel réseau) ──
    setDefaultLLM: (llm) => { prefs.defaultLLM = llm; save(); },
    apiSet: async () => true,
    workshopList: async () => [],
    workshopDelete: async () => true,
    workshopExport: async () => true,
    modelsList: async (provider) => ({ ok: true, models: ({
      groq: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'groq/compound', 'groq/compound-mini', 'qwen/qwen3.8-27b'],
      gemini: ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemma-4-26b-a4b-it'],
      omniroute: ['auto/best-coding', 'auto/best-reasoning', 'auto/best-fast', 'auto/best-vision', 'auto/best-chat'],
      mistral: ['mistral-medium-latest', 'mistral-small-latest', 'magistral-small-latest'],
      cerebras: ['gpt-oss-120b', 'qwen-3.8-27b'],
      cohere: ['command-a-03-2025', 'command-r-plus-08-2024', 'c4ai-aya-expanse-32b'],
    }[provider] || []) }),
    llmGenerate: async () => ({ ok: false, error: 'démo navigateur : clé API non connectée — lance l app Electron pour générer' }),
    teamList: async () => loadTeams(),
    teamGenerate: async (p) => {
      const intent = String((p && p.intent) || 'mission de démonstration');
      const rec = {
        team: 'Équipe Démo', desc: intent.slice(0, 140), generatedAt: new Date().toISOString(),
        orchestrator: { name: 'Orchestrateur Démo', system: 'Tu distribues les tâches aux agents, vérifies leurs livrables, arbitres les conflits et consolides le rapport final.', skills: ['coordination', 'arbitrage'] },
        agents: [
          { name: 'Analyste', role: 'analyse du besoin', desc: 'Découpe le besoin en points vérifiables.', system: 'Tu analyses la demande et produis une liste de points clés.', skills: ['analyse'], deliverable: 'liste de points clés' },
          { name: 'Rédacteur', role: 'rédaction', desc: 'Transforme l analyse en livrable clair.', system: 'Tu rédiges un livrable structuré à partir des points clés.', skills: ['rédaction'], deliverable: 'livrable final' },
          { name: 'Vérificateur', role: 'contrôle qualité', desc: 'Relit et valide le livrable.', system: 'Tu relis le livrable et signales tout écart.', skills: ['revue'], deliverable: 'rapport de vérification' },
        ],
        workflow: [
          'Analyste produit la liste de points clés',
          'Rédacteur écrit le livrable à partir des points',
          'Vérificateur valide, l orchestrateur consolide',
        ],
      };
      const list = loadTeams(); const i = list.findIndex((t) => t.team === rec.team);
      if (i >= 0) list[i] = rec; else list.push(rec);
      saveTeams(list);
      return { ok: true, item: rec, model: 'démo', latency: 280 };
    },
    teamRun: async (p) => ({ ok: true, latency: 640, tasks: (p && p.team && p.team.agents || []).length,
      report: `# Rapport — ${(p && p.team && p.team.team) || 'Équipe'}\n\n> Mode démo navigateur : rapport simulé, aucune clé API utilisée.\n\n## Synthèse exécutive\n\nLa mission a été distribuée aux agents et consolidée (démo).\n\n## Prochaines actions\n\n- Lancez l app Electron pour de vraies missions via l API` }),
    reportSave: async () => ({ ok: false }),
    teamDelete: async (name) => { saveTeams(loadTeams().filter((t) => (t.team || t.name) !== name)); return true; },
    teamExport: async () => true,
    teamMdCreate: async () => ({ ok: false, error: 'démo' }),
    promptTreeOverview: async () => ({ ok: true, tree: DEMO_TREE }),
    promptMdOpen: () => {},
    promptDirOpen: () => {},
  };
})();
