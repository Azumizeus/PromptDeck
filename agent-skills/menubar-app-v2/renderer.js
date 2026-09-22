// MEGA PACK V3 « Constellation » — deux vues jamais vues dans un lanceur menu-bar :
//   🌌 GALAXIE 3D  : toute la bibliothèque en étoiles (agents en orbite verte, skills en
//                    anneau violet, ✍️ perso au centre, ⭐ favoris en constellation polaire).
//                    Inclinaison + rotation + zoom à la souris ; la recherche déclenche un
//                    HYPER-SAUT : la caméra plonge vers les étoiles trouvées.
//   🛰 PONT DE COMMANDEMENT : HUD radial façon vaisseau — 4 arcs-secteurs, cœur pulsant,
//                    et un CADRAN ORBITAL : les items défilent sur un anneau sous le réticule ;
//                    ← → ou molette ou glisser pour viser, ⏎ pour tirer le prompt.
// La liste classique devient un TIROIR de résultats (recherche → précision) et tout le moteur
// est conservé : prompts bilingues, favoris ⭐, récents, ✍️ personnalisés (éditeur, import
// glisser-déposer, presse-papiers), composeur, thèmes sombre/clair/contraste, FR/EN, ARIA.

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

// ---------- Édition (galaxie seule / pont seul / les deux — cf. <meta name="mgp-edition">) ----------
let EDITION = 'both';
try {
  const m = document.querySelector('meta[name="mgp-edition"]');
  if (m) { const v = (m.getAttribute('content') || '').trim(); if (v === 'galaxy' || v === 'bridge') EDITION = v; }
} catch (e) { /* sandbox : méta absente → both */ }
const HAS_GALAXY = EDITION !== 'bridge';
const HAS_BRIDGE = EDITION !== 'galaxy';

// ---------- État ----------
let THEME = localStorage.getItem('mgp.theme') || 'dark';
let CONTRAST = localStorage.getItem('mgp.contrast') === '1';
let LANG = localStorage.getItem('mgp.lang') || 'fr';
let VIEW = localStorage.getItem('mgp.view') || 'galaxy'; // 'galaxy' | 'bridge'

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
    hello: 'Bonjour !', results: 'Résultats', viewGalaxy: '🌌 Galaxie', viewBridge: '🛰 Pont',
    secAgents: 'Agents', secSkills: 'Skills', secCustom: 'Perso', secFavs: 'Favoris',
    targetEmpty: 'Cadran armé — ← → ou molette pour viser, Tab change de secteur',
    favEmpty: 'Aucun favori — ★ dans le tiroir, ou ⌥-clic sur une étoile',
    sectorEmpty: 'Secteur vide',    ghelp: '⌥-glisser tourner · molette zoom · clic tirer · ← → cibler · Tab carte d\'action · ⌥-clic ★ · ⌘-clic composer · double-clic recentrer',
    galTitle: 'Galaxie des skills & agents', bridgeTitle: 'Pont de commandement',
    pasted: (n) => `⚡ ${n} prompt(s) collé(s) depuis le presse-papiers`,
    imported: (n) => `⚡ ${n} prompt(s) importé(s)`,
    noFav: (n) => (n ? `⭐ Favori ${n} introuvable` : 'Pas de favori dans ce créneau'),
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
    hello: 'Hello!', results: 'Results', viewGalaxy: '🌌 Galaxy', viewBridge: '🛰 Bridge',
    secAgents: 'Agents', secSkills: 'Skills', secCustom: 'Custom', secFavs: 'Favorites',
    targetEmpty: 'Dial armed — ← → or wheel to aim, Tab switches sector',
    favEmpty: 'No favorites yet — ★ in the drawer, or ⌥-click a star',
    sectorEmpty: 'Empty sector',    ghelp: '⌥-drag orbit · wheel zoom · click fire · ← → target · Tab action card · ⌥-click ★ · ⌘-click compose · double-click recenter',
    galTitle: 'Skills & agents galaxy', bridgeTitle: 'Command bridge',
    pasted: (n) => `⚡ ${n} prompt(s) pasted from clipboard`,
    imported: (n) => `⚡ ${n} prompt(s) imported`,
    noFav: (n) => (n ? `⭐ Favorite ${n} not found` : 'No favorite in this slot'),
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

