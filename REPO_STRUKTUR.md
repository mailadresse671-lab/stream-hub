# REPO_STRUKTUR.md

Diese Datei ist die knappe, menschlich lesbare Ordnungsregel fuer das Repo.

## Aktiv benoetigt

- Root-HTML-Dateien sind die stabilen Browser-Quellen-Einstiege fuer Streamlabs und Vercel.
- `api/` enthaelt die produktiven Serverless-Funktionen.
- `assets/` enthaelt produktive Bilder, Audio und Browser-JS.
- `scenes/` enthaelt kanonische Quellordner kompletter Szenen-Sammlungen.
- `scenes/core/` enthaelt die kanonischen Quellseiten der Hauptszenen (`start`, `in-game`, `overlay`, `goal`, `chat`, `index`, `branding`).
- `scenes/oldschool/` ist der kanonische Quellordner fuer die komplette 90s-Old-School-Suite.
- `widgets/` enthaelt die kanonischen Quellseiten der frei positionierbaren Einzel-Widgets.

## Wichtig fuer die Oldschool-Suite

- Inhaltliche Arbeit immer in `scenes/oldschool/`.
- Die Root-Dateien `oldschool-starting.html`, `oldschool-chatting.html`, `oldschool-gameplay.html`, `oldschool-brb.html`, `oldschool-outro.html` sind nur noch Kompatibilitaets-Einstiege.
- `oldschoolchatting.html` bleibt eine Legacy-URL fuer die Tippfehler-Variante ohne Bindestrich.

## Nicht mehr produktiv gebraucht

- `archive/uploads/bear_avatar.png` ist nur noch ein altes Upload-Artefakt und wird nicht mehr von produktivem Code referenziert.

## Kuenftige Ordnungsregel

- Neue komplette Szenen-Suiten bekommen einen eigenen Unterordner unter `scenes/`.
- Neue Widget-Sammlungen oder spaeter migrierte Einzel-Widgets werden unter `widgets/` gebuendelt.
- Root bleibt fuer stabile Einstiegspfade reserviert.
- Verwaiste Uploads, alte Rohdateien oder abgeloeste Artefakte kommen nach `archive/`.
- Struktur-Dokumentation zuerst hier aktualisieren, bevor neue Sonderfaelle entstehen.