# CURSOR_CONTEXT.md

Übergabe-Snapshot für die Weiterarbeit an **stream-hub** in Cursor. Dieses Dokument ist eine strukturierte Zusammenfassung — die vollständige chronologische Historie (jede Fehlerkorrektur-Runde, jede Nutzer-Rückmeldung) steht in [`CLAUDE.md`](./CLAUDE.md). Bei Widersprüchen zwischen den beiden Dateien gilt: **dieses Dokument beschreibt den aktuellen Ist-Zustand**, `CLAUDE.md` erklärt, wie es dazu kam.

## Steckbrief

| | |
| :--- | :--- |
| **Zweck** | Streaming-Overlays + Serverless-APIs für Twitch/Rocket League, eingebunden als Browser-Quellen in Streamlabs Mobile |
| **Streamer** | DaN, Twitch-Kanal `dangsxr1000`, Rocket-League-ID `DaNgsxR` (Epic Games) |
| **Hosting** | Vercel, Auto-Deploy bei jedem Push auf `main` |
| **Live-URL** | `https://stream-hub-three-gold.vercel.app/` |
| **Repo** | `mailadresse671-lab/stream-hub` |
| **Setup** | 100% mobil/Cloud: GeForce NOW Ultimate (Rocket League) auf Samsung Galaxy Tab S11 Ultra (Streamlabs Mobile), Chat/Monitoring auf Samsung Galaxy S26 Ultra |
| **Datenbank** | Keine. Zustand liegt in `localStorage` (Browser der jeweiligen Quelle) oder kommt per URL-Query-Parameter |

---

## 1. Architektur & Deployment

- **Statisches Hosting**: Alle `.html`-Dateien liegen im Repo-Root und werden von Vercel unverändert ausgeliefert. Kein Build-Schritt, kein Framework — reines HTML/CSS/Vanilla-JS pro Datei, jede Seite ist eigenständig lauffähig.
- **Serverless Functions**: `api/*.js` laufen als Vercel-Node-Functions (`export default async function handler(req, res)`). Jede Function ist **bewusst self-contained** — kein gemeinsames `lib/`-Modul zwischen den API-Dateien (Konvention im Projekt), Wiederholung wird in Kauf genommen für Einfachheit/Deploy-Isolation.
- **Live-Einbindung**: Jede Szene/jedes Widget wird in Streamlabs Mobile als eigene **Browser-Quelle** (Android WebView, nicht der normale Mobile-Chrome) eingebunden. Das bringt drei projektprägende technische Einschränkungen mit sich:
  1. **`getUserMedia()` (Mikrofon) ist in dieser WebView bestätigt blockiert** — kein Berechtigungsdialog erscheint überhaupt. Funktioniert im normalen Mobile-Browser einwandfrei (live vom Nutzer bestätigt). Deshalb: Mikro ist überall nur ein kostenloser Bonus-Pfad, nie die primäre Interaktionsquelle.
  2. **Externe CDN-Skripte sind nicht zuverlässig ladbar.** Das hat lange die Twitch-Chat-Anbindung sabotiert — siehe Abschnitt 8 (tmi.js-Root-Cause) für die volle Diagnose. Konsequenz fürs Projekt: **so wenig externe Laufzeit-Abhängigkeiten wie möglich**, und wenn nötig, selbst hosten statt auf ein CDN zu vertrauen.
  3. **Die Streamlabs-Transform-Panel-Größenänderung skaliert Inhalt NICHT proportional** — sie ändert nur die Render-Viewport-Größe der Quelle. Das treibt das gesamte `--vu`-Fluid-Unit-System (Abschnitt 2).
