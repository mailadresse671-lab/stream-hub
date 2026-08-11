# Twitch-Kanal-Konzept: dangsxr1000 im Hood/Ghetto-Style

Datenbasis: [`twitch_profile_dump.json`](./twitch_profile_dump.json) (manuell erfasst aus
Screenshots, da automatisierter Live-Abruf via decapi.me/twitch.tv aus dieser Sandbox
netzwerkseitig blockiert ist - siehe `meta.note` in der JSON-Datei).

Ziel: der Kanal soll optisch und textlich zum bereits gebauten Overlay-Look von
`goal.html`/`chat.html` passen (zerschossene Panzerplatte, Blutrot `#b30000`, Gold
`#ffd700`, dunkler Asphalt, Bebas Neue/Montserrat, Einschusslöcher) - alles aus einem
Guss statt Kanalseite und Overlay in zwei verschiedenen Welten.

---

## 1. Entrümpelung - was verschwindet/verschmilzt und warum

| Problem gefunden | Aktion |
|---|---|
| Panel **"Mein Setup"** nennt PS4 + DualShock 4 | **Widerspricht der Realität.** CLAUDE.md dokumentiert ein 100% Cloud-/Mobile-Setup (GeForce NOW Ultimate, kein PC/Konsole, Galaxy Tab S11 Ultra + Galaxy S26 Ultra). Text wird korrigiert. |
| Panel **"Über mich"** nennt erneut PS4, überschneidet sich inhaltlich mit der Kanal-Beschreibung | **Zusammenlegen.** Beide erzählen "wer bin ich" - wird zu einem einzigen, stärkeren Panel "Über Mich / Die Hood". |
| Kanal-Beschreibung hat sichtbares kaputtes Markdown (`**Text**` statt fett) | Wird als sauberer Klartext neu geschrieben, kein rohes Markdown mehr. |
| Live-Benachrichtigungstext endet mit einem verirrten `"` -Zeichen (Copy-Paste-Rest) | Tippfehler entfernen. |
| **Keine Social-Links hinterlegt** (Twitch zeigt aktiv den Hinweis-Banner dazu an) | Neues Panel "Socials" mit Platzhalter-Struktur, bereit zum Befüllen sobald Handles feststehen. |
| **Kein Support/Spendenbox-Panel** - nur das native Twitch-Goals-Widget | Neues Panel "Support", das Follow/Sub/Bits klar als Community-Aktion einordnet statt nur Zahlen zu zeigen. |
| Erweiterung **"Sound Alerts"** ist aktiv | **Konfliktrisiko:** `goal.html` spielt eigene Alert-Sounds über die Twitch-EventSub-Anbindung ab. Läuft die Extension parallel, gibt's bei Follow/Sub/Bits/Raid möglicherweise doppelten Ton. **Bestätigt (11.08.2026): DaN deaktiviert sie manuell im Twitch-Dashboard unter Erweiterungen** – das ist eine Live-Dashboard-Einstellung außerhalb dieses Repos, kann nicht per Code umgesetzt werden. |
| Emotes (Rage, GG, Brille, Bombe, Birne, Dart) sind Twitch-Standardmotive ohne Markenbezug | **Bewusst zurückgestellt** - Stufe 2/3 sind erst ab Affiliate-Status nutzbar (aktuell 0/10 Abonnenten-Punkte). Redesign folgt, sobald freigeschaltet. |

---

## 2. Neue Panel-Architektur

Reihenfolge unter dem Player, von links nach rechts:

1. **Mein Setup** - Beweis, dass Skill über Hardware siegt
2. **Kiez-Regeln** - Chat-Regeln, aber mit Haltung
3. **Über Mich / Die Hood** - wer ist DaN (ersetzt die alten Panels "Über mich" + Kanal-Beschreibung)
4. **Socials** - alle Kanäle an einem Ort (aktuell leer, Struktur startklar)
5. **Support** - warum Follow/Sub/Bits zählen

Alle fünf Panels bekommen ein eigenes Bild im selben visuellen System (siehe unten) -
damit die Reihe wie eine durchgängige Serie wirkt, nicht wie fünf Einzelstücke.

---

## 3. Panel-Texte (exakt, copy-paste-fertig)

### Panel 1 - "MEIN SETUP"
```
🔧 KEIN 3000€-PC. KEINE AUSREDEN.
Ich fahr volles Programm über die Cloud:
▸ Gaming-Rig: GeForce NOW Ultimate
▸ Regie-Zentrale: Samsung Galaxy Tab S11 Ultra
▸ Zweitgerät (Chat & Kontrolle): Galaxy S26 Ultra
▸ Setup: 100% mobil, 100% Cloud – kein PC, kein Laptop, nur Skill.
Beweis, dass es nicht am Gerät liegt, sondern am Fahrer.
```

### Panel 2 - "KIEZ-REGELN"
```
📜 IN MEINEM REVIER GILT EIN CODE:
1️⃣ Respekt zuerst – für mich, für den Chat, für jeden hier.
2️⃣ Kein Spam. Keine Eigenwerbung. Kein Zugemülle im Chat.
3️⃣ Null Toleranz für Beleidigungen.
Wer sich nicht dran hält, fliegt raus – ohne Diskussion. So läuft das hier. 🚫
```

