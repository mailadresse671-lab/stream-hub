# CLAUDE.md

Diese Datei dokumentiert das Projekt-Setup von **stream-hub** für zukünftige Arbeit mit Claude Code.

## Projekt-Zweck

Streaming Overlays & Serverless APIs für Twitch/Streamlabs, gehostet auf Vercel. Die Overlays werden als Browser-Quellen in OBS (o.ä.) eingebunden und zeigen Live-Daten wie Rocket-League-Session-Stats, Follower-Fortschritt mit Party-Animationen sowie einen Twitch-Chat-Feed.

## Dateistruktur

- **`index.html`** — Session Stats Widget (Wins, Losses, Winrate). Fragt periodisch (alle 20s) die Vercel-API `/api/stats` ab und berechnet die Session-Differenz gegenüber dem beim Laden erfassten Basiswert.
- **`goal.html`** — Follower-Ziel-Widget mit Fortschrittsbalken. Verbindet sich per Socket.IO mit dem Streamlabs-Socket-API (`sockets.streamlabs.com`) und zeigt bei neuen Followern sowie beim Erreichen des Ziels ein Party-Animations-Popup (Konfetti, Sound, Popup-Overlay in Bildschirmmitte).
- **`chat.html`** — Chat-Overlay Widget. Verbindet sich via `tmi.js` mit einem Twitch-Kanal und zeigt eingehende Chat-Nachrichten als animierte, automatisch ausblendende Karten an.
- **`api/stats.js`** — Vercel Serverless Function. Fragt die Rocket League Tracker API (`api.tracker.gg`) für den Spieler **„DaNgsxR"** (Plattform: `epic`) ab und liefert `wins`/`matches` als JSON zurück. Setzt CORS-Header, damit die Overlays die Daten browserseitig abrufen können.

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

`goal.html` enthält aktuell den Streamlabs-Socket-Token fest im Client-Code eingebettet. Da die Datei öffentlich über Vercel ausgeliefert wird, ist der Token für jeden einsehbar (View-Source). Empfehlenswert wäre, den Token stattdessen serverseitig (z. B. über eine weitere `api/`-Function oder Umgebungsvariable) zu verwalten.

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