- **Keine externe Datenbank** — bewusste Architekturentscheidung (wurde einmal mit Vercel KV gebaut, noch am selben Tag zurückgebaut). Persistenter Zustand läuft über `localStorage` im Browser der jeweiligen Quelle (z. B. Wanted-Level, Hype-Level, RL-Tagesbilanz); konfigurierbare Werte über URL-Query-Parameter (`?channel=`, `?track=`, `?minutes=` etc.).
- **Benötigte Vercel-Umgebungsvariablen**:
  | Variable | Zweck |
  | :--- | :--- |
  | `TWITCH_CLIENT_ID` | Twitch-App-Credential (dev.twitch.tv/console) |
  | `TWITCH_CLIENT_SECRET` | Twitch-App-Credential |
  | `TWITCH_REFRESH_TOKEN` | Einmalig per OAuth-Authorization-Code-Flow beschafft (Scopes: `moderator:read:followers`, `channel:read:subscriptions`, `bits:read`); Access-Token wird bei jedem Aufruf frisch daraus erzeugt |
  | ~~`STREAMLABS_SOCKET_TOKEN`~~ | **Entfernt** — Streamlabs-Socket-Anbindung wurde komplett durch native Twitch-EventSub ersetzt |
  | ~~`GOAL_API_SECRET`~~ / KV-Variablen | **Entfernt** — Wanted-Level lief kurz über Vercel KV, wurde bewusst wieder auf `localStorage` zurückgebaut |

---

## 2. Design-Systeme & Skalierung

### Das `--vu`-Fluid-Unit-System

**Kernregel: niemals `transform: scale()` für Layout-Skalierung verwenden.** Historisch wurde das für `overlay.html` versucht — Ergebnis: sichtbar unscharfer/verpixelter Text in der Streamlabs-WebView, weil sie herunterskalierte Layer als Bitmap nachskaliert statt Text bei der Zielgröße neu zu rasterisieren.

Stattdessen wird **jede** feste Pixelgröße (Font-Size, Padding, Gap, Border, Icon-Maße, …) als `calc(var(--vu) * N)` geschrieben, wobei `--vu` eine `clamp()`-Formel ist, die mit der tatsächlichen Viewport-Breite mitschrumpft. Damit rasterisiert der Browser Text/Formen **nativ in der finalen Zielgröße** — scharf, unabhängig von der echten Auflösung, die die Streamlabs-WebView dem iframe gibt.

Es gibt **zwei Kalibrierungen**, je nach Quellen-Typ:

| Quellen-Typ | `--vu`-Formel | Referenzbreite | Betrifft |
| :--- | :--- | :--- | :--- |
| Vollflächige Master-Szene (1920×1080) | `clamp(0.5px, 0.0521vw, 1px)` | 1920px (ergibt exakt 1px bei 1920px Breite) | `overlay.html`, `goal.html`, `chat.html`, `in-game.html`, `start.html` |
| Frei positionierbares Einzel-Widget | `clamp(0.3px, K·vw, 3px)`, K = `100/Design-Breite` | eigene, kleinere Design-Breite (z. B. ~380px) | `rl-stats.html`, `rl-daily.html`, `hype-level.html`, `chat-vibes.html`, `status-ticker.html`, `status-bar.html`, `event-cards.html` |

`avatar.html` braucht kein `--vu`: es füllt die eigene Seite per `width/height:100%` + `object-fit:contain` randlos aus, Streamlabs' Transform-Panel steuert die Endgröße direkt.

### Visuelle Stile im Repo (drei getrennte Systeme — nicht vermischen)

1. **"Urban Blackout"** (aktuell) — `goal.html`, `chat.html`, die Hood-Widgets in `overlay.html`. Tiefschwarz/Anthrazit (`--asphalt: #08090a`), Neon-Rot (`--blood: #ff1a1a`) + Gold (`--gold: #ffd700`), `Bebas Neue` (Headlines) + `Montserrat` (Body), hartkantige gekappte Ecken (`clip-path` mit `--cut`-Variable), Chainlink-Fence-Textur, Police-Tape-Akzente. Löste einen früheren braun-zerrissenen "Hood/Ghetto"-Look ab.
2. **"Chrome/Gold-Bling" (Vintage Hip-Hop)** — `start.html`, `in-game.html` und alle sechs modularen Widgets (`rl-stats.html`, `rl-daily.html`, `status-ticker.html`, `event-cards.html`, `chat-vibes.html`, `hype-level.html`, `status-bar.html`). `Anton` (Display) + `Share Tech Mono` (Body), Blutrot `#ff2340` + wandernder Gold-Chrom-Farbverlauf (`chromeShine`-Keyframe), aus zwei Claude-Design-Exports extrahiert.
3. **Glassmorphism (alt, unangetastet)** — `index.html`, `branding.html`. Dark-Slate-Hintergrund, Blau/Orange-Neon-Akzente, `backdrop-filter: blur()`, abgerundete Ecken. Bewusst nicht auf einen der neueren Looks migriert (offener Punkt, siehe Abschnitt 10).