// ---------- DOM ----------
document.body.innerHTML = `
<div id="wrap">
  <header id="head">
    <div id="brand">
      <span id="logo" aria-hidden="true">⚡</span><span id="btitle">MEGA PACK <b>V3</b></span>
      ${HAS_BRIDGE && HAS_GALAXY ? `<span id="viewsel" role="tablist" aria-label="${LANG === 'fr' ? 'Choix de la vue' : 'View switch'}">
        <button class="vbtn" id="v-galaxy" role="tab" aria-selected="false"></button>
        <button class="vbtn" id="v-bridge" role="tab" aria-selected="false"></button>
      </span>` : ''}
      <span style="flex:1"></span>
      <button id="addc" title="${T().newPrompt}" aria-label="${T().newPrompt}">＋</button>
      <button id="theme" title="${T().theme}" aria-label="${T().theme}">🌙</button>
      <button id="ctrst" title="${T().contrast}" aria-label="${T().contrast}" aria-pressed="false">◐</button>
      <button id="lang" title="${T().lang}" aria-label="${T().lang}">FR</button>
    </div>
    <div id="searchrow">
      <span id="qico" aria-hidden="true">🔍</span>
      <input id="q" type="text" role="searchbox" aria-label="${T().ph}" placeholder="${T().ph}" autofocus
             autocomplete="off" spellcheck="false">
      <button id="clr" title="${T().searchClear}" aria-label="${T().searchClear}" hidden>✕</button>
    </div>
  </header>
  <div id="stage">
    <div id="onb" hidden><span id="onbtxt"></span><button id="onbx" aria-label="${LANG === 'fr' ? 'Fermer l’aide' : 'Dismiss help'}">✕</button></div>
    <canvas id="galaxy" aria-label="${T().galTitle}" role="img"></canvas>
    <div id="ghud">
      <span id="gcount" role="status" aria-live="polite"></span>
      <span id="ghelp"></span>
    </div>
    ${HAS_GALAXY ? `
    <div id="glegend" role="toolbar" aria-label="${LANG === 'fr' ? 'Filtres de secteurs' : 'Sector filters'}"></div>
    <div id="gcard" role="toolbar" aria-label="${LANG === 'fr' ? 'Actions sur l étoile ciblée' : 'Focused star actions'}" hidden>
      <b id="gcname"></b>
      <button id="gc-copy" class="gcbtn primary"></button>
      <button id="gc-open" class="gcbtn"></button>
      <button id="gc-gpt" class="gcbtn"></button>
      <button id="gc-fav" class="gcbtn" aria-pressed="false"></button>
      <button id="gc-sel" class="gcbtn"></button>
      <button id="gc-edit" class="gcbtn" hidden>✎</button>
      <button id="gc-x" class="gcbtn ghost" aria-label="${LANG === 'fr' ? 'Quitter la cible' : 'Drop target'}">✕</button>
    </div>` : ''}
    <div id="bridge" hidden>
      <svg id="bsvg" aria-hidden="true"></svg>
      <div id="bcore" aria-hidden="true"><span id="bclogo">⚡</span><b>MEGA PACK</b><b id="bctarget"></b><i id="bcstate"></i></div>
      <div id="reticle" aria-hidden="true">▼</div>
      <div id="dial"></div>
      <div id="bread" role="status" aria-live="polite"></div>
      ${HAS_BRIDGE ? `
      <div id="bfilter" role="toolbar" aria-label="${LANG === 'fr' ? 'Filtres du cadran' : 'Dial filters'}"></div>
      <div id="bacts" role="toolbar" aria-label="${LANG === 'fr' ? 'Actions sur la cible' : 'Target actions'}">
        <button id="ba-copy" class="babtn primary"></button>
        <button id="ba-open" class="babtn"></button>
        <button id="ba-gpt" class="babtn"></button>
        <button id="ba-fav" class="babtn" aria-pressed="false"></button>
      </div>` : ''}
    </div>
    <div id="overlay" role="region" aria-label="${T().results}">
      <div id="ovbar">
        <b id="ovtitle"></b>
        <span id="cnt" role="status" aria-live="polite"></span>
        <button id="ovclose" title="${LANG === 'fr' ? 'Revenir à la vue' : 'Back to view'}" aria-label="${LANG === 'fr' ? 'Revenir à la vue' : 'Back to view'}">✕</button>
      </div>
      <main id="list" role="listbox" aria-label="${T().results}"></main>
    </div>
  </div>
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

// ---------- CSS — design system Solana + mise en scène des deux vues ----------
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
#head{background:var(--bg2);border-bottom:1px solid var(--border);position:relative;z-index:30}
#brand{display:flex;align-items:center;gap:7px;padding:8px 12px 0}
#logo{font-size:14px;filter:drop-shadow(0 0 6px rgba(153,69,255,.8))}
#btitle{font-size:11px;font-weight:700;letter-spacing:.12em;color:var(--mut)}
#btitle b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
#viewsel{display:flex;gap:4px;margin-left:10px;background:var(--card);border:1px solid var(--border);border-radius:99px;padding:2px}
.vbtn{border:none;background:transparent;color:var(--mut);font:inherit;font-size:11px;font-weight:700;padding:3px 11px;border-radius:99px;cursor:pointer;transition:all .15s}
.vbtn:hover{color:var(--txt2)}
.vbtn.on{background:var(--gradsoft);color:var(--txt);box-shadow:inset 0 0 0 1px rgba(153,69,255,.4)}
#brand>span:nth-child(4){flex:1}
#searchrow button,#brand button{min-width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--txt2);cursor:pointer;font-size:12.5px;transition:transform .1s,border-color .15s}
#brand button:hover{border-color:var(--vio);transform:translateY(-1px)}
#addc{color:var(--acc2)!important;font-weight:700}
#lang{width:auto!important;padding:0 9px;font-weight:600}
#searchrow{display:flex;gap:6px;align-items:center;padding:7px 10px}
#qico{opacity:.55;font-size:12px}
#q{flex:1;background:var(--card);border:1.5px solid var(--border);color:var(--txt);padding:8px 11px;border-radius:10px;font-size:13.5px;outline:none;transition:border-color .15s,box-shadow .15s}
#q::placeholder{color:var(--mut)}
#q:focus{border-color:var(--vio);box-shadow:0 0 0 3px rgba(153,69,255,.22)}
#clr{background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px;padding:4px}

/* ── Scène (les deux vues vivent ici) ── */
#stage{position:relative;flex:1;min-height:0;overflow:hidden;background:transparent}
#v4frame svg{width:100%;height:100%;display:block}
#galaxy{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab}
#galaxy.drag{cursor:grabbing}
#ghud{position:absolute;left:10px;right:10px;bottom:6px;display:flex;gap:10px;align-items:baseline;pointer-events:none}
#gcount{font-size:11px;font-weight:700;color:var(--acc2);font-variant-numeric:tabular-nums}
#ghelp{margin-left:auto;font-size:10px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* ── Pont de commandement ── */
#galaxy{z-index:0}
#ghud{z-index:3}
#bcore{z-index:2}
#overlay{z-index:10}
#bridge{position:absolute;inset:0}
#bsvg{position:absolute;inset:0;width:100%;height:100%}
.arc{fill:none;stroke:var(--card3);stroke-width:30;stroke-linecap:round;cursor:pointer;transition:stroke .2s,opacity .2s;opacity:.75}
.arc:hover{opacity:1;stroke:var(--border2)}
.arc.on{opacity:1;stroke:url(#gradArc);filter:drop-shadow(0 0 8px rgba(153,69,255,.55))}
.alab{fill:var(--mut);font-size:11px;font-weight:700;text-anchor:middle;dominant-baseline:middle;pointer-events:none}
.arc.on+.alab{fill:var(--txt)}
#bcore{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:128px;height:128px;border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;text-align:center;
  background:radial-gradient(circle at 50% 32%,rgba(153,69,255,.28),var(--card) 68%);
  border:1.5px solid var(--border2);box-shadow:0 0 34px rgba(153,69,255,.28),inset 0 0 22px rgba(20,241,149,.07)}
#bcore b{font-size:10px;letter-spacing:.14em;color:var(--mut)}
#bctarget{font-size:11.5px;font-weight:700;color:var(--txt);max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#bclogo{font-size:26px;filter:drop-shadow(0 0 10px rgba(153,69,255,.9));animation:breathe 3.2s ease-in-out infinite}
#bcstate{font-style:normal;font-size:9px;color:var(--mut);font-variant-numeric:tabular-nums}
@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
#reticle{position:absolute;left:50%;transform:translateX(-50%);color:var(--acc2);font-size:13px;text-shadow:0 0 8px rgba(20,241,149,.9);pointer-events:none}
.chip{position:absolute;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;border:1.5px solid var(--border2);
  background:var(--card);color:var(--txt);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;
  font:inherit;font-size:9.5px;line-height:1.15;padding:2px;transition:border-color .15s,background .15s;user-select:none}
.chip .ce{font-size:15px;line-height:1}
.chip .cn{max-width:52px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.chip:hover{border-color:var(--vio);background:var(--card2)}
.chip.tgt{border-color:var(--acc2);box-shadow:0 0 16px rgba(20,241,149,.5);background:var(--card2)}
.chip.med{width:66px;height:66px;margin:-33px 0 0 -33px;background-size:100% 100%;background-position:center;background-repeat:no-repeat;border-color:transparent}
.chip.med .ce{display:none}
.chip.med .cn{margin-top:30px;font-size:9px;text-shadow:0 1px 4px rgba(0,0,0,.9)}
.chip.k-fav{border-color:rgba(245,197,24,.55)}
.chip.selc{outline:2px solid var(--acc2);outline-offset:1px}
#bread{position:absolute;left:12px;right:12px;bottom:8px;text-align:center;font-size:11px;color:var(--txt2);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
#bread b{color:var(--acc2)}
#bread .bd{color:var(--mut)}

/* ── Galaxie : légende cliquable + carte d'action de l'étoile ciblée ── */
#glegend{position:absolute;top:8px;left:10px;display:flex;gap:6px;flex-wrap:wrap;z-index:5;background:color-mix(in srgb,var(--bg2) 55%,transparent);backdrop-filter:blur(8px);border:1px solid var(--border);border-radius:14px;padding:5px 7px}
.glg{display:flex;gap:5px;align-items:center;border:1px solid var(--border);background:var(--card);color:var(--txt2);border-radius:99px;padding:3px 10px;font:inherit;font-size:10.5px;font-weight:600;cursor:pointer;transition:border-color .15s,color .15s}
.glg:hover{border-color:var(--border2);color:var(--txt)}
.glg.on{background:var(--gradsoft);border-color:var(--vio);color:var(--txt)}
.glg .dot{width:8px;height:8px;border-radius:50%}
#gcard{position:absolute;left:50%;bottom:40px;transform:translateX(-50%);display:flex;gap:6px;align-items:center;background:color-mix(in srgb,var(--card) 78%,transparent);backdrop-filter:blur(14px);border:1px solid var(--border2);border-radius:12px;padding:6px 10px;box-shadow:var(--shadow);z-index:6;max-width:94%}
#gcard[hidden]{display:none}
#onb{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:4;display:flex;gap:10px;align-items:center;background:linear-gradient(120deg,rgba(10,12,22,.88),rgba(10,12,22,.78));border:1px solid rgba(153,69,255,.45);backdrop-filter:blur(12px);border-radius:12px;padding:7px 12px;font-size:11px;color:var(--txt2);max-width:92%}
#onb[hidden]{display:none}
#onb b{color:var(--txt)}
#onbx{background:none;border:none;color:var(--mut);cursor:pointer;font-size:12px;padding:0}
#gcname{font-size:11.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px}
/* Boutons TECH & CLASS : bords visibles 1.5px, angles droits courts, majuscules espacées */
.gcbtn,.babtn{border:1.5px solid var(--border2);border-radius:7px;background:linear-gradient(180deg,color-mix(in srgb,var(--card) 90%,transparent),color-mix(in srgb,var(--card2) 90%,transparent));color:var(--txt2);font:inherit;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;white-space:nowrap;padding:7px 12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 2px 10px rgba(0,0,0,.35);transition:border-color .15s,transform .1s,box-shadow .15s}
.gcbtn:hover,.babtn:hover{border-color:var(--vio);color:var(--txt);transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 4px 16px rgba(153,69,255,.28)}
.gcbtn.primary,.babtn.primary{background:var(--grad);border-color:rgba(255,255,255,.24);color:#fff}
.gcbtn.ghost,.babtn.ghost{background:transparent;box-shadow:none}
.gcbtn{padding:5px 10px}

/* ── Pont : filtres du cadran + actions rapides sur la cible ── */
#bfilter{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:4px;align-items:flex-end;z-index:5;max-height:82%;overflow-y:auto;padding:7px 6px;background:color-mix(in srgb,var(--card) 62%,transparent);backdrop-filter:blur(10px);border:1px solid var(--border);border-radius:12px}
.bflt{text-align:left}
#bfilter:not(.open) .bflt{font-size:10.5px}
#bfilter:not(.open){padding:6px 8px}
.bflt{border:1px solid var(--border);background:var(--card);color:var(--txt2);border-radius:99px;padding:3px 10px;font:inherit;font-size:10px;font-weight:600;cursor:pointer;transition:border-color .15s,color .15s}
.bflt:hover{border-color:var(--border2);color:var(--txt)}
.bflt.on{background:var(--gradsoft);border-color:var(--vio);color:var(--txt)}
#bacts{position:absolute;left:50%;bottom:30px;transform:translateX(-50%);display:flex;gap:6px;z-index:6}
.babtn.favon{color:var(--amber)!important;border-color:rgba(245,197,24,.6)!important}
.chip{border-radius:12px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 4px 14px rgba(0,0,0,.45)}

/* ── Tiroir de résultats ── */
#overlay{position:absolute;inset:0;display:none;flex-direction:column;background:var(--bg);z-index:20}
#overlay.on{display:flex}
#ovbar{display:flex;gap:8px;align-items:center;padding:7px 10px;border-bottom:1px solid var(--border);background:var(--bg2)}
#ovtitle{font-size:11px;font-weight:800;letter-spacing:.1em;color:var(--mut);text-transform:uppercase}
#ovclose{margin-left:auto;min-width:26px;height:26px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--txt2);cursor:pointer;font-size:11px}
#ovclose:hover{border-color:var(--vio)}
#cnt{font-size:11px;color:var(--mut);font-variant-numeric:tabular-nums}
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
/* ── Verre natif : panneau translucide flottant au-dessus du bureau et des apps ── */
#wrap{background:transparent}
#head,#foot{background:color-mix(in srgb,var(--bg2) 74%,transparent);backdrop-filter:blur(20px) saturate(1.4)}
#stage{background:transparent}
#overlay{background:color-mix(in srgb,var(--bg) 84%,transparent);backdrop-filter:blur(16px)}
#ghud span,#gcount{text-shadow:0 1px 6px rgba(0,0,0,.85)}
body.contrast #wrap,body.contrast #stage{background:var(--bg)} /* contraste élevé : opacité pleine (VERA) */
body.light #head,body.light #foot{background:color-mix(in srgb,#f6f7fd 78%,transparent)}
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
  if ($('v-galaxy')) { $('v-galaxy').textContent = T().viewGalaxy; $('v-bridge').textContent = T().viewBridge; }
  if (HAS_GALAXY) buildLegend();
  $('ovtitle').textContent = T().results;
  $('ghelp').textContent = T().ghelp;
  $('btnopen2').textContent = T().openDef(LLM_LABEL[SYS.defaultLLM] || SYS.defaultLLM);
  $('btncopy').textContent = T().copy;
}

// ---------- Préférences système (favoris, récents, LLM par défaut) ----------
const SYS = (window.mgp.getPrefs && window.mgp.getPrefs()) || { favorites: [], recents: [], defaultLLM: 'claude' };
const FAVS = new Set(SYS.favorites || []);
const isFav = (name) => FAVS.has(name);
let CUSTOMS = (SYS.customs || []).slice(); // ✍️ prompts personnalisés (sync via IPC)

// Item complet + type depuis un nom ('custom' | true=agent | false=skill | null)
function findItem(name) {
  const c = CUSTOMS.find((x) => x.name === name);
  if (c) return { x: c, k: 'custom' };
  const a = A.find((x) => x.name === name);
  if (a) return { x: a, k: 'agent' };
  const s = S.find((x) => x.name === name);
  if (s) return { x: s, k: 'skill' };
  return null;
}
function promptOf(x, k) {
  return k === 'custom' ? (x.desc || x.name || '') : (k === 'agent' ? promptAgent(x) : promptSkill(x));
}

// ---------- Pool filtré partagé (tiroir + hyper-saut galaxie) ----------
function filteredPool(terms, mode) {
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
  return pool;
}

// ---------- Tiroir de résultats (la liste, en surimpression de la scène) ----------
let mode = 'all', sel = new Set(), results = [];
const overlayOpen = () => $('overlay').classList.contains('on');
function showOverlay() { $('overlay').classList.add('on'); updFoot(); }
function closeOverlay() {
  $('overlay').classList.remove('on');
  if (q.value) { q.value = ''; $('clr').hidden = true; }
  updFoot();
}

function render() {
  const terms = q.value.toLowerCase().split(/\s+/).filter(Boolean);
  $('clr').hidden = !q.value;
  const pool = filteredPool(terms, mode);
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
         aria-label="${ico} ${esc(lname(x))}${sel.has(x.name) ? (LANG === 'fr' ? ', sélectionné' : ', selected') : ''}"
         data-i="${i}" data-k="${esc(x.name)}" data-k2="${kind}">
      <span class="ick" aria-hidden="true">✓</span>
      <div class="ibd">
        <div class="ihd"><span class="nm">${ico} ${esc(lname(x))}</span>
          <span class="ct">${a === 'custom' ? esc(x.tag || (LANG === 'fr' ? 'perso' : 'custom')) : esc(x.category)}</span>
          ${a === 'custom' ? `<button class="ev" data-e="${esc(x.name)}" title="${T().edit}" aria-label="${T().edit}">✎</button>` : ''}
        </div>
        <div class="ds">${esc(ldesc(x))}</div>
      </div>
      <button class="fv ${isFav(x.name) ? 'on' : ''}" data-f="${esc(x.name)}"
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
        toggleFav(fb.dataset.f);
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

function toggleFav(name) {
  if (FAVS.has(name)) FAVS.delete(name); else FAVS.add(name);
  window.mgp.toggleFav && window.mgp.toggleFav(name);
  buildGalaxy(); // la constellation ⭐ se met à jour en direct
  render();
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
  buildGalaxy();
  if (mode === 'custom' || mode === 'all' || mode === 'fav') render();
};
$('e-del').onclick = () => {
  if (!editingName) return;
  window.mgp.customDelete && window.mgp.customDelete(editingName);
  CUSTOMS = CUSTOMS.filter((c) => c.name !== editingName);
  FAVS.delete(editingName);
  $('modal').style.display = 'none';
  buildGalaxy();
  render();
};
$('e-txt').addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('e-save').onclick();
  if (e.key === 'Escape') $('modal').style.display = 'none';
});
if (window.mgp.onEditCustom) window.mgp.onEditCustom((c) => openEditor(c)); // « ✎ Éditer » du menu ⚡

// ---------- 📥 Import .md/.txt (glisser-déposer) + 📋 collage direct ----------
document.addEventListener('dragover', (e) => e.preventDefault());
function importTexts(entries) { // [{name, text}] → customs ; renvoie le nombre importé
  let n = 0;
  for (const { name: fname, text } of entries) {
    try {
      const body = String(text || '').replace(/\r\n/g, '\n').trim().slice(0, 20000);
      if (!body) continue;
      const base = (String(fname).replace(/\.(md|txt)$/i, '').slice(0, 80)) || (LANG === 'fr' ? 'Prompt importé' : 'Imported prompt');
      let name = base, k = 2;
      while (CUSTOMS.some((c) => c.name === name)) name = `${base} (${k++})`; // pas d'écrasement
      const rec = { name, desc: body };
      window.mgp.customSave && window.mgp.customSave(rec);
      CUSTOMS.push(rec);
      n++;
    } catch (err) { /* fichier illisible : ignoré */ }
  }
  if (n) {
    mode = 'custom';
    showOverlay();
    render();
    buildGalaxy();
  }
  return n;
}
document.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = [...((e.dataTransfer && e.dataTransfer.files) || [])].filter((f) => /\.(md|txt)$/i.test(f.name));
  if (!files.length) return;
  (async () => {
    const entries = [];
    for (const f of files) { try { entries.push({ name: f.name, text: await f.text() }); } catch (err) { /* ignoré */ } }
    const n = importTexts(entries);
    if (n) flash(T().imported(n));
  })();
});
// 📋 Coller directement un ou plusieurs prompts (séparés par --- ou lignes vides doubles)
document.addEventListener('paste', (e) => {
  if (document.activeElement === q || $('modal').style.display === 'flex') return;
  const cd = (window.navigator && navigator.clipboard) ? navigator.clipboard : null;
  if (!cd || !cd.readText) return;
  cd.readText().then((raw) => {
    const chunks = String(raw || '').split(/\n---\n|\n\n{1}/).map((s) => s.trim()).filter((s) => s.length > 3);
    if (!chunks.length) return;
    const n = importTexts(chunks.map((t, i) => ({ name: (LANG === 'fr' ? 'Collé ' : 'Pasted ') + (i + 1), text: t })));
    if (n) flash(T().pasted(n));
  }).catch(() => {});
});

// ---------- 🌌 GALAXIE 3D — constellation navigable ----------
const gal = $('galaxy');
let G = null; // contexte 2d (absent en sandbox de test)
try { if (gal && typeof gal.getContext === 'function') G = gal.getContext('2d'); } catch (e) { G = null; }
const raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame : () => 0;

// secteurs 3D : agents (anneau vert), skills (anneau violet), ✍️ (disque central bas), ⭐ (constellation polaire)
const SECT3D = {
  agent: { col: '#14f195', r0: 1.85, r1: 2.55 }, // agents : anneau EXTÉRIEUR vert
  skill: { col: '#9945ff', r0: 0.95, r1: 1.65 }, // skills : anneau INTÉRIEUR violet
  custom: { col: '#f5c518', r0: 0.12, r1: 0.55 }, // ✍️ perso : disque central
};
function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) { h ^= String(str).charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
let GAL = []; // nœuds : { x(item), k, kind, p:{x,y,z}, hit, selc }
function buildGalaxy() {
  const nodes = [];
  const mk = (x, k) => {
    const sec = SECT3D[k];
    const th = hash01(x.name) * Math.PI * 2;
    const flat = Math.pow(hash01(x.name + ':r'), 0.72);
    const r = sec.r0 + flat * (sec.r1 - sec.r0);
    const y = (hash01(x.name + ':y') - 0.5) * 1.1 - (k === 'custom' ? 0.55 : 0);
    nodes.push({ x, k, p: { x: Math.cos(th) * r, y, z: Math.sin(th) * r }, hit: false, selc: sel.has(x.name) });
  };
  S.forEach((x) => mk(x, 'skill'));
  A.forEach((x) => mk(x, 'agent'));
  CUSTOMS.forEach((x) => mk(x, 'custom'));
  // ⭐ constellation polaire : anneau au-dessus du plan
  const favItems = [...FAVS].map((n) => findItem(n)).filter(Boolean).slice(0, 14);
  favItems.forEach((f, i) => {
    const th = (i / Math.max(1, favItems.length)) * Math.PI * 2 + 0.35;
    const r = 0.55 + hash01(f.x.name + ':f') * 0.5;
    nodes.push({ x: f.x, k: f.k, fav: true, p: { x: Math.cos(th) * r, y: 1.15, z: Math.sin(th) * r }, hit: false, selc: sel.has(f.x.name) });
  });
  GAL = nodes;
  if (VIEW === 'galaxy') updGCount();
  buildLegend();
}
let gFilter = null; // légende : secteur isolé ('skill' | 'agent' | 'custom' | 'fav')
function buildLegend() {
  const el = $('glegend'); if (!el) return;
  const defs = [
    { k: 'skill', col: '#9945ff', lab: `🛠 ${T().secSkills}` },
    { k: 'agent', col: '#14f195', lab: `👥 ${T().secAgents}` },
    { k: 'custom', col: '#f5c518', lab: `✍️ ${T().secCustom}` },
    { k: 'fav', col: '#f5c518', lab: `⭐ ${T().secFavs}` },
  ];
  el.innerHTML = defs.map((d) => `<button class="glg ${gFilter === d.k ? 'on' : ''}" data-g="${d.k}" aria-pressed="${gFilter === d.k}"><span class="dot" style="background:${d.col}"></span>${esc(d.lab)}</button>`).join('');
  el.querySelectorAll('.glg').forEach((b) => {
    b.onclick = () => { gFilter = gFilter === b.dataset.g ? null : b.dataset.g; buildLegend(); updGCount(); };
  });
}
function cardSet(node) { // carte d'action de l'étoile ciblée
  const c = $('gcard'); if (!c || !node) return;
  const fav = isFav(node.x.name);
  $('gcname').textContent = lname(node.x);
  $('gcname').title = ldesc(node.x).slice(0, 160);
  $('gc-copy').textContent = T().copy;
  $('gc-open').textContent = T().openDef(LLM_LABEL[SYS.defaultLLM] || SYS.defaultLLM);
  $('gc-gpt').textContent = T().openGpt;
  $('gc-fav').textContent = fav ? '★' : '☆';
  $('gc-fav').setAttribute('aria-pressed', String(fav));
  $('gc-fav').title = fav ? T().favOn : T().favOff;
  $('gc-sel').textContent = sel.has(node.x.name) ? (LANG === 'fr' ? '✚ retirer' : '✚ remove') : (LANG === 'fr' ? '✚ composer' : '✚ compose');
  $('gc-edit').hidden = node.k !== 'custom';
  c.hidden = false;
}
function hideCard() { const c = $('gcard'); if (c) c.hidden = true; }
const cam = { rotX: -0.58, rotY: 0.35, zoom: 1, zoomT: 1, tx: 0, ty: 0.05, tz: 0 };
const STARS = Array.from({ length: 430 }, (_, i) => ({
  x: (hash01('sx' + i) - 0.5) * 7,
  y: (hash01('sy' + i) - 0.5) * 4.6,
  z: (hash01('sz' + i) - 0.5) * 7,
  tw: 0.4 + hash01('st' + i) * 1.6,
  ph: hash01('sp' + i) * Math.PI * 2,
  hue: hash01('sh' + i),
}));
let PARTS = []; // particules d'activation {sx,sy,vx,vy,life,col}
let gFocused = null; // étoile ciblée au clavier
let dragGal = null;

function proj3(p, W, H) {
  let x = p.x - cam.tx, y = p.y - cam.ty, z = p.z - cam.tz;
  const cy1 = Math.cos(cam.rotY), sy1 = Math.sin(cam.rotY);
  const x1 = x * cy1 - z * sy1, z1 = x * sy1 + z * cy1;
  const cx1 = Math.cos(cam.rotX), sx1 = Math.sin(cam.rotX);
  const y1 = y * cx1 - z1 * sx1, z2 = y * sx1 + z1 * cx1;
  const K = Math.min(W, H) / 3.1;
  const f = (3.1 / Math.max(0.28, z2 + 3.1)) * cam.zoom;
  return { sx: W / 2 + x1 * f * K, sy: H / 2 - y1 * f * K, f };
}
function termList() { return q.value.toLowerCase().split(/\s+/).filter(Boolean); }
function updGCount() {
  const terms = termList();
  let hits = 0;
  for (const n of GAL) {
    n.dim = !!gFilter && n.k !== gFilter; // légende : secteurs hors filtre estompés
    if (!terms.length) { n.hit = false; continue; } // recherche vide : aucun signal
    const hay = (n.x.name + ' ' + (n.x.name_fr || '') + ' ' + (n.x.desc || '') + ' ' + (n.x.desc_fr || '') + ' ' + (n.x.category || n.x.tag || '') + ' favori').toLowerCase();
    n.hit = terms.every((w) => hay.includes(w));
    if (n.hit) hits++;
  }
  $('gcount').textContent = terms.length
    ? `${LANG === 'fr' ? 'signaux' : 'signals'} ${hits}/${GAL.length}`
    : `${GAL.length} ${LANG === 'fr' ? 'étoiles' : 'stars'} · ${sel.size} ${T().sel}`;
  return GAL.filter((n) => n.hit);
}
function drawGalaxy() {
  const W = gal.clientWidth || 560, H = gal.clientHeight || 480;
  if (gal.width !== W * devicePixelRatioSafe() || gal.height !== H * devicePixelRatioSafe()) {
    gal.width = W * devicePixelRatioSafe(); gal.height = H * devicePixelRatioSafe();
  }
  const g = G, dpr = devicePixelRatioSafe();
  cam.zoom += (cam.zoomT - cam.zoom) * 0.085;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const dark = THEME !== 'light';
  g.clearRect(0, 0, W, H); // fond transparent : la galaxie flotte au-dessus du bureau et des apps
  g.fillStyle = dark ? 'rgba(7,9,15,.62)' : 'rgba(246,247,253,.66)'; // voile dense : lisibilité avant tout (VERA)
  g.fillRect(0, 0, W, H);
  // nébuleuses SVG Groq en PARALLAXE (dérive à la rotation, ancrées dans l'espace 3D) — sinon dégradés (fallback)
  const nebSVG = (im, wx, wy, size) => {
    const p = proj3({ x: wx, y: -0.25, z: wy }, W, H);
    const s2 = size * (0.75 + cam.zoom * 0.35);
    g.globalAlpha = dark ? 0.5 : 0.42;
    g.drawImage(im, p.sx - s2 / 2, p.sy - s2 / 2, s2, s2);
    g.globalAlpha = 1;
  };
  if (SVG_NEB[1]) nebSVG(SVG_NEB[1], -1.4, -1.1, W * 0.85);
  if (SVG_NEB[2]) nebSVG(SVG_NEB[2], 1.5, 1.2, W * 0.95);
  if (!SVG_NEB[1] || !SVG_NEB[2]) {
    const neb = (x, y, r, c) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, c); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    neb(W * 0.22, H * 0.3, W * 0.4, dark ? 'rgba(153,69,255,.13)' : 'rgba(153,69,255,.10)');
    neb(W * 0.8, H * 0.75, W * 0.42, dark ? 'rgba(20,241,149,.08)' : 'rgba(20,241,149,.07)');
    neb(W * 0.55, H * 0.12, W * 0.3, dark ? 'rgba(70,110,255,.07)' : 'rgba(70,110,255,.06)');
  }
  // champ d'étoiles
  const t = Date.now() / 1000;
  for (const s2 of STARS) {
    const p = proj3(s2, W, H);
    if (p.sx < -8 || p.sx > W + 8 || p.sy < -8 || p.sy > H + 8) continue;
    const a = (dark ? 0.22 : 0.16) + 0.4 * Math.abs(Math.sin(t * s2.tw + s2.ph));
    g.fillStyle = s2.hue > 0.92 ? `rgba(153,69,255,${a})` : (s2.hue < 0.06 ? `rgba(20,241,149,${a})` : (dark ? `rgba(210,220,255,${a})` : `rgba(40,55,110,${a})`));
    const r2 = 0.7 + p.f * 0.9;
    g.beginPath(); g.arc(p.sx, p.sy, r2, 0, 6.2832); g.fill();
  }
  // anneaux de secteurs (orbites suggérées)
  g.lineWidth = 1;
  g.setLineDash([3, 6]);
  for (const key of ['skill', 'agent']) {
    const sec = SECT3D[key];
    g.strokeStyle = dark ? 'rgba(153,69,255,.15)' : 'rgba(90,80,200,.10)';
    if (key === 'agent') g.strokeStyle = dark ? 'rgba(20,241,149,.15)' : 'rgba(10,140,105,.10)';
    for (const rr of [sec.r0, sec.r1]) {
      g.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a2 = (i / 64) * Math.PI * 2;
        const p = proj3({ x: Math.cos(a2) * rr, y: 0, z: Math.sin(a2) * rr }, W, H);
        i ? g.lineTo(p.sx, p.sy) : g.moveTo(p.sx, p.sy);
      }
      g.stroke();
    }
  }
  g.setLineDash([]);
  // étiquettes orbitales : tournent lentement et expliquent chaque anneau
  const zoneLab = (rr, txt, col) => {
    const a2 = (Date.now() / 8000) % (Math.PI * 2);
    const p = proj3({ x: Math.cos(a2) * rr, y: 0.02, z: Math.sin(a2) * rr }, W, H);
    g.font = 'bold 10.5px -apple-system,sans-serif'; g.textAlign = 'center';
    g.lineWidth = 3; g.strokeStyle = dark ? 'rgba(7,9,15,.9)' : 'rgba(246,247,253,.9)';
    g.strokeText(txt, p.sx, p.sy); g.fillStyle = col; g.fillText(txt, p.sx, p.sy);
  };
  zoneLab((SECT3D.skill.r0 + SECT3D.skill.r1) / 2, `🛠 ${T().secSkills.toUpperCase()} · ${S.length}`, '#a86bff');
  zoneLab((SECT3D.agent.r0 + SECT3D.agent.r1) / 2 + 0.12, `👥 ${T().secAgents.toUpperCase()} · ${A.length}`, '#2ee59d');
  // constellation ⭐ : lignes entre favoris
  const favs = GAL.filter((n) => n.fav);
  if (favs.length > 1) {
    g.strokeStyle = dark ? 'rgba(245,197,24,.28)' : 'rgba(160,120,0,.30)';
    g.beginPath();
    let prev = null;
    for (const n of favs) {
      const p = proj3(n.p, W, H);
      if (prev) { g.moveTo(prev.sx, prev.sy); g.lineTo(p.sx, p.sy); }
      prev = p;
    }
    g.stroke();
  }
  // nœuds (triés : loin → près) — sprites vectoriels si chargés, sinon cercles
  const nodes = GAL.map((n) => ({ n, p: proj3(n.p, W, H) })).sort((a2, b2) => b2.p.f - a2.p.f);
  const labels = [];
  for (const { n, p } of nodes) {
    if (p.sx < -30 || p.sx > W + 30 || p.sy < -30 || p.sy > H + 30) continue;
    const col = n.fav ? '#f5c518' : SECT3D[n.k].col;
    g.globalAlpha = n.dim && !n.hit ? 0.18 : 1;
    const base = n.fav ? 4.6 : (n.k === 'custom' ? 3.6 : 2.9);
    const r2 = (base + (n.hit ? 1.6 : 0) + (n.selc ? 1.2 : 0)) * p.f * (0.8 + cam.zoom * 0.25);
    const isTarget = gFocused === n;
    const sprite = SVG_STARS[n.fav ? 'fav' : n.k];
    if (sprite) { // étoile vectorielle Groq : taille pilotée par la profondeur (grosse de près, fine au loin)
      const sz = r2 * 9;
      g.drawImage(sprite, p.sx - sz / 2, p.sy - sz / 2, sz, sz);
    } else {
      // halo
      const glow = g.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r2 * 4);
      glow.addColorStop(0, col + (n.hit || isTarget ? '66' : '33'));
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = glow;
      g.beginPath(); g.arc(p.sx, p.sy, r2 * 4, 0, 6.2832); g.fill();
      // cœur
      g.fillStyle = col;
      g.beginPath(); g.arc(p.sx, p.sy, r2, 0, 6.2832); g.fill();
    }
    if (n.fav) { g.fillStyle = dark ? '#07090f' : '#eef0fa'; g.font = `${Math.max(7, r2 * 2.4)}px system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('★', p.sx, p.sy + 0.5); }
    if (n.selc || isTarget) {
      g.strokeStyle = isTarget ? '#ffffff' : 'rgba(20,241,149,.9)';
      g.lineWidth = isTarget ? 2 : 1.5;
      g.beginPath(); g.arc(p.sx, p.sy, r2 + 4 + (isTarget ? Math.sin(t * 5) * 1.4 : 0), 0, 6.2832); g.stroke();
    }
    if (n.fav || n.hit || isTarget || n === gHover) labels.push({ p, txt: lname(n.x), col }); // VERA : jamais plus de 24 noms, zéro sous-titre en masse
    g.globalAlpha = 1;
  }
  // étiquettes (dernier plan) : ANTI-COLLISION stricte — 24 max, jamais 2 qui se chevauchent
  const taken = [];
  const fits = (x, y, w2) => taken.every((t) => Math.abs(t.x - x) > (t.w + w2) / 2 + 6 || Math.abs(t.y - y) > 16);
  g.font = '10.5px -apple-system,sans-serif'; g.textAlign = 'center';
  let shown = 0;
  for (const { p, txt, col } of labels) {
    if (shown >= 24) break;
    if (p.sx < 40 || p.sx > W - 40 || p.sy < 50 || p.sy > H - 40) continue;
    const w2 = g.measureText(txt).width;
    if (!fits(p.sx, p.sy - 13, w2)) continue;
    const y = p.sy - 13;
    g.lineWidth = 3.5; g.strokeStyle = dark ? 'rgba(10,12,20,.92)' : 'rgba(248,250,255,.95)';
    g.strokeText(txt, p.sx, y);
    g.fillStyle = col; g.fillText(txt, p.sx, y);
    taken.push({ x: p.sx, y, w: w2 });
    shown++;
  }
  // particules
  PARTS = PARTS.filter((pt) => pt.life > 0);
  for (const pt of PARTS) {
    pt.sx += pt.vx; pt.sy += pt.vy; pt.vy += 0.05; pt.life -= 0.025;
    g.fillStyle = pt.col + Math.max(0, Math.round(pt.life * 255)).toString(16).padStart(2, '0');
    g.beginPath(); g.arc(pt.sx, pt.sy, 2, 0, 6.2832); g.fill();
  }
}
function devicePixelRatioSafe() {
  try { return window.devicePixelRatio || 1; } catch (e) { return 1; }
}
function paintLoop() {
  if (VIEW === 'galaxy' && G && !$('overlay').classList.contains('on')) drawGalaxy();
  raf(paintLoop);
}
function burst(sx, sy, col) {
  for (let i = 0; i < 16; i++) {
    const a2 = Math.random() * Math.PI * 2, v = 1 + Math.random() * 2.6;
    PARTS.push({ sx, sy, vx: Math.cos(a2) * v, vy: Math.sin(a2) * v - 1.2, life: 1, col });
  }
}
function focusNode(n) {
  if (!n) return;
  gFocused = n;
  cam.tx = n.p.x * 0.55; cam.ty = n.p.y * 0.55; cam.tz = n.p.z * 0.55;
  cam.zoomT = 1.75;
  updGCount();
  cardSet(n); // la carte d'action suit l'étoile ciblée
}
function galaxyHit(sx, sy) {
  const W = gal.clientWidth || 560, H = gal.clientHeight || 480;
  const proj = GAL.map((n) => ({ n, p: proj3(n.p, W, H) })).sort((a2, b2) => a2.p.f - b2.p.f); // près d'abord
  for (const { n, p } of proj) {
    const r2 = Math.max(11, 14 * p.f);
    if ((sx - p.sx) ** 2 + (sy - p.sy) ** 2 < r2 * r2) return { n, p };
  }
  return null;
}
// interactions souris/touchpad (uniquement si canvas réel)
if (G) {
  gal.addEventListener('mousedown', (e) => { dragGal = { x: e.clientX, y: e.clientY, moved: false }; gal.classList.add('drag'); });
  window.addEventListener('mousemove', (e) => {
    if (!dragGal) { if (VIEW === 'galaxy') { const h = galaxyHit(e.offsetX, e.offsetY); gHover = h ? h.n : null; } return; }
    const dx = e.clientX - dragGal.x, dy = e.clientY - dragGal.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragGal.moved = true;
    cam.rotY += dx * 0.005;
    cam.rotX = Math.max(-1.45, Math.min(0.4, cam.rotX + dy * 0.004));
    dragGal.x = e.clientX; dragGal.y = e.clientY;
  });
  window.addEventListener('mouseup', (e) => {
    if (!dragGal) return;
    const wasDrag = dragGal.moved;
    dragGal = null; gal.classList.remove('drag');
    if (wasDrag) return;
    const h = galaxyHit(e.offsetX, e.offsetY);
    if (!h) return;
    if (e.altKey) { toggleFav(h.n.x.name); burst(h.p.sx, h.p.sy, '#f5c518'); return; }
    if (e.metaKey || e.ctrlKey) {
      sel.has(h.n.x.name) ? sel.delete(h.n.x.name) : sel.add(h.n.x.name);
      buildGalaxy(); burst(h.p.sx, h.p.sy, '#14f195'); updFoot(); return;
    }
    activate({ x: h.n.x, a: h.n.k === 'custom' ? 'custom' : h.n.k === 'agent' }, null);
    burst(h.p.sx, h.p.sy, h.n.fav ? '#f5c518' : SECT3D[h.n.k].col);
    cardSet(h.n); // clic sur une étoile → carte d'action explicite
    if (q.value) { q.value = ''; $('clr').hidden = true; updGCount(); } // le tir éteint la recherche
  });
  gal.addEventListener('wheel', (e) => {
    e.preventDefault();
    const f = Math.exp(-(e.deltaY || 0) * 0.0009); // zoom doux : ~9 % par cran de souris, ~1 % par geste trackpad
    cam.zoomT = Math.max(0.5, Math.min(3, cam.zoomT * f));
  }, { passive: false });
  gal.addEventListener('dblclick', () => { cam.tx = 0; cam.ty = 0.05; cam.tz = 0; cam.zoomT = 1; gFocused = null; });
}
let gHover = null;

