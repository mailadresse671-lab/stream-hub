# CLAUDE.md

Diese Datei dokumentiert das Projekt-Setup von **stream-hub** für zukünftige Arbeit mit Claude Code.

## Projekt-Zweck

Streaming Overlays & Serverless APIs für Twitch/Streamlabs, gehostet auf Vercel. Die Overlays werden als Browser-Quellen in OBS (o.ä.) eingebunden und zeigen Live-Daten wie Rocket-League-Session-Stats, Follower-Fortschritt mit Party-Animationen sowie einen Twitch-Chat-Feed.

## Dateistruktur

- **`index.html`** — Session Stats Widget (Wins, Losses, Winrate). Fragt periodisch (alle 20s) die Vercel-API `/api/stats` ab und berechnet die Session-Differenz gegenüber dem beim Laden erfassten Basiswert. Zeigt zusätzlich einen Live/Cached/Offline-Statuspunkt basierend auf den `cached`/`stale`-Feldern der API-Antwort.
- **`goal.html`** — Follower-Ziel-Widget mit Fortschrittsbalken. Holt sich beim Laden den Streamlabs-Socket-Token von `/api/streamlabs-proxy` und verbindet sich anschließend per Socket.IO mit dem Streamlabs-Socket-API (`sockets.streamlabs.com`). Bei neuen Followern sowie beim Erreichen des Ziels wird ein Party-Animations-Popup (Konfetti, Sound, Popup-Overlay in Bildschirmmitte) über eine Warteschlange (`popupQueue`) angezeigt, damit mehrere Follower kurz hintereinander (z. B. bei einem Raid) sauber nacheinander abgespielt werden statt sich zu überschreiben.
- **`chat.html`** — Chat-Overlay Widget. Verbindet sich via `tmi.js` mit einem Twitch-Kanal und zeigt eingehende Chat-Nachrichten als animierte Karten an, die nach 15s automatisch ausblenden.
- **`branding.html`** — Statisches Branding-Widget für die untere rechte Ecke („DaN | LIVE STREAM").
- **`api/stats.js`** — Vercel Serverless Function. Fragt die Rocket League Tracker API (`api.tracker.gg`) für den Spieler **„DaNgsxR"** (Plattform: `epic`) ab und liefert `wins`/`matches` als JSON zurück. Cached das Ergebnis 30 Sekunden lang In-Memory (modulweite Variable, gilt pro warmer Function-Instanz) und liefert bei einem fehlgeschlagenen Tracker.gg-Request den letzten bekannten Stand als `stale: true` zurück, statt das Overlay einfrieren zu lassen.
- **`api/streamlabs-proxy.js`** — Vercel Serverless Function, die den Streamlabs-Socket-Token aus der Umgebungsvariable `STREAMLABS_SOCKET_TOKEN` liest und als JSON zurückgibt. Hält den Token aus dem öffentlich ausgelieferten `goal.html`-Quelltext heraus.

## Deployment & Hosting

- Hosting über **Vercel**.
- **Auto-Deploy**: Jeder Commit auf den `main`-Branch löst automatisch ein neues Deployment aus.
- `api/stats.js` läuft als Vercel Serverless Function (Node-Runtime), die HTML-Dateien werden statisch ausgeliefert.

## Styling-Guides

- **Dark Mode** als Basis: Hintergrundflächen in Slate-900-Ton (`rgba(15, 23, 42, ...)`).
- **Neon-Akzente**: Blau `#38bdf8` und Orange `#f97316` als primäre Akzentfarben (Rahmen, Titel, Verläufe); ergänzend Grün `#22c55e`, Rot `#ef4444` und Gelb/Amber `#fbbf24` für Statuswerte (Win/Loss/Rate, Sounds/Konfetti).
- **Abgerundete Ecken**: `border-radius` durchgängig zwischen 10–20px je nach Element (Container, Popups, Fortschrittsbalken).
- **Blur-Effekte**: `backdrop-filter: blur(8px)` in Kombination mit halbtransparenten Hintergründen (`rgba(15, 23, 42, 0.9–0.96)`) für den typischen Glassmorphism-Look der Overlays.

## Hinweis (Sicherheit)

Der Streamlabs-Socket-Token liegt nicht mehr fest im Client-Code von `goal.html`, sondern wird zur Laufzeit von `api/streamlabs-proxy.js` geladen, das ihn aus der Vercel-Umgebungsvariable `STREAMLABS_SOCKET_TOKEN` liest. **Damit dies funktioniert, muss `STREAMLABS_SOCKET_TOKEN` im Vercel-Projekt (Project Settings → Environment Variables) gesetzt sein** — ohne diese Variable liefert der Proxy einen Fehler und `goal.html` verbindet sich nicht.

Wichtig: Das entfernt den Token zwar aus zukünftigen Commits und aus der View-Source-Ansicht, macht ihn aber **nicht** rückwirkend unsichtbar — der alte Token steht weiterhin im Klartext in der Git-Historie dieses Repos (frühere Commits vor diesem Fix). Der alte Token sollte daher im Streamlabs-Dashboard rotiert/neu generiert und der neue Wert ausschließlich als Vercel-Umgebungsvariable hinterlegt werden.

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
