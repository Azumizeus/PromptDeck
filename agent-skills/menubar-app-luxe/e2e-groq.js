// e2e-groq.js — chemin API de bout en bout de l'app Luxe, par le VRAI bridge renderer.
// Usage : Electron e2e-groq.js   (app résidente arrêtée : verrou mono-instance)
// Ce main ouvre une fenêtre cachée avec le preload de production (window.mgp),
// y injecte le driver renderer via executeJavaScript, et écrit /tmp/e2e-result.json.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const RESULT = '/tmp/e2e-result.json';
const STEPS = '/tmp/e2e-steps.log';
const T0 = Date.now();
const W = (s) => { try { fs.appendFileSync(STEPS, `[${((Date.now() - T0) / 1000).toFixed(1)}s] ${s}\n`); } catch {} };

const DRIVER = `(async () => {
  const mgp = window.mgp;
  if (!mgp || typeof mgp.teamGenerate !== 'function') return { ok: false, error: 'bridge window.mgp absent (preload ?)' };
  const withTimeout = (p, ms, label) => Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error('WATCHDOG ' + label + ' > ' + ms / 1000 + 's')), ms)),
  ]);
  console.log('[step] etape 2/5 : llm-test (Groq)');
  let test;
  try { test = await withTimeout(mgp.llmTest({ provider: 'groq' }), 45000, 'llm-test'); }
  catch (e) { return { ok: false, step: 'llm-test', error: String(e.message || e) }; }
  if (!test || !test.ok) return { ok: false, step: 'llm-test', error: test && test.error, latencyMs: test && test.latency };
  console.log('[step] llm-test OK : modèle=' + test.model + ' latence=' + test.latency + 'ms sample="' + test.sample + '"');
  console.log('[step] etape 3/5 : team-generate (vraie génération Groq, maxTokens 8192)');
  const intent = "Constitue une équipe de veille IA qui surveille l'actualité des modèles ouverts cette semaine et produit une note de synthèse concise. Maximum 3 agents.";
  let gen;
  try { gen = await withTimeout(mgp.teamGenerate({ intent, provider: 'groq', lang: 'fr', saveApiChoice: true }), 150000, 'team-generate'); }
  catch (e) { return { ok: false, step: 'team-generate', error: String(e.message || e) }; }
  if (!gen || !gen.ok) return { ok: false, step: 'team-generate', error: gen && gen.error };
  const team = gen.item;
  console.log('[step] équipe générée : "' + team.team + '" · orch=' + team.orchestrator.name + ' · ' + team.agents.length + ' agent(s) [ ' + team.agents.map((a) => a.name).join(', ') + '] · workflow=' + team.workflow.length + ' étapes · modèle=' + gen.model + ' latence=' + gen.latency + 'ms');
  console.log('[step] etape 4/5 : team-run (plan → agents en parallèle → rapport consolidé)');
  const mission = 'Produis une note de veille de 5 lignes maximum sur les modèles ouverts publiés cette semaine, avec une recommandation finale.';
  let run;
  try { run = await withTimeout(mgp.teamRun({ team, mission, provider: 'groq', lang: 'fr' }), 180000, 'team-run'); }
  catch (e) { return { ok: false, step: 'team-run', error: String(e.message || e), team }; }
  if (!run || !run.ok) return { ok: false, step: 'team-run', error: run && run.error, team };
  console.log('[step] etape 5/5 : vérification du rapport');
  const report = String(run.report || '');
  const checks = { reportNotEmpty: report.trim().length > 200, noUndefined: !/undefined/.test(report) && !/undefined/.test(JSON.stringify(team)), tasksPlanned: run.tasks > 0, persisted: false };
  try {
    const list = await mgp.teamList();
    checks.persisted = Array.isArray(list) && list.some((t) => (t.team || t.name) === team.team);
  } catch {}
  console.log('[step] terminé : team-run latence=' + run.latency + 'ms tâches=' + run.tasks + ' persistance=' + checks.persisted);
  return {
    ok: Object.values(checks).every(Boolean),
    team: { name: team.team, orchestrator: team.orchestrator.name, agents: team.agents.map((a) => ({ name: a.name, role: a.role, deliverable: a.deliverable })), workflow: team.workflow },
    generate: { model: gen.model, latencyMs: gen.latency },
    run: { model: run.model, latencyMs: run.latency, tasks: run.tasks },
    reportExcerpt: report.slice(0, 700),
    checks,
  };
})()`;

app.whenReady().then(() => {
  W('etape 1/5 : fenêtre cachée + preload de production');
  const win = new BrowserWindow({
    show: false,
    width: 500, height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.webContents.on('console-message', (e, level, message) => {
    if (message.startsWith('[step]')) W(message.replace('[step] ', ''));
  });
  win.webContents.on('render-process-gone', (e, d) => finish({ ok: false, error: 'renderer gone: ' + (d && d.reason) }));
  win.loadURL('data:text/html,<html><body>e2e</body></html>');
  win.webContents.on('did-finish-load', async () => {
    try {
      const result = await win.webContents.executeJavaScript(DRIVER, true);
      finish(result || { ok: false, error: 'driver sans résultat' });
    } catch (err) {
      finish({ ok: false, error: 'executeJavaScript: ' + String((err && err.message) || err) });
    }
  });
});

function finish(obj) {
  const payload = JSON.stringify(obj, null, 2);
  try { fs.writeFileSync(RESULT, payload); } catch {}
  process.stdout.write(payload + '\n');
  try { app.exit(obj.ok ? 0 : 1); } catch { process.exit(obj.ok ? 0 : 1); }
}

// Chien de garde global : aucune étape ne doit pendre indéfiniment
setTimeout(() => {
  W('WATCHDOG global 300s dépassé');
  finish({ ok: false, error: 'WATCHDOG global > 300s (voir /tmp/e2e-steps.log pour la dernière étape)' });
}, 300000);