// ---------- 🛰 PONT DE COMMANDEMENT — HUD radial + cadran orbital ----------
const BR = HAS_BRIDGE ? { svg: $('bsvg'), dial: $('dial'), bread: $('bread'), sector: null, filter: null, items: [], idx: 0, base: 0, chips: [] } : { sector: null, filter: null, items: [], idx: 0, base: 0, chips: [] };
const BR_STEP = (Math.PI * 2) / 11 * 0.82; // pas angulaire du cadran à fenêtre (11 slots visibles)
const BR_SECTORS = [
  { key: 'agents', ik: 'agent', ico: '👥', lab: () => T().secAgents },
  { key: 'skills', ik: 'skill', ico: '🛠', lab: () => T().secSkills },
  { key: 'custom', ik: 'custom', ico: '✍️', lab: () => T().secCustom },
  { key: 'favs', ik: 'fav', ico: '⭐', lab: () => T().secFavs },
];
function sectorItems(key) {
  let items = [];
  if (key === 'agents') items = A.map((x) => ({ x, k: 'agent' }));
  else if (key === 'skills') items = S.map((x) => ({ x, k: 'skill' }));
  else if (key === 'custom') items = CUSTOMS.map((x) => ({ x, k: 'custom' }));
  else if (key === 'favs') items = [...FAVS].map((n) => findItem(n)).filter(Boolean).slice(0, 40);
  if (BR.filter) items = items.filter((it) => (it.x.category || it.x.tag || '') === BR.filter); // filtre catégorie
  return items;
}
function buildBFilter() { // puces de catégories réelles du catalogue — colonne repliable (repliée par défaut)
  const f = $('bfilter'); if (!f) return;
  let open = false;
  try { open = sessionStorage.getItem('mgp.bfilter') === '1'; } catch (e) {}
  f.classList.toggle('open', open || !!BR.filter); // un filtre actif force l'ouverture
  const cats = [...new Set([...A, ...S].map((x) => x.category || '').filter(Boolean))].sort((a2, b2) => a2.localeCompare(b2)).slice(0, 11);
  const mk = (val, lab, zero) => `<button class="bflt ${BR.filter === val ? 'on' : ''}" ${zero ? 'data-c0="1"' : `data-c="${esc(val)}"`}>${esc(lab)}</button>`;
  f.innerHTML = mk('', BR.filter ? '✕ tout' : (LANG === 'fr' ? 'filtres ▾' : 'filters ▾'), true) + (open || BR.filter ? cats.map((c) => mk(c, c, false)).join('') : '');
  f.querySelectorAll('.bflt').forEach((b) => {
    b.onclick = () => {
      if (b.dataset.c0 && !BR.filter) { // le bouton-racine bascule l'ouverture
        try { sessionStorage.setItem('mgp.bfilter', open ? '0' : '1'); } catch (e) {}
        buildBFilter();
        return;
      }
      BR.filter = b.dataset.c0 ? null : (BR.filter === b.dataset.c ? null : b.dataset.c);
      buildBFilter();
      selectSector(BR.sector || 'agents');
    };
  });
}
function updateBActs() { // barre d'actions rapides sur la cible
  const bar = $('bacts'); if (!bar) return;
  const t = BR.items[BR.idx];
  bar.style.display = t ? 'flex' : 'none';
  if (!t) return;
  const fav = isFav(t.x.name);
  $('ba-copy').textContent = T().copy;
  $('ba-open').textContent = T().openDef(LLM_LABEL[SYS.defaultLLM] || SYS.defaultLLM);
  $('ba-gpt').textContent = T().openGpt;
  $('ba-fav').textContent = fav ? '★' : '☆';
  $('ba-fav').setAttribute('aria-pressed', String(fav));
  $('ba-fav').classList.toggle('favon', fav);
}
function bridgeFire(target, llm) { // tir d'une cible : copie simple ou ouverture LLM
  if (!target) return;
  const p = promptOf(target.x, target.k);
  if (llm) window.mgp.openLLM(llm, p);
  else { window.mgp.copy(p); window.mgp.addRecent && window.mgp.addRecent(target.x.name); }
}
function angNorm(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
function arcPath(cx, cy, r, a1, a2) {
  const p1x = cx + r * Math.sin(a1), p1y = cy - r * Math.cos(a1);
  const p2x = cx + r * Math.sin(a2), p2y = cy - r * Math.cos(a2);
  const large = (a2 - a1) > Math.PI ? 1 : 0;
  return `M ${p1x.toFixed(1)} ${p1y.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
}
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const itEmoji = (k) => (k === 'custom' ? '✍️' : k === 'agent' ? '👤' : k === 'fav' ? '⭐' : '🛠');
function buildBridge() {
  $('bcstate').textContent = `${S.length} 🛠 · ${A.length} 👤 · ${CUSTOMS.length} ✍️ · ${FAVS.size} ⭐`;
  const W = $('stage').clientWidth || 560, H = $('stage').clientHeight || 480;
  BR.cx = W / 2; BR.cy = H / 2 + 6;
  BR.R = Math.max(120, Math.min(W, H) / 2 - 130); // rayon du cadran : anneau 360° + marge pour bread/actions en bas
  BR.Ra = BR.R * 0.56;                           // rayon des arcs-secteurs
  BR.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  BR.svg.style.width = W + 'px'; BR.svg.style.height = H + 'px';
  const defs = `<defs><linearGradient id="gradArc" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#9945ff"/><stop offset="1" stop-color="#14f195"/></linearGradient></defs>`;
  const span = Math.PI / 2 - 0.5;
  const quads = [Math.PI / 4 + 0.12, 3 * Math.PI / 4 - 0.12, 5 * Math.PI / 4 + 0.12, 7 * Math.PI / 4 - 0.12]; // diagonales : le cadre habille les 4 coins, le bas respire
  let svg = defs;
  BR_SECTORS.forEach((s2, i) => {
    const a1 = quads[i], a2 = quads[i] + span;
    const mid = a1 + span / 2;
    const n = sectorItems(s2.key).length;
    if (SVGOK.arc) { // emblème vectoriel Groq GRAVÉ sous la ligne (zero surcharge)
      svg += `<image href="assets/bridge-arc.svg" x="${(BR.cx + (BR.Ra + 18) * Math.sin(a1)).toFixed(1)}" y="${(BR.cy - (BR.Ra + 18) * Math.cos(a1)).toFixed(1)}" width="74" height="74" opacity="0.42" transform="rotate(${(mid * 180 / Math.PI).toFixed(1)} ${(BR.cx + (BR.Ra + 18) * Math.sin(a1)).toFixed(1)} ${(BR.cy - (BR.Ra + 18) * Math.cos(a1)).toFixed(1)})"/>`;
    }
    svg += `<path class="arc ${BR.sector === s2.key ? 'on' : ''}" data-s="${s2.key}" role="button" tabindex="0"
      aria-label="${s2.lab()} (${n})" d="${arcPath(BR.cx, BR.cy, BR.Ra, a1, a2)}"></path>`;
    const lx = BR.cx + (BR.Ra - 28) * Math.sin(mid), ly = BR.cy - (BR.Ra - 28) * Math.cos(mid);
    svg += `<text class="alab" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}">${s2.ico} ${n}</text>`;
  });
  BR.svg.innerHTML = svg;
  BR.svg.querySelectorAll('.arc').forEach((p) => {
    p.onclick = () => selectSector(p.dataset.s);
  });
  $('reticle').style.top = (BR.cy - BR.R - 22) + 'px';
  buildBFilter();
  updateBActs();
  // cadran à FENÊTRE : seules 11 chips visibles (±5 autour de la cible) — fini la soupe
  // (les chips ne sont CRÉÉES qu'ici — jamais réécrites pendant la rotation : fini le clignotement)
  BR.dial.innerHTML = '';
  BR.chips = [];
  const mkChip = (it) => {
    const b = document.createElement('button');
    b.className = 'chip k-' + it.k;
    b.onclick = (ev) => {
      if (ev.altKey) { toggleFav(b.dataset.n); drawDial(); return; }
      if (ev.metaKey || ev.ctrlKey) { sel.has(b.dataset.n) ? sel.delete(b.dataset.n) : sel.add(b.dataset.n); updFoot(); drawDial(); return; }
      dialFire();
    };
    return b;
  };
  if (BR.items.length) {
    BR.dial.appendChild(mkChip(BR.items[0]));
    BR.chips = [BR.dial.lastChild];
    for (let d = 1; d <= 5; d++) {
      for (const s2 of [1, -1]) {
        const it = BR.items[d % BR.items.length];
        if (!it) continue;
        const b = mkChip(it);
        BR.dial.appendChild(b);
        BR.chips.push(b);
      }
    }
  }
  $('bcstate').textContent = BR.items.length
    ? `${BR_SECTORS.find((s2) => s2.key === BR.sector)?.lab() || ''} · ${BR.items.length}`
    : `${S.length} 🛠 · ${A.length} 👤 · ${CUSTOMS.length} ✍️ · ${FAVS.size} ⭐`;
  drawDial();
}
function selectSector(key) {
  BR.sector = key;
  BR.items = sectorItems(key);
  BR.base = 0; BR.idx = 0;
  buildBridge();
}
function drawDial() {
  const n = BR.items.length;
  if (!n) {
    BR.bread.innerHTML = BR.sector === 'favs' ? T().favEmpty : (BR.sector ? T().sectorEmpty : T().targetEmpty);
    if ($('bacts')) $('bacts').style.display = 'none';
    if ($('bctarget')) $('bctarget').textContent = '';
    return;
  }
  // la cible est dérivée de la base de rotation (← →, molette, glisser pilotent BR.base)
  // pos = position NON modulée de la fenêtre : l'angle DOIT être calculé sur pos, pas sur
  // l'index modulé — sinon après ~7 crans de molette la fenêtre dérive et toutes les
  // chips sortent du cadran (la cible disparaît). Bug visible à la molette rapide.
  // ANNEAU 360° : les 11 slots font le tour complet du cadran (fenêtre ±5 autour de la
  // cible) — la moitié basse n'est plus vide, l'instrument vit sur tout le cercle.
  const pos = Math.round(-BR.base / BR_STEP);
  BR.idx = ((pos % n) + n) % n;
  const order = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5];
  order.forEach((d, wi) => {
    const chip = BR.chips[wi];
    if (!chip) return;
    const it = BR.items[(((pos + d) % n) + n) % n];
    if (!it) { chip.style.display = 'none'; return; }
    // contenu mis à jour SEULEMENT si l'item a changé (zéro réécriture → zéro scintillement)
    if (chip.dataset.n !== it.x.name) {
      chip.dataset.n = it.x.name;
      chip.className = 'chip k-' + it.k;
      chip.title = lname(it.x) + ' — ' + ldesc(it.x).slice(0, 140);
      chip.setAttribute('aria-label', lname(it.x));
      chip.innerHTML = `<span class="ce">${itEmoji(it.k)}</span><span class="cn">${esc(lname(it.x))}</span>`;
    }
    const a2 = angNorm(BR.base + (pos + d) * BR_STEP);
    const depth = Math.abs(a2) / Math.PI; // 0 = cible (haut) → 1 = opposé (bas) : pleine profondeur sur 360°
    const sx = BR.cx + BR.R * Math.sin(a2);
    const sy = BR.cy - BR.R * Math.cos(a2);
    chip.style.display = 'flex';
    chip.style.left = sx + 'px';
    chip.style.top = sy + 'px';
    chip.style.transform = `scale(${(1 - depth * 0.38).toFixed(3)})`;
    chip.style.opacity = (d === 0 ? 1 : 0.94 - depth * 0.55).toFixed(2);
    chip.style.zIndex = String(100 - Math.round(depth * 50));
    chip.style.filter = depth > 0.55 ? `brightness(${(1 - (depth - 0.55) * 0.7).toFixed(2)})` : ''; // les chips du bas s'enfoncent dans l'ombre
    chip.classList.toggle('tgt', d === 0);
    chip.classList.toggle('selc', sel.has(it.x.name));
    const med = SVGOK.chips[it.k]; // médaillon vectoriel Groq (octogone par type) — sinon chip classique
    chip.classList.toggle('med', !!med);
    if (med) chip.style.backgroundImage = `url('assets/chip-${it.k}.svg')`; else chip.style.backgroundImage = '';
  });
  const tgt = BR.items[BR.idx];
  const cat = tgt.x.category || tgt.x.tag || '';
  $('bctarget').textContent = `🎯 ${lname(tgt.x)}`; // la cible VIT au cœur du HUD
  BR.bread.innerHTML = `<b>${itEmoji(tgt.k)} ${esc(lname(tgt.x))}</b> <span class="bd">— ${esc(ldesc(tgt.x).slice(0, 110))}</span>`
    + ` <span class="bd">· ${esc(cat)} · ${BR.idx + 1}/${BR.items.length} ${LANG === 'fr' ? 'cibles' : 'targets'}</span>`;
  updateBActs();
}
function rotateDial(dir) { // dir = ±1 item
  if (!BR.items.length) return;
  BR.base -= dir * BR_STEP;
  drawDial();
}
function dialFire() {
  const it = BR.items[BR.idx];
  if (!it) return;
  activate({ x: it.x, a: it.k === 'custom' ? 'custom' : it.k === 'agent' }, null);
}
function buildOnb() { // onboarding : une seule fois par édition
  const o = $('onb'); if (!o) return;
  let key = 'mgp.onb.' + EDITION;
  let seen = false;
  try { seen = localStorage.getItem(key) === '1'; } catch (e) {}
  if (seen) { o.hidden = true; return; }
  $('onbtxt').innerHTML = EDITION === 'bridge'
    ? (LANG === 'fr' ? '<b>🛰 Pont de commandement</b> — ← → ou molette pour viser · ⏎ pour tirer · Tab change de secteur · « filtres ▾ » à droite' : '<b>🛰 Command bridge</b> — ← → or wheel to aim · ⏎ fires the prompt · Tab switches sector')
    : (LANG === 'fr' ? '<b>🌌 Galaxie 3D</b> — chaque étoile = un skill (violet) ou un agent (vert) · clic pour tirer · ← → pour cibler · molette pour zoomer' : '<b>🌌 3D Galaxy</b> — each star is a skill (purple) or an agent (green) · click to fire · ← → to target · wheel to zoom');
  o.hidden = false;
  $('onbx').onclick = () => { o.hidden = true; try { localStorage.setItem(key, '1'); } catch (e) {} };
}
// interactions du pont (uniquement si DOM réel — stage mesurable)
if (G) {
  let dialDrag = null;
  $('stage').addEventListener('mousedown', (e) => {
    if (VIEW !== 'bridge' || overlayOpen() || e.target.closest('.chip') || e.target.closest('.arc')) return;
    dialDrag = { y: e.clientY, x: e.clientX };
  });
  window.addEventListener('mousemove', (e) => {
    if (!dialDrag) return;
    const d = (e.clientY - dialDrag.y) + (e.clientX - dialDrag.x);
    if (BR.items.length) BR.base += d * BR_STEP * 0.012;
    dialDrag = { y: e.clientY, x: e.clientX };
    drawDial();
  });
  window.addEventListener('mouseup', () => { dialDrag = null; });
  let wheelAcc = 0, wheelLast = 0; // molette douce : 1 cible max / 70 ms (fini le spinning)
  $('stage').addEventListener('wheel', (e) => {
    if (VIEW !== 'bridge' || overlayOpen()) return;
    e.preventDefault();
    wheelAcc += e.deltaY || 0;
    const now = Date.now();
    if (Math.abs(wheelAcc) >= 28 && now - wheelLast > 70) {
      rotateDial(wheelAcc > 0 ? 1 : -1);
      wheelAcc = 0; wheelLast = now;
    }
  }, { passive: false });
}
function bridgeKeys(e) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const i = BR_SECTORS.findIndex((s2) => s2.key === BR.sector);
    const nxt = BR_SECTORS[((i < 0 ? -1 : i) + (e.shiftKey ? BR_SECTORS.length - 1 : 1)) % BR_SECTORS.length];
    selectSector(nxt.key);
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); BR.sector ? rotateDial(1) : selectSector('agents'); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); BR.sector ? rotateDial(-1) : selectSector('agents'); }
  else if (e.key === 'Enter') { e.preventDefault(); dialFire(); }
}
function galaxyKeys(e) {
  const hits = GAL.filter((n) => n.hit);
  const order = hits.length ? hits : GAL.slice().sort((a2, b2) => lname(a2.x).localeCompare(lname(b2.x)));
  if (!order.length) return;
  let i = order.indexOf(gFocused);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); focusNode(order[(i + 1 + order.length) % order.length]); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); focusNode(order[(i - 1 + order.length) % order.length]); }
  else if (e.key === 'Enter' && gFocused) { e.preventDefault(); activate({ x: gFocused.x, a: gFocused.k === 'custom' ? 'custom' : gFocused.k === 'agent' }, null); }
  else if (e.key === 'Tab' && gFocused) { e.preventDefault(); const c = $('gcard'); if (c) c.hidden = !c.hidden; }
}

