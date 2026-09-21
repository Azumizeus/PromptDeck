// Réglages MEGA PACK menu-bar : thème + langue persistés (localStorage partagé avec le panneau)

// i18n de la fenêtre Réglages (langue partagée avec le panneau via mgp.lang)
const I18N = {
  fr: { title: 'MEGA PACK — Réglages', h2: '⚡ MEGA PACK — Réglages', cat: 'Catalogue :', genFrom: '· généré depuis', theme: 'Thème', themeD: 'Appliqué au panneau et à cette fenêtre', dark: '🌙 Sombre', light: '☀️ Clair', lang: 'Langue', langD: 'Interface du panneau', gs: 'Recherche globale', gsD: 'Raccourci système (⌘Espace est réservé par Spotlight)', set: 'Réglages', setD: 'Ouvrir cette fenêtre', dllm: 'LLM par défaut', dllmD: '⌘⏎ dans le panneau ouvre ce chat', auto: 'Lancement au démarrage', autoD: "Ouvre MEGA PACK à l'ouverture de session", fsc: 'Raccourcis favoris', fscD: '⌘1 à ⌘9 lancent les 9 premiers favoris (menu du ⚡ ouvert)', cfg: 'Configuration', cfgD: 'Favoris, récents et préférences en JSON', xp: 'Mes prompts ✍️', xpD: 'Télécharge tous tes prompts en Markdown', osel: 'Ouvrir la sélection', oselD: 'Dans le panneau : ⏎ copie · ⌘⏎ LLM par défaut · ⇧⏎ ChatGPT', saved: '✓ Enregistré', noCat: 'catalogue introuvable' },
  en: { title: 'MEGA PACK — Settings', h2: '⚡ MEGA PACK — Settings', cat: 'Catalog:', genFrom: '· generated from', theme: 'Theme', themeD: 'Applied to the panel and this window', dark: '🌙 Dark', light: '☀️ Light', lang: 'Language', langD: 'Panel interface', gs: 'Global search', gsD: 'System shortcut (⌘Space is reserved by Spotlight)', set: 'Settings', setD: 'Open this window', dllm: 'Default LLM', dllmD: '⌘⏎ in the panel opens this chat', auto: 'Launch at startup', autoD: 'Open MEGA PACK at login', fsc: 'Favorite shortcuts', fscD: '⌘1 to ⌘9 launch the first 9 favorites (open ⚡ menu)', cfg: 'Configuration', cfgD: 'Favorites, recents and preferences as JSON', xp: 'My prompts ✍️', xpD: 'Download all your prompts as Markdown', osel: 'Open selection', oselD: 'In the panel: ⏎ copy · ⌘⏎ default LLM · ⇧⏎ ChatGPT', saved: '✓ Saved', noCat: 'catalog not found' },
};
let LANG = 'fr';
try { LANG = localStorage.getItem('mgp.lang') || 'fr'; } catch (e) {}
function applyLang() {
  const T = I18N[LANG] || I18N.fr;
  document.title = T.title;
  document.documentElement.lang = LANG;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = T[el.dataset.i18n] || el.textContent; });
}
applyLang();

const stats = document.getElementById('stats');
const themeSel = document.getElementById('theme');
const langSel = document.getElementById('lang');
const shortcutSel = document.getElementById('shortcut');
const dllmSel = document.getElementById('dllm');
const autostartCb = document.getElementById('autostart');
const favShortcutsCb = document.getElementById('favshortcuts');
const saved = document.getElementById('saved');
const exportBtn = document.getElementById('export');
const importBtn = document.getElementById('import');
const exportCustomsBtn = document.getElementById('exportcustoms');

try {
  themeSel.value = localStorage.getItem('mgp.theme') || 'dark';
  langSel.value = localStorage.getItem('mgp.lang') || 'fr';
} catch (e) { /* ok */ }

