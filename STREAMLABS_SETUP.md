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

Das folgende Setup ist eine konkrete Startempfehlung für die Rocket-League-Gameplay-Session — **noch nicht live in Streamlabs Mobile validiert** (wie jedes neue Layout in diesem Projekt), siehe Nachbesserungspfad unten. Basis: Gameplay-Capture (OBS/Streamlabs-Bildschirmfreigabe oder GeForce-NOW-App-Capture) als unterste Quelle, darüber `oldschool-master.html` im `?mode=gameplay` (transparente FX-Schicht), darüber fünf frei positionierbare Widget-Quellen. Die vorgeschlagenen Größen/Positionen sind Startwerte basierend auf bekannten Rocket-League-HUD-Kollisionszonen (In-Match-Chat oben links, Tor/Zeit-Anzeige oben Mitte, Boost oben rechts). **Wichtig**: Bei unterschiedlichen RL-Bildschirmen (Lobby-Menü, Pausenmenü, Nachspiel-Ergebnisliste) können Widgets trotzdem kollidieren — Live nachjustieren ist normal und nötig.

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

## Stream-Qualität (Twitch-Übertragung)

Anlass: Nach dem ersten kompletten Live-Gang meldete DaN, die Bildqualität auf Twitch sei "nicht gut" gewesen. Wichtig für die Einordnung: **zwei Kompressionsschritte hintereinander**, nicht nur einer.

