# CLAUDE.md

Diese Datei dokumentiert das Projekt-Setup von **stream-hub** für zukünftige Arbeit mit Claude Code.

## Projekt-Zweck

Streaming Overlays & Serverless APIs für Twitch/Streamlabs, gehostet auf Vercel. Die Overlays werden als Browser-Quellen in OBS (o.ä.) eingebunden und zeigen Live-Daten wie Rocket-League-Session-Stats, Follower-Fortschritt mit Party-Animationen sowie einen Twitch-Chat-Feed.

## Dateistruktur

- **`index.html`** — Session Stats Widget (Wins, Losses, Winrate). Fragt periodisch (alle 20s) die Vercel-API `/api/stats` ab und berechnet die Session-Differenz gegenüber dem beim Laden erfassten Basiswert. Zeigt zusätzlich einen Live/Cached/Offline-Statuspunkt basierend auf den `cached`/`stale`-Feldern der API-Antwort.
- **`goal.html`** — Follower-Ziel-Widget mit Fortschrittsbalken. Verbindet sich per nativem Browser-`WebSocket` direkt mit **Twitch EventSub** (`wss://eventsub.wss.twitch.tv/ws`, keine Drittanbieter-Client-Library nötig) und meldet die benötigten Event-Subscriptions (Follow, Sub, Resub, Bits, Raid) über `/api/twitch-eventsub` an, sobald die Session-ID vom WebSocket-Handshake vorliegt. Enthält eine eigene Reconnect-Logik mit Backoff sowie Behandlung von Twitchs `session_reconnect`-Handoff (Subscriptions wandern dabei automatisch auf die neue Session, kein erneutes Anmelden nötig). Bei neuen Followern, Subs, Bits-Spenden und Raids sowie beim Erreichen des Follower-Ziels wird ein Party-Animations-Popup (Konfetti, Sound, Popup-Overlay in Bildschirmmitte) über eine Warteschlange (`popupQueue`) angezeigt, damit mehrere Events kurz hintereinander (z. B. ein Bit-Train oder Raid) sauber nacheinander abgespielt werden statt sich zu überschreiben. Die Sounds (`follow.mp3`, `sub.mp3`, `bits.mp3`, `raid.mp3` aus `/assets/audio/`) werden per Web Audio API vorab dekodiert; fehlt eine Datei, bleibt nur der jeweilige Alert stumm, der Rest läuft unbeeinflusst weiter.
- **`chat.html`** — Chat-Overlay Widget. Verbindet sich via `tmi.js` mit einem Twitch-Kanal und zeigt eingehende Chat-Nachrichten als animierte Karten an, die nach 15s automatisch ausblenden. Rendert Twitch-Emotes (`tags.emotes`) direkt als Bilder vom Twitch-CDN.
- **`branding.html`** — Statisches Branding-Widget für die untere rechte Ecke („DaN | LIVE STREAM").
- **`api/stats.js`** — Vercel Serverless Function. Fragt die Rocket League Tracker API (`api.tracker.gg`) für den Spieler **„DaNgsxR"** (Plattform: `epic`) ab und liefert `wins`/`matches` als JSON zurück. Cached das Ergebnis 30 Sekunden lang In-Memory (modulweite Variable, gilt pro warmer Function-Instanz) und liefert bei einem fehlgeschlagenen Tracker.gg-Request den letzten bekannten Stand als `stale: true` zurück, statt das Overlay einfrieren zu lassen.
- **`api/twitch-eventsub.js`** — Vercel Serverless Function. Holt per Refresh-Token einen frischen Twitch-User-Access-Token, ermittelt die Broadcaster-ID für den Kanal **„dangsxr1000"** und meldet für eine übergebene WebSocket-Session-ID die EventSub-Subscriptions `channel.follow`, `channel.subscribe`, `channel.subscription.message`, `channel.cheer` und `channel.raid` bei der Twitch-Helix-API an. Liest `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` und `TWITCH_REFRESH_TOKEN` aus den Vercel-Umgebungsvariablen.

## Deployment & Hosting

- Hosting über **Vercel**.
- **Auto-Deploy**: Jeder Commit auf den `main`-Branch löst automatisch ein neues Deployment aus.
- `api/stats.js` läuft als Vercel Serverless Function (Node-Runtime), die HTML-Dateien werden statisch ausgeliefert.

## Styling-Guides

- **Dark Mode** als Basis: Hintergrundflächen in Slate-900-Ton (`rgba(15, 23, 42, ...)`).
- **Neon-Akzente**: Blau `#38bdf8` und Orange `#f97316` als primäre Akzentfarben (Rahmen, Titel, Verläufe); ergänzend Grün `#22c55e`, Rot `#ef4444` und Gelb/Amber `#fbbf24` für Statuswerte (Win/Loss/Rate, Sounds/Konfetti).
- **Abgerundete Ecken**: `border-radius` durchgängig zwischen 10–20px je nach Element (Container, Popups, Fortschrittsbalken).
- **Blur-Effekte**: `backdrop-filter: blur(8px)` in Kombination mit halbtransparenten Hintergründen (`rgba(15, 23, 42, 0.9–0.96)`) für den typischen Glassmorphism-Look der Overlays.

## Hinweis (Sicherheit & Setup)

`goal.html` bezieht Follow-/Sub-/Bits-/Raid-Events seit der Migration auf Twitch EventSub **nicht mehr über Streamlabs** — `api/streamlabs-proxy.js` wurde entfernt, da nichts mehr den Streamlabs-Socket-Token benötigt. Die Umgebungsvariable `STREAMLABS_SOCKET_TOKEN` kann in den Vercel-Projekteinstellungen gelöscht werden. Unabhängig davon bleibt die frühere Empfehlung gültig: Der alte Token stand einmal im Klartext im Repo und in der Git-Historie und sollte im Streamlabs-Dashboard rotiert/widerrufen werden, falls das noch nicht geschehen ist.

**Neu benötigt für `api/twitch-eventsub.js`** — folgende Vercel-Umgebungsvariablen müssen gesetzt sein, sonst liefert die Function einen Fehler und `goal.html` kann keine Events abonnieren:

- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` — aus einer selbst registrierten App auf [dev.twitch.tv/console](https://dev.twitch.tv/console).
- `TWITCH_REFRESH_TOKEN` — aus einem einmalig manuell durchgeführten OAuth-Authorization-Code-Flow des Broadcaster-Accounts (DaN) mit den Scopes `moderator:read:followers`, `channel:read:subscriptions`, `bits:read`. Der Access-Token selbst wird bei jedem `goal.html`-Laden frisch aus diesem Refresh-Token erzeugt, muss also nicht manuell erneuert werden — nur der Refresh-Token muss einmalig beschafft und als Env-Variable hinterlegt werden.

## System & Hardware Context

- **Setup-Typ**: 100% Cloud- & Mobile-Streaming Setup (kein PC/Laptop).
- **Gaming-Plattform**: GeForce NOW Ultimate (Rocket League).
- **Hauptgerät (Gaming & Stream-Regie)**: Samsung Galaxy Tab S11 Ultra (Streamlabs Mobile).
- **Begleitgerät (Chat, Control & Twitch-App)**: Samsung Galaxy S26 Ultra.
- **Entwicklungs-Umgebung**: Claude Code Cloud CLI (Web Browser).
- **Canvas**: 1920x1080 (16:9 Aspect Ratio).
- **Streaming-Plattform**: Twitch.
- **Twitch Kanal**: DaNgsxr1000.
- **Ingame ID**: DaNgsxR (Epic Games).

## Proactive Code & Feature Audit Directive

- Scanne bei neuen Aufgaben das Repository auf ungenutzten Code, Sicherheitslücken und Performance-Engpässe.
- Schlage proaktiv neue Widgets, Design-Verbesserungen oder API-Erweiterungen vor, die zu diesem Streamer-Setup passen.