// Préférences système (main process) : raccourci, LLM par défaut, auto-boot
try {
  const P = window.mgp.getPrefs ? window.mgp.getPrefs() : {};
  if (P.shortcut) shortcutSel.value = P.shortcut;
  if (P.defaultLLM) dllmSel.value = P.defaultLLM;
  autostartCb.checked = !!P.autostart;
  if (typeof P.favShortcuts === 'boolean') favShortcutsCb.checked = P.favShortcuts;
} catch (e) { /* défauts */ }

// Compte du catalogue (lecture directe du fichier généré)
fetch('../interface/catalog-full.js')
  .then((r) => r.text())
  .then((code) => {
    const fn = new Function(code + '\n;return MEGA_CATALOG;');
    const cat = fn();
    stats.textContent = `${cat.skills.length} skills · ${cat.agents.length} agents · v${cat.meta.version}`;
  })
  .catch(() => { stats.textContent = (I18N[LANG] || I18N.fr).noCat; });

// Version + date de build (build.json écrit par build-app.sh au packaging)
fetch('build.json')
  .then((r) => r.json())
  .then((b) => {
    const d = new Date(b.built);
    const ds = d.toLocaleDateString(LANG === 'fr' ? 'fr-FR' : 'en-US') + ' ' + d.toLocaleTimeString(LANG === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('buildinfo').textContent = `· v${b.version} (${b.arch}) ${ds} · Electron ${b.electron}`;
  })
  .catch(() => { document.getElementById('buildinfo').textContent = ''; }); // mode dev : absent

function persist() {
  try {
    localStorage.setItem('mgp.theme', themeSel.value);
    localStorage.setItem('mgp.lang', langSel.value);
  } catch (e) { /* ok */ }
  LANG = langSel.value;
  applyLang();
  document.body.className = themeSel.value === 'light' ? 'light' : '';
  window.mgp.onSettingsChange && window.mgp.onSettingsChange({
    theme: themeSel.value,
    lang: langSel.value,
    shortcut: shortcutSel.value,
    defaultLLM: dllmSel.value,
    autostart: autostartCb.checked,
    favShortcuts: favShortcutsCb.checked,
  });
  saved.classList.add('show');
  setTimeout(() => saved.classList.remove('show'), 1200);
}
themeSel.onchange = persist;
langSel.onchange = persist;
shortcutSel.onchange = persist;
dllmSel.onchange = persist;
autostartCb.onchange = persist;
favShortcutsCb.onchange = persist;

// Export / import de la configuration (JSON) via le main process
if (window.mgp.exportConfig) {
  exportBtn.onclick = async () => {
    if (await window.mgp.exportConfig()) {
      saved.textContent = '✓ ' + (LANG === 'en' ? 'Config exported' : 'Config exportée');
      saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
    }
  };
  importBtn.onclick = async () => {
    if (await window.mgp.importConfig()) {
      try {
        const P = window.mgp.getPrefs();
        if (P.shortcut) shortcutSel.value = P.shortcut;
        if (P.defaultLLM) dllmSel.value = P.defaultLLM;
        autostartCb.checked = !!P.autostart;
        if (typeof P.favShortcuts === 'boolean') favShortcutsCb.checked = P.favShortcuts;
        if (P.lang) { langSel.value = P.lang; LANG = P.lang; applyLang(); }
      } catch (e) {}
      saved.textContent = '✓ ' + (LANG === 'en' ? 'Config imported' : 'Config importée');
      saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
    }
  };
  exportCustomsBtn.onclick = async () => {
    const ok = await window.mgp.exportCustoms();
    saved.textContent = ok ? '✓ ' + (LANG === 'en' ? 'Prompts exported (.md)' : 'Prompts exportés (.md)')
                           : (LANG === 'en' ? 'No prompts to export' : 'Aucun prompt à exporter');
    saved.classList.add('show'); setTimeout(() => saved.classList.remove('show'), 1500);
  };
}

if (window.mgp && window.mgp.onSettings) {
  window.mgp.onSettings(({ theme, lang }) => {
    themeSel.value = theme; langSel.value = lang;
    LANG = lang; applyLang();
    document.body.className = theme === 'light' ? 'light' : '';
  });
}
document.body.className = themeSel.value === 'light' ? 'light' : '';
