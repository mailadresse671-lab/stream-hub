const PLAYER_NAME = "DaNgsxR";
const PLATFORM = "epic";
const CACHE_TTL_MS = 30 * 1000;
const TRACKER_API_KEY = process.env.TRACKER_API_KEY;

// Modul-weiter In-Memory-Cache: bleibt zwischen Aufrufen erhalten, solange
// Vercel dieselbe (warme) Function-Instanz wiederverwendet.
// Wichtig: pro angefragter Playlist/Modus cachen, damit sich 1v1/2v2/3v3
// Antworten nicht gegenseitig ueberschreiben.
const cacheBySelection = new Map();

// Bevorzugte Ranked-Playlists in Praeferenz-Reihenfolge (2v2 zuerst, passt
// zu den "2v2"/"3v3"-Tags im Kanal-Profil), Fallback auf die erste Playlist
// mit gueltigen Tier-Daten, falls keine der beiden vorhanden ist.
const PREFERRED_PLAYLIST_KEYS = ['ranked-doubles', 'ranked-standard'];
const VALID_MODES = new Set(['auto', '1v1', '2v2', '3v3', 'hoops', 'rumble', 'dropshot', 'snowday']);

const MODE_TOKENS = {
  '1v1': ['duel', '1v1', 'soloduel', 'rankedduel'],
  '2v2': ['doubles', '2v2', 'double', 'rankeddoubles'],
  '3v3': ['standard', '3v3', 'rankedstandard'],
  hoops: ['hoops'],
  rumble: ['rumble'],
  dropshot: ['dropshot', 'drop shot'],
  snowday: ['snowday', 'snow day']
};