// ---------- Bascule des vues ----------
function setView(v) {
  VIEW = v === 'bridge' && HAS_BRIDGE ? 'bridge' : 'galaxy';
  localStorage.setItem('mgp.view', HAS_BRIDGE ? VIEW : EDITION);
  $('galaxy').style.display = VIEW === 'galaxy' ? 'block' : 'none';
  $('ghud').style.display = VIEW === 'galaxy' ? 'flex' : 'none';
  if ($('bridge')) $('bridge').hidden = VIEW !== 'bridge';
  // basculement d'assets : chaque vue ne montre QUE ses SVG (bug : cœur du pont visible dans la galaxie)
  if ($('v4frame')) $('v4frame').style.display = VIEW === 'bridge' && HAS_BRIDGE ? 'block' : 'none';
  if ($('v4core')) $('v4core').style.display = VIEW === 'bridge' && HAS_BRIDGE ? 'block' : 'none';
  if ($('v4hud')) $('v4hud').style.display = VIEW === 'galaxy' || !HAS_BRIDGE ? 'block' : 'none';
  if ($('v-galaxy')) {
    $('v-galaxy').classList.toggle('on', VIEW === 'galaxy');
    $('v-bridge').classList.toggle('on', VIEW === 'bridge');
    $('v-galaxy').setAttribute('aria-selected', String(VIEW === 'galaxy'));
    $('v-bridge').setAttribute('aria-selected', String(VIEW === 'bridge'));
  }
  if (VIEW === 'galaxy') { buildGalaxy(); if (G) drawGalaxy(); }
  else if (!BR.sector) selectSector('agents'); // pont armé direct : cadran prêt à viser
  else buildBridge();
  updFoot();
}
if ($('v-galaxy')) $('v-galaxy').onclick = () => setView('galaxy');
if ($('v-bridge')) $('v-bridge').onclick = () => setView('bridge');

