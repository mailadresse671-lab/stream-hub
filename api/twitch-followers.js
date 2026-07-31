const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REFRESH_TOKEN = process.env.TWITCH_REFRESH_TOKEN;
const CHANNEL_LOGIN = 'dangsxr1000';
const CACHE_TTL_MS = 60 * 1000;

// Modul-weiter In-Memory-Cache, gleiches Muster wie api/stats.js - vermeidet
// unnoetige Token-Refreshs, falls mehrere Quellen (goal.html o.ae.) kurz
// hintereinander laden.
let cache = { data: null, timestamp: 0 };

async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: TWITCH_REFRESH_TOKEN
  });

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token-Refresh fehlgeschlagen (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getBroadcasterId(accessToken) {
  const response = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(CHANNEL_LOGIN)}`, {
    headers: {
      'Client-Id': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Broadcaster-Abfrage fehlgeschlagen (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (!data.data || !data.data[0]) {
    throw new Error(`Kein Twitch-User gefunden fuer Login "${CHANNEL_LOGIN}"`);
  }
  return data.data[0].id;
}

// Liefert die echte, aktuelle Gesamt-Follower-Zahl ueber Twitch Helix
// (GET /channels/followers, "total"-Feld) - braucht denselben
// moderator:read:followers-Scope, der fuer channel.follow EventSub
// ohnehin schon vorausgesetzt ist (siehe CLAUDE.md).
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_TTL_MS) {
    return res.status(200).json({ ...cache.data, cached: true });
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET || !TWITCH_REFRESH_TOKEN) {
    return res.status(500).json({
      success: false,
      message: 'TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET / TWITCH_REFRESH_TOKEN fehlen als Vercel-Umgebungsvariable.'
    });
  }

  try {
    const accessToken = await getAccessToken();
    const broadcasterId = await getBroadcasterId(accessToken);

    const response = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}&first=1`, {
      headers: {
        'Client-Id': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Follower-Abfrage fehlgeschlagen (${response.status}): ${text}`);
    }

    const data = await response.json();
    const payload = { success: true, total: data.total };
    cache = { data: payload, timestamp: now };
    return res.status(200).json({ ...payload, cached: false });
  } catch (err) {
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}
