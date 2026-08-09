# Pre-Stream-Checkliste

Diese Checkliste ist dafür gedacht, jeden Stream mit derselben methodischen Ruhe zu starten — kein Hokuspokus, keine Überraschungen während des Countdowns. Teile A–D sind Standard-Checks vor jedem Stream. Teile E–G sind neu für die "Technische Störung"-Szene und die Regie-Integration.

Geschätzte Dauer: **8–10 Minuten** — führe diese Checks in aller Ruhe durch, nicht im Stress.

## A. Hardware-Check (vor dem Tablet hochfahren)

- [ ] **PS4-Controller:** Bluetooth angeschaltet, Batterie voll, nichts zwischen Controller und Tablet
- [ ] **Begleitgeräte:** Galaxy S26 (Chat/Regie) ist ebenfalls geladen und erreichbar
- [ ] **GeForce NOW:** Internet-Verbindung stabil (Speedtest starten, mind. 15 Mbps downstream für die Cloud-Gaming-Session)
- [ ] **Tablet (Tab S11 Ultra):** Nicht zu warm, genug RAM frei, Apps im Hintergrund minimiert (Chrome/Streamlabs sind die einzigen schweren Prozesse, die heute laufen)

## B. Streamlabs-Szenen-Setup-Check (in der App selbst)

1. **Projekt öffnen**, das die gewünschte Szenensammlung hat
   - Richtige Szenen sichtbar? (Alle sechs "90s Old School Edition"-Szenen sollten da sein: Starting, Chatting, Gameplay, BRB, Outro, Technical Issue)
   - Richtige Canvas-Auflösung eingestellt? (Siehe `STREAMLABS_SETUP.md`, **zuletzt bestätigter Wert: W=2847, H=1732**)

2. **Browser-Quellen überprüfen** (jede Szene einzeln öffnen):
   - [ ] **Starting:** Goal-Objekt sichtbar, Countdown läuft nicht einfach endlos vor dem Stream-Start
   - [ ] **Chatting:** Sub-Ziel-Balken sichtbar, Chat-Box unten (wird leer bis zur ersten Nachricht sein)
   - [ ] **Gameplay:** Bär ist sichtbar (freistehend unten mittig), Event-Karten oben rechts, Chat rechts, Status-Bar unten
   - [ ] **BRB:** Bär im Facecam-Slot sichtbar, Chat-Box, Message-Tagline falls `?message=` gesetzt
   - [ ] **Outro:** MVP-Liste sollte leer sein bis zur ersten echten Event/Leaderboard-Daten
   - [ ] **Technical Issue (NEU):** Headline sichtbar, Reconnect-Radar dreht sich, Chat-Box unten zeigt Status

3. **Transform-Panel-Werte prüfen** (falls eine Quelle seit letztem Stream verschoben wurde):
   - Alle Werte noch korrekt eingetragen? (W/H/Sc/TX/TY wie in `STREAMLABS_SETUP.md` beschrieben)
   - Sc ist definitiv 1 (nicht 0.9 oder 1.1)? Das macht den Unterschied zwischen scharf und verschwommen.

## C. Live-Verbindungen vorab testen (im normalen Browser, nicht im Stream)

**Testen auf deinem S26 Ultra mit Chrome**, BEVOR du Streamlabs startest:

1. **Vercel-API erreichbar?**
   - Öffne `https://stream-hub-three-gold.vercel.app/api/stats` in Chrome
   - Du solltest JSON sehen, nicht einen weißen Bildschirm oder 503-Fehler
   - Falls `"stale": true` oder `"offline"` — das ist normal, wenn die letzte Session-Baseline nicht mehr da ist, startet die erste Session-Poll auf Null

2. **Twitch-Verbindungen warm?**
   - Das kannst du nicht direkt testen (folge ganz unten "D. Letzter Check bevor die Übertragung startet"), aber achte darauf:
   - Eventuelle Fehlermeldungen in den Browser-Konsolen (F12 → Konsole)
   - Wenn eine Seite "CDN-Fehler" meldet = `tmi.js` konnte vom CDN nicht geladen werden → Check deine Internet-DNS

## D. Einzelne Overlay-Szenen vorab testen (ohne live zu gehen)

Öffne jede Szene EINZELN in einem neuen Browser-Tab auf dem Tablet (nicht in Streamlabs) — nutze die `?test=`-Parameter, um Effekte zu prüfen **ohne** live zu sein:

