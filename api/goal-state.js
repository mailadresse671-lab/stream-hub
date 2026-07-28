import { kvGet } from './_lib/kv.js';

const STARS_MAX = 5;

// Reiner Lese-Endpoint: liefert den aktuellen Wanted-Level-Fortschritt,
// z.B. beim (Neu-)Laden von goal.html, damit ein Reload waehrend des
// Streams nicht wieder bei 0 Sternen startet.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const raw = await kvGet('wanted:points');
    const points = raw ? parseFloat(raw) : 0;
    const stars = Math.min(STARS_MAX, Math.floor(points));
    return res.status(200).json({ success: true, points, stars });
  } catch (err) {
    // KV (noch) nicht verknuepft/erreichbar - Widget startet einfach bei 0
    // Sternen statt das Overlay zu blockieren.
    return res.status(200).json({ success: true, points: 0, stars: 0, message: err.message });
  }
}
