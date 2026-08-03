const COMMAND_TTL_MS = 5 * 60 * 1000;
const REGIE_KEY = process.env.REGIE_CONTROL_KEY;

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
  if ((now - state.command.issuedAt) > COMMAND_TTL_MS) {
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
      command
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
