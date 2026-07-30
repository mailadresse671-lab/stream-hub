# Szenen-Übersicht

Kompakter Überblick über alle Streamlabs-Browser-Quellen ("Szenen") im Repo. Ausführliche Details, Historie und Begründungen stehen in [`CLAUDE.md`](./CLAUDE.md) — diese Tabelle ist die Kurzfassung zum schnellen Scannen.

| Szene-Nr. | Dateiname | Zweck | Visueller Stil | Status | Enthält |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `overlay.html` | All-In-One Master-Szene zur Bündelung aller Widgets auf einer einzigen Browser-Quelle | Urban Blackout | 🟢 | Goal, Chat, Avatar, Stats, Branding |
| 2 | `goal.html` | Follower-Ziel-Widget mit Event-Alert-, Physik- und Wanted-Level-System | Urban Blackout | 🟢 | EventSub, 5-Sterne-Wanted, Commands, Soundtrack |
| 3 | `chat.html` | Chat-Overlay mit physikbasierten, abprallenden Nachrichten-Karten und Emotes | Urban Blackout | 🟢 | tmi.js, XSS-Escaping, Fall-Physik, Demo-Modus |
| 4 | `start.html` | Eigenständige "Starting Soon"-Szene mit Countdown und lebendigen Animationen | Chakra Petch / JetBrains Mono | 🟢 | Bärenkopf-Idle, Countdown, Ticker, Visualizer |
| 5 | `in-game.html` | Zusätzliche Gameplay-Szene im alternativen Look für den aktiven Stream | Vintage Hip-Hop / Gold-Bling | 🟢 | Kassetten-Panel, Session-Zähler, Wanted, Ticker |
| 6 | `avatar.html` | Event-reaktiver Avatar als visueller Ersatz für Kamera und Mimik | Urban Blackout | 🟢 | Idle/Action-Bilder, Event-Reaktion, Neon-Glow |
| 7 | `index.html` | Session-Stats-Widget für Wins, Losses, Winrate und Rocket-League-Rang/MMR | Glassmorphism (alt) | 🟢 | API-Polling (`/api/stats`), Rang-HUD, Status |
| 8 | `branding.html` | Statisches Branding-Widget für die untere rechte Ecke des Streams | Glassmorphism (alt) | 🟢 | Statischer Schriftzug ("DaN \| LIVE STREAM") |
| 9 | `in-game.html` (Refresh) | Ersatz von Szene 5 auf Basis eines in Claude Design gebauten Prototyps ("Twitch In-Game HUD") | Vintage Hip-Hop (Chrom/Gold-Glitzer, Laserlinien, Grunge) | 🟡 | Bär mit Augen-Glow, Chat, Hype-Anzeige (`dangsxr_hypeLevel`), RL-Stats/Rang-Widget (neu), Playlist/Status |
| 10 | `start.html` (Refresh) | Möglicher Ersatz von Szene 4 auf Basis eines aktualisierten Claude-Design-Exports ("Twitch Starting Soon") | TBD — wird noch mit der Live-Version verglichen | 🟡 | *(Analyse noch nicht abgeschlossen)* |

**Legende:**
🟢 Live auf `main` · 🟡 In Prüfung/Planung · 🔴 Verworfen (mit Begründung)