### D1. Starting-Szene (`oldschool-starting.html?test=follow`)
- [ ] **Countdown funktioniert:** `?minutes=5` (oder Default 5) sollte runterzählen, nicht hängen
- [ ] **Alert-Test:** `?test=follow` sollte einen Follow-Alert anzeigen (Popup oben rechts)
- [ ] **Track-Parameter:** `?track=Mein%20Lied%20by%20Artist` sollte die Marquee unten mit diesem Track füllen

### D2. Gameplay-Szene (`oldschool-gameplay.html?test=sub`)
- [ ] **Bär-Reaktion:** `?test=sub` sollte den Bären auf Action-Pose wechseln (für ca. 3.5s)
- [ ] **Safe Zones (optional):** `?safezones=1` zeigt gestrichelte Boxen für die Rocket-League-HUD-Bereiche (Orientierungshilfe)

### D3. Technical-Issue-Szene (NEU) — wichtig vor dem ersten echten Stream
```
https://.../scenes/oldschool/technical-issue.html?test=follow
https://.../scenes/oldschool/technical-issue.html?test=chat
https://.../scenes/oldschool/technical-issue.html?message=Custom%20Tagline
```
- [ ] **Reconnect-Radar dreht:** `.reconnect-radar` sollte kontinuierlich rot rotieren (kein Stillstand)
- [ ] **Chat-Status sichtbar:** Punkt + Text neben "CHAT LÄUFT WEITER" sollten sich von "Verbinde…" auf "Verbunden" oder "CDN-Fehler" bewegen
- [ ] **Follow-Alert:** `?test=follow` sollte ein Alert oben rechts zeigen (selbe Funktionalität wie in anderen Szenen)
- [ ] **Chat-Nachricht:** `?test=chat` sollte eine simulierte Chat-Zeile in der Chat-Box unten anzeigen
- [ ] **Custom Message:** `?message=Meine%20Custom%20Nachricht` sollte die Tagline unten ersetzen
- [ ] **Headline-Länge:** Die Headline "TECHNISCHE STÖRUNG" sollte nicht am rechten Rand abgeschnitten sein (Auto-Fit prüft das)

## E. Regie-Live-Deck-Test (Szenenwechsel-Button & Daumen-Erreichbarkeits-Kalibrierung)

### E1. Grundtest: Button-Funktionalität (auf dem S26 Ultra)

1. Öffne `https://stream-hub-three-gold.vercel.app/oldschool-live.html` in Chrome
2. Gib deine Regie-API-URL ein (falls konfiguriert) und speichern
3. Teste JEDEN Button einzeln:
   - [ ] **"Starting"** — wechselt auf Starting-Szene in `oldschool-master`
   - [ ] **"Gameplay"** — wechselt auf Gameplay-Szene
   - [ ] **"Technical"** (NEU) — wechselt auf Technical-Issue-Szene
   - [ ] **"Chatting"** — wechselt auf Chatting-Szene
   - [ ] **"BRB"** — wechselt auf BRB-Szene
   - [ ] **"Outro"** — wechselt auf Outro-Szene
   - [ ] **"Master neu laden"** — lädt die `oldschool-master`-Quelle neu

### E2. Daumen-Erreichbarkeits-Kalibrierung (auf dem echten Tab S11 Ultra, das Gerät, mit dem du streamst)

**Hintergrund:** Der neue "Technical"-Button ist notwendig für Notfälle (GeForce-NOW-Abbruch), muss aber blind und unter Zeitdruck erreichbar sein. Diese Kalibrierung simuliert exakt diese Situation.

#### Schritt 1: Setup
- [ ] Öffne `https://stream-hub-three-gold.vercel.app/oldschool-live.html` direkt im **Tab S11 Ultra** (nicht auf dem S26)
- [ ] Halte das Tablet in deiner **typischen Streaming-Haltung**: Langseitig auf dem Tisch, du sitzt davor, ungefähr 40–50cm Abstand
- [ ] Die Seite sollte vollständig laden (alle 6 farbigen Szenen-Buttons + der grauere "Master neu laden"-Button sichtbar)

#### Schritt 2: Der Button-Grid (was du sehen solltest)
Das Button-Grid hat folgende Struktur (2 Spalten, 7 Buttons total):
```
Reihe 1: [ Starting      ] [ Gameplay    ]
Reihe 2: [ Technical     ] [ Chatting    ]  ← "Technical" ist hier (LINKS, oben in dieser Reihe)
Reihe 3: [ BRB           ] [ Outro       ]
Reihe 4: [ Master n. l.  ] [ (leer)      ]  ← asymmetrisch
```

