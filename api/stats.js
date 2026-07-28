const PLAYER_NAME = "DaNgsxR";
const PLATFORM = "epic";
const CACHE_TTL_MS = 30 * 1000;

// Modul-weiter In-Memory-Cache: bleibt zwischen Aufrufen erhalten, solange
// Vercel dieselbe (warme) Function-Instanz wiederverwendet.
let cache = { data: null, timestamp: 0 };

export default async function handler(req, res) {
  // CORS-Header setzen, damit dein Tablet die Daten ungehindert lesen darf
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = Date.now();

  // Frischer Cache-Treffer: kein neuer Request an tracker.gg nötig
  if (cache.data && (now - cache.timestamp) < CACHE_TTL_MS) {
    return res.status(200).json({ ...cache.data, cached: true, stale: false });
  }

  try {
    // Anfrage direkt vom Vercel-Cloudserver an die Tracker-API (wird nicht geblockt)
    const response = await fetch(`https://api.tracker.gg/api/v2/rocket-league/standard/profile/${PLATFORM}/${encodeURIComponent(PLAYER_NAME)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      if (cache.data) {
        return res.status(200).json({ ...cache.data, cached: true, stale: true });
      }
      return res.status(200).json({ success: false, message: 'Tracker lädt noch...' });
    }

    const data = await response.json();
    const overview = data?.data?.segments?.find(s => s.type === 'overview');

    if (overview && overview.stats) {
      const wins = overview.stats.wins ? overview.stats.wins.value : 0;
      const matches = overview.stats.matchesPlayed ? overview.stats.matchesPlayed.value : 0;

      const payload = {
        success: true,
        player: PLAYER_NAME,
        wins: wins,
        matches: matches
      };

      cache = { data: payload, timestamp: now };

      return res.status(200).json({ ...payload, cached: false, stale: false });
    }

    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true });
    }
    return res.status(200).json({ success: false, message: 'Keine Stats gefunden' });
  } catch (err) {
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true });
    }
    return res.status(500).json({ error: err.message });
  }
}