---

## 3. Kern-Dateien im Detail

### `in-game.html` — Gameplay-HUD-Bündel

All-In-One-Zusatzszene (transparent, liegt über dem Rocket-League-Gameplay), **kein Ersatz für `overlay.html`** — beide sind getrennte, wählbare Browser-Quellen. Nach mehreren Kollisions-Runden mit unterschiedlichen RL-Bildschirmen (Lobby-Menü, In-Match-HUD, Nachspiel-Ergebnisliste) minimalistisch umgebaut:

- **Bär** (`#bearPosition`/`.bear-position`, unten mittig, `200×288` Design-Pixel) — freistehend ohne umschließenden Rahmen, permanentes Idle-Wippen (`.bear-bob`) plus Crossfade auf die Action-Pose bei Chat-Nachrichten/Twitch-Events (`triggerBearReaction()`, 3.5s Anzeigedauer, Timing 1:1 aus `avatar.html`). Mikro bleibt Bonus-Pfad.
- **`.left-info-stack`** (vertikal zentriert am linken Rand) — Status-Ticker + RL-**Session**-Stats-Karte (Siege/Niederlagen/Winrate, Live/Cached/Offline-Status, Offline-Fallback-Panel). **Wichtig**: das ist die Session-Variante (Reset bei jedem Neuladen), NICHT die neue Tagesbilanz aus `rl-daily.html` — die beiden Logiken sind bisher nicht zusammengeführt.
- **Event-Karten oben rechts** — "Letzter Follower"/"Letzte Subsprüche"/"Letzte Spende" (Spende = Bits/Cheers, da keine echte Spendenplattform existiert), live aus der EventSub-Verbindung gespeist, "Letzter Follower" zusätzlich beim Laden per `api/twitch-followers.js` vorbefüllt.
- **"CHAT VIBES"-Panel rechts** — eigene tmi.js-Instanz (lädt jetzt über den lokalen Bundle, siehe Abschnitt 8), XSS-sicheres Emote-Rendering.
- **Hype-Level unten links** — 5-Sterne-"WANTED-METER" (`localStorage`-Key `dangsxr_hypeLevel`, **bewusst nicht** vereinheitlicht mit `goal.html`s `dangsxr_wanted_points`), klickbar + Cross-Tab-Sync + Auto-Increment bei Sub/Cheer.
- **Bottom-Bar** — 16-Balken-EQ, Vinyl-Spinner, Track-Marquee (`?track=`/`?artist=`), MIC/CAM/NET-Status-Punkte (nur NET real an EventSub-Verbindungsstatus gekoppelt), Live-Uptime-Zähler.
- `?test=follow|sub|resub|bits|react|hype|speak` zum manuellen Durchtesten aller Effekte.
- Lädt `tmi.js` über `/assets/js/tmi-loader.js` (same-origin, siehe Abschnitt 8).

### `start.html` — Countdown-/"Starting Soon"-Szene

Eigenständige, **deckende** Szene (kein transparentes Overlay über Gameplay) für die Zeit vor Stream-Start. Zentrale Spalte: Twitch-Handle + "SIGNAL: BEREITSCHAFT" oben, Bär (`avatar_action.png` als statische Pose, Ganzkörper, Glow-Drop-Shadow) mittig, riesige Gold-Chrom-Headline ("GLEICH LIVE" → "JETZT LIVE"), gerahmter Countdown-Block, rotierender Status-Ticker (5 Meldungen, 10s-Rotation), Bottom-Bar mit EQ/Vinyl/Track-Marquee.

- **Countdown-Logik**: `?minutes=`-Parameter (Default 5), zählt real per `performance.now()` runter, schaltet bei 0:00 **einmalig** auf "JETZT LIVE" um — läuft NICHT endlos im Loop (bewusste Abweichung vom Claude-Design-Export, der für die Design-Tool-Vorschau `loopCountdown:true` nutzt).
- Kein Hype-Level-Widget mehr (auf Nutzerwunsch entfernt — "hat auf dem Start-Bildschirm nichts zu suchen").
- Konfigurierbar: `?minutes=`, `?track=`, `?artist=`.

### `overlay.html` — All-In-One Master-Szene (Urban Blackout)