#### Schritt 3: Blind-Test (ohne Hinschauen)
1. **Startposition:** Lege deine rechte Hand entspannt neben das Tablet (Daumen nach innen, wie beim normalen Halten)
2. **Zeit-Stress simulieren:** Zähle mental "3... 2... 1..." wie bei einem echten Notfall (GeForce-NOW ist gerade weg, du musst JETZT wechseln)
3. **Blind antippen:** Ohne auf den Bildschirm zu schauen, versuche den "Technical"-Button mit dem rechten Daumen zu treffen. Der sollte sich ungefähr **in der Mitte-oben des Tablets, leicht rechts von der Mittellinie** befinden (Reihe 2, linke Spalte)
4. **Wiederhole 5-mal:** Versuche dies 5 Mal hintereinander
5. **Erfolgsquote:** Wie oft hast du den Button erwischt? (Ziel: 4/5 oder besser)

#### Schritt 4: Stress-Test (optionale Steigerung)
Wenn der Blind-Test gut funktioniert:
- Halte das Tablet diesmal mit **beiden Händen** (wie beim echten Gaming)
- Versuche den "Technical"-Button mit dem rechten Daumen zu treffen, ohne die linke Hand zu bewegen
- Das ist realistischer, wenn du gerade Rocket League spielst und den Controller neu greifen musst

#### Schritt 5: Ergebnis-Bewertung

**✅ Erreichbarkeit ist GUT, wenn:**
- Du den Button **4 von 5 Mal blind triffst** (oder besser)
- Der Daumen kommt problemlos hin, **ohne das Tablet umzugreifen**
- Du ihn auch mit **beiden Händen** noch sicher treffen kannst (Stress-Test)

**⚠️ Erreichbarkeit ist GRENZWERTIG, wenn:**
- Du nur **2–3 von 5 Mal** triffst
- Du den Daumen **sehr weit strecken** musst
- Der Button sehr nah am **Display-Rand** liegt (Risiko, versehentlich daneben zu tippen)

**❌ Erreichbarkeit ist SCHLECHT, wenn:**
- Du **weniger als 2 von 5 Mal** triffst
- Du das Tablet **umgreifen** musst, um den Button zu erreichen
- Der Button **gar nicht sichtbar** ist auf dem Tab-Bildschirm (responsives Design-Problem)

#### Schritt 6: Notiz für dein Tagebuch/die nächste Runde
Falls der Test schlecht ausfällt, notiere:
- Wie oft hast du getroffen?
- Wo ist der Button tatsächlich (welcher Bildschirm-Bereich)?
- Was würde die Situation verbessern? (z.B. Button größer, woanders platziert, etc.)

→ Diese Notiz dann an **Overlay-Oliver** weitergeben mit dem Hinweis: "Blind-Test unter Stress hat X/5 Treffer gebracht, möglicherweise braucht das Grid eine Anpassung"

### E3. Verbesserungsoptionen (falls der Blind-Test negativ ausfällt)

**Falls du regelmäßig den "Technical"-Button verfehlst, hat Overlay-Oliver folgende Optionen zur Auswahl:**

1. **Button-Größe erhöhen:**
   - Der "Technical"-Button könnte auf 50% mehr Höhe/Breite skaliert werden
   - Macht ihn leichter zu treffen, braucht aber Platz
   - Einfachste, schnellste Lösung

2. **Grid-Layout umorganisieren:**
   - Variante A: Nur eine Spalte für die 6 Szenen-Buttons machen (Start, Gameplay, Technical, Chatting, BRB, Outro untereinander)
   - Variante B: "Master neu laden" ganz unten in voller Breite, darüber 2 Spalten für die 6 Szenen-Buttons
   - Variante C: "Technical" in die obere Reihe neben "Gameplay" verschieben (häufiger benötigte Buttons oben + prominent)

3. **Neue Tasten-Anordnung:**
   - "Technical" und "Chatting" sind häufiger notwendig als "BRB" und "Outro"
   - → Diese oben, weniger häufig benötigte unten
   - Macht den Notfall-Button (Technical) präsenter

4. **Responsive Anpassung für Tablets:**
   - Größere Buttons bei breiterem Bildschirm (>800px)
   - Derzeitig CSS: `@media (max-width: 560px)` stellt auf 1 Spalte um — könnte für größere Tablets anders optimiert werden

**Du brauchst KEINE dieser Optionen selbst umzusetzen** — notiere nur das Ergebnis deines Blind-Tests und leite es an Oliver weiter.

