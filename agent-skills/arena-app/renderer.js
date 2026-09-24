// MEGA PACK ARENA — renderer : deux scènes 2D vectorielles (SVG).
// COMBAT : arène octogonale top-down, fighters = agents réels (à leur nom).
// COURSE : circuit top-down (Bézier), véhicules = skills, chronos par tour, nitro.
'use strict';

const SVG = document.getElementById('svg');
const NS = 'http://www.w3.org/2000/svg';
const el = (t, attrs = {}) => { const n = document.createElementNS(NS, t); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $id = (i) => document.getElementById(i);

// ── État ──
const S = { mode: 'combat', fighters: [], vehicles: [], racers: [], xp: 0, enemies: [], running: true, t: 0, laps: {}, best: {} };
const FIGHTER_COLORS = ['#9945ff', '#14f195', '#f5c518', '#5eb0ff', '#ff6b9d'];

// ══════════════════ DÉCOR — COMBAT (arène octogonale) ══════════════════
function drawArena() {
  SVG.innerHTML = '';
  const g = el('g');
  g.appendChild(el('rect', { x: 0, y: 0, width: 1000, height: 700, fill: '#0e0f14' }));
  for (let x = 0; x <= 1000; x += 50) g.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: 700, stroke: '#15161d', 'stroke-width': 1 }));
  for (let y = 0; y <= 700; y += 50) g.appendChild(el('line', { x1: 0, y1: y, x2: 1000, y2: y, stroke: '#15161d', 'stroke-width': 1 }));
  const cx = 500, cy = 350, R = 300, pts = [];
  for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i + Math.PI / 8; pts.push(`${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}`); }
  g.appendChild(el('polygon', { points: pts.join(' '), fill: '#12131a', stroke: '#31343f', 'stroke-width': 3 }));
  g.appendChild(el('polygon', { points: pts.join(' '), fill: 'none', stroke: 'url(#grad)', 'stroke-width': 1.5, opacity: .55 }));
  addDefs(g);
  SVG.appendChild(g);
  SVG.appendChild(el('g', { id: 'fx' }));
  SVG.appendChild(el('g', { id: 'enemies' }));
  SVG.appendChild(el('g', { id: 'actors' }));
}

// ══════════════════ DÉCOR — COURSE (circuit Bézier + chronos) ══════════════════
// Circuit fermé défini par des points de contrôle (courbe lissée catmull-rom → bézier).
const TRACK_PTS = [[500,80],[820,140],[900,350],[800,560],[500,630],[210,560],[100,350],[190,140]];
function trackPath(pts) {
  const n = pts.length;
  let d = `M ${pts[0][0]},${pts[0][1]} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C ${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]} `;
  }
  return d + 'Z';
}
const TRACK_D = trackPath(TRACK_PTS);
// Point le plus proche sur la polyligne échantillonnée (pour la progression de tour)
const TRACK_SAMPLES = (() => {
  const svgPath = document.createElementNS(NS, 'path');
  svgPath.setAttribute('d', TRACK_D);
  const L = svgPath.getTotalLength ? svgPath.getTotalLength() : 2200;
  const arr = [];
  for (let i = 0; i <= 200; i++) { const p = svgPath.getPointAtLength ? svgPath.getPointAtLength(L * i / 200) : { x: 500, y: 80 }; arr.push({ x: p.x, y: p.y, i }); }
  return arr;
})();
function nearestTrack(x, y) {
  let best = TRACK_SAMPLES[0], bd = Infinity;
  for (const p of TRACK_SAMPLES) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p; } }
  return best;
}
function drawRace() {
  SVG.innerHTML = '';
  const g = el('g');
  g.appendChild(el('rect', { x: 0, y: 0, width: 1000, height: 700, fill: '#0e0f14' }));
  // herbe
  g.appendChild(el('rect', { x: 0, y: 0, width: 1000, height: 700, fill: '#101410' }));
  // piste (large trait = asphalte, trait pointillé central)
  g.appendChild(el('path', { d: TRACK_D, fill: 'none', stroke: '#1c1e26', 'stroke-width': 74, 'stroke-linejoin': 'round' }));
  g.appendChild(el('path', { d: TRACK_D, fill: 'none', stroke: '#23252f', 'stroke-width': 2, 'stroke-dasharray': '14 18' }));
  // bordures rouges/blanches aux virages (dash bicolore)
  g.appendChild(el('path', { d: TRACK_D, fill: 'none', stroke: '#ff4d6d', 'stroke-width': 3, 'stroke-dasharray': '2 26', opacity: .8 }));
  // ligne de départ/arrivée
  const s = TRACK_SAMPLES[0], s2 = TRACK_SAMPLES[8];
  g.appendChild(el('line', { x1: s.x, y1: s.y, x2: s2.x, y2: s2.y, stroke: '#eef0f6', 'stroke-width': 6, 'stroke-dasharray': '6 6', opacity: .9 }));
  addDefs(g);
  SVG.appendChild(g);
  SVG.appendChild(el('g', { id: 'fx' }));
  SVG.appendChild(el('g', { id: 'actors' }));
  // minimap chrono
  const hud = el('text', { id: 'raceclock', x: 16, y: 28, 'font-size': 15, 'font-weight': 700, fill: '#14f195', 'font-family': 'ui-monospace,monospace' });
  hud.textContent = '⏱ 0.00 s';
  SVG.appendChild(hud);
}
function addDefs(g) {
  const defs = el('defs');
  defs.innerHTML = `<linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9945ff"/><stop offset="1" stop-color="#14f195"/></linearGradient>`;
  g.appendChild(defs);
}
const fxLayer = () => SVG.querySelector('#fx');
const actorLayer = () => SVG.querySelector('#actors');