// Carte d'action de la galaxie + barre d'actions du pont (DOM statique → branché une fois)
if ($('gc-copy')) {
  const kind = (n) => n.k;
  $('gc-copy').onclick = () => { if (gFocused) activate({ x: gFocused.x, a: kind(gFocused) === 'custom' ? 'custom' : kind(gFocused) === 'agent' }, null); };
  $('gc-open').onclick = () => { if (gFocused) window.mgp.openLLM(SYS.defaultLLM || 'claude', promptOf(gFocused.x, kind(gFocused))); };
  $('gc-gpt').onclick = () => { if (gFocused) window.mgp.openLLM('chatgpt', promptOf(gFocused.x, kind(gFocused))); };
  $('gc-fav').onclick = () => { if (gFocused) { toggleFav(gFocused.x.name); cardSet(gFocused); } };
  $('gc-sel').onclick = () => { if (!gFocused) return; sel.has(gFocused.x.name) ? sel.delete(gFocused.x.name) : sel.add(gFocused.x.name); buildGalaxy(); updFoot(); cardSet(gFocused); };
  $('gc-edit').onclick = () => { const c = CUSTOMS.find((x) => gFocused && x.name === gFocused.x.name); if (c) openEditor(c); };
  $('gc-x').onclick = () => { gFocused = null; hideCard(); if (G) drawGalaxy(); };
}
if ($('ba-copy')) {
  $('ba-copy').onclick = () => bridgeFire(BR.items[BR.idx]);
  $('ba-open').onclick = () => bridgeFire(BR.items[BR.idx], SYS.defaultLLM || 'claude');
  $('ba-gpt').onclick = () => bridgeFire(BR.items[BR.idx], 'chatgpt');
  $('ba-fav').onclick = () => { const t = BR.items[BR.idx]; if (!t) return; toggleFav(t.x.name); updateBActs(); };
}

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
  if (e.key === 'ArrowDown') { e.preventDefault(); if (!overlayOpen()) { showOverlay(); render(); idx = 0; } move(1); }
  else if (e.key === 'ArrowUp' && overlayOpen()) { e.preventDefault(); move(-1); }
  else if (e.key === 'Enter' && (e.metaKey || e.shiftKey)) {
    e.preventDefault(); openSelection(e.shiftKey ? 'chatgpt' : (SYS.defaultLLM || 'claude'));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (!overlayOpen()) { showOverlay(); render(); idx = 0; }
    const el = list.querySelector('.it.on');
    if (el) activate(results[+el.dataset.i], el);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if ($('modal').style.display === 'flex') { $('modal').style.display = 'none'; return; }
    if (VIEW === 'galaxy' && gFocused && $('gcard') && !$('gcard').hidden) { $('gcard').hidden = true; return; }
    if (overlayOpen()) { closeOverlay(); return; }
    window.mgp.hide();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === ',') { window.mgp.openSettings(); return; }
  // ⌘1-9 : lance directement le n-ième favori (LLM par défaut) — dans toutes les vues
  if ((e.metaKey || e.ctrlKey) && /^[1-9]$/.test(e.key)) {
    const f = findItem((SYS.favorites || [])[+e.key - 1]);
    if (f) {
      e.preventDefault();
      window.mgp.addRecent && window.mgp.addRecent(f.x.name);
      window.mgp.openLLM(SYS.defaultLLM || 'claude', promptOf(f.x, f.k));
    } else flash(T().noFav(+e.key));
    return;
  }
  if (document.activeElement === q) return; // la recherche gère ses touches
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && overlayOpen()) {
    e.preventDefault(); results.forEach(({ x }) => sel.add(x.name)); render(); return;
  }
  if (overlayOpen()) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); const el = list.querySelector('.it.on'); if (el) activate(results[+el.dataset.i], el); }
    return;
  }
  if (VIEW === 'bridge') bridgeKeys(e);
  else galaxyKeys(e);
});