1. **GeForce NOW → Tablet**: Der Cloud-Gaming-Server komprimiert das Rocket-League-Bild bereits einmal und schickt es als Video-Stream ans Tab S11 Ultra. Qualität/Bitrate dieses ersten Schritts hängt an GeForce NOWs eigenen Streaming-Einstellungen und der Verbindung zu Nvidias Servern — das ist **nicht** Streamlabs-/Twitch-Technik, sondern Cloud-Gaming-Technik (Cloud-Chris' Zuständigkeit, siehe unten).
2. **Tablet-Bildschirm → Twitch**: Streamlabs Mobile erfasst genau dieses (schon einmal komprimierte) Tablet-Bild per Bildschirmfreigabe und **kodiert es ein zweites Mal** neu, bevor es an Twitch geht. Das ist der Teil, den Setup-Stefan beeinflussen kann — und wo laut Recherche am ehesten ungenutztes Qualitätspotenzial liegt, weil Mobile-Broadcast-Apps ihre Ausgabe-Einstellungen oft konservativ/automatisch vorbelegen.

Diese doppelte Kompression bedeutet: Streamlabs' eigener Re-Encode kann die Ausgangsqualität von GeForce NOW nur **erhalten**, nie verbessern. Wirkt das Bild komplett "matschig", lohnt sich parallel ein Check bei Cloud-Chris (GeForce-NOW-eigene Stream-Qualitätsstufe, Netzwerkstabilität) — die folgende Checkliste behebt nur den zweiten Schritt.

**Checkliste — Streamlabs-Mobile-Video-Einstellungen prüfen (vor dem nächsten Stream):**

1. In Streamlabs Mobile: Menü → **Streaming-Einstellungen → Video-Einstellungen** öffnen (Ausgabe-Auflösung, Framerate, Max-Bitrate liegen dort, nicht im Transform-Panel der einzelnen Quelle).
2. **Auflösung/FPS**: Für ein schnelles Spiel wie Rocket League (viel Kamerabewegung, kleiner schneller Ball) zählt eine hohe, stabile Framerate meist mehr als reine Pixelzahl. Startempfehlung: **720p bei 60 fps**. Alternative, falls die Internetleitung nachweislich mehr hergibt (siehe Bitrate-Test unten): **1080p bei 30 fps**. Beides einmal live testen und über den Twitch-Dashboard-Verlauf (siehe Punkt 6) vergleichen, statt zu raten.
3. **Bitrate**: Twitch-übliche Richtwerte — ca. **4.000–4.500 kbps bei 720p60**, ca. **4.500–6.000 kbps bei 1080p30/60**. Twitch selbst empfiehlt, **6.000 kbps** als praktische Obergrenze nicht zu überschreiten (höher riskiert eher Puffern bei Zuschauern als bessere Qualität). Wichtiger Gegen-Check: die gesetzte Bitrate sollte **maximal 70–80 % der tatsächlich getesteten Upload-Geschwindigkeit** (echter Speedtest vom Tablet, nicht der beworbene Tarifwert) betragen — sonst drohen Dropped Frames.
4. **Rate Control**: Falls einstellbar, **CBR (Constant Bitrate)** statt VBR wählen — das entspricht Twitchs eigener Empfehlung für stabile Übertragung.
5. **Keyframe-Interval**: Twitch verlangt für korrektes Transcoding/VOD einen Wert von **2 Sekunden**. Streamlabs Mobile zeigt dieses Feld je nach App-Version evtl. gar nicht an — falls sichtbar, auf 2s setzen; falls nicht, ist es intern vermutlich schon korrekt fix hinterlegt (kein bekannter Grund zur Sorge, aber nicht aktiv verifizierbar aus der Sandbox).
6. **Nach dem nächsten Stream direkt gegenprüfen**: Twitch Creator Dashboard → Kanal-Dashboard → Stream-Zustand/Inspector zeigt die tatsächlich bei Twitch angekommene Bitrate, Auflösung und Dropped-Frame-Rate — das beste Werkzeug, um zu sehen, ob die gesetzten Werte überhaupt ankommen oder unterwegs (Tablet-Upload, WLAN) schon einbrechen.
7. **Encoder-Wahl**: Auf Mobile-Geräten gibt es i. d. R. keinen echten Software/Hardware-Auswahldialog wie am Desktop (x264 vs. NVENC) — das Tablet nutzt automatisch seinen Hardware-Encoder. Hier nichts manuell umzustellen; falls die Kodierleistung gedrosselt wirkt, ist das eher ein Energiespar-/Ressourcenthema (→ Cloud-Chris).

## Fernsteuerung im Hintergrund (Regie-System)

Anlass: DaN konnte `oldschool-live.html`/`oldschool-studio.html` (auf dem S26 Ultra geöffnet) nicht mehr nutzen, um Szenenwechsel-Befehle an `oldschool-master.html` (Browser-Quelle in Streamlabs Mobile auf dem Tab S11 Ultra) zu senden, sobald GeForce NOW im Vordergrund lief und Streamlabs dadurch minimiert war — erst nach Zurückwechseln zu Streamlabs griff die Steuerung wieder.

**Technischer Ablauf zur Einordnung**: `oldschool-master.html` ist eine ganz normale Browser-Quelle, die alle ~1,2s per `fetch()` gegen `api/regie-control.js` pollt, ob ein neuer Befehl vorliegt (`oldschool-master.html`, `pollMs`-Konstante). Der Befehl selbst wird von `oldschool-live.html`/`-studio.html` per `POST` an dieselbe API abgelegt (`api/regie-control.js`, In-Memory-State mit `revision`-Zähler und 5-Minuten-TTL pro Befehl). Damit ein Szenenwechsel ankommt, muss also **die Browser-Quelle selbst aktiv JavaScript ausführen** — sie kann nichts empfangen, wenn ihre eigene Ausführung pausiert ist.

**Recherche-Ergebnis — keine versteckte Streamlabs-Einstellung dafür gefunden**:
- Laut Streamlabs' eigener Dokumentation ist die App während aktiver Bildschirmfreigabe/Aufnahme technisch im Hintergrund und kann nichts "über" eine andere App rendern — auf iOS werden eigene Widgets/Alerts während des Broadcasts deshalb sogar explizit deaktiviert, wegen genau derselben Ressourcen-/Suspend-Problematik. Das deckt sich mit dem beobachteten Verhalten, auch wenn Streamlabs das für Android nicht identisch dokumentiert.
- Es existiert ein offizielles **"Streamlabs Controller"**-App (Fernsteuerung von einem Zweitgerät) — das koppelt sich aber ausschließlich mit **Streamlabs Desktop** (PC/Mac, per QR-Code im lokalen Netzwerk) und hat kein Gegenstück für Streamlabs Mobile. Da dieses Setup keinen PC hat, ist das kein übersehener Shortcut, sondern ein echtes Ausschlusskriterium — bestätigt gleichzeitig, dass unser selbstgebautes `regie-control.js`-System aktuell der **einzige** Weg ist, Streamlabs Mobile von einem Zweitgerät aus fernzusteuern.
- Fazit: Es handelt sich vermutlich um eine **strukturelle Android-Hintergrundausführungs-Grenze der Streamlabs-App selbst**, keine Einstellung, die DaN im Streamlabs-Menü umlegen kann. Der aussichtsreichste Hebel liegt eine Ebene tiefer, auf Android-/Geräteseite (Akkuoptimierung-Ausnahme für Streamlabs, "Nicht schlafende Apps"-Liste, Hintergrundprozess-Limits) — das ist **Cloud-Chris' Recherchebereich**, nicht Streamlabs-/Twitch-Technik. Empfehlung: Cloud-Chris gezielt fragen, ob sich Streamlabs Mobile auf dem Tab S11 Ultra von Samsungs Akkuoptimierung/Sleeping-Apps-Liste ausnehmen lässt — das wäre der nächste sinnvolle Schritt für dieses Problem.

**Eigenes Regie-System — zwei kleine Robustheits-Fixes, `Erledigt (11.08.2026)`:**
1. `oldschool-master.html` bekam einen `visibilitychange`-Listener: wird die Seite wieder sichtbar (Streamlabs kommt aus dem Hintergrund zurück), bricht er den laufenden `setTimeout` ab und pollt sofort, statt auf den nächsten regulären Tick zu warten. Verkürzt nur die Aufhol-Verzögerung nach einer Zwangspause, löst aber nicht die eigentliche Lücke (null Aktivität, solange wirklich im Hintergrund).
2. `api/regie-control.js` differenziert die Gültigkeitsdauer jetzt nach Aktionstyp: `scene.switch`/`scene.reload` bleiben 30 Minuten gültig statt der bisherigen pauschalen 5 Minuten für jede Befehlsart — ein während einer längeren Drosselungs-Pause gesendeter Szenenwechsel verfällt dadurch nicht mehr, bevor `oldschool-master.html` überhaupt wieder pollt.
3. **Weiterhin nicht empfohlen**: das Poll-Intervall selbst (1,2s) zu verkürzen — das ist nachweislich nicht der Engpass, ein kürzerer Takt würde nur unnötig Akku/Netzwerk kosten.

Diese beiden Fixes reduzieren nur Kollateralschäden (verlorene/verspätete Befehle) — sie lösen NICHT das eigentliche Problem, dass die Fernsteuerung während einer aktiven GeForce-NOW-Session gar nicht reagiert. Dafür siehe den nächsten Abschnitt.

## Echtzeit-Broadcast statt reinem Polling (Pusher Channels), `Erledigt (11.08.2026)`

DaN hat die oben unter „Empfehlung 1" (Akku-Optimierung ausnehmen) vorgeschlagene Sofortmaßnahme selbst live getestet — **keine Besserung**. Das bestätigt: das Problem liegt tiefer als eine Android-Einstellung, nämlich in Chromiums eigener Drosselung von `setTimeout`-Timern in nicht sichtbaren Seiten (siehe `.claude/stream-setup.md`). Aktive **WebSocket-Verbindungen sind von dieser Drosselung dokumentiert ausgenommen** — DaN hat sich daraufhin bewusst für den dafür nötigen externen Dienst entschieden (Kurskorrektur der bisherigen „keine externen Services"-Linie, siehe `CLAUDE.md` Tech-Stack-Entscheidung).

