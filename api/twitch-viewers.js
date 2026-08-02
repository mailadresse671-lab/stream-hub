const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REFRESH_TOKEN = process.env.TWITCH_REFRESH_TOKEN;
const CHANNEL_LOGIN = 'dangsxr1000';
const CACHE_TTL_MS = 30 * 1000;

// Modul-weiter In-Memory-Cache, gleiches Muster wie api/stats.js/
// api/twitch-followers.js.
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

// Liefert die echte Live-Zuschauerzahl ueber Twitch Helix (GET /streams,
// "viewer_count"-Feld) fuer start.htmls Countdown-/Pause-Screen. Braucht
// KEINE Broadcaster-ID-Aufloesung (im Gegensatz zu api/twitch-followers.js) -
// /streams laesst sich direkt per user_login abfragen, ein Aufruf weniger.
// data:[] (leeres Array) bedeutet lediglich, dass der Kanal aktuell nicht
// als "live" bei Twitch gefuehrt wird - waehrend der Starting-Soon-Phase vor
// dem Draufdruecken von "Los geht's" in Streamlabs der Normalfall, kein
// Fehler. Braucht keinen zusaetzlichen Scope ueber die bereits fuer
// api/twitch-eventsub.js/api/twitch-followers.js hinterlegten Umgebungs-
// variablen hinaus (GET /streams ist mit jedem gueltigen User-Token lesbar).
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

    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(CHANNEL_LOGIN)}`, {
      headers: {
        'Client-Id': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Stream-Abfrage fehlgeschlagen (${response.status}): ${text}`);
    }

    const data = await response.json();
    const stream = data.data && data.data[0];
    const payload = {
      success: true,
      live: !!stream,
      viewerCount: stream ? stream.viewer_count : 0
    };
    cache = { data: payload, timestamp: now };
    return res.status(200).json({ ...payload, cached: false });
  } catch (err) {
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
}
