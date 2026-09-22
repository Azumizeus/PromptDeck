// Launcher « fenêtre macOS » : recâble l'UI Luxe APRÈS que renderer.js a
// remplacé document.body — déplace l'en-tête Luxe dans la barre mac, cadre
// #app dans la fenêtre, et câble les 3 feux + le dock de lancement.
(function () {
  'use strict';

  const macwin = document.getElementById('macwin');
  const macbar = document.getElementById('macbar');
  const app = document.getElementById('app');
  if (!macwin || !macbar || !app) return; // pas la page launcher

  document.body.classList.add('has-mac'); // re-cadre #app (position:fixed → absolu dans la fenêtre)

  // ── Les boutons d'en-tête Luxe (＋ ✍️ et FR/EN) vont dans la barre mac ──
  // (renderer.js les a créés dans son propre header #top, qui reste en place)
  const top = document.getElementById('top');
  const newp = document.getElementById('newp');
  const langb = document.getElementById('langb');
  const lx = macbar.querySelector('.lx');
  if (top && lx && newp && langb) {
    lx.appendChild(newp);
    lx.appendChild(langb);
    const topRight = top.querySelector('span[style*="flex"]');
    if (topRight) topRight.style.display = 'none'; // plus de doublon dans #top
  }

  // ── Les 3 feux ──────────────────────────────────────────────────────
  const q = document.getElementById('q');
  const fold = () => { macwin.classList.add('folded'); };
  const unfold = () => { macwin.classList.remove('folded'); if (q) q.focus(); };
  macbar.querySelector('.l-close').onclick = fold;   // 🔴 fermer = replier
  macbar.querySelector('.l-min').onclick = fold;     // 🟡 réduire = replier
  macbar.querySelector('.l-close').ondblclick = unfold;
  macbar.querySelector('.l-min').ondblclick = unfold;
  let zoomed = false;
  macbar.querySelector('.l-max').onclick = () => {   // 🟢 plein écran / restaurer
    zoomed = !zoomed;
    macwin.style.width = zoomed ? '100vw' : '';
    macwin.style.height = zoomed ? '100vh' : '';
    macwin.style.borderRadius = zoomed ? '0' : '';
    macwin.style.minHeight = zoomed ? '0' : '';
    document.getElementById('stage').style.padding = zoomed ? '0' : '';
    const dock = document.getElementById('dock');
    if (dock) dock.style.display = zoomed ? 'none' : '';
  };
  // Double-clic sur la barre titre = replier/déplier (réflexe mac)
  macbar.addEventListener('dblclick', (e) => {
    if (e.target.closest('.l') || e.target.closest('.lx')) return;
    macwin.classList.contains('folded') ? unfold() : fold();
  });

  // ── Dock de lancement sous la fenêtre ───────────────────────────────
  const dock = document.createElement('div');
  dock.id = 'dock';
  const fr = (document.documentElement.lang || 'fr') !== 'en';
  dock.innerHTML =
    '<span class="lbl">' + (fr ? 'Ouvrir :' : 'Open:') + '</span>' +
    '<button id="d-luxe">⚡ ' + (fr ? 'Luxe (ce panneau)' : 'Luxe (this panel)') + '</button>' +
    '<a href="standalone.html">🧭 ' + (fr ? 'Démo pleine page' : 'Full-page demo') + '</a>' +
    '<a href="settings.html">⚙️ ' + (fr ? 'Réglages' : 'Settings') + '</a>' +
    '<a href="../interface/MODE-DEMPLOI.html">📖 ' + (fr ? "Mode d'emploi" : 'User guide') + '</a>' +
    '<a href="../interface/mega-pack-panel-full.user.js" download>🐵 ' + (fr ? 'Userscript Tampermonkey' : 'Tampermonkey userscript') + '</a>';
  document.getElementById('stage').after(dock);
  dock.querySelector('#d-luxe').onclick = unfold;
  // Échap ferme le panneau Luxe (comportement renderer) → on replie la fenêtre aussi
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && macwin.classList.contains('folded')) unfold();
  });
})();