**Umsetzung**: `api/regie-control.js` löst bei jedem gespeicherten Befehl zusätzlich `pusher.trigger('regie-control', 'command', …)` aus (Pusher Channels, kostenloser Tarif). `oldschool-master.html` abonniert denselben Kanal und wendet ankommende Befehle sofort an — unabhängig vom Polling-Takt. Das bestehende Polling bleibt vollständig als Fallback aktiv (falls Pusher nicht konfiguriert ist oder die Verbindung fehlschlägt, funktioniert alles wie zuvor). Volle Architektur-/Testdetails: `CLAUDE.md` „Fertig & gemerged" → „Regie-System: Umstieg von reinem Polling auf Pusher-Channels-Echtzeit-Broadcast". Benötigte Vercel-Umgebungsvariablen: siehe `CLAUDE.md` Abschnitt „Hinweis (Sicherheit & Setup)".

Der `#hud`-Status in `oldschool-master.html` zeigt jetzt zusätzlich **„Live (Echtzeit)"** (Pusher verbunden) oder **„Live (Polling)"** (Fallback aktiv) an — daran lässt sich beim nächsten Live-Test direkt ablesen, ob Pusher tatsächlich greift.

**Noch offen, nur live bestätigbar**: ob die Pusher-Verbindung die Chromium-Drosselung im echten Streamlabs-Mobile-Hintergrund tatsächlich umgeht. Falls nicht (z.B. weil Android den ganzen App-Prozess einfriert statt nur Timer zu drosseln), bleibt als **praktische Zwischenlösung**: gewünschte Szene möglichst **vor** dem Wechsel ins Spiel schon über das Live Deck setzen, solange Streamlabs noch im Vordergrund ist.

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
| Bildqualität auf Twitch schlecht (verpixelt/verwaschen) trotz guter Internetleitung | Vermutlich (a) Streamlabs-eigene Ausgabe-Bitrate/Auflösung steht auf einem konservativen Auto-Wert, und/oder (b) doppelte Kompression (GeForce NOW → Streamlabs-Re-Encode) verstärkt vorhandene Unschärfe | Video-Einstellungen in Streamlabs Mobile manuell auf die Werte aus „Stream-Qualität" oben setzen; zusätzlich GeForce-NOW-eigene Stream-Qualitätsstufe mit Cloud-Chris prüfen |
| Live Deck (`oldschool-live.html`/`-studio.html`) reagiert nicht, solange im Spiel/GeForce NOW aktiv ist | Streamlabs Mobile läuft dabei im Hintergrund — reines Polling wird von Chromium dort gedrosselt (bestätigte Plattform-Grenze) | Pusher-Echtzeit-Broadcast ist seit 11.08.2026 eingebaut (siehe „Echtzeit-Broadcast statt reinem Polling" oben) — braucht die 4 `PUSHER_*`-Env-Vars in Vercel, sonst bleibt es beim alten Polling-Verhalten. Zusätzlich: Szene möglichst vor dem Spielwechsel schon setzen |
| `#transport`-HUD-Text in `oldschool-master.html` zeigt dauerhaft „Live (Polling)" statt „Live (Echtzeit)" | Die 4 `PUSHER_*`-Umgebungsvariablen fehlen in Vercel, oder die Pusher-Verbindung konnte nicht aufgebaut werden | `PUSHER_APP_ID`/`PUSHER_KEY`/`PUSHER_SECRET`/`PUSHER_CLUSTER` in den Vercel-Projekteinstellungen prüfen (siehe `CLAUDE.md` „Hinweis (Sicherheit & Setup)"); Polling funktioniert in der Zwischenzeit unverändert als Fallback |

## Quellen (Web-Recherche, 31.07.2026)

- [Browser Source | Streamlabs (Content Hub)](https://streamlabs.com/content-hub/tag/browser-source)
- [Why Your Stream is Pixelated and How to Fix It? | Streamlabs](https://streamlabs.com/content-hub/post/why-your-stream-is-pixelated-and-how-to-fix-it)
- [Question / Help - BrowserSource is blurry. | OBS Forums](https://obsproject.com/forum/threads/browsersource-is-blurry.116810/)
- [Introducing Browser Source Interaction For Streamlabs Desktop | Streamlabs](https://blog.streamlabs.com/introducing-browser-source-interaction-for-streamlabs-obs-d8fc4dcbb1fb)
- [Mobile Streaming FAQ | Streamlabs](https://streamlabs.com/content-hub/post/mobile-streaming-faq)

## Quellen (Web-Recherche, 11.08.2026 — Stream-Qualität & Fernsteuerung im Hintergrund)

- [Twitch Streamers - Twitch Video Encoding/Bitrates/And Stuff](https://stream.twitch.tv/encoding/)
- [Best Bitrate Settings for Live Streaming | Streamlabs](https://streamlabs.com/content-hub/post/best-bitrate-settings-for-live-streaming)
- [Mobile Streaming FAQ | Streamlabs](https://streamlabs.com/content-hub/post/mobile-streaming-faq)
- [How to Live Stream from Streamlabs Mobile (iOS and Android) | Streamlabs](https://streamlabs.com/content-hub/post/mobile-live-streaming-guide)
- [Twitch stream settings: bitrate, encoding and keyframe guide](https://callaba.io/twitch-stream-settings)
- [Cloud Gaming and Streaming: How to Broadcast from GeForce Now or Xbox Cloud | Streamhub](https://streamhub.world/streamer-blog/trends/1143-cloud-gaming-and-streaming-how-to-broadcast-from-geforce-now-or-xbox-cloud/)
- [Streamlabs Controller App: Remote Control Your Stream | Streamlabs](https://streamlabs.com/content-hub/post/streamlabs-controller-app-remote-control-your-stream)
- [Control Your Live Stream From Your Phone with Streamlabs Stream Deck | Streamlabs Support](https://support.streamlabs.com/hc/en-us/articles/4413175015579-Control-Your-Live-Stream-From-Your-Phone-with-Streamlabs-Stream-Deck)