function openSelection(target) {
  const items = [...sel].map((n) => { const f = findItem(n); return f && { ...f.x, __k: f.k }; }).filter(Boolean);
  const prompt = items.length ? buildCombo(items)
    : (q.value.trim() ? q.value.trim() : T().hello);
  window.mgp.openLLM(target, prompt);
}

// ---------- Événements ----------
q.addEventListener('input', () => {
  idx = 0;
  showOverlay();
  render();
  if (VIEW === 'galaxy') { // signale aussi les étoiles trouvées + hyper-saut
    const hits = updGCount();
    if (hits.length) focusNode(hits[0]);
  }
});
$('clr').onclick = () => {
  q.value = ''; idx = 0;
  closeOverlay();
  q.focus();
  if (VIEW === 'galaxy') updGCount();
};
$('ovclose').onclick = () => { closeOverlay(); if (VIEW === 'galaxy') updGCount(); };
$('btncopy').onclick = () => { // bouton Copier : sélection si présente, sinon item courant
  const el = list.querySelector('.it.on');
  if (sel.size) openSelection('clipboard');
  else if (el && overlayOpen()) activate(results[+el.dataset.i], el);
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
  if (VIEW === 'bridge') buildBridge(); else { buildGalaxy(); if (G) drawGalaxy(); }
};