Kombiniert `goal.html` (Follower-Ziel + Alert-/Audio-/Physik-System + Wanted-Level + Chat-Commands + Soundtrack-Badge) + `chat.html` (Chat-Feed) + `avatar.html` (Bär) + die Session-Stats/Rang-Logik aus `index.html` + `branding.html` auf **einer** Browser-Quelle. Vorteil: alle drei tmi.js-Anwendungsfälle (Chat rendern, Chat-Commands, Avatar-Reaktion) laufen über **eine** gemeinsame Verbindung statt drei getrennter.

Layout (alle Anker-Container `vw`/`vh`-verankert, vertikal zentriert an den Rändern statt in festen Ecken — Kollisionsvermeidung mit RL-eigenem HUD):
- `.left-edge-stack` (vertikal zentriert links): Wanted-Level + Session-Stats/Rang zu **einer** gemergten Karte zusammengeführt (`.hud-card-merged`).
- `.goal-position` (oben rechts): Follower-Ziel-Fortschrittsbalken.
- `.avatar-position` (unten links): Bär.
- `.right-edge-stack` (vertikal zentriert rechts): Chat-Feed + Branding-Tag.
- `.soundtrack-position` (unten mittig): Laufschrift-Badge.
- Party-Popup (Alert-Overlay, bildschirmmittig, NICHT im `--vu`-System — transient, eigene JS-Transform-Kette).
- Lädt `tmi.js` über `/assets/js/tmi-loader.js`.

Die Original-Einzelseiten (`goal.html`, `chat.html`, `avatar.html`, `index.html`, `branding.html`) bleiben unverändert als modulare Backup-Szenen bestehen.

### `api/twitch-eventsub.js` — EventSub-Subscription-Endpoint

Vercel-Function, `POST`-only. Nimmt eine `session_id` (von einem bereits geöffneten `wss://eventsub.wss.twitch.tv/ws`-WebSocket-Handshake) entgegen und meldet fünf Subscriptions bei Twitch Helix an:

```
channel.follow (v2)              — condition: {broadcaster_user_id, moderator_user_id}
channel.subscribe (v1)           — condition: {broadcaster_user_id}
channel.subscription.message (v1)— condition: {broadcaster_user_id}
channel.cheer (v1)                — condition: {broadcaster_user_id}
channel.raid (v1)                 — condition: {to_broadcaster_user_id}  ← Raids IN den Kanal
```

Holt zuvor per Refresh-Token einen frischen Access-Token (`getAccessToken()`) und die Broadcaster-ID (`getBroadcasterId()`, Kanal `dangsxr1000` hartkodiert als `CHANNEL_LOGIN`). Response: `{success, broadcasterId, subscriptions: [...]}`, jede fehlgeschlagene Subscription einzeln sichtbar (`{type, success:false, status, error}`), kein Total-Failure bei Teilfehlern.

**Aufrufer-Seite** (in `goal.html`/`overlay.html`/`in-game.html`/`avatar.html`): natives Browser-`WebSocket` direkt zu `wss://eventsub.wss.twitch.tv/ws`, kein Client-Library nötig. Eigene Reconnect-Logik mit Backoff, Behandlung von Twitchs `session_reconnect`-Handoff.

---

## 4. Weitere API-Endpoints

| Datei | Zweck | Response-Felder |
| :--- | :--- | :--- |
| `api/stats.js` | Rocket-League-Stats von Tracker.gg (`api.tracker.gg`, undokumentiertes/privates Endpoint) für Spieler `DaNgsxR` (Plattform `epic`) | `{success, wins, matches, rank:{playlist,tierName,tierIconUrl,mmr}|null, cached, stale}` — bei Fehler zusätzlich `trackerStatus`/`trackerBodySnippet` oder `foundSegmentTypes` |
| `api/twitch-followers.js` | Echte Gesamt-Follower-Zahl + letzter Follower über Helix `GET /channels/followers` | `{success, total, latestFollower:{name,followedAt}\|null}` |

Beide cachen 30–60s In-Memory (modulweite Variable, gilt nur pro warmer Vercel-Function-Instanz).

