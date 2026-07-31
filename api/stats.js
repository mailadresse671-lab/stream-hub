const PLAYER_NAME = "DaNgsxR";
const PLATFORM = "epic";
const CACHE_TTL_MS = 30 * 1000;

// Modul-weiter In-Memory-Cache: bleibt zwischen Aufrufen erhalten, solange
// Vercel dieselbe (warme) Function-Instanz wiederverwendet.
let cache = { data: null, timestamp: 0 };

// Bevorzugte Ranked-Playlists in Praeferenz-Reihenfolge (2v2 zuerst, passt
// zu den "2v2"/"3v3"-Tags im Kanal-Profil), Fallback auf die erste Playlist
// mit gueltigen Tier-Daten, falls keine der beiden vorhanden ist.
const PREFERRED_PLAYLIST_KEYS = ['ranked-doubles', 'ranked-standard'];

function extractRank(segment) {
  const tier = segment?.stats?.tier;
  const rating = segment?.stats?.rating;
  if (!tier?.metadata?.name) return null;
  return {
    playlist: segment.metadata?.name || segment.attributes?.key || 'Ranked',
    tierName: tier.metadata.name,
    tierIconUrl: tier.metadata.iconUrl || null,
    mmr: rating?.value ?? null
  };
}

// Sucht in den Tracker.gg-Segmenten nach Rang-/MMR-Daten fuer eine
// bevorzugte Playlist. Liefert null, wenn nichts Verwertbares gefunden
// wird (z.B. Season noch unranked) - das Overlay blendet den Rang-HUD dann
// einfach aus, statt kaputte Werte anzuzeigen.
function findRank(segments) {
  if (!Array.isArray(segments)) return null;
  const playlists = segments.filter(s => s.type === 'playlist');

  for (const key of PREFERRED_PLAYLIST_KEYS) {
    const match = playlists.find(s => s.attributes?.key === key);
    const rank = match && extractRank(match);
    if (rank) return rank;
  }

  for (const segment of playlists) {
    const rank = extractRank(segment);
    if (rank) return rank;
  }

  return null;
}

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
      // Detaillierte Diagnose statt der frueheren generischen "Tracker
      // laedt noch..."-Meldung, die nie erkennen liess, WARUM der Aufruf
      // an tracker.gg fehlschlaegt (z.B. 403 = blockiert/Rate-Limit,
      // 404 = Spieler/Plattform nicht gefunden, 5xx = tracker.gg-seitiges
      // Problem) - der Body-Ausschnitt zeigt oft direkt die Ursache.
      const errorBody = await response.text().catch(() => '');
      return res.status(200).json({
        success: false,
        message: `Tracker.gg antwortete mit HTTP ${response.status} ${response.statusText}`,
        trackerStatus: response.status,
        trackerBodySnippet: errorBody.slice(0, 300)
      });
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
        matches: matches,
        rank: findRank(data?.data?.segments)
      };

      cache = { data: payload, timestamp: now };

      return res.status(200).json({ ...payload, cached: false, stale: false });
    }

    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true });
    }
    const foundSegmentTypes = Array.isArray(data?.data?.segments) ? data.data.segments.map(s => s.type) : [];
    return res.status(200).json({
      success: false,
      message: 'Keine Stats gefunden (Antwort kam an, aber ohne "overview"-Segment)',
      foundSegmentTypes
    });
  } catch (err) {
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true });
    }
    return res.status(500).json({ error: err.message });
  }
}
