# AIDER_GUIDE.md

Referenzdokument für den Einsatz von **Aider** (Backup-KI-Coding-Tool zu Claude Code) auf diesem Projekt. Aider läuft auf einem separaten Android-Gerät über Termux → Ubuntu (proot-distro) → Python-venv, verbunden mit dem kostenlosen Google-Gemini-Modell (`gemini-2.5-flash`). Zweck des Zweit-Tools: bei erreichtem Claude-Code-Nutzungslimit trotzdem weiterarbeiten können, statt auf den nächsten Reset zu warten.

## 1. Projekt-Fakten

Alle konkreten Projekt-Werte (Twitch-Kanalname, Vercel-Production-Domain, Epic/Rocket-League-Spielername, Env-Var-Namen, URL-Parameter-Konventionen) stehen zentral in **`PROJECT_INFO.md`** — dort nachschlagen statt Platzhalter zu verwenden oder Werte zu erraten.

## 2. Setup auf dem Zweitgerät (Termux/Android)

```bash
pkg install git python  # falls noch nicht vorhanden
git clone https://github.com/mailadresse671-lab/stream-hub.git
cd stream-hub
git checkout aider-termux-work   # eigener Arbeits-Branch, siehe Abschnitt 3
```

- Kein Build-Schritt nötig — reines statisches HTML/CSS/Vanilla-JS plus drei Vercel-Serverless-Functions (`api/*.js`), kein `package.json`, keine npm-Dependencies.
- Lokaler Test-Server für HTML-Dateien: `python3 -m http.server 8000`
- Weiterführende Doku: `CURSOR_CONTEXT.md` (kompakter technischer Überblick), `CLAUDE.md` (vollständige Projekthistorie, sehr ausführlich).
- Es gibt **keine `.env`-Datei** im Repo — Secrets liegen ausschließlich als Vercel-Projekt-Umgebungsvariablen (Namen siehe `PROJECT_INFO.md`, Werte nicht im Repo einsehbar).

## 3. Branch-Workflow

| Tool | Branch | Regel |
|---|---|---|
| Aider (Termux) | `aider-termux-work` | Arbeitet ausschließlich hier, niemals direkt auf `main` |
| Claude Code | `claude/stream-hub-documentation-b41jci` | Arbeitet ausschließlich hier |

- Beide Branches werden nur nach expliziter Freigabe des Nutzers per PR nach `main` gemergt — kein Tool merged eigenständig das jeweils andere.
- Falls Aider auf einen fremden Branch-Namen oder Commit in der Historie stößt, der nicht von Aider selbst stammt: das ist normales Claude-Code-Arbeitsmaterial, nicht anfassen.

## 4. Aider-Betriebsregeln (Lektionen aus dem Vorfall vom 31.07.2026)

Bei einem frühen Testlauf hat Aider ungefragt Code geändert (Kommentare entfernt + automatisch committed), obwohl nur eine Analyse angefragt war — Ursache waren zwei Bedienfehler, die sich leicht vermeiden lassen:

1. **Reine Analyse/Recherche → immer `--chat-mode ask` verwenden.**
   Aider startet standardmäßig im Code-Edit-Modus: jede Nachricht wird als Bearbeitungsauftrag interpretiert. Für Analysen ohne Code-Änderung explizit so starten:
   ```bash
   aider --chat-mode ask --file <betroffene-datei>
   ```
   (Alternativ in einer laufenden Session `/ask <Frage>` bzw. `/chat-mode ask` tippen.)

2. **Lange/mehrzeilige Prompts nicht ins Termux-Terminal pasten.**
   Copy-Paste wird dort zeilenweise als einzelne Nachrichten an Aider gesendet (führt zu Fehlinterpretationen, z.B. URLs werden als Scraping-Befehl verstanden). Stattdessen den Prompt in eine Datei schreiben und als eine Nachricht übergeben:
   ```bash
   aider --chat-mode ask --file <datei> --message-file prompt.txt
   ```

3. **Playwright-Installationsangebote ablehnen.** Termux/ARM64 wird von Playwright nicht unterstützt (Installation schlägt ohnehin fehl) und wird für dieses Projekt nicht benötigt.

4. **Gemini-2.5-Flash-Kostenlos-Tier limitiert auf 5 Requests/Minute.** Bei wiederholtem `429 RESOURCE_EXHAUSTED`: Anfragen bündeln (ein zusammenhängender Prompt statt vieler kleiner) oder Modell/Provider in `~/.aider.conf.yml` wechseln.

5. **Nach jeder Aider-Sitzung mit Code-Änderungen, vor dem Push: `git status` und `git diff` prüfen.** Falls ungewollte Änderungen dabei sind: `git revert <hash> --no-edit` (sicher, auch falls bereits gepusht) statt `git reset --hard`.

## 5. Wann welches Tool

- **Claude Code**: primäres Werkzeug, arbeitet direkt gegen GitHub/Vercel, erstellt und merged PRs nach `main`.
- **Aider**: Backup bei erreichtem Claude-Code-Limit — für Analysen/Recherche (immer `--chat-mode ask`) sowie einfache, abgegrenzte Code-Änderungen auf `aider-termux-work`. Ergebnisse werden dem Nutzer gezeigt und erst nach Rücksprache per PR nach `main` übernommen.