// ══════════════════ ACTEURS ══════════════════
function spawnFighter(name, category) {
  if (S.fighters.some((f) => f.name === name)) return;
  const n = S.fighters.length;
  const a = (Math.PI * 2 / 12) * n;
  const x = 500 + 190 * Math.cos(a), y = 350 + 190 * Math.sin(a);
  const color = FIGHTER_COLORS[n % FIGHTER_COLORS.length];
  const g = el('g', { class: 'fighter', transform: `translate(${x},${y})` });
  fxLayer().appendChild(el('circle', { class: 'spawnring', cx: x, cy: y, r: 6, fill: 'none', stroke: color, 'stroke-width': 2.5 }));
  g.appendChild(el('circle', { r: 15, fill: '#14151c', stroke: color, 'stroke-width': 2.5 }));
  g.appendChild(el('polygon', { points: '0,-19 9,6 0,1 -9,6', fill: color, opacity: .9 }));
  g.appendChild(el('text', { y: 4.5, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: color })).textContent = (name[0] || '?').toUpperCase();
  const label = el('text', { y: 34, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: '#eef0f6', opacity: .95 });
  label.textContent = name.length > 22 ? name.slice(0, 21) + '…' : name;
  g.appendChild(label);
  actorLayer().appendChild(g);
  S.fighters.push({ name, x, y, color, g });
  log(`🆕 <b>${esc(name)}</b> entre dans l'arène${category ? ` (${esc(category)})` : ''}`, 'spawn');
  updHud();
}
// Véhicule : en combat → garage à gauche ; en course → sur la grille de départ
function spawnVehicle(name, onTrack) {
  if (onTrack) {
    if (S.racers.some((r) => r.name === name)) return;
    const i = S.racers.length;
    const p = TRACK_SAMPLES[6 + i * 5] || TRACK_SAMPLES[0];
    const color = FIGHTER_COLORS[i % FIGHTER_COLORS.length];
    const g = el('g', { class: 'fighter', transform: `translate(${p.x},${p.y})` });
    fxLayer().appendChild(el('circle', { class: 'spawnring', cx: p.x, cy: p.y, r: 6, fill: 'none', stroke: color, 'stroke-width': 2.5 }));
    g.appendChild(el('rect', { x: -9, y: -17, width: 18, height: 34, rx: 8, fill: '#14151c', stroke: color, 'stroke-width': 2.5 }));
    [[-10, -10], [10, -10], [-10, 10], [10, 10]].forEach(([wx, wy]) => g.appendChild(el('rect', { x: wx - 2.5, y: wy - 4.5, width: 5, height: 9, rx: 1.5, fill: '#31343f' })));
    const label = el('text', { y: 36, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: '#eef0f6' });
    label.textContent = name.length > 20 ? name.slice(0, 19) + '…' : name;
    g.appendChild(label);
    actorLayer().appendChild(g);
    S.racers.push({ name, g, sample: 6 + i * 5, lap: 0, lapStart: performance.now(), last: 0, boost: 0, color });
    log(`🏁 <b>${esc(name)}</b> sur la grille de départ`, 'spawn');
  } else {
    if (S.vehicles.some((v) => v.name === name)) return;
    const i = S.vehicles.length;
    const x = 80, y = 120 + i * 58;
    const g = el('g', { class: 'fighter', transform: `translate(${x},${y})` });
    g.appendChild(el('rect', { x: -16, y: -30, width: 32, height: 60, rx: 14, fill: '#14151c', stroke: '#5eb0ff', 'stroke-width': 2 }));
    [[-17, -18], [17, -18], [-17, 18], [17, 18]].forEach(([wx, wy]) => g.appendChild(el('rect', { x: wx - 3, y: wy - 6, width: 6, height: 12, rx: 2, fill: '#31343f' })));
    const label = el('text', { y: 48, 'text-anchor': 'middle', 'font-size': 10, fill: '#a8adbd' });
    label.textContent = name.length > 20 ? name.slice(0, 19) + '…' : name;
    g.appendChild(label);
    actorLayer().appendChild(g);
    S.vehicles.push({ name, x, y, g });
    log(`🏁 Skill « <b>${esc(name)}</b> » rejoint le garage`, 'spawn');
  }
  updHud();
}
// Coureur = un agent (en course, les agents pilotent)
function spawnRacer(name) {
  if (!S.racers.some((r) => r.name === name)) spawnVehicle(name, true);
  else log(`· ${esc(name)} est déjà en piste`, '');
}
function fx(x, y, kind, color) {
  const g = el('g', { class: kind === 'slash' ? 'slash' : 'boost', transform: `translate(${x},${y})` });
  if (kind === 'slash') g.appendChild(el('path', { d: 'M -22 10 Q 0 -26 22 10', fill: 'none', stroke: color || '#14f195', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  else g.appendChild(el('circle', { r: 14, fill: 'none', stroke: color || '#f5c518', 'stroke-width': 3 }));
  fxLayer().appendChild(g);
  setTimeout(() => g.remove(), 800);
}
function spawnBug() {
  if (S.enemies.length >= 5 || S.mode !== 'combat') return;
  const x = 500 + (Math.random() * 400 - 200), y = 350 + (Math.random() * 300 - 150);
  const g = el('g', { class: 'fighter', transform: `translate(${x},${y})` });
  g.appendChild(el('polygon', { points: '0,-14 12,8 -12,8', fill: '#ff4d6d', opacity: .85 }));
  const hp = el('rect', { x: -14, y: 12, width: 28, height: 4, fill: '#31343f' });
  hp.appendChild(el('rect', { width: 28, height: 4, fill: '#ff4d6d' }));
  g.appendChild(hp);
  SVG.querySelector('#enemies').appendChild(g);
  S.enemies.push({ x, y, hp: 100, g });
  log(`🐛 Un Bug apparaît — copie un prompt pour l'attaquer !`, '');
}

// ══════════════════ JOURNAL + HUD ══════════════════
function log(html, cls) {
  const d = document.createElement('div');
  d.className = 'ev' + (cls ? ' ' + cls : '');
  const t = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  d.innerHTML = `<span class="t">${t}</span>${html}`;
  const box = $id('log');
  box.prepend(d);
  while (box.children.length > 60) box.lastChild.remove();
}
function updHud() {
  $id('h-fighters').textContent = S.fighters.length;
  $id('h-vehicles').textContent = S.mode === 'race' ? S.racers.length : S.vehicles.length;
  $id('h-xp').textContent = S.xp;
}
function fmtLap(ms) { return (ms / 1000).toFixed(2) + ' s'; }

// ══════════════════ MAPPING ÉVÉNEMENTS MEGA PACK → JEU ══════════════════
function handleEvent(ev) {
  switch (ev.type) {
    case 'agent-created':
      S.mode === 'race' ? spawnRacer(ev.name) : spawnFighter(ev.name, ev.category);
      S.xp += 25; break;
    case 'skill-created':
      S.mode === 'race' ? spawnVehicle(ev.name, true) : spawnVehicle(ev.name, false);
      S.xp += 15; break;
    case 'team-created':
      log(`🕸 Équipe « <b>${esc(ev.name)}</b> » invoquée (${ev.agents || 0} alliés)`, 'spawn');
      S.xp += (ev.agents || 1) * 10; break;
    case 'prompt-sent': {
      if (S.mode === 'combat') {
        const f = S.fighters[Math.floor(Math.random() * S.fighters.length)];
        const bug = S.enemies.find((b) => b.hp > 0);
        if (f) fx(f.x, f.y - 24, 'slash', f.color);
        if (bug) { bug.hp -= 34; fx(bug.x, bug.y, 'boost', '#ff4d6d'); if (bug.hp <= 0) { log(`🐛 Bug éliminé ! +10 XP`, 'spawn'); bug.g.remove(); S.enemies = S.enemies.filter((b) => b !== bug); } }
      } else {
        const r = S.racers[Math.floor(Math.random() * S.racers.length)];
        if (r) { r.boost = 120; } // nitro : le tick dessine les flammes sur la piste
      }
      S.xp += 5; break;
    }
    case 'custom-created':
      S.xp += 8; log(`✍️ Prompt « <b>${esc(ev.name)}</b> » créé (fragment de savoir)`, ''); break;
    case 'item-locked':
      S.xp += 6; log(`🔒 ${esc(ev.kind)} « <b>${esc(ev.name)}</b> » — armure renforcée`, ''); break;
    case 'item-deleted':
    case 'custom-deleted':
      S.xp = Math.max(0, S.xp - 2); log(`🗑 ${esc(ev.name)} retiré — un obstacle en moins`, ''); break;
    default:
      log(`· ${esc(ev.type)} ${esc(ev.name || '')}`, '');
  }
  updHud();
}

// ══════════════════ BOUCLE ══════════════════
let bugTimer = 0;
function tickCombat() {
  for (const f of S.fighters) {
    const a = S.t / 60 + S.fighters.indexOf(f) * 2;
    const nx = f.x + Math.cos(a) * 0.15, ny = f.y + Math.sin(a * 1.3) * 0.15;
    f.g.setAttribute('transform', `translate(${nx},${ny})`); f.x = nx; f.y = ny;
  }
  bugTimer++;
  if (bugTimer > 60 * 25 && S.fighters.length && S.enemies.length < 3) { spawnBug(); bugTimer = 0; }
}
function tickRace() {
  const clock = $id('raceclock');
  for (const r of S.racers) {
    // vitesse de base + nitro (prompt copié) ; les véhicules restent sur la ligne centrale
    const speed = 0.55 + (r.boost > 0 ? 0.9 : 0) + (r.name.length % 5) * 0.02;
    if (r.boost > 0) { r.boost--; if (r.boost % 12 === 0) fx(r.x, r.y - 26, 'boost', '#f5c518'); }
    const prev = r.sample;
    r.sample = (r.sample + speed) % TRACK_SAMPLES.length;
    const p = TRACK_SAMPLES[Math.floor(r.sample)];
    r.x = p.x; r.y = p.y;
    r.g.setAttribute('transform', `translate(${p.x},${p.y})`); // cap conservé vertical : noms toujours lisibles
    // tour bouclé : l'index a repassé la ligne de départ
    if (prev > TRACK_SAMPLES.length - 8 && r.sample < 8) {
      const lapMs = performance.now() - r.lapStart;
      r.lap++; r.lapStart = performance.now();
      if (!S.best[r.name] || lapMs < S.best[r.name]) S.best[r.name] = lapMs;
      log(`🏁 <b>${esc(r.name)}</b> — tour ${r.lap} : ${fmtLap(lapMs)} (record ${fmtLap(S.best[r.name])})`, 'spawn');
      S.xp += 3;
    }
    if (clock) clock.textContent = `⏱ ${((performance.now() - S.raceStart) / 1000).toFixed(1)} s · tours ${S.racers.reduce((a, x) => a + x.lap, 0)}`;
  }
}
let raceStartInit = false;
S.raceStart = 0;
function tick() {
  if (S.running && S.mode) {
    S.t++;
    if (S.mode === 'combat') tickCombat(); else tickRace();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ══════════════════ RACCOURCIS ══════════════════
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); S.running = !S.running; log(S.running ? '▶ Reprend' : '⏸ Pause', ''); }
  if (e.key === 'a' || e.key === 'A') handleEvent({ type: 'prompt-sent' }); // démo attaque / nitro
  if (e.key === 'm' || e.key === 'M') switchMode(); // bascule manuelle combat ↔ course
});
function switchMode() {
  S.mode = S.mode === 'combat' ? 'race' : 'combat';
  S.fighters = []; S.vehicles = []; S.racers = []; S.enemies = []; S.t = 0;
  log(`🔁 Mode ${S.mode === 'combat' ? '⚔ COMBAT (arène)' : '🏁 COURSE (circuit)'}`, 'spawn');
  boot(true); // redessine et respawnne le roster existant
}

// ══════════════════ INIT ══════════════════
async function boot(keepLog) {
  S.raceStart = performance.now();
  if (S.mode === 'combat') drawArena(); else drawRace();
  if (!keepLog) { /* premier boot */ } else { log(`🔁 Scène redessinée (${S.mode})`, ''); }
  try {
    const init = await window.arena.init();
    S.mode = init.mode || S.mode;
    if (S.mode === 'combat') drawArena(); else drawRace();
    log(`📂 Mode du jour : <b>${S.mode === 'combat' ? '⚔ COMBAT' : '🏁 COURSE'}</b> — activité MEGA PACK (36 h) : ${init.yesterdayActivity} événements`, 'spawn');
    log(`📄 Bus : ${esc(init.eventsFile)}`, '');
    $id('subtitle').textContent = S.mode === 'combat'
      ? `⚔ Combat — activité 36 h : ${init.yesterdayActivity} évts`
      : `🏁 Course — activité 36 h : ${init.yesterdayActivity} évts · M pour basculer`;
    const demoAgents = init.agents.length ? init.agents : [
      { name: 'Analyse Critique', category: 'revue' },
      { name: 'Architecte Solana', category: 'blockchain' },
      { name: 'Dame de Fer', category: 'tests' },
      { name: 'Veilleur Nocturne', category: 'veille' },
    ];
    const demoSkills = init.skills.length ? init.skills : ['tests-navigateur-avec-devtools', 'code-review', 'debugging', 'frontend-ui', 'spec-driven'];
    console.log('DEMO roster:', demoAgents.length, 'agents,', demoSkills.length, 'skills (roster réel:', init.agents.length, '/', init.skills.length, ')');
    if (S.mode === 'combat') { for (const a of demoAgents) spawnFighter(a.name, a.category); for (const s of demoSkills) spawnVehicle(s, false); }
    else { for (const a of demoAgents) spawnRacer(a.name); for (const s of demoSkills) spawnVehicle(s, true); }
    console.log('BOOT_OK fighters:', S.fighters.length, 'vehicles:', S.vehicles.length, 'racers:', S.racers.length, 'roster réel:', init.agents.length, '/', init.skills.length);
    updHud();
  } catch (e) { console.error('BOOT_ERR:', e && e.message); log('⚠️ Init impossible (MEGA PACK pas encore lancé ?)', ''); }
  if (!boot.wired) { window.arena.onEvent(handleEvent); boot.wired = true; log("🔌 Connecté au bus d'événements MEGA PACK", 'spawn'); }
}
boot();
