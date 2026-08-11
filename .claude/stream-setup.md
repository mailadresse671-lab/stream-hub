# Stream-Setup

Technisches Setup des Streamers — von allen Subagenten unter `.claude/agents/` vor jeder Antwort zu berücksichtigen (siehe Verweiszeile am Ende jedes Agenten-System-Prompts).

## Hardware
- **Hauptgerät (Gaming & Stream-Regie):** Samsung Galaxy Tab S11 Ultra
- **Begleitgerät (Zweitbildschirm für Chat & Steuerung):** Samsung Galaxy S26 Ultra
- **Controller:** PS4-Controller (Bluetooth, am Tablet)
- **Mikrofon:** integriertes Mikro des Tablets ist AUS / nicht genutzt
- **Kamera:** integrierte Kamera des Tablets ist AUS / nicht genutzt — kein echter Facecam-Feed im Stream

## Software
- **Gaming-Plattform:** GeForce NOW (Cloud-Gaming) — gespielt wird Rocket League
- **Broadcast-Software:** Streamlabs (Android-App)
- **Streaming-Plattform:** Twitch

## Konsequenzen für Overlay-/Setup-Empfehlungen
- Kein echtes Kamerabild verfügbar — Overlays nutzen stattdessen einen Bären als visuellen Ersatz für Kamera/Mimik (siehe `assets/images/avatar_idle.png`/`avatar_action.png` im Repo).
- Mikrofon-/Kamera-Zugriff aus dem Browser-Overlay heraus (`getUserMedia`) ist in der Streamlabs-Mobile-Android-WebView blockiert — jede Audio-/Video-Reaktivität im Overlay-Code ist bestenfalls ein Bonus-Pfad, nie die primäre Grundlage.
- 100% mobiles/Cloud-Setup, kein PC/Laptop im Loop — Empfehlungen (Bitrate, Encoder, Peripherie, Einrichtungsschritte) müssen zur Android/Tablet-Realität passen, nicht zu Desktop-Streaming-Software wie OBS.
- Steuerung/Chat-Interaktion läuft über das Zweitgerät (S26 Ultra), nicht über das Streaming-Tablet selbst.

Weitere Projekt-Fakten (Twitch-Kanal, Vercel-Domain, Env-Var-Namen etc.) stehen zusätzlich in [`../PROJECT_INFO.md`](../PROJECT_INFO.md).
