export default async function handler(req, res) {
  // CORS-Header setzen, damit dein Tablet die Daten ungehindert lesen darf
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const PLAYER_NAME = "DaNgsxR";
  const PLATFORM = "epic";

  try {
    // Anfrage direkt vom Vercel-Cloudserver an die Tracker-API (wird nicht geblockt)
    const response = await fetch(`https://api.tracker.gg/api/v2/rocket-league/standard/profile/${PLATFORM}/${encodeURIComponent(PLAYER_NAME)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(200).json({ success: false, message: 'Tracker lädt noch...' });
    }

    const data = await response.json();
    const overview = data?.data?.segments?.find(s => s.type === 'overview');

    if (overview && overview.stats) {
      const wins = overview.stats.wins ? overview.stats.wins.value : 0;
      const matches = overview.stats.matchesPlayed ? overview.stats.matchesPlayed.value : 0;

      return res.status(200).json({
        success: true,
        player: PLAYER_NAME,
        wins: wins,
        matches: matches
      });
    }

    return res.status(200).json({ success: false, message: 'Keine Stats gefunden' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
