const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const TWITCH_REFRESH_TOKEN = process.env.TWITCH_REFRESH_TOKEN;
const CHANNEL_LOGIN = 'dangsxr1000';

// Modul-weiter Cache (ueberlebt zwischen Aufrufen, solange Vercel dieselbe
// warme Function-Instanz wiederverwendet - gleiches Muster wie api/stats.js).
// Grund: Twitch verlangt, dass EventSub-Subscriptions innerhalb weniger
// Sekunden nach dem WebSocket-"session_welcome" angemeldet werden, sonst
// schliesst Twitch die Session und JEDE Subscription schlaegt fehl (live
// beobachtet: alle 5 Typen gleichzeitig). Vorher liefen bei JEDEM Aufruf
// zwei sequenzielle externe Requests (Token-Refresh + Broadcaster-Lookup)
// VOR den eigentlichen Subscription-Anfragen - auf einer warmen Instanz
// faellt das jetzt komplett weg, wodurch die Subscriptions deutlich
// schneller nach dem WebSocket-Handshake bei Twitch ankommen.
let tokenCache = { accessToken: null, expiresAt: 0 };
let broadcasterIdCache = null;

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && now < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

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
  // 5 Minuten Sicherheitsabstand vor dem tatsaechlichen Ablauf, damit kein
  // Request knapp mit einem gerade abgelaufenen Token rausgeht.
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + Math.max(0, (data.expires_in || 3600) - 300) * 1000
  };
  return tokenCache.accessToken;
}

async function getBroadcasterId(accessToken) {
  if (broadcasterIdCache) return broadcasterIdCache;

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
  broadcasterIdCache = data.data[0].id;
  return broadcasterIdCache;
}

async function createSubscription(accessToken, type, version, condition, sessionId) {
  const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      'Client-Id': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      version,
      condition,
      transport: { method: 'websocket', session_id: sessionId }
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return { type, success: false, status: response.status, error: data };
  }
  return { type, success: true };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Nur POST erlaubt.' });
  }

  const sessionId = req.body && req.body.session_id;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'session_id fehlt im Request-Body.' });
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

    const subscriptions = await Promise.all([
      createSubscription(accessToken, 'channel.follow', '2',
        { broadcaster_user_id: broadcasterId, moderator_user_id: broadcasterId }, sessionId),
      createSubscription(accessToken, 'channel.subscribe', '1',
        { broadcaster_user_id: broadcasterId }, sessionId),
      createSubscription(accessToken, 'channel.subscription.message', '1',
        { broadcaster_user_id: broadcasterId }, sessionId),
      createSubscription(accessToken, 'channel.cheer', '1',
        { broadcaster_user_id: broadcasterId }, sessionId),
      createSubscription(accessToken, 'channel.raid', '1',
        { to_broadcaster_user_id: broadcasterId }, sessionId)
    ]);

    const failed = subscriptions.filter(s => !s.success);

    return res.status(200).json({
      success: failed.length === 0,
      broadcasterId,
      subscriptions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
