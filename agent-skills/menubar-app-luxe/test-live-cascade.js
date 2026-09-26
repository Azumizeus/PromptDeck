// 🌐 Test LIVE de la cascade — requêtes réseau réelles, sans l'app.
// Reproduit FIDÈLEMENT la logique de main.js : clés (env + auth.json OpenCode),
// ordre PROBE_PRIORITY, fallback modèle = 1er modèle du catalogue (fallbackModelFor).
// Lancé par test-luxe.js quand MGP_LIVE=1, ou à la main : node test-live-cascade.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const home = os.homedir();
// ── clés : même lecture que main.js (auth.json OpenCode, format { type, key }) ──
const OPENCODE_KEYS = {};
try {
  const au = JSON.parse(fs.readFileSync(path.join(home, '.local/share/opencode/auth.json'), 'utf8'));
  for (const [name, rec] of Object.entries(au || {})) {
    const k = rec && typeof rec === 'object' ? (rec.key || rec.access || rec.api_key || (rec.tokens || {}).access) : '';
    if (k) OPENCODE_KEYS[name === 'google' ? 'gemini' : name.replace(/-direct$/, '')] = k;
  }
} catch (e) { /* pas d'auth.json */ }

const PROVIDERS = {
  groq: { base: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-120b', label: 'Groq' },
  gemini: { base: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', model: 'gemini-3.6-flash', label: 'Google Gemini' },
  omniroute: { base: 'http://127.0.0.1:20128/v1/chat/completions', model: 'auto/best-coding', label: 'OmniRoute (local)' },
  mistral: { base: 'https://api.mistral.ai/v1/chat/completions', model: 'mistral-medium-latest', label: 'Mistral AI' },
  cerebras: { base: 'https://api.cerebras.ai/v1/chat/completions', model: 'gpt-oss-120b', label: 'Cerebras' },
  cohere: { base: 'https://api.cohere.com/compatibility/v1/chat/completions', model: 'command-a-03-2025', label: 'Cohere' },
  freellm: { base: 'http://127.0.0.1:8000/v1/chat/completions', model: 'auto', label: 'FreeLLM (local)' },
  openai: { base: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', label: 'OpenAI' },
  anthropic: { base: 'https://api.anthropic.com/v1/messages', model: 'claude-haiku-20250514', label: 'Anthropic', style: 'anthropic' },
  openrouter: { base: 'https://openrouter.ai/api/v1/chat/completions', model: 'meta-llama/llama-3.3-70b-instruct', label: 'OpenRouter' },
  ollama: { base: 'http://127.0.0.1:11434/v1/chat/completions', model: 'llama3.2', label: 'Ollama (local)' },
};
const ENV_KEYS = { groq: 'GROQ_API_KEY', gemini: 'GEMINI_API_KEY', mistral: 'MISTRAL_API_KEY', cerebras: 'CEREBRAS_API_KEY', cohere: 'COHERE_API_KEY', freellm: 'FREELLMAPI_API_KEY', openai: 'OPENAI_API_KEY', anthropic: 'ANTHROPIC_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
const PROBE_PRIORITY = ['omniroute', 'freellm', 'ollama', 'groq', 'gemini', 'mistral', 'cerebras', 'cohere', 'openai', 'anthropic', 'openrouter'];
const keyFor = (p) => (p === 'gemini' && (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY)) || (ENV_KEYS[p] && process.env[ENV_KEYS[p]]) || OPENCODE_KEYS[p] || '';
const isLocal = (p) => /127\.0\.0\.1|localhost/.test(PROVIDERS[p].base);

const MESSAGES = [{ role: 'user', content: 'Réponds juste : OK' }];
const MESSAGES_ANTHROPIC = [{ role: 'user', content: 'Réponds juste : OK' }];

async function tryProvider(p) {
  const prov = PROVIDERS[p];
  const key = keyFor(p);
  if (!key && !isLocal(p)) return { provider: p, skip: 'pas de clé' };
  const isAnthropic = prov.style === 'anthropic';
  const t0 = Date.now();
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(prov.base, {
      method: 'POST',
      headers: isAnthropic
        ? { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }
        : { 'content-type': 'application/json', ...(key ? { authorization: 'Bearer ' + key } : {}) },
      // max_tokens aligné sur l'app (2048) : avec 16, les modèles « thinking »
      // (gemini-3.6-flash…) brûlent le budget en raisonnement interne et répondent vide.
      body: JSON.stringify(isAnthropic
        ? { model: prov.model, max_tokens: 2048, messages: MESSAGES_ANTHROPIC }
        : { model: prov.model, max_tokens: 2048, messages: MESSAGES }),
      signal: ctl.signal,
    });
    const dt = Date.now() - t0;
    if (!res.ok) {
      let detail = '';
      try { const j = await res.json(); detail = (j.error && (j.error.message || j.error)) || ''; } catch (e) { /* non JSON */ }
      return { provider: p, ok: false, status: res.status, dt, detail: String(detail).slice(0, 90) };
    }
    const j = await res.json();
    const text = (j.choices && j.choices[0] && ((j.choices[0].message || {}).content || j.choices[0].text)) || (j.content && j.content[0] && j.content[0].text) || '';
    if (!String(text).trim()) return { provider: p, ok: false, status: res.status, dt, detail: 'réponse vide' };
    return { provider: p, ok: true, status: res.status, dt, model: j.model || prov.model, sample: String(text).trim().slice(0, 40) };
  } catch (e) {
    return { provider: p, ok: false, status: 0, dt: Date.now() - t0, detail: String((e && e.message) || e).slice(0, 60) };
  } finally { clearTimeout(timer); }
}

(async () => {
  console.log('Clés détectées : ' + (Object.keys(OPENCODE_KEYS).join(', ') || '(aucune auth.json)'));
  const errors = [];
  for (const p of PROBE_PRIORITY) {
    const r = await tryProvider(p);
    if (r.skip) { console.log(`  · ${p.padEnd(11)} — ignoré (${r.skip})`); continue; }
    if (r.ok) {
      console.log(`  ✅ ${p.padEnd(11)} HTTP ${r.status} en ${r.dt} ms — modèle ${r.model} — « ${r.sample} »`);
      console.log('CASCADE LIVE: PASS');
      process.exit(0);
    }
    console.log(`  ✗ ${p.padEnd(11)} HTTP ${r.status || '—'} en ${r.dt} ms — ${r.detail || ''}`);
    errors.push(p + ': ' + (r.detail || 'HTTP ' + r.status));
  }
  console.log('Échecs : ' + errors.join(' · '));
  console.log('CASCADE LIVE: FAIL');
  process.exit(1);
})();
