# PROJECT_INFO.md

Kompakte Referenz mit konkreten, öffentlichen Projekt-Fakten (Kanalname, Domains, Spielername etc.) — gedacht für externe Tools wie Aider, damit Analysen/Empfehlungen nicht mit Platzhaltern arbeiten müssen. **Enthält bewusst keine Secrets/Tokens/Keys** — nur Namen der benötigten Env-Variablen, siehe Abschnitt 5.

Ausführlicher Projektkontext (Historie, Design-Entscheidungen, offene Punkte): siehe `CLAUDE.md`. Kompakter technischer Überblick: siehe `CURSOR_CONTEXT.md`.

## 1. Twitch

| Feld | Wert |
|---|---|
| Login/Channel-Name (für `?channel=`-Parameter, API-Calls) | `dangsxr1000` |
| Anzeigename (Display-Name) | `DaNgsxr1000` |
| Kanal-URL | `https://twitch.tv/dangsxr1000` |
| Stream-Sprache | Deutsch |
| Kategorie | Rocket League |
| Affiliate-Status | Noch nicht erreicht (0/10 Abonnenten-Punkte, Stand siehe `CLAUDE.md`) |

## 2. Vercel-Deployment

| Feld | Wert |
|---|---|
| **Production-URL (maßgeblich)** | `https://stream-hub-three-gold.vercel.app` |
| GitHub-Repo-„Homepage"-Feld (alternativer/möglicher Alias) | `https://stream-hub-da-n1.vercel.app` |
| GitHub-Repository | `https://github.com/mailadresse671-lab/stream-hub` (öffentlich) |
| Standard-Branch | `main` (Auto-Deploy bei jedem Push) |

**Wichtig zur Production-URL**: `https://stream-hub-three-gold.vercel.app` ist die Adresse, die **im Code selbst** fest hinterlegt ist (Konstante `VERCEL_URL`, referenziert u.a. in `goal.html`, `index.html`, `overlay.html`, `in-game.html`, `avatar.html`, `event-cards.html`, `hype-level.html`, `rl-stats.html`, `rl-daily.html` für die eigenen API-Calls) — diese muss also erreichbar sein, damit die Widgets funktionieren, und ist deshalb als primäre Adresse zu behandeln. `https://stream-hub-da-n1.vercel.app` taucht dagegen nur im „homepage"-Metadatenfeld des GitHub-Repos auf, wird im Code nirgends verwendet. Ob beide Adressen auf dasselbe Deployment zeigen (z.B. als Vercel-Alias) oder eine davon veraltet ist, ließ sich aus dieser Sandbox nicht prüfen (kein Netzwerkzugriff auf Vercel-Domains) — bei Bedarf im Browser gegenchecken.

## 3. Rocket League / Epic Games

| Feld | Wert |
|---|---|
| Epic-Games-Spielername (case-sensitive) | `DaNgsxR` |
| Plattform-Kürzel (für Tracker.gg-API) | `epic` |
| Bevorzugte Ranked-Playlist | `ranked-doubles`, Fallback `ranked-standard` |

Quelle: `PLAYER_NAME`/`PLATFORM`-Konstanten in `api/stats.js`. Falls sich der Epic-Handle seither geändert hat, bitte hier UND in `api/stats.js` (Zeile 1) aktualisieren.

## 4. Weitere Hinweise

- **Social-Media-Handles** (Twitter/X, Instagram, TikTok, Discord): **noch nicht festgelegt.** Bewusste Lücke, kein fehlender Rechercheschritt — siehe `CLAUDE.md`, offener Punkt „Social-Media-Handles ... von DaN festlegen lassen". Bitte nicht raten oder Platzhalter erfinden.
- **Streaming-Setup (aktuell korrekt)**: 100% Cloud-/Mobile-Setup — GeForce NOW Ultimate (Cloud-Gaming, kein PC/Konsole), Samsung Galaxy Tab S11 Ultra (Streamlabs Mobile, Gaming+Regie), Samsung Galaxy S26 Ultra (Chat/Control). **Nicht mehr aktuell**: der alte Twitch-Panel-Text „Mein Setup" (PS4 + DualShock 4) — das ist ein bekannter, noch nicht im echten Twitch-Dashboard korrigierter Fehler, siehe `PANEL_CONCEPT.md` für den bereits fertig formulierten korrigierten Text.

## 5. Benötigte Umgebungsvariablen (Namen — keine Werte!)

Liegen ausschließlich als Vercel-Projekt-Umgebungsvariablen vor, nicht im Repo:

- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`
- `TWITCH_REFRESH_TOKEN`
- `TRACKER_API_KEY`

## 6. URL-Parameter-Konventionen (für Browser-Quellen-Links)

| Datei | Beispiel |
|---|---|
| `chat.html` | `chat.html?channel=dangsxr1000` (Pflicht, sonst Demo-Modus) |
| `goal.html` | `goal.html?track=Soundtrack%20by%20Twitch` (optional) |
| `start.html` | `start.html?minutes=5&track=...&artist=...` (optional) |
| `in-game.html` / `overlay.html` | `?track=`/`?artist=` (optional) |
| Alle Widgets mit Alert-Logik | `?test=follow\|sub\|resub\|bits\|raid\|goal\|idle\|speak` (Test-Modus, je nach Datei) |