**Bekanntes Problem bei `api/stats.js`**: Tracker.gg blockt Anfragen von der Vercel-Server-IP-Range aktiv mit einer eigenen "You've Been Blocked"-Seite (HTTP 403) — ein Cloudflare-artiger Bot-/Datacenter-Schutz, keine Rate-Limit-Verzögerung. Ein Fix-Versuch mit vollständigeren Browser-Headern (`Accept`, `Referer`, `Origin`) ist deployed, aber **nicht garantiert wirksam**, falls die Sperre rein IP-basiert ist. Siehe Abschnitt 10.

---

## 5. Modulare Widget-Architektur

Drei Ebenen von Browser-Quellen im Repo, dokumentiert in [`SZENEN_UEBERSICHT.md`](./SZENEN_UEBERSICHT.md):

1. **Vollflächige Master-/Einzel-Szenen** (`--vu` auf 1920px kalibriert): `overlay.html`, `goal.html`, `chat.html`, `start.html`, `in-game.html`, `index.html`, `branding.html`.
2. **Frei positionierbare Einzel-Widgets** (`--vu` auf eigene Design-Breite kalibriert, füllen die eigene Seite randlos aus, Streamlabs' Transform-Panel bestimmt Endgröße/Position): `avatar.html`, `rl-stats.html`, `rl-daily.html`, `status-ticker.html`, `event-cards.html`, `chat-vibes.html`, `hype-level.html`, `status-bar.html`.

Diese Modularisierung entstand, weil ein einzelnes, fest im Code positioniertes `in-game.html`-Bündel wiederholt mit unterschiedlichen Rocket-League-Bildschirmen kollidierte — jedes Widget lässt sich jetzt unabhängig dorthin ziehen, wo auf dem jeweiligen Gerät tatsächlich Platz ist. Bewusster Kompromiss: mehrere gleichzeitig genutzte Einzel-Quellen bedeuten mehrere parallele EventSub-/tmi.js-Verbindungen statt einer gebündelten — Twitch erlaubt das problemlos, ist nur weniger effizient.

`rl-stats.html` vs. `rl-daily.html`: gleicher Look/gleiche API, unterschiedliches Reset-Verhalten — `rl-stats.html` zählt eine **Session** (Reset bei jedem Neuladen der Quelle, In-Memory-Baseline), `rl-daily.html` zählt einen **Kalendertag** (Reset automatisch um 00:00 Uhr, `localStorage`-Baseline `{date, wins, matches}`, geprüft bei jedem 20s-Poll statt per eigenem Timer).

---

## 6. `localStorage`-Key-Registry

| Key | Datei(en) | Wertebereich | Zweck |
| :--- | :--- | :--- | :--- |
| `dangsxr_wanted_points` | `goal.html`, `overlay.html` | Zahl (Sub/Bits-Fortschritt) | GTA-Wanted-Level (5 Sterne, 1 Sub = 1 Stern, 100 Bits = 1 Stern) |
| `dangsxr_hypeLevel` | `in-game.html`, `hype-level.html` | 1–5 (Default **1**, nicht 0) | Hype-Meter, **bewusst getrenntes** System von `dangsxr_wanted_points` |
| `dangsxr_rl_daily_baseline` | `rl-daily.html` | JSON `{date, wins, matches}` | Tages-Baseline für Siege/Niederlagen-Delta |

Alle Keys sind pro Browser-Quelle isoliert (kein geräteübergreifender Sync) — für ein einzelnes Streamlabs-Mobile-Tablet kein praktischer Nachteil.

---

## 7. Chat-/tmi.js-Architektur

`tmi.js` (Twitch-IRC-Client) wird in sechs Dateien genutzt: `chat.html`, `chat-vibes.html`, `avatar.html`, `goal.html`, `overlay.html`, `in-game.html`. Alle laden es über den gemeinsamen Loader **`assets/js/tmi-loader.js`** (`window.loadTmiWithFallback(onReady, onFailed)`).

### Kritischer Fund: tmi.js liefert keinen Browser-Bundle über npm/CDN

Das npm-Paket `tmi.js@1.8.5` listet in seiner `package.json` unter `"files"` nur `["lib", "index.js", "LICENSE"]` — **kein gebauter Browser-Bundle wird überhaupt veröffentlicht**, nur roher Node-CommonJS-Quellcode. Der `tmi.min.js`, den das Paket selbst per `npm run build` erzeugt, landet nur in einem lokalen `build/`-Ordner, der nie in den npm-Tarball gepackt und folglich auch nie von `cdn.jsdelivr.net`/`unpkg.com` ausgeliefert wird (beide CDNs spiegeln exakt den npm-Tarball). **Jede bisherige CDN-basierte tmi.js-Einbindung im Projekt hat dadurch vermutlich nie funktioniert**, unabhängig von WebView, Netzwerk oder CDN-Wahl.

**Fix**: Browser-Bundle einmalig selbst gebaut (`browserify` + `babelify`, exakt nach `tmi.js`s eigenem `build:browserify`-Skript, danach `uglify-js`-minifiziert nach `build:uglify`) und als **`assets/js/tmi.min.js`** (51KB, MIT-lizenziert, `tmi.min.js.LICENSE` liegt daneben) im Repo abgelegt. Der Loader lädt jetzt zuerst diese lokale, same-origin-Datei; die alten CDN-URLs (`.../185/tmi.min.js`) bleiben nur als Notfall-Fallback, falls die lokale Datei je fehlen sollte. **Live vom Nutzer bestätigt funktionierend** (`chat-vibes.html` zeigt "Verbunden", echte Nachrichten kommen an).

> **Für Cursor**: Falls `tmi.js` je auf eine andere Version aktualisiert werden soll, muss der Bundle-Build-Schritt (siehe `assets/js/tmi-loader.js`-Kommentar) manuell wiederholt werden — es gibt keinen automatisierten Build-Prozess im Repo (bewusst, um das Projekt build-frei zu halten).

---

## 8. Projekt-Philosophie & Besonderheiten

- **"Chat ersetzt die Stimme"** — Kernstrategie-Prinzip, da DaN ohne Mikrofon streamt: Overlay-Effekte ersetzen Mimik (audio-reaktive FX statt Gesichtsausdruck), der Chat-Feed ersetzt die Stimme, künftiges Chat-TTS (Phase 3, noch nicht gebaut) soll Zuschauern das Gefühl geben, gehört zu werden. Mikrofon-Code existiert überall nur als **kostenloser Bonus-Pfad** (`tryStartMic()`-Muster), niemals als Voraussetzung.
- **Idle-Ambient-Prinzip**: Reine Alert-Reaktivität ließ Overlays >95% der Sendezeit statisch wirken → in `goal.html` läuft deshalb ein permanenter Idle-Ambient-Layer (Funken/Partikel unabhängig von Events), in `in-game.html`/`avatar.html` ein permanentes Idle-Wippen des Bären.
- **Multi-Device-Setup**: Samsung Galaxy Tab S11 Ultra streamt (Streamlabs Mobile + GeForce NOW), Samsung Galaxy S26 Ultra dient für Chat/Steuerung/Monitoring — Entwicklung erfolgt komplett über Claude Code Cloud CLI im Browser, kein lokaler PC im Workflow.
- **Kein Framework, keine Build-Pipeline** — bewusst, damit jede Datei unabhängig als einzelne Streamlabs-Browser-Quellen-URL funktioniert und Deploys trivial bleiben (Vercel liefert `.html`/`.js` direkt aus).
- **Diagnostische Statusanzeigen statt stillem Scheitern**: Wiederkehrendes Muster im ganzen Projekt (`chat-vibes.html`s Verbindungsstatus, `rl-stats.html`/`rl-daily.html`s Live/Cached/Offline-Punkt, `api/stats.js`s detaillierte Fehlerfelder) — weil Remote-Diagnose aus der Entwicklungs-Sandbox nur über Screenshots des Nutzers möglich ist, brauchen Fehlerzustände immer einen sichtbaren, unterscheidbaren UI-Zustand statt eines stillen `console.warn`.

---

## 9. Testing-Konvention

Kein CI, keine automatisierten Tests im Repo selbst. Jede Änderung wird während der Entwicklung manuell per **Playwright** (Chromium, `/opt/pw-browsers/chromium`) gegen einen lokalen `python3 -m http.server`-Server verifiziert — typische Checks: Screenshot-Kontrolle, `page.on('pageerror')` auf Null JS-Fehler, gemockte `fetch()`/`route()`-Antworten für API-abhängige Widgets, `?test=`-Query-Parameter zum manuellen Auslösen von Alert-/Event-Effekten ohne echtes Twitch-Event. Diese Test-Skripte sind **nicht** Teil des Repos (liegen nur in der jeweiligen Entwicklungs-Session) — bei Bedarf müssten sie in Cursor neu geschrieben werden.

---

## 10. Aktueller Status & offene Punkte

### Kürzlich behoben
- **Twitch-Chat funktioniert jetzt live** (tmi.js-Self-Hosting-Fix, siehe Abschnitt 8) — größter Fix dieser Session, betraf 6 Dateien gleichzeitig.
- **Follower-Ziel-Widget zeigt echte Twitch-Zahl** (`api/twitch-followers.js`) statt eines nie aktualisierten Platzhalters.
- **`--vu`-Skalierung + Schärfe-Probleme** in `overlay.html`/den 6 modularen Widgets behoben (kein `transform:scale()` mehr, korrekt kalibrierte `clamp()`-Formeln).
- **Neues Widget `rl-daily.html`** — Tagesbilanz Siege/Niederlagen mit Mitternachts-Reset, gerade fertiggestellt.

### Offen / bekannte Baustellen
1. **`api/stats.js` / Rocket-League-Stats-Offline-Status**: Tracker.gg blockt Vercel-IPs (HTTP 403, Bot-Schutz). Header-Fix deployed, aber Wirksamkeit ungewiss. **Nächster Schritt bei Fortbestand**: offizielle Tracker.gg-Developer-API-Registrierung (tracker.gg/developers, API-Key-basiert) als einzig verlässlicher Weg, oder das bereits vorhandene Offline-Fallback-Panel als dauerhaft akzeptierter Zustand.
2. **`in-game.html`s RL-Stats-Karte nutzt noch Session-Logik**, nicht die neue `rl-daily.html`-Tageslogik — falls der Nutzer die Tagesbilanz auch im Bündel statt nur als Einzel-Widget will, muss `in-game.html` auf dieselbe `localStorage`-Baseline-Logik umgestellt werden.
3. **Raid-Handling**: `channel.raid`-Subscription existiert in `api/twitch-eventsub.js` und wird in `goal.html`/`overlay.html`/`in-game.html` als Alert behandelt (Sound + Party-Popup) — aber es gibt **keine dedizierte Raid-Anzeige/Kartenslot** wie bei Follower/Sub/Cheer (`event-cards.html` hat keine "Letzter Raid"-Karte). Sollte geprüft/ergänzt werden, falls Raids ein relevanter Anwendungsfall für DaN sind.
4. **`index.html`/`branding.html`** noch im alten Glassmorphism-Look, nicht auf "Urban Blackout" migriert (bewusst zurückgestellt).
5. **Live-Validierung ausstehend**: `overlay.html`s randnahe Vertikal-Zentrierung (`.left-edge-stack`/`.right-edge-stack`) ist nur anhand von drei vom Nutzer genannten RL-HUD-Zonen hergeleitet, nicht gegen jeden möglichen RL-Bildschirm getestet.
6. **Spotify-Integration** (`api/spotify-now-playing.js`) für einen echten "jetzt läuft"-Ticker — vom Nutzer aus **Premium-Gründen verworfen** (kein Spotify Premium), gilt als nicht mehr verfolgt. `?track=`/`?artist=`-Parameter bleiben der produktive Weg.
7. **`bear_avatar.png` liegt verwaist im Repo-Root** (Upload-Artefakt aus einer früheren Runde, nicht mehr referenziert — die aktiven Bär-Bilder liegen in `assets/images/`). Kandidat für Aufräumen, falls gewünscht.
8. Fünf Twitch-Panel-Grafiken, Offline-/Video-Player-Banner, Profilbild — Text-Konzepte in [`PANEL_CONCEPT.md`](./PANEL_CONCEPT.md) fertig, Grafiken noch nicht produziert.
9. Affiliate-Status (0/10 Abonnenten-Punkte) noch nicht erreicht — Emote-/Sub-Badge-Redesign davon abhängig.

### Tech-Stack-Entscheidungen (nicht neu diskutieren)
Streamlabs Mobile + GitHub/Vercel + Claude Code sind der gesetzte Kern-Stack. **Keine externe Datenbank.** StreamElements/Cloudbot (Chat-TTS) und Discord sind für spätere Phasen vorgesehen, noch nicht begonnen.
