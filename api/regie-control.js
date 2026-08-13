import Pusher from 'pusher';

// Echtzeit-Broadcast-Kanal (Kurskorrektur 11.08.2026, siehe CLAUDE.md "Fertig
// & gemerged"): Chromium drosselt setTimeout-Polling in Hintergrund-Tabs,
// macht aber eine dokumentierte Ausnahme fuer aktive WebSocket-Verbindungen -
// siehe STREAMLABS_SETUP.md "Fernsteuerung im Hintergrund (Regie-System)".
// Pusher Channels liefert diese WebSocket-Verbindung, ohne dass wir selbst
// einen dauerhaften Server betreiben muessten (Vercel Serverless kann das
// nicht). Rein additiv: das bestehende In-Memory-State/GET-Polling bleibt
// unveraendert als Fallback/Backup-Sync bestehen, falls Pusher nicht
// konfiguriert ist oder ein einzelner Trigger-Call fehlschlaegt.
const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
const PUSHER_KEY = process.env.PUSHER_KEY;
const PUSHER_SECRET = process.env.PUSHER_SECRET;
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER;
const PUSHER_CONFIGURED = Boolean(
  PUSHER_APP_ID && PUSHER_KEY && PUSHER_SECRET && PUSHER_CLUSTER
);

let pusherClient = null;
if (PUSHER_CONFIGURED) {
  try {
    pusherClient = new Pusher({
      appId: PUSHER_APP_ID,
      key: PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: PUSHER_CLUSTER,
      useTLS: true
    });
  } catch (err) {
    // Guard-Klausel-Muster wie bei fehlendem TRACKER_API_KEY in api/stats.js:
    // ein kaputter Pusher-Client darf die restliche Function nicht mitreissen.
    console.error('Pusher-Client konnte nicht initialisiert werden:', err);
    pusherClient = null;
  }
}

async function broadcastCommand(command) {
  if (!pusherClient) return;
  try {
    await pusherClient.trigger('regie-control', 'command', command);
  } catch (err) {
    // Broadcast ist ein Zusatzkanal, kein Ersatz fuer das GET-Polling - ein
    // fehlgeschlagener Push darf die POST-Antwort nicht kaputt machen, das
    // Polling holt den Befehl im schlimmsten Fall beim naechsten Tick nach.
    console.error('Pusher-Broadcast fehlgeschlagen (Polling-Fallback bleibt aktiv):', err);
  }
}

const COMMAND_TTL_MS = 5 * 60 * 1000;
// scene.switch/scene.reload bleiben deutlich laenger gueltig als andere Aktionen:
// ein Szenenwechsel-Befehl ist auch verspaetet abgeholt noch sinnvoll anwendbar
// (kein zeitkritischer Ping wie z.B. ein kuenftiges system.ping), waehrend
// oldschool-master.html im Hintergrund (GeForce NOW im Vordergrund) laut
// Chromium-Timer-Drosselung teils minutenlang gar nicht pollt - siehe
// STREAMLABS_SETUP.md Abschnitt "Fernsteuerung im Hintergrund (Regie-System)".
const SCENE_SWITCH_TTL_MS = 30 * 60 * 1000;
const LONG_TTL_ACTIONS = new Set(['scene.switch', 'scene.reload']);
const REGIE_KEY = process.env.REGIE_CONTROL_KEY;

function getCommandTtlMs(action) {
  return LONG_TTL_ACTIONS.has(action) ? SCENE_SWITCH_TTL_MS : COMMAND_TTL_MS;
}

let state = {
  revision: 0,
  updatedAt: 0,
  command: null
};

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Regie-Key');
}

function readSince(req) {
  const raw = req.query && req.query.since;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isAuthorized(req) {
  if (!REGIE_KEY) return true;
  const headerKey = req.headers['x-regie-key'];
  const queryKey = req.query && req.query.key;
  const bodyKey = req.body && req.body.key;
  const provided = headerKey || queryKey || bodyKey;
  return provided && provided === REGIE_KEY;
}

function getCurrentCommand(now) {
  if (!state.command) return null;
  const ttl = getCommandTtlMs(state.command.action);
  if ((now - state.command.issuedAt) > ttl) {
    return null;
  }
  return state.command;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = Date.now();

  if (req.method === 'GET') {
    const since = readSince(req);
    const command = getCurrentCommand(now);
    const changed = state.revision > since;

    return res.status(200).json({
      success: true,
      secureMode: Boolean(REGIE_KEY),
      revision: state.revision,
      changed,
      updatedAt: state.updatedAt || null,
      command,
      // pusherKey/pusherCluster sind laut Pusher selbst zum Client-seitigen
      // Exponieren gedacht (im Gegensatz zu PUSHER_SECRET) - erlaubt
      // oldschool-master.html, sich selbst zu konfigurieren, ohne die Werte
      // hart in die statische HTML-Datei zu backen. null, falls nicht (voll-
      // staendig) konfiguriert - der Client faellt dann auf reines Polling zurueck.
      pusherKey: PUSHER_CONFIGURED ? PUSHER_KEY : null,
      pusherCluster: PUSHER_CONFIGURED ? PUSHER_CLUSTER : null
    });
  }

  if (req.method === 'POST') {
    if (!isAuthorized(req)) {
      return res.status(401).json({
        success: false,
        message: 'Nicht autorisiert. REGIE_CONTROL_KEY fehlt oder ist falsch.'
      });
    }

    const body = req.body || {};
    const action = typeof body.action === 'string' ? body.action.trim() : '';

    if (!action) {
      return res.status(400).json({ success: false, message: 'Feld "action" fehlt.' });
    }

    state.revision += 1;
    state.updatedAt = now;
    state.command = {
      id: state.revision,
      scene: typeof body.scene === 'string' ? body.scene : 'oldschool-starting',
      action,
      payload: body.payload && typeof body.payload === 'object' ? body.payload : {},
      issuedAt: now
    };

    // Zusaetzlicher Push-Kanal, kein Ersatz fuer die obige In-Memory-State-
    // Logik (die bleibt fuer das GET-Polling unveraendert bestehen).
    await broadcastCommand(state.command);

    return res.status(200).json({
      success: true,
      secureMode: Boolean(REGIE_KEY),
      revision: state.revision,
      command: state.command
    });
  }

  if (req.method === 'DELETE') {
    if (!isAuthorized(req)) {
      return res.status(401).json({
        success: false,
        message: 'Nicht autorisiert. REGIE_CONTROL_KEY fehlt oder ist falsch.'
      });
    }

    state.revision += 1;
    state.updatedAt = now;
    state.command = null;

    return res.status(200).json({
      success: true,
      secureMode: Boolean(REGIE_KEY),
      revision: state.revision,
      command: null
    });
  }

  return res.status(405).json({ success: false, message: 'Methode nicht erlaubt.' });
}
