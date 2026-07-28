// Duenner Wrapper um die Upstash-kompatible REST-API von Vercel KV. Bewusst
// ohne @vercel/kv-Package: das Projekt hat kein package.json/node_modules,
// und die paar hier gebrauchten Kommandos (get/set/incrbyfloat) sind per
// simplem fetch() genauso zuverlaessig - kein neuer Build-Schritt noetig.
//
// Unterstuetzt zwei moegliche Env-Var-Namenspaare, da Vercel/Upstash die
// Benennung je nach Integrationsweg (verwaltetes Vercel-KV vs. direkt
// verknuepfte Upstash-Redis-Datenbank) unterschiedlich vergeben:
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvCommand(...parts) {
  if (!KV_URL || !KV_TOKEN) {
    throw new Error('KV_REST_API_URL/KV_REST_API_TOKEN (oder UPSTASH_REDIS_REST_URL/_TOKEN) fehlen als Vercel-Umgebungsvariable.');
  }
  const url = `${KV_URL.replace(/\/$/, '')}/${parts.map(p => encodeURIComponent(p)).join('/')}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`KV-Request fehlgeschlagen (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data.result;
}

export async function kvGet(key) {
  return kvCommand('get', key);
}

export async function kvSet(key, value) {
  return kvCommand('set', key, value);
}

export async function kvIncrByFloat(key, amount) {
  const result = await kvCommand('incrbyfloat', key, amount);
  return parseFloat(result);
}
