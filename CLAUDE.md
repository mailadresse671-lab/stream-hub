# CLAUDE.md

Diese Datei dokumentiert das Projekt-Setup von **stream-hub** für zukünftige Arbeit mit Claude Code.

## Projekt-Zweck

Streaming Overlays & Serverless APIs für Twitch/Streamlabs, gehostet auf Vercel. Die Overlays werden als Browser-Quellen in OBS (o.ä.) eingebunden und zeigen Live-Daten wie Rocket-League-Session-Stats, Follower-Fortschritt mit Party-Animationen sowie einen Twitch-Chat-Feed.

## Dateistruktur

- **`index.html`** — Session Stats Widget (Wins, Losses, Winrate). Fragt periodisch (alle 20s) die Vercel-API `/api/stats` ab und berechnet die Session-Differenz gegenüber dem beim Laden erfassten Basiswert. Zeigt zusätzlich einen Live/Cached/Offline-Statuspunkt basierend auf den `cached`/`stale`-Feldern der API-Antwort. Nutzt noch den ursprünglichen Glassmorphism-Look (siehe Styling-Guides) — wurde bei den Hood/Ghetto-Redesign-Runden bewusst nicht mit umgestellt.
- **`goal.html`** — Follower-Ziel-Widget mit Fortschrittsbalken **plus komplettes Alert-/Audio-/Physik-System**, im Hood/Ghetto-Look (siehe Styling-Guides). Verbindet sich per nativem Browser-`WebSocket` direkt mit **Twitch EventSub** (`wss://eventsub.wss.twitch.tv/ws`, keine Drittanbieter-Client-Library nötig) und meldet die benötigten Event-Subscriptions (Follow, Sub, Resub, Bits, Raid) über `/api/twitch-eventsub` an, sobald die Session-ID vom WebSocket-Handshake vorliegt. Eigene Reconnect-Logik mit Backoff, Behandlung von Twitchs `session_reconnect`-Handoff. Bei Events wird ein Party-Popup über eine Warteschlange (`popupQueue`) angezeigt (mehrere Events hintereinander spielen sauber nacheinander ab). Struktur: `#party-popup` (äußere, ungeclippte Hülle — trägt Position/Opacity/Transform inkl. Lowrider-Hydraulik-Physik + Recoil-Kick) umschließt `#party-panel` (die eigentliche geclippte "Panzerplatte" mit zerklüftetem `clip-path`, Einschusslöchern, Riss-Overlay) sowie als Geschwister-Elemente `.most-wanted-badge`, `.license-plate` und zwei `.crime-tape`-Streifen, die absichtlich über den Panel-Rand hinausragen (deshalb nicht Kind von `#party-panel`). FX-Layer: `#spray-canvas` (Partikel-System `SpraySystem`, noise-gesteuert, inkl. dynamischer Bullet-Hole-Risse), `#impact-flash` (kontinuierlicher sub-bass-gesteuerter Flash), `#muzzle-flash` (einmaliger Blitz beim Alert-Trigger), `#cop-siren` (rot-blaues Sirenen-Strobe während Alerts), `#scanline-overlay` (VHS-Scanlines, immer oben). Eigene `AudioAnalysisRig`-Klasse zerlegt jeden Alert-Sound per BiquadFilter in Sub-Bass/Mid-High-Bänder und treibt darüber Hydraulik-Hop, Liquid-Bar-Impulse und Spray-Nachschub. Zusätzlich läuft ein **Idle-Ambient-Layer** (`startIdleAmbient`/`emitIdleSpark`) permanent im Hintergrund — unabhängig von Alerts wird alle 700–1200ms ein einzelner Funke an zufälliger Position emittiert, damit der Screen in den >95% der Sendezeit ohne Event nicht komplett statisch wirkt. Die Sounds (`follow.mp3`, `sub.mp3`, `bits.mp3`, `raid.mp3` aus `/assets/audio/`) werden per Web Audio API vorab dekodiert; fehlt eine Datei, bleibt nur der jeweilige Alert stumm. `?test=follow|sub|resub|bits|raid|goal` löst einen Alert manuell aus, ohne auf ein echtes Twitch-Event zu warten. **GTA-Wanted-Level-Widget** (oben links, Geschwister des Follower-Widgets): 5 Sterne füllen sich über Subs/Bits (1 Sub = 1 Stern, 100 Bits = 1 Stern, Fortschritt liegt persistent in Vercel KV via `/api/goal-state`+`/api/goal-progress`, überlebt also Reloads); bei 5/5 feuert ein eigener `wanted`-Alert-Eintrag (Mündungsfeuer/Sirene/Spray wie jeder andere Alert). **Chat-Commands** über eine zweite, unabhängige `tmi.js`-Verbindung (getrennt von `chat.html`, in try/catch gekapselt, damit ein CDN-Ausfall nicht den Rest des Bootstraps mitreißt): `!shoot` (offen für alle, spawnt ein Bullet-Hole, 2.5s-Cooldown) sowie `!siren`/`!tor`/`!fail` (Broadcaster/Mod-only via Twitch-Badge-Tags — `!tor`/`!fail` sind der bewusste Ersatz für einen automatischen Rocket-League-Tor-Detektor, der technisch nicht machbar ist, da das Overlay als Browser-Quelle keinen Zugriff auf Bild/Ton des Cloud-Gaming-Streams darunter hat).
- **`chat.html`** — Chat-Overlay Widget im Hood/Ghetto-Look, physik-basierte fallende/abprallende Karten (Gravitation/Bounce/Friction, eigener rAF-Loop, selbstterminierend). Rendert Twitch-Emotes (`tags.emotes`) direkt als Bilder vom Twitch-CDN, XSS-sicheres Escaping. **Kanal kommt ausschließlich aus dem `?channel=`-URL-Parameter** — es gibt keinen hartkodierten Kanalnamen mehr. ⚠️ **Wichtig für die OBS-/Streamlabs-Browser-Quellen-URL: `chat.html?channel=dangsxr1000` (mit Parameter!), sonst läuft automatisch der Demo-Modus statt des echten Chats.** Fehlt der Parameter, wird **nie** weitergeleitet — stattdessen startet automatisch ein Demo-Modus (`startDemoMode()`), der alle 3.5s eine von sieben Beispielnachrichten aus `DEMO_MESSAGES` zeigt, pausiert über die Page Visibility API.
- **`branding.html`** — Statisches Branding-Widget für die untere rechte Ecke („DaN | LIVE STREAM").
- **`api/stats.js`** — Vercel Serverless Function. Fragt die Rocket League Tracker API (`api.tracker.gg`) für den Spieler **„DaNgsxR"** (Plattform: `epic`) ab und liefert `wins`/`matches` als JSON zurück. Cached das Ergebnis 30 Sekunden lang In-Memory (modulweite Variable, gilt pro warmer Function-Instanz) und liefert bei einem fehlgeschlagenen Tracker.gg-Request den letzten bekannten Stand als `stale: true` zurück, statt das Overlay einfrieren zu lassen.
- **`api/twitch-eventsub.js`** — Vercel Serverless Function. Holt per Refresh-Token einen frischen Twitch-User-Access-Token, ermittelt die Broadcaster-ID für den Kanal **„dangsxr1000"** und meldet für eine übergebene WebSocket-Session-ID die EventSub-Subscriptions `channel.follow`, `channel.subscribe`, `channel.subscription.message`, `channel.cheer` und `channel.raid` bei der Twitch-Helix-API an. Liest `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` und `TWITCH_REFRESH_TOKEN` aus den Vercel-Umgebungsvariablen.
- **`api/_lib/kv.js`** — Kein eigener Endpoint (Unterordner-Konvention `_`-Prefix schließt ihn von Vercels automatischem Routing aus), sondern ein schlanker `fetch`-Wrapper um die Upstash-kompatible REST-API von Vercel KV (`get`/`set`/`incrbyfloat`). Bewusst ohne `@vercel/kv`-Package (kein `package.json`/`node_modules` im Projekt) — passt zum bestehenden Zero-Dependency-Stil von `api/stats.js`.
- **`api/goal-state.js`** / **`api/goal-progress.js`** — Backend für das GTA-Wanted-Level-Widget in `goal.html`. `goal-state.js` (GET) liefert den aktuellen Punkte-/Sternstand aus Vercel KV. `goal-progress.js` (POST) erhöht den Zähler atomar (`INCRBYFLOAT`) bei jedem Sub-/Bits-Event, setzt bei Erreichen von 5 Sternen sofort auf 0 zurück und meldet `triggered: true`. Geschützt durch einen `X-Goal-Secret`-Header (Wert muss mit der Vercel-Env-Var `GOAL_API_SECRET` übereinstimmen) — das ist **kein echter Auth-Schutz** (der Wert steht im Klartext im `goal.html`-Quelltext), sondern nur ein Spam-Deterrent gegen zufälliges Treffen des Endpoints, für eine rein kosmetische Sterne-Anzeige als angemessen bewertet.

## Deployment & Hosting

- Hosting über **Vercel**.
- **Auto-Deploy**: Jeder Commit auf den `main`-Branch löst automatisch ein neues Deployment aus.
- `api/stats.js` läuft als Vercel Serverless Function (Node-Runtime), die HTML-Dateien werden statisch ausgeliefert.

## Styling-Guides

**Zwei getrennte visuelle Systeme im Repo — nicht vermischen:**

### `goal.html` + `chat.html` — "Hood/Ghetto"-Look (aktuell, Stand mehrerer Redesign-Runden)
- **Grundfarben**: dunkles Asphalt/Rost (`--asphalt: #17130f`, `--rust: #3a2317`), Chrome-Töne (`--chrome-1: #e8e6e1`, `--chrome-2: #9a958a`) für Text/Akzente.
- **Zwei Akzentfarben, sparsam eingesetzt**: Blutrot `--blood: #b30000` (Rahmen, Glow, Sirene/Impact-Flash) und Gold `--gold: #ffd700` (Highlights, Badges, Tape).
- **Typografie**: `Bebas Neue` (condensed, Versalien) für Überschriften/Namen/Labels, `Montserrat` für Fließtext/Zahlen — beide über Google Fonts eingebunden, klare Lesbarkeit hat Priorität vor Verzerrungseffekten.
- **Zerklüftete Geometrie statt runder Ecken**: `clip-path`-Polygone simulieren beschädigte Panzerplatten (`goal-card`, `#party-panel`), keine `border-radius`-Container mehr in diesen beiden Dateien.
- **Beschädigungs-Motive als Ornament**: statische Einschusslöcher (`.bullet-hole`), Riss-Overlays (SVG), abgerissenes Absperrband (`.crime-tape`), "MOST WANTED"-Patch und Nummernschild-Badge — alles bewusst asymmetrisch/schräg positioniert.
- **Audio-Reaktivität als Kernprinzip**: fast jeder visuelle Effekt (Hydraulik-Hop, Liquid-Bar-Wellen, Spray-Partikel-Rate, Sirene) hängt am `AudioAnalysisRig`-Sub-/Mid-Band-Signal, nicht an festen Timern.

### `index.html` + `branding.html` — ursprünglicher Glassmorphism-Look (unverändert seit dem ersten Redesign)
- **Dark Mode** als Basis: Hintergrundflächen in Slate-900-Ton (`rgba(15, 23, 42, ...)`).
- **Neon-Akzente**: Blau `#38bdf8` und Orange `#f97316` als primäre Akzentfarben; ergänzend Grün `#22c55e`, Rot `#ef4444` und Gelb/Amber `#fbbf24` für Statuswerte.
- **Abgerundete Ecken**: `border-radius` durchgängig zwischen 10–20px.
- **Blur-Effekte**: `backdrop-filter: blur(8px)` mit halbtransparenten Hintergründen (`rgba(15, 23, 42, 0.9–0.96)`).
- Bewusst **nicht** an den Hood/Ghetto-Look angeglichen — offener Punkt, siehe "Aktueller Stand & Offene Punkte".

## Hinweis (Sicherheit & Setup)

`goal.html` bezieht Follow-/Sub-/Bits-/Raid-Events seit der Migration auf Twitch EventSub **nicht mehr über Streamlabs** — `api/streamlabs-proxy.js` wurde entfernt, da nichts mehr den Streamlabs-Socket-Token benötigt. Die Umgebungsvariable `STREAMLABS_SOCKET_TOKEN` kann in den Vercel-Projekteinstellungen gelöscht werden. Unabhängig davon bleibt die frühere Empfehlung gültig: Der alte Token stand einmal im Klartext im Repo und in der Git-Historie und sollte im Streamlabs-Dashboard rotiert/widerrufen werden, falls das noch nicht geschehen ist.

**Neu benötigt für `api/twitch-eventsub.js`** — folgende Vercel-Umgebungsvariablen müssen gesetzt sein, sonst liefert die Function einen Fehler und `goal.html` kann keine Events abonnieren:

- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` — aus einer selbst registrierten App auf [dev.twitch.tv/console](https://dev.twitch.tv/console).
- `TWITCH_REFRESH_TOKEN` — aus einem einmalig manuell durchgeführten OAuth-Authorization-Code-Flow des Broadcaster-Accounts (DaN) mit den Scopes `moderator:read:followers`, `channel:read:subscriptions`, `bits:read`. Der Access-Token selbst wird bei jedem `goal.html`-Laden frisch aus diesem Refresh-Token erzeugt, muss also nicht manuell erneuert werden — nur der Refresh-Token muss einmalig beschafft und als Env-Variable hinterlegt werden.

**Neu benötigt für das GTA-Wanted-Level-Widget** (`api/goal-state.js` + `api/goal-progress.js`):

- Eine Vercel-KV-Datenbank muss im Vercel-Dashboard angelegt und mit dem Projekt verknüpft sein. `api/_lib/kv.js` liest `KV_REST_API_URL`/`KV_REST_API_TOKEN` (Standard-Namenskonvention für verwaltetes Vercel-KV) und fällt alternativ auf `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` zurück (falls stattdessen eine direkt verknüpfte Upstash-Redis-Datenbank verwendet wird) — die exakten Namen zeigt Vercel nach dem Verknüpfen im Dashboard an.
- `GOAL_API_SECRET` — beliebiger String, muss identisch in `goal.html` als `GOAL_CLIENT_SECRET`-Konstante eingetragen sein (siehe Kommentar dort). Aktuell hartkodiert im Repo: `62e2c9eaaf558e73669725a002b175952252b998` — falls der Wert je rotiert wird, muss er an beiden Stellen synchron geändert werden.

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

## Twitch-Profil (Kanalseite, außerhalb des Overlay-Codes)

Zusätzlich zu den Overlays wurde die eigentliche Twitch-Kanalseite (twitch.tv/dangsxr1000) analysiert und neu konzipiert — zwei Dateien im Repo-Root dokumentieren das:

- **`twitch_profile_dump.json`** — Schnappschuss des Kanal-Zustands (Bio, Panels, Goals-Widget, Tags, Emotes, Monetarisierungsstatus, Erweiterungen). Automatisierter Live-Abruf über `decapi.me`/`twitch.tv` ist aus der Sandbox-Umgebung netzwerkseitig blockiert (HTTP 403 auf Proxy-Ebene, mit `curl` und `WebFetch` bestätigt) — die Daten stammen stattdessen aus vom Nutzer bereitgestellten Screenshots, transparent als `manual_screenshot_review` gekennzeichnet.
- **`PANEL_CONCEPT.md`** — vollständiges Redesign-Konzept: neue 5-Panel-Architektur (Setup, Kiez-Regeln, Über Mich/Die Hood, Socials, Support) mit exakten, copy-paste-fertigen Texten im Hood-Tone-of-Voice, korrigierte Kanal-Beschreibung (behebt kaputtes Markdown im Original), korrigierter Live-Benachrichtigungstext, einheitliche Bild-Spezifikation für alle 5 Panel-Grafiken (320×320px, Asphalt/Blutrot/Gold, Panzerplatten-Ecke, Einschusslöcher).
- **Wichtigster inhaltlicher Fund**: die alten Panel-Texte ("Mein Setup", "Über mich") nannten PS4 + DualShock 4 — das widerspricht dem oben dokumentierten tatsächlichen Setup (GeForce NOW Ultimate, 100% Cloud/Mobile). In den neuen Texten in `PANEL_CONCEPT.md` bereits korrigiert.

## Aktueller Stand & Offene Punkte (Stand 28.07.2026)

**Fertig & gemerged:**
- Vollständiges Hood/Ghetto-Redesign von `goal.html`/`chat.html` inkl. Audio-Engine, Hydraulik-Physik, Muzzle-Flash/Cop-Siren, Idle-Ambient-Layer.
- Migration von Streamlabs-Socket auf direkte Twitch-EventSub-Anbindung.
- `chat.html`-Routing-Fix (`?channel=`-Parameter + Demo-Modus, kein Redirect mehr).
- Twitch-Profil-Analyse + Panel-Redesign-Konzept (`twitch_profile_dump.json`, `PANEL_CONCEPT.md`).
- Strategie-Roadmap als Artifact veröffentlicht: **https://claude.ai/code/artifact/1d8195c9-76a1-4c89-9de7-1f57c5001c49** (6 Phasen: Overlay-Fundament → Profil-Grundgerüst → Engagement ohne Cam&Mic → Community&Reichweite → Monetarisierung → Pflege).
- **Modul 1 (Wanted-Level + Chat-Commands)**: GTA-Wanted-Level-Widget (5 Sterne, Sub/Bits-Fortschritt, persistent via Vercel KV) + Chat-Commands `!shoot`/`!siren`/`!tor`/`!fail` in `goal.html`, Backend `api/goal-state.js`+`api/goal-progress.js`+`api/_lib/kv.js`. Ersetzt den technisch nicht machbaren automatischen RL-Tor-Detektor durch manuelle Mod-Trigger.

**Offen — nächste Schritte, in etwa dieser Reihenfolge:**
1. **Live-Validierung**: Overlays noch nie vollständig gegen die echte Streamlabs-Mobile-App getestet (nur teilweise per Screenshot bestätigt: `chat.html`-Demo-Modus rendert korrekt; `goal.html`-Widget erschien dabei am oberen Rand abgeschnitten — vermutlich Browser-Source-Breite/Höhe in Streamlabs Mobile nicht auf 1920×1080 gesetzt, muss geprüft werden). Jetzt zusätzlich zu prüfen: Wanted-Level-Widget oben links sichtbar/nicht abgeschnitten, Mikrofon-Berechtigungsdialog für das tmi.js-basierte Chat-Commands-Script wird nicht benötigt (reiner Lesezugriff), aber CDN-Erreichbarkeit von `cdn.jsdelivr.net` in der echten Umgebung sollte einmal beobachtet werden (in der Sandbox blockiert, auf einem normalen Android-Tablet aber ohne bekannten Grund zur Sorge).
2. Bildschirmfreigabe/App-Capture in Streamlabs Mobile aktivieren (war beim letzten Test noch aus, deshalb schwarzes Vorschaubild).
3. **Soundtrack by Twitch** aktivieren — kostenlose, lizenzfreie Hintergrundmusik, DMCA-sicher, kein Code nötig. Wichtig für DaN als Nicht-Mic-Streamer.
4. Twitch-Erweiterung "Sound Alerts" deaktivieren (Risiko: doppelter Ton, da `goal.html` jetzt eigene Alert-Sounds spielt) — Empfehlung ausgesprochen, noch nicht bestätigt/umgesetzt.
5. Texte aus `PANEL_CONCEPT.md` (Bio, Live-Benachrichtigung, 5 Panel-Texte) sind fertig formuliert, aber noch nicht im echten Twitch-Dashboard eingetragen.
6. 5 Panel-Grafiken produzieren (Spec steht in `PANEL_CONCEPT.md`).
7. Neues Offline-/Video-Player-Banner produzieren (ersetzt das alte Neon-Cyberpunk-Bild) — ein erster Design-Philosophie-Entwurf ("Scarred Chrome") wurde begonnen, aber noch nicht fertiggestellt.
8. Profilbild-Konzept produzieren (Vorschlag: Marken-Badge/Wortmarke statt Foto, da kein bearbeitbares Foto vorliegt).
9. Social-Media-Handles (Twitter/X, Instagram, TikTok, Discord) von DaN festlegen lassen — Socials-Panel ist strukturell fertig, aber inhaltlich leer.
10. `index.html`/`branding.html` optisch an den Hood/Ghetto-Look angleichen (aktuell bewusst unverändert im alten Glassmorphism-Look, siehe Styling-Guides).
11. **Modul 2**: `api/stats.js` um Rang-Icon + genaue MMR-Zahl erweitern (Corner-HUD).
12. **Modul 4**: Animierte Soundtrack-Badge in `goal.html` (Text aus einem zweiten Vercel-KV-Key, live änderbar ohne Redeploy). Start-Text vorgemerkt: "🎵 SOUNDTRACK: StreamBeats Hip-Hop (DMCA-Safe)".
13. **Modul 3**: `avatar.html` (audio-reaktiver PNGtuber/Masken-Avatar) — erst Mikro-Permission-Spike auf dem echten Tablet (Streamlabs-Mobile-WebView-Verhalten ungetestet), dann volles CSS/SVG-Maskendesign. Höchste technische Unsicherheit im ganzen Projekt, bewusst zuletzt eingeplant.
14. Phase 3 der Roadmap (Chat-TTS, Twitch-Schedule einrichten — Channel-Points-Rewards/Chatbot-Commands sind durch Modul 1 teilweise bereits vorweggenommen).
15. Affiliate-Status abwarten (0/10 Abonnenten-Punkte) — Emote-/Sub-Badge-Redesign erst danach sinnvoll (Stufe 2/3 sind vorher gesperrt).

**Tech-Stack-Entscheidung (bereits getroffen, nicht neu diskutieren):**
Streamlabs Mobile (einzige praktikable Broadcast-Software für das 100% mobile Cloud-Setup ohne PC), GitHub + Vercel (Code/Deploy-Pipeline) und Claude Code (Entwicklung) sind der gesetzte Kern-Stack. StreamElements/Cloudbot (Chat-TTS + Commands) und Discord (Community-Hub) sind für Phase 3/4 vorgesehene Ergänzungen. Gemini ist kein Teil des Kern-Stacks (höchstens optional für Content-Brainstorming). OBS ist nicht relevant (Desktop-only, Setup ist 100% mobil).

**Kernstrategie-Prinzip** (aus der Diskussion um Engagement ohne Kamera/Mikrofon): Das Overlay ersetzt die Mimik (audio-reaktive Effekte statt Gesichtsausdruck), der Chat ersetzt die Stimme, künftiges Chat-TTS gibt den Zuschauern das Gefühl gehört zu werden, Channel-Points-Rewards, die direkt Overlay-Effekte auslösen, ersetzen Blickkontakt/Interaktion. Der Idle-Ambient-Layer wurde eingeführt, weil die Overlays vorher nur bei Alerts lebendig wirkten (~2% der Sendezeit) — die übrigen >95% sahen statisch aus, was laut DaN direkt zum Wegklicken bei anderen Streams führt.

## Proactive Code & Feature Audit Directive

- Scanne bei neuen Aufgaben das Repository auf ungenutzten Code, Sicherheitslücken und Performance-Engpässe.
- Schlage proaktiv neue Widgets, Design-Verbesserungen oder API-Erweiterungen vor, die zu diesem Streamer-Setup passen.
