# Agent-Team

Übersicht aller Subagenten unter `.claude/agents/` für dieses Streaming-Projekt. Aufruf über `subagent_type` erfolgt über den **Agent-Namen** (Spalte 2), nicht über den ursprünglichen Charakter-Namen — bei drei Agenten weichen diese bewusst voneinander ab (siehe Hinweis unten der Tabelle). Alle zehn lesen vor jeder Antwort `.claude/stream-setup.md`, um das reale Hardware-/Software-Setup des Streamers zu berücksichtigen.

| Charakter | Agent-Name (`subagent_type`) | Modell | Aufgabe |
| :--- | :--- | :---: | :--- |
| Chat-Charlie | `twitch-engagement-manager` | sonnet | Chat-Aktivierung (Fragen des Tages, Chat-Spiele), Kanalpunkte-Belohnungen, Going-Live-Ankündigungen, Hype-Management (Raids, Sub-Trains, Cheers) |
| Plan-Paula | `twitch-stream-planner` | haiku | Stream-Ablaufpläne/Schedules, Titel-Optimierung (mind. 5 Optionen), Kategorien & strategische Tags, Kollaborations-/Squad-Stream-Konzepte |
| Video-Jon | `twitch-social-clipper` | sonnet | Clip-Identifikation (virales Potenzial), Short-Form-Skripte mit Hook, Social-Media-Captions & Hashtag-Strategie, Plattform-Anpassung (TikTok/Shorts/Reels) |
| Overlay-Oliver | `overlay-oliver` | sonnet | Coding von Overlays/Alerts/Widgets (HTML/CSS/JS), Streamlabs-Browserquellen-Integration, mobiles/responsives Design ohne Verdeckung wichtiger UI |
| Szene-Sam | `szene-sam` | haiku | Szenen-Struktur & -Hierarchie, Quellen-/Layer-Anordnung, Schritt-für-Schritt-Anleitungen für die mobile Streamlabs-App |
| Check-Conny | `check-conny` | haiku | Pre-Stream-Checklisten, Testmethoden ohne Live-Gang (Streamlabs-Test-Buttons), spontanes Troubleshooting |
| Setup-Stefan | `setup-stefan` | sonnet | Bitrate/FPS/Auflösung-Empfehlungen, Twitch-Ersteller-Dashboard-Einstellungen, Verknüpfung Streamlabs ↔ Twitch-Konto |
| Cloud-Chris | `cloud-chris` | sonnet | GeForce-NOW-Latenz-Optimierung, Android-Ressourcen-Management (RAM Plus, Hintergrundprozesse), Peripherie (Controller/Headset/USB-C-Hub) |
| Audio-Anna | `audio-anna` | sonnet | Audio-Routing (Spiel-/Mikro-Trennung), Discord-Voice-Integration in den Stream-Mix, USB-Mikrofone am Tablet |
| Start-Steffen | `start-steffen` | sonnet | Ist-Analyse/Audit des laufenden Setups, Lücken-Identifikation, priorisierter Optimierungsplan, Delegation an die Fachagenten |

**Hinweis zur Namensabweichung:** Bei `twitch-engagement-manager`, `twitch-stream-planner` und `twitch-social-clipper` wurde das `name`-Feld im Frontmatter beim Anlegen bewusst an den gewünschten Dateinamen angeglichen (Aufruf läuft über `name`, nicht über den Dateinamen) — die Charakter-Namen Chat-Charlie/Plan-Paula/Video-Jon stehen dafür weiterhin im jeweiligen System-Prompt. Bei den übrigen sieben Agenten ist der Charakter-Name gleichzeitig der Agent-Name.

Details zu jedem Agenten stehen in der jeweiligen Datei unter `.claude/agents/`, das technische Setup zentral in [`stream-setup.md`](./stream-setup.md).
