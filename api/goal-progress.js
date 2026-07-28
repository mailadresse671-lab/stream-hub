import { kvIncrByFloat, kvSet } from './_lib/kv.js';

const GOAL_API_SECRET = process.env.GOAL_API_SECRET;
const STARS_MAX = 5;
const POINTS_PER_SUB = 1;
const POINTS_PER_100_BITS = 1; // 100 Bits = 1 Fahndungsstern

// Schreib-Endpoint: goal.html ruft diesen bei jedem Sub/Resub/Cheer-Event
// (aus der eigenen Twitch-EventSub-WebSocket-Verbindung) auf, um den
// Wanted-Level-Fortschritt persistent (ueber Reloads/Cold-Starts hinweg) zu
// erhoehen. X-Goal-Secret ist kein echter Auth-Schutz (der Wert steht im
// Klartext im HTML-Quelltext von goal.html) - es ist bewusst nur ein Spam-
// Deterrent gegen zufaelliges/automatisiertes Treffen des Endpoints, nicht
// gegen einen gezielten Angreifer. Fuer eine rein kosmetische Sterne-Anzeige
// ist das angemessen, siehe CLAUDE.md-Review dazu.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Goal-Secret');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Nur POST erlaubt.' });
  }

  if (GOAL_API_SECRET && req.headers['x-goal-secret'] !== GOAL_API_SECRET) {
    return res.status(401).json({ success: false, message: 'Ungueltiges oder fehlendes X-Goal-Secret.' });
  }

  const { type, amount } = req.body || {};
  let delta = 0;
  if (type === 'sub') {
    delta = POINTS_PER_SUB;
  } else if (type === 'bits') {
    delta = (Number(amount) || 0) / 100 * POINTS_PER_100_BITS;
  } else {
    return res.status(400).json({ success: false, message: 'type muss "sub" oder "bits" sein.' });
  }

  if (delta <= 0) {
    return res.status(400).json({ success: false, message: 'Kein positiver Fortschritt (delta <= 0).' });
  }

  try {
    const rawPoints = await kvIncrByFloat('wanted:points', delta);
    const triggered = rawPoints >= STARS_MAX;

    // Reset auf 0 statt (rawPoints - STARS_MAX): bewusst einfach gehalten,
    // ein Ueberlauf ueber 5 Sterne hinaus (z.B. ein einzelner Bit-Train,
    // der von 4.7 direkt auf 6 springt) wird verworfen statt in die
    // naechste Runde uebernommen - siehe Roadmap-Review ("Ghetto-
    // Engineering", keine Stream-Grenzen-Kopplung). Der Client zeigt die
    // Sterne sofort auf 0 zurueckgesetzt an, unabhaengig davon, wann der
    // "wanted"-Alert selbst in der Popup-Warteschlange drankommt - der
    // eigentliche Celebration-Moment ist der Alert, nicht der Stern-Zustand.
    if (triggered) {
      await kvSet('wanted:points', 0);
    }

    const points = triggered ? 0 : rawPoints;
    return res.status(200).json({ success: true, points, stars: Math.floor(points), triggered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