// Boot : vue mémorisée + boucle de rendu + première liste
// ---------- 🧬 ASSETS VECTORIELS V4 (Groq) — détection + injection, fallback total ----------
let SVGOK = { frame: false, core: false, arc: false, chips: {}, hud: false, stars: {}, neb: {} };
const SVG_STARS = {}; // sprites Image des étoiles vectorielles (dessinées au canvas)
const SVG_NEB = {};   // nébuleuses (parallaxe)
function loadImg(url, cb) { try { const im = new Image(); im.onload = () => cb(im); im.onerror = () => cb(null); im.src = url; } catch (e) { cb(null); } }
async function loadSvgAssets() {
  const put = (id, css) => {
    const old = document.getElementById(id); if (old) old.remove();
    const host = document.createElement('div');
    host.id = id;
    host.style.cssText = css;
    $('stage').insertBefore(host, $('stage').firstChild);
    return host;
  };
  // les SVG Groq portent leurs propres id (ex. id="reticle" dans bridge-frame) : en les
  // inlinant, ils ENTRENT EN COLLISION avec les id du DOM → $('reticle') résolvait vers
  // le SVG et le vrai réticule n'était plus positionné. On namespaced tout (ids + refs).
  const nsSvg = (s) => s
    .replace(/\bid="/g, 'id="v4-')
    .replace(/url\(#/g, 'url(#v4-')
    .replace(/href="#/g, 'href="#v4-');
  if (HAS_BRIDGE) { // ─── assets du PONT uniquement (jamais dans la galaxie !) ───
    try { // cadre HUD — z-index:1 = AU-DESSUS du canvas : jamais voilé, lignes nettes
      const r = await fetch('assets/bridge-frame.svg');
      if (r.ok) {
        const svg = await r.text();
        if (/<svg[^>]*viewBox/.test(svg) && svg.length < 200000) {
          const host = put('v4frame', 'position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.95');
          host.innerHTML = nsSvg(svg);
          const s = host.querySelector('svg');
          if (s) { s.removeAttribute('width'); s.removeAttribute('height'); SVGOK.frame = true; }
        }
      }
    } catch (e) {}
    try { // cœur réacteur hexagonal derrière le texte du cœur
      const r = await fetch('assets/bridge-core.svg');
      if (r.ok) {
        const svg = await r.text();
        if (/<svg[^>]*viewBox/.test(svg) && svg.length < 120000) {
          const host = put('v4core', 'position:absolute;left:50%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px;z-index:1;pointer-events:none;opacity:.95');
          host.innerHTML = nsSvg(svg);
          const s = host.querySelector('svg');
          if (s) { s.removeAttribute('width'); s.removeAttribute('height'); SVGOK.core = true; }
        }
      }
    } catch (e) {}
    try { const r = await fetch('assets/bridge-arc.svg'); if (r.ok) SVGOK.arc = true; } catch (e) {}
    for (const k of ['agent', 'skill', 'custom', 'fav']) {
      try { const r = await fetch('assets/chip-' + k + '.svg'); if (r.ok) SVGOK.chips[k] = true; } catch (e) {}
    }
  }
  if (HAS_GALAXY) { // ─── assets de la GALAXIE uniquement ───
    try {
      const r = await fetch('assets/galaxy-hud.svg');
      if (r.ok) {
        const svg = await r.text();
        if (/<svg[^>]*viewBox/.test(svg) && svg.length < 200000) {
          const host = put('v4hud', 'position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.95');
          host.innerHTML = nsSvg(svg);
          const s = host.querySelector('svg');
          if (s) { s.removeAttribute('width'); s.removeAttribute('height'); SVGOK.hud = true; }
        }
      }
    } catch (e) {}
    for (const k of ['skill', 'agent', 'custom', 'fav']) {
      loadImg('assets/star-' + k + '.svg', (im) => {
        if (im) { SVG_STARS[k] = im; SVGOK.stars[k] = true; if (VIEW === 'galaxy' && G) drawGalaxy(); }
      });
    }
    loadImg('assets/nebula-1.svg', (im) => { if (im) { SVG_NEB[1] = im; if (VIEW === 'galaxy' && G) drawGalaxy(); } });
    loadImg('assets/nebula-2.svg', (im) => { if (im) { SVG_NEB[2] = im; if (VIEW === 'galaxy' && G) drawGalaxy(); } });
  }
  if (VIEW === 'galaxy') { if (G) drawGalaxy(); }
  if (VIEW === 'bridge' && BR.items) drawDial();
}
loadSvgAssets();

applyTheme(); applyLang();
if (!HAS_GALAXY) VIEW = 'bridge';       // édition pont : la galaxie n'existe pas
else if (!HAS_BRIDGE) VIEW = 'galaxy';  // édition galaxie : le pont n'existe pas
setView(VIEW);
render();
buildOnb();
paintLoop();
// Monovue : le pied n'a pas de doublon d'actions (déjà dans la carte/la barre du pont)
if (!HAS_BRIDGE || !HAS_GALAXY) $('acts').style.display = 'none';

// Redimensionnement : re-layout du pont (la galaxie se redimensionne toute seule)
if (window.addEventListener) window.addEventListener('resize', () => { if (VIEW === 'bridge') buildBridge(); });

// Sync depuis la fenêtre Réglages (langue : re-render complet)
if (window.mgp.onSettings) {
  window.mgp.onSettings(({ theme, lang }) => {
    THEME = theme; LANG = lang;
    try { localStorage.setItem('mgp.theme', THEME); localStorage.setItem('mgp.lang', LANG); } catch (e) {}
    applyTheme(); applyLang(); render();
    if (VIEW === 'bridge') buildBridge(); else buildGalaxy();
  });
}

// Poignée de test/debug (utilisée par test-galaxy.js) — inerte en production
window.__mgp = {
  galaxy: {
    nodes: () => GAL,
    matches: () => GAL.filter((n) => n.hit),
    focus: focusNode,
    camera: () => cam,
    search: (t) => { q.value = t; const hits = updGCount(); if (hits.length) focusNode(hits[0]); return hits.map((n) => n.x.name); },
    fire: () => { if (!gFocused) return null; activate({ x: gFocused.x, a: gFocused.k === 'custom' ? 'custom' : gFocused.k === 'agent' }, null); return gFocused.x.name; },
  },
  bridge: {
    select: selectSector,
    rotate: rotateDial,
    target: () => (BR.items[BR.idx] ? { name: BR.items[BR.idx].x.name, k: BR.items[BR.idx].k } : null),
    sector: () => BR.sector,
    fire: dialFire,
  },
  view: () => VIEW,
  setView,
};