## F. Notfall-Szene: Wenn GeForce NOW während des Streams abbricht

**Das ist der Augenblick, wo du schnell & ruhig handeln musst. Drucke diese Merkzeile aus oder schreib sie auf einen Zettel neben dein Tablet:**

```
🎮 GEFORCE-NOW-ABBRUCH — ABLAUF:

1. S26 hochziehen (Chat-Fenster)
2. oldschool-live.html öffnen (noch nicht getan? → Bookmark prüfen)
3. "Technical"-Button drücken (dritte Reihe, rechts)
4. WARTE 1-2s, bis Umschaltung sichtbar ist
5. Prüfe Chat-Status-Punkt (sollte grün "Verbunden" sein)
6. CHAT LÄUFT WEITER — deine Zuschauer sehen dir zu, während
   GeForce-NOW neu aufbaut (typisch 30–90 Sekunden)
7. Wenn Gameplay wieder da: "Gameplay"-Button drücken
8. Session sollte automatisch weiterlaufen

Wichtig: KEINE PANIK. Chat läuft IMMER weiter, auch wenn
das Gameplay schwarz ist. Nur Szenenwechsel, sonst nichts.
```

**Lagere diese Merkzeile physisch irgendwo, wo du sie im Stress schnell lesen kannst** (neben dem Tablet, im S26-Etui, auf dem Controller-Kabel geklebt, etc.).

## G. Letzte Prüfung bevor die Übertragung startet (3 Minuten vorher)

- [ ] **Streamlabs Live Check:** "Going Live"-Button ist sichtbar und grün (kein Fehler-Meldung)
- [ ] **Twitch-Profil öffnen** (auf S26): Kanal lädt, keine Fehler
- [ ] **Rocket League in GeForce NOW starten** — sollte problemlos laden
- [ ] **Erste Szene aktiv:** Starting-Szene sollte sichtbar sein im Streamlabs-Preview
- [ ] **Countdown läuft:** Nicht einfach eingefroren bei 5:00
- [ ] **Audio-Ausgang prüfen:** Sind die Alert-Sounds aktiviert? (Test in `goal.html`/`oldschool-starting.html` mit `?test=follow`)
- [ ] **Dein Psycho-Check:** Tiefes Durchatmen, 10 Sekunden. Du hast diese Checks gerade gemacht, alles läuft. Go live.

---

## Referenzen

Ausführliche Setup-Dokumentation:
- **Streamlabs Browser-Quellen-Setup:** siehe [`STREAMLABS_SETUP.md`](./STREAMLABS_SETUP.md) (W/H/Sc-Werte, Transform-Panel, Troubleshooting)
- **Szenen-Übersicht:** siehe [`SZENEN_UEBERSICHT.md`](./SZENEN_UEBERSICHT.md) (alle 6 Szenen, Eigene Live-Verbindungen, Query-Parameter)
- **Vollständige technische Details:** siehe [`CLAUDE.md`](./CLAUDE.md) (Historie, Architektur, Offene Punkte)

---

## Offene Punkte & Bekannte Grenzen

1. **"Technical"-Button-Erreichbarkeit (Abschnitt E2 — "Daumen-Erreichbarkeits-Kalibrierung"):** Der neue "Technical"-Button ist in Reihe 2, linke Spalte des Live-Deck-Grids. Die konkrete Blind-Test-Anleitung oben (E2) sollte VOR jedem Stream durchgeführt werden, um sicherzustellen, dass du ihn unter Zeitdruck zuverlässig treffen kannst. Falls der Blind-Test weniger als 3/5 Treffer bringt, notiere das und leite es an Overlay-Oliver weiter — siehe E3 für die möglichen Verbesserungen.

2. **Alle six Szenen der "90s Old School Edition"-Suite:** `oldschool-gameplay.html` und `oldschool-outro.html` wurden noch nicht live in Streamlabs Mobile getestet (nur Sandbox-Playwright-Tests). `oldschool-technical-issue.html` ist brandneu und sollte zeitnah im echten Einsatz validiert werden.

3. **Reconnect-Radius während eines echten Abbruchs:** Der Reconnect-Radar ist rein dekorativ (dreht sich kontinuierlich unabhängig von der echten GeForce-NOW-Reconnect-Aktivität). Der Chat-Status-Punkt wird dir zeigen, ob die Twitch-Verbindung noch da ist, aber NICHT, ob GeForce NOW gerade neu verbindet — das musst du am echten Bild sehen.
