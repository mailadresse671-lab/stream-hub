# Streamlabs Mobile: Browser-Quellen-Setup (wiederverwendbares Preset)

Dieses Dokument fasst zusammen, wie **jede neue Browser-Quelle** (egal ob `overlay.html`, `in-game.html`, `start.html` oder eine zukünftige Szene) in Streamlabs Mobile eingerichtet werden muss, damit sie von Anfang an scharf, richtig positioniert ist und nicht mit dem eigenen Gameplay-HUD kollidiert — statt das bei jeder neuen Szene erneut per Trial-and-Error über Live-Screenshots herauszufinden.

Die Werte hier sind das Ergebnis von (a) eigener Web-Recherche zu Browser-Source-Verhalten (Quellen unten) und (b) mehreren Runden Live-Troubleshooting mit DaN über echte Streamlabs-Mobile-Screenshots (volle Historie: siehe `CLAUDE.md` → „Hotfix-Historie: overlay.html-Layout"). Das hier ist die destillierte, direkt anwendbare Checkliste daraus.

## Zwei Arten von Quellen — unterschiedliche W/H-Logik

- **Vollflächige Master-/Einzel-Szenen** (`overlay.html`, `goal.html`, `chat.html`, `start.html`, `in-game.html`, `index.html`, `branding.html`): randlos auf die gesamte Canvas ausgelegt, nutzen intern das `--vu`-Fluid-Unit-System. Hier gilt Punkt 2 der Checkliste unten wörtlich: **W/H = die volle Canvas-/Projekt-Auflösung.**
- **Frei positionierbare Einzel-Widget-Quellen** (`avatar.html`, `rl-stats.html`, `rl-daily.html`, `rl-rank-frame.html`, `status-ticker.html`, `event-cards.html`, `chat-vibes.html`, `hype-level.html`, `status-bar.html`, `follower-goal.html`): füllen nur die EIGENE Seite randlos aus, ohne festen Positions-Offset im Code — hier ist W/H bewusst NICHT die volle Canvas-Auflösung, sondern die Größe, die DU für dieses eine Widget auf dem Bildschirm haben willst (z. B. ein kleines 300×450-Rechteck für den Bären in einer freien Ecke). Position (TX/TY) frei nach Wunsch setzen. `Sc` bleibt trotzdem immer `1` (siehe unten) — die gewünschte Endgröße wird über W/H selbst gesteuert, nicht über einen nachtraeglichen Scale-Multiplikator.

## Checkliste: neue Browser-Quelle hinzufügen

1. **URL eintragen** — vollständig, inkl. nötiger `?parameter=`. Nachschlagen in `SZENEN_UEBERSICHT.md`, welche Szene welche Parameter braucht (z. B. `chat.html?channel=dangsxr1000` — **ohne** den Parameter läuft automatisch der Demo-Modus).
2. **Transform-Panel öffnen** und folgende Werte setzen:
   - **W / H** = bei vollflächigen Master-/Einzel-Szenen exakt die Canvas-/Projekt-Auflösung der aktuellen Streamlabs-Mobile-Szenensammlung (siehe unten, „Wie finde ich die richtige Canvas-Auflösung"). **Nicht** blind 1920×1080 eintragen, wenn das Gerät real anders rendert. Bei frei positionierbaren Einzel-Widget-Quellen stattdessen die gewünschte Widget-Größe eintragen (siehe „Zwei Arten von Quellen" oben).
   - **Sc (Scale)** = **immer 1**. Niemals ändern, auch nicht um etwas größer/kleiner wirken zu lassen (siehe Begründung unten).
   - **TX / TY / TZ** = 0 (keine Verschiebung — unsere Seiten sind auf volle Canvas-Abdeckung ausgelegt, `position:fixed;inset:0`).
   - **AX / AY / AZ** = 0 / Standard-Anker (Top-Left, volle Deckung).
   - **RX / RY / RZ** = 0 (keine Rotation).
3. **„Shutdown source when not visible"** = **AUS**.
4. **„Refresh browser when scene becomes active"** = **AUS**.
5. **Custom CSS** = leer lassen (unsere Seiten bringen ihr komplettes Styling selbst mit).
6. **FPS** = Standardwert reicht (unsere Animationen sind CSS-/rAF-basiert, kein Video-Feed).

## Warum genau diese Werte

- **W/H = echte Canvas-Auflösung, nicht 1920×1080 angenommen**: Der Browser rendert intern in der Größe, die W/H vorgeben. Ist diese kleiner als die spätere Zielgröße auf dem Canvas, wird das Ergebnis nachträglich hochskaliert — und das erzeugt zwangsläufig Unschärfe, weil eine bereits gerenderte, niedriger aufgelöste Bitmap vergrößert wird, statt nativ in der Zielgröße zu zeichnen. Das deckt sich sowohl mit allgemeiner Browser-Source-Praxis (siehe Quellen) als auch mit unserem eigenen bestätigten Live-Test.
- **Sc muss immer 1 bleiben**: `Sc` ist KEIN Teil der Render-Auflösung, sondern ein zusätzlicher Multiplikator, der das bereits fertig gerenderte Bild nochmal bitmap-artig skaliert — exakt derselbe Unschärfe-Mechanismus wie oben, nur eine Ebene höher. Genau das war die Ursache des ersten Blur-Bugs in dieser Session (`Sc:2` statt `Sc:1`).
- **`--vu`-Fluid-Unit-System statt CSS-`transform:scale()`**: Unsere eigenen Seiten skalieren sich intern NICHT per CSS-Transform (das hätte in der Streamlabs-Mobile-Android-WebView denselben Bitmap-Unschärfe-Effekt, live bestätigt in einer früheren Runde) — stattdessen lösen `calc()`/`clamp()`-Werte jede Größe schon beim Layout nativ auf. Das bedeutet: sobald W/H korrekt gesetzt sind und Sc=1 ist, passt sich der Inhalt automatisch scharf an jede reale Auflösung an — **keine Code-Änderung pro neuem Gerät/neuer Szene nötig.**
- **„Shutdown when not visible" AUS + „Refresh on active" AUS**: Unsere Overlays halten dauerhafte Zustände (Twitch-EventSub-WebSocket, tmi.js-Chat-Verbindung, Session-Stats-Baseline seit Seitenaufruf, Uptime-Zähler). Ist eine dieser Optionen aktiv, wird die Seite bei jedem Szenenwechsel komplett neu geladen — Verbindungen reconnecten unnötig neu, Session-Zähler (z. B. RL-Sieg/Niederlage-Delta) setzen sich fälschlich zurück. Beide AUS lassen die Seite durchgängig im Hintergrund weiterlaufen, unabhängig davon, welche Szene gerade sichtbar ist.

## Wie finde ich die richtige Canvas-Auflösung

In Streamlabs Mobile: Projekt-/Videoeinstellungen der aktuellen Szenensammlung öffnen und die dort hinterlegte Ausgabe-/Canvas-Auflösung ablesen — diese Zahl (nicht die theoretische Geräte-Display-Auflösung) gehört 1:1 in W/H.

**Zuletzt bestätigter Referenzwert für DaNs Samsung Galaxy Tab S11 Ultra** (natives Display 2.960×1.848, 16:10, Stand 31.07.2026):

| Feld | Wert |
|---|---|
| W | 2847 |
| H | 1732 |
| Sc | 1 |

Dieser Wert war der letzte, bei dem sowohl scharfe Darstellung als auch korrekte Positionierung live bestätigt wurden. **Muss neu geprüft werden**, falls sich die Projekt-Canvas-Auflösung in Streamlabs Mobile jemals ändert (z. B. nach einem App-Update oder einer geänderten Projekteinstellung) — dann einfach den obigen Ablese-Schritt wiederholen, die restliche Checkliste bleibt unverändert gültig.

## Empfohlenes Gameplay-Widget-Layout

Das folgende Setup ist eine konkrete, live erprobte Komposition für die Rocket-League-Gameplay-Session. Basis: Gameplay-Capture (OBS/Streamlabs-Bildschirmfreigabe oder GeForce-NOW-App-Capture) als unterste Quelle, darüber `oldschool-master.html` im `?mode=gameplay` (transparente FX-Schicht), darüber fünf frei positionierbare Widget-Quellen. Die vorgeschlagenen Größen/Positionen sind Startwerte basierend auf bekannten Rocket-League-HUD-Kollisionszonen (In-Match-Chat oben links, Tor/Zeit-Anzeige oben Mitte, Boost oben rechts). **Wichtig**: Bei unterschiedlichen RL-Bildschirmen (Lobby-Menü, Pausenmenü, Nachspiel-Ergebnisliste) können Widgets trotzdem kollidieren — Live nachjustieren ist normal und nötig.

**Quellen-Reihenfolge im Streamlabs-Szenen-Editor (von unten nach oben):**

1. **Gameplay-Capture** (OBS Bildschirmfreigabe oder GeForce-NOW-App-Erfassung) — exakte Einrichtung hängt vom Gerät ab, hier nicht detailliert.
2. **`oldschool-master.html?mode=gameplay`** (Master-Regie-iframe, transparent) — siehe Standard-Checkliste oben, W/H = Canvas-Auflösung, Sc=1, TX/TY=0.
3. **Fünf Widget-Quellen** (Reihenfolge von unten nach oben, damit die oberen visuell vor den unteren sichtbar sind):

| Quelle | URL | Empfohlene Größe (W×H) | Position Hinweis | Zweck |
|---|---|---|---|---|
| Bär | `avatar.html` | 200×288 | Unten mittig | Event-reaktiver Avatar, Idle-Wippen |
| Follower-Ziel | `follower-goal.html` | 360×150 | Oben rechts, frei von Tor/Zeit | Fortschrittsbalken für Follower-Meilensteine |
| Event-Karten | `event-cards.html` | 380×200 | Rechts, vertikal zentriert | Zuletzt Follower/Sub/Cheer |
| Hype-Level | `hype-level.html` | 380×140 | Oben rechts oder unten rechts, Platz abhängig | 5-Sterne-Meter, Auto-Increment bei Subs |
| RL-Rang-/Stats | `rl-stats.html` (alt) oder `rl-rank-frame.html?src=...` (neu, echtes Tracker.gg) | 380×180 (Stats) oder 450×150 (Rank-Frame) | Links, vertikal zentriert | Session/Tages-Stats oder echtes RL-Rang-HUD |

**Konkrete Positions-Vorschläge** (TX/TY im Streamlabs Transform-Panel, basierend auf 2847×1732-Canvas):

- **Bär**: TX ≈ 1300, TY ≈ 1450 (Bodenraum, horizontal mittig, frei von unteren Infotainment-Elementen wie Boost-Anzeige)
- **Follower-Ziel**: TX ≈ 2350, TY ≈ 50 (oben rechts, Platz für RL-Tor-Zeit oben-Mitte)
- **Event-Karten**: TX ≈ 2400, TY ≈ 600 (rechter Rand, vertikal zentriert, frei von Boost oben rechts)
- **Hype-Level**: TX ≈ 50, TY ≈ 1550 (unten links) ODER TX ≈ 2400, TY ≈ 350 (oben rechts unter Follower-Ziel, Platz abhängig)
- **RL-Stats**: TX ≈ 50, TY ≈ 700 (links, vertikal zentriert, frei von In-Match-Chat oben links)

**Nachbesserungspfad:**
1. Alle fünf Quellen mit den Startwerten hinzufügen.
2. Im echten Rocket-League-Gameplay (Lobby, Match laufend, Nachspiel) prüfen, wo Überlappungen auftreten.
3. Pro Überlappung die betroffene(n) Widget-Quelle(n) um ca. 100–200px verschieben (TX/TY-Wert im Transform-Panel anpassen).
4. Für verschiedene RL-Bildschirme ggfs. VERSCHIEDENE Szenen-Layouts in Streamlabs erstellen (z.B. "Gameplay — Ingame" vs. "Gameplay — Lobby-Menü"), damit die Widgets je nach aktuellem Kontext nicht erneut verschoben werden müssen.

## Kurz-Troubleshooting

| Symptom | Ursache | Fix |
|---|---|---|
| Bild wirkt unscharf/verpixelt | `Sc` steht nicht auf 1 | Transform-Panel öffnen, `Sc` auf `1` setzen |
| Bild wirkt unscharf, `Sc` ist schon 1 | W/H stimmen nicht mit der echten Canvas-Auflösung überein | Canvas-Auflösung neu ablesen (siehe oben), W/H korrigieren |
| Karten wirken riesig / hängen mitten im Bild | W/H falsch gesetzt (z. B. angenommene 1920×1080 statt echter Canvas-Größe) | W/H auf echte Canvas-Auflösung setzen |
| HUD überlappt eigenes Rocket-League-Menü/HUD | Bekanntes, gezielt zu behebendes Layout-Problem im Code, kein Streamlabs-Einstellungsproblem | Screenshot schicken, Zone wird im jeweiligen `.html` gezielt verschoben |
| Chat/Events reconnecten bei jedem Szenenwechsel neu | „Shutdown when not visible" oder „Refresh on active" steht auf AN | Beide auf AUS stellen (siehe Checkliste oben) |
| Einzel-Widget-Quelle (Bär, RL-Stats, Hype-Level, ...) wirkt winzig/abgeschnitten statt einfach kleiner | War ein Code-Bug (behoben): der Inhalt skaliert jetzt mit W/H mit, statt bei zu kleinem Kasten abgeschnitten zu werden | Sollte seit der Runde-2-Fix-Version nicht mehr auftreten — falls doch, W/H probeweise größer setzen und Screenshot schicken |
| Widget-Position passt nicht zu meinen RL-Bildschirmen | Rocket League hat je nach Bildschirm (Lobby, Menü, Ingame, Nachspiel) andere HUD-Layoutes. Proposierte Werte sind Startwerte | Nutze mehrere Szenen-Layouts in Streamlabs (eine pro RL-Kontext) oder verschiebe einzelne Widgets live nacheinander im Transform-Panel, bis alle frei bleiben |

## Quellen (Web-Recherche, 31.07.2026)

- [Browser Source | Streamlabs (Content Hub)](https://streamlabs.com/content-hub/tag/browser-source)
- [Why Your Stream is Pixelated and How to Fix It? | Streamlabs](https://streamlabs.com/content-hub/post/why-your-stream-is-pixelated-and-how-to-fix-it)
- [Question / Help - BrowserSource is blurry. | OBS Forums](https://obsproject.com/forum/threads/browsersource-is-blurry.116810/)
- [Introducing Browser Source Interaction For Streamlabs Desktop | Streamlabs](https://blog.streamlabs.com/introducing-browser-source-interaction-for-streamlabs-obs-d8fc4dcbb1fb)
- [Mobile Streaming FAQ | Streamlabs](https://streamlabs.com/content-hub/post/mobile-streaming-faq)