### Panel 3 - "ÜBER MICH / DIE HOOD"
```
🏗️ DaN – Bayern, Baustelle, Ranked.
Tagsüber bau ich echte Straßen (Polier im Straßen- & Tiefbau) – nachts regier
ich mein eigenes Revier hier auf Twitch. Rocket League, volles Risiko, volle Cloud.
Ich streame ohne Mikro – der Chat ist meine Stimme. Schreib mir, ich antworte sofort. 🤘
Motorrad, Fußball, Fitness – und ein Original, das sich auch von KI nicht
kleinkriegen lässt.
```

### Panel 4 - "SOCIALS"
```
📡 BLEIB DRAN – AUCH ABSEITS VOM STREAM:
▸ TikTok: @dangsxr1000
Weitere Kanäle (Twitter/X, Instagram, Discord) kommen, sobald sie stehen –
bis dahin ist TikTok die beste Anlaufstelle neben Twitch.
```

### Panel 5 - "SUPPORT"
```
💰 DEN STREAM AM LAUFEN HALTEN:
Follows, Subs und Bits pushen nicht nur die Ziele oben – sie sind der Grund,
warum's hier weitergeht.
▸ Folgen: kostenlos, macht aber den Unterschied.
▸ Abo/Bits: direkter Support, taucht sofort im Stream auf.
Jeder Support zählt – und wird gefeiert, nicht nur gezählt. 🎉
```

### Zusätzlich: korrigierte Kanal-Beschreibung (ersetzt den kaputten Markdown-Text)
```
DaN – Abenteurer aus Bayern.

Polier im Straßen- und Tiefbau, nachts Vollgas in Rocket League. Motorrad,
Fußball, Fitness – und immer für den Chat da. Auch wenn er sich beim Aufbau
von einer KI helfen ließ: am Ende bleibt DaN ein Original.
```

### Zusätzlich: korrigierter Live-Benachrichtigungstext (Tippfehler entfernt)
```
🚀 Rocket League Stream! Kommt vorbei und seht zu, wie ich versuche, nicht in
mein eigenes Tor zu schießen! 🎉⚽ Lasst uns Spaß haben!
```

---

## 4. Bild-Spezifikation für alle 5 Panel-Grafiken

Einheitliches Format für alle fünf, damit die Panel-Reihe wie ein durchgehendes Set wirkt:

- **Maße:** 320 × 320px (quadratisch, PNG, sRGB) - Twitch skaliert Panel-Bilder auf
  eine feste Breite von ~320px, quadratisch hält die Reihe visuell bündig.
- **Hintergrund:** dunkle Asphalt-/Rost-Textur (`#17130f` → `#3a2317`-Verlauf,
  identisch zur `--asphalt`/`--rust`-Palette aus `goal.html`), leichtes Korn/Rauschen.
- **Rahmen:** 3px Rahmenlinie in Blutrot `#b30000`, eine Ecke asymmetrisch
  "abgeschossen" (schräger Schnitt statt rechtem Winkel) - Panzerplatten-Motiv aus
  dem Overlay, hier als statischer Bildschnitt statt CSS-`clip-path`.
- **Akzent:** 1-2 kleine Einschusslöcher (dunkler Kreis + feine radiale Risslinien in
  Blutrot-Glow) als Textur-Element in einer Ecke, nicht über dem Text.
- **Typografie:** Panel-Titel in **Bebas Neue** (o.ä. condensed Grotesk), Gold
  `#ffd700`, Versalien, deutlicher Schlagschatten für Kontrast auf der Textur.
  Fließtext im Bild selbst wird NICHT ins Bild gerendert (Twitch zeigt den Text
  ohnehin separat unter/neben dem Panel-Bild) - das Bild trägt nur Titel + Icon-Motiv.
- **Icon je Panel** (zentral, Chrome/Gold, einfache Silhouette statt Fotorealismus):
  - Setup → stilisiertes Cloud-/Signal-Symbol (steht für Cloud-Gaming statt Hardware)
  - Kiez-Regeln → stilisiertes Stopp-/Warnschild-Symbol
  - Über Mich / Die Hood → Skyline-/Silhouetten-Motiv (Person + Baukran im Hintergrund,
    Nod zum echten Beruf)
  - Socials → stilisiertes Antennen-/Signal-Symbol
  - Support → stilisierte Münze/Chip-Symbol in Gold
- **Konsistenz:** exakt dieselbe Schrift, dieselben zwei Akzentfarben und dieselbe
  Eckenbehandlung in allen 5 Bildern - keine Variation im Grundsystem, nur im Icon.

Diese Spezifikation ist bewusst so präzise gehalten, dass die Bilder in einem
Folgeschritt 1:1 danach produziert werden können (Python/Pillow mit denselben
Assets/Farbwerten wie das Overlay).

---

## 5. Offene Punkte (brauchen Input von DaN, nicht von mir lösbar)

- **Social-Handles**: TikTok (`@dangsxr1000`) ist bestätigt und in Panel 4 eingetragen.
  Twitter/X, Instagram, Discord-Invite bewusst zurückgestellt (DaN-Entscheidung
  11.08.2026: "Nur TikTok + Twitch fürs Erste") - Panel 4 wird ergänzt, sobald
  weitere Accounts feststehen.
- ~~**Sound-Alerts-Erweiterung deaktivieren?**~~ **Bestätigt (11.08.2026)** - DaN
  deaktiviert sie manuell im Twitch-Dashboard, siehe Tabelle oben.
- **Panel-Bilder final produzieren**: Diese Datei liefert die Spezifikation: Text +
  Farben + Layout stehen. Das tatsächliche Rendern der 5 PNGs ist ein separater
  nächster Schritt (auf Wunsch).