function asSingleString(value) {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseSelection(req) {
  const rawMode = asSingleString(req?.query?.mode).toLowerCase().trim();
  const mode = VALID_MODES.has(rawMode) ? rawMode : 'auto';

  const rawPlaylist = asSingleString(req?.query?.playlist).trim();
  const playlist = rawPlaylist ? rawPlaylist : null;

  return { mode, playlist };
}

function makeCacheKey(selection) {
  const playlistPart = selection.playlist ? selection.playlist.toLowerCase() : '-';
  return `${PLATFORM}:${PLAYER_NAME}:${selection.mode}:${playlistPart}`;
}

function listPlaylists(segments) {
  if (!Array.isArray(segments)) return [];
  return segments
    .filter((segment) => segment?.type === 'playlist')
    .map((segment) => ({
      key: segment?.attributes?.key || null,
      name: segment?.metadata?.name || null,
      tierName: segment?.stats?.tier?.metadata?.name || null,
      mmr: segment?.stats?.rating?.value ?? null,
      hasRank: Boolean(segment?.stats?.tier?.metadata?.name)
    }));
}

function extractRank(segment) {
  const tier = segment?.stats?.tier;
  const rating = segment?.stats?.rating;
  if (!tier?.metadata?.name) return null;
  return {
    playlistKey: segment?.attributes?.key || null,
    playlist: segment.metadata?.name || segment.attributes?.key || 'Ranked',
    tierName: tier.metadata.name,
    tierIconUrl: tier.metadata.iconUrl || null,
    mmr: rating?.value ?? null
  };
}

function pickByMode(playlists, mode) {
  const tokens = MODE_TOKENS[mode] || [];
  if (tokens.length === 0) return null;

  for (const segment of playlists) {
    const rank = extractRank(segment);
    if (!rank) continue;
    const haystack = normalizeText(`${segment?.attributes?.key || ''} ${segment?.metadata?.name || ''}`);
    const matches = tokens.some((token) => haystack.includes(normalizeText(token)));
    if (matches) return rank;
  }

  return null;
}

function pickByExplicitPlaylist(playlists, playlist) {
  if (!playlist) return null;
  const wanted = normalizeText(playlist);

  for (const segment of playlists) {
    const rank = extractRank(segment);
    if (!rank) continue;
    const key = normalizeText(segment?.attributes?.key || '');
    const name = normalizeText(segment?.metadata?.name || '');
    if (key === wanted || name === wanted) {
      return rank;
    }
  }

  for (const segment of playlists) {
    const rank = extractRank(segment);
    if (!rank) continue;
    const haystack = normalizeText(`${segment?.attributes?.key || ''} ${segment?.metadata?.name || ''}`);
    if (haystack.includes(wanted)) {
      return rank;
    }
  }

  return null;
}

// Sucht in den Tracker.gg-Segmenten nach Rang-/MMR-Daten fuer eine
// bevorzugte Playlist. Liefert null, wenn nichts Verwertbares gefunden
// wird (z.B. Season noch unranked) - das Overlay blendet den Rang-HUD dann
// einfach aus, statt kaputte Werte anzuzeigen.
function findRank(segments, selection) {
  if (!Array.isArray(segments)) return null;
  const playlists = segments.filter(s => s.type === 'playlist');

  const explicitMatch = pickByExplicitPlaylist(playlists, selection?.playlist);
  if (explicitMatch) return explicitMatch;

  if (selection?.mode && selection.mode !== 'auto') {
    const modeMatch = pickByMode(playlists, selection.mode);
    if (modeMatch) return modeMatch;
  }

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

  const selection = parseSelection(req);
  const cacheKey = makeCacheKey(selection);
  const cacheEntry = cacheBySelection.get(cacheKey);
  const now = Date.now();

  // Frischer Cache-Treffer: kein neuer Request an tracker.gg nötig
  if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_TTL_MS) {
    return res.status(200).json({ ...cacheEntry.data, cached: true, stale: false });
  }

  if (!TRACKER_API_KEY) {
    if (cacheEntry?.data) {
      return res.status(200).json({ ...cacheEntry.data, cached: true, stale: true });
    }
    return res.status(200).json({
      success: false,
      message: 'TRACKER_API_KEY fehlt als Vercel-Umgebungsvariable.'
    });
  }

  try {
    // Offizielle Tracker-Network-API statt der frueheren privaten/
    // undokumentierten api.tracker.gg-Adresse - die wurde von Tracker.gg
    // per Cloudflare-Bot-Schutz pauschal fuer Cloud-/Datacenter-IPs wie
    // Vercels gesperrt (HTTP 403 "You've Been Blocked"), unabhaengig von
    // Request-Headern. Der offizielle Endpoint auf public-api.tracker.gg
    // ist per API-Key authentifiziert und dadurch nicht von dieser Sperre
    // betroffen. URL-Pfad exakt nach dem Code-Beispiel aus der offiziellen
    // Tracker-Network-Dokumentation (tracker.gg/developers/docs/data-ingest):
    // /api/v1/{titleSlug}/standard/profile/{platform}/{playerId} - der
    // vorherige Versuch ohne "/api/"-Praefix und mit "/v2/" statt "/api/v1/"
    // fuehrte zu HTTP 401 "Invalid authentication credentials".
    const response = await fetch(`https://public-api.tracker.gg/api/v1/rocket-league/standard/profile/${PLATFORM}/${encodeURIComponent(PLAYER_NAME)}`, {
      headers: {
        'TRN-Api-Key': TRACKER_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (cacheEntry?.data) {
        return res.status(200).json({ ...cacheEntry.data, cached: true, stale: true });
      }
      // Detaillierte Diagnose statt einer generischen Meldung - 401/403 =
      // API-Key fehlt/ungueltig, 404 = Spieler/Plattform nicht gefunden,
      // 5xx = tracker.gg-seitiges Problem. Der Body-Ausschnitt zeigt oft
      // direkt die Ursache.
      const errorBody = await response.text().catch(() => '');
      return res.status(200).json({
        success: false,
        message: `Tracker.gg antwortete mit HTTP ${response.status} ${response.statusText}`,
        trackerStatus: response.status,
        trackerBodySnippet: errorBody.slice(0, 300)
      });
    }

    const data = await response.json();
    const playlists = listPlaylists(data?.data?.segments);
    const overview = data?.data?.segments?.find(s => s.type === 'overview');

    if (overview && overview.stats) {
      const wins = overview.stats.wins ? overview.stats.wins.value : 0;
      const matches = overview.stats.matchesPlayed ? overview.stats.matchesPlayed.value : 0;

      const payload = {
        success: true,
        player: PLAYER_NAME,
        wins: wins,
        matches: matches,
        selectedMode: selection.mode,
        selectedPlaylist: selection.playlist,
        availablePlaylists: playlists,
        rank: findRank(data?.data?.segments, selection)
      };

      cacheBySelection.set(cacheKey, { data: payload, timestamp: now });

      return res.status(200).json({ ...payload, cached: false, stale: false });
    }

    if (cacheEntry?.data) {
      return res.status(200).json({ ...cacheEntry.data, cached: true, stale: true });
    }
    const foundSegmentTypes = Array.isArray(data?.data?.segments) ? data.data.segments.map(s => s.type) : [];
    return res.status(200).json({
      success: false,
      message: 'Keine Stats gefunden (Antwort kam an, aber ohne "overview"-Segment)',
      foundSegmentTypes
    });
  } catch (err) {
    if (cacheEntry?.data) {
      return res.status(200).json({ ...cacheEntry.data, cached: true, stale: true });
    }
    return res.status(500).json({ error: err.message });
  }
}
