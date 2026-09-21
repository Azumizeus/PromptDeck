// Démo navigateur : shim window.mgp (le renderer de l'app ne change pas d'un octet)
(function () {
  'use strict';
  const KEY = 'mgp.prefs.luxe';
  const DEFAULTS = { lang: 'fr', theme: 'dark', favorites: [], recents: [], customs: [], defaultLLM: 'claude' };
  let prefs;
  try { prefs = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { prefs = Object.assign({}, DEFAULTS); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} };
  // const au top-level = liaison globale lexical (pas window.MEGA_CATALOG)
  const CAT = typeof MEGA_CATALOG !== 'undefined' ? MEGA_CATALOG : { meta: {}, skills: [], agents: [] };
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
  };
})();
