# Szenen-Übersicht

Kompakter Überblick über alle Streamlabs-Browser-Quellen ("Szenen") im Repo. Ausführliche Details, Historie und Begründungen stehen in [`CLAUDE.md`](./CLAUDE.md), Einrichtungs-Checkliste für neue Quellen in [`STREAMLABS_SETUP.md`](./STREAMLABS_SETUP.md) — diese Tabelle ist die Kurzfassung zum schnellen Scannen.

## Vollflächige Master-/Einzel-Szenen

Randlos ausgelegt (`--vu`-Fluid-Unit-System), für die gesamte Streamlabs-Canvas gedacht.

| Dateiname | Zweck | Visueller Stil | Status | Enthält |
| :--- | :--- | :--- | :---: | :--- |
| `overlay.html` | All-In-One Master-Szene zur Bündelung aller Widgets auf einer einzigen Browser-Quelle | Urban Blackout | 🟢 | Goal, Chat, Avatar, Stats, Branding |
| `goal.html` | Follower-Ziel-Widget mit Event-Alert-, Physik- und Wanted-Level-System | Urban Blackout | 🟢 | EventSub, 5-Sterne-Wanted, Commands, Soundtrack |
| `chat.html` | Chat-Overlay mit physikbasierten, abprallenden Nachrichten-Karten und Emotes | Urban Blackout | 🟢 | tmi.js, XSS-Escaping, Fall-Physik, Demo-Modus |
| `start.html` | Eigenständige "Starting Soon"-Szene mit Countdown, aus Claude-Design-Export gebaut | Chrome/Gold-Bling (Anton + Share Tech Mono) | 🟢 | Bär-Idle, Countdown, Status-Ticker, EQ-Visualizer |
| `in-game.html` | All-In-One Gameplay-HUD-Szene, aus Claude-Design-Export gebaut | Chrome/Gold-Bling (Anton + Share Tech Mono) | 🟢 | Bär (freistehend), Event-Karten, Chat Vibes, Hype-Level, RL-Stats, Bottom-Bar |
| `index.html` | Session-Stats-Widget für Wins, Losses, Winrate und Rocket-League-Rang/MMR | Glassmorphism (alt) | 🟢 | API-Polling (`/api/stats`), Rang-HUD, Status |
| `branding.html` | Statisches Branding-Widget für die untere rechte Ecke des Streams | Glassmorphism (alt) | 🟢 | Statischer Schriftzug ("DaN \| LIVE STREAM") |

## "90s Old School Edition"-Szenen (drittes eigenständiges visuelles System)

Randlos ausgelegt (`--vu`-Fluid-Unit-System), eigenständige Szenen-Sammlung — ergänzt die obigen Szenen, ersetzt nichts. Aus dem Claude-Design-Export "DaNgsxr1000 Stream Overlay Suite" übersetzt (Rubik Spray Paint/Permanent Marker/Barlow Condensed, Schwarz/Weiß + Blutrot). Details siehe `CLAUDE.md`.

| Dateiname | Zweck | Status | Eigene Live-Verbindung |
| :--- | :--- | :---: | :--- |
| `oldschool-starting.html` | "Starting Soon"-Ersatz-Szene mit echtem Countdown (`?minutes=`) + Track-Ticker | 🟢 | EventSub (Alert-Popup) |
| `oldschool-chatting.html` | "Just Chatting"-Overlay: Latest-Follower-Badge, Sub-Ziel-Balken (`?subgoal=`), Chat-Box | 🟢 | tmi.js, EventSub, Polling `/api/twitch-followers` + `/api/twitch-subs` |
| `oldschool-gameplay.html` | Transparentes Vollbild-Overlay über dem Gameplay, Safe-Zone-Guides per `?safezones=1` | 🟢 | EventSub (Alert-Popup) |
| `oldschool-brb.html` | "BRB"-Ersatz-Szene mit Mic-Status-Badge (`?mic=`) + Chat-Box | 🟢 | tmi.js, EventSub |
| `oldschool-outro.html` | "Stream Ending"-Ersatz-Szene mit echter "Tonight's MVPs"-Liste aus `dangsxr_leaderboard` | 🟢 | EventSub (Alert-Popup) |

**Live-Validierung läuft bereits** — `oldschool-starting.html` und `oldschool-chatting.html`/`oldschool-brb.html` wurden je mind. einmal live in Streamlabs Mobile getestet und nachgebessert (Social-Chips reduziert, Countdown-Clipping behoben, tanzender Bär, Bär statt leerem Facecam-Slot, sichtbarer Chat-Status, Chat-Box-Positionierung robuster gegen schmale Browser-Quellen). `oldschool-gameplay.html`/`oldschool-outro.html` noch ungetestet. Details + volle Live-Test-Historie siehe `CLAUDE.md`, Offene Punkte #18.

## Frei positionierbare Einzel-Widget-Quellen

Füllen ihre eigene Seite randlos aus (`inset:0` + `object-fit:contain` bzw. `width/height:100%`), OHNE eigene feste Positions-Offsets im Code — Größe/Platzierung auf dem Canvas wird ausschließlich über Streamlabs' eigenes Transform-Panel gesteuert (siehe `STREAMLABS_SETUP.md`). Entstanden, weil ein einzelnes fest im Code positioniertes `in-game.html`-Bündel wiederholt mit unterschiedlichen Rocket-League-Bildschirmen (Lobby-Menü, Ingame-HUD, Nachspiel-Ergebnisliste) kollidierte — jedes Widget lässt sich jetzt unabhängig dorthin ziehen, wo auf dem jeweiligen Gerät/Bildschirm tatsächlich Platz ist. Inhaltlich/funktional identisch zu den entsprechenden Widgets in `in-game.html` (welches als Bündel-Option weiterhin unverändert bestehen bleibt).

| Dateiname | Zweck | Status | Eigene Live-Verbindung |
| :--- | :--- | :---: | :--- |
| `avatar.html` | Event-reaktiver Bär als visueller Ersatz für Kamera und Mimik | 🟢 | tmi.js (Chat) + EventSub (Follow/Sub/Cheer/Raid) |
| `rl-stats.html` | Rocket-League-Session-Stats-Karte (Siege/Niederlagen/Winrate/Rang) | 🟢 | Polling `/api/stats` |
| `rl-daily.html` | Rocket-League-TAGES-Stats-Karte (Siege/Niederlagen/Winrate, Reset um 00:00 Uhr) | 🟢 | Polling `/api/stats` |
| `status-ticker.html` | Rotierende Status-Meldungen (`?ticker=`) | 🟢 | keine |
| `event-cards.html` | "Letztes Event"-Kartenstapel (Follower/Sub/Bits) | 🟢 | EventSub |
| `chat-vibes.html` | Chat-Panel im Chrome/Gold-Bling-Look (TV/Boombox-Rahmen) | 🟢 | tmi.js |
| `hype-level.html` | 5-Sterne-Hype-Meter (`dangsxr_hypeLevel`) | 🟢 | EventSub (Auto-Increment) + Klick |
| `status-bar.html` | EQ-Visualizer, Plattenspieler, Track-Marquee, MIC/CAM/NET-Status, Uptime | 🟢 | EventSub (nur NET-Status) |

**Legende:**
🟢 Live auf `main` · 🟡 In Prüfung/Planung · 🔴 Verworfen (mit Begründung)
