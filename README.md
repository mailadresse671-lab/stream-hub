# stream-hub

Sauber strukturierte Browser-Quellen-, Widget- und API-Sammlung fuer den Twitch-/Streamlabs-Workflow von DaNgsxr1000.

## Schnellstart

Wenn du etwas suchst, nimm diese Reihenfolge:

1. [REPO_STRUKTUR.md](REPO_STRUKTUR.md) — die Ordnungsregel des Repos
2. [SZENEN_UEBERSICHT.md](SZENEN_UEBERSICHT.md) — welche Szene oder welches Widget wofuer da ist
3. [STREAMLABS_SETUP.md](STREAMLABS_SETUP.md) — wie Browser-Quellen eingerichtet werden
4. [PROJECT_INFO.md](PROJECT_INFO.md) — feste Projektwerte, Domains, Kanalname, API-Kontext
5. [CURSOR_CONTEXT.md](CURSOR_CONTEXT.md) — kompakter technischer Ist-Zustand
6. [CLAUDE.md](CLAUDE.md) — volle Historie und Herleitungen

## Repo-Aufbau

- [scenes](scenes) — kanonische Quellordner kompletter Szenen-Sammlungen
- [scenes/core](scenes/core) — kanonische Hauptszenen wie Start, In-Game, Overlay, Goal, Chat, Stats, Branding
- [scenes/oldschool](scenes/oldschool) — komplette 90s-Old-School-Suite
- [widgets](widgets) — kanonische frei positionierbare Einzel-Widgets
- [api](api) — produktive Serverless-Funktionen
- [assets](assets) — produktive Bilder, Audio-Dateien und Browser-JS
- [archive](archive) — nicht mehr produktive, aber bewusst aufbewahrte Altlasten

## Wichtige Regel

Die Root-HTML-Dateien bleiben absichtlich als stabile Browser-Quellen-Einstiege fuer Streamlabs und Vercel erhalten.

Das bedeutet:
- Inhaltliche Aenderungen an Core-Szenen in [scenes/core](scenes/core)
- Inhaltliche Aenderungen an Oldschool-Szenen in [scenes/oldschool](scenes/oldschool)
- Inhaltliche Aenderungen an Widgets in [widgets](widgets)
- Root-Dateien nur als Kompatibilitaets-Einstiege behandeln

## Typische Suchwege

- Neue Szene anpassen: erst [SZENEN_UEBERSICHT.md](SZENEN_UEBERSICHT.md), dann passenden Ordner unter [scenes](scenes)
- Widget anpassen: direkt in [widgets](widgets) nachsehen
- API-Problem: in [api](api) schauen, dann [PROJECT_INFO.md](PROJECT_INFO.md)
- Alte oder verwirrende Datei gefunden: gegen [REPO_STRUKTUR.md](REPO_STRUKTUR.md) pruefen, ob sie aktiv oder archiviert ist