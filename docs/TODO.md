# BTC-Klar – Verbesserungs-TODO

## Update 12.10.2026 · Version 3.6.0 (deployt)

- [x] Neue Startseite, Themenkarten, Navigation und Rabbit-Hole-Kapitelübersicht.
- [x] Persönlicher Lernstart und Wallet-Führerschein mit lokalem Speicher und Backup-Integration.
- [x] Build, Regressionstests und Deployment-Smoke-Tests.
- [ ] Visuelle Kontrolle des neuen Designs auf Desktop und Mobilgeräten.
- Enthält auch die zuvor lokalen Änderungen der Versionen 3.4.0 und 3.5.0.

## Update 07.10.2026 · Version 3.5.0 (lokal, noch nicht deployt)

- [x] Einstieg bzw. Weiterlernen direkt unter dem Titel; Marktdaten und Spielstatistik unter der Modulübersicht.
- [x] Besuche von bewussten Modulabschlüssen trennen; Modul-Quiz separat anzeigen; Lernpfade zählen Abschlüsse.
- [x] Gespeicherte Fortschrittsdaten fehlertolerant laden und vor dem Import vollständig prüfen.
- [x] Import-Rollback bei Schreibfehlern und korrekte Speicherung des aktiven Lernpfades.
- [x] Idle-Initialisierung bei Timeout und ohne Idle-API korrigieren.
- [x] Regressionstests sowie Desktop- und Mobil-Browserprüfung.

> **Stand: 2026-04-25 · App-Version 3.3.0**
> Erledigte Items sind mit `[x]` markiert. Details zu jedem Release siehe
> Modul «Changelog» in der App oder den `CHANGELOG`-Block in `index.html`.

---

## Erledigt in Version 3.3.0 (Übersicht)

- Spendenadresse mit QR-Code, doppelter SHA-256-Verifikation (Adresse + QR-Datei)
- Lern-Sats überall klar als Simulation gekennzeichnet
- History-API-Routing für jedes Modul (`/blockchain`, `/lightning`, …)
- Neues Modul «Bitcoin Schweiz» (Praxisleitfaden) mit persistenten Checklisten
- Fortschritt JSON-Export/Import + Schema-Versionierung (`migrateProgress`-Hook)
- «Zuletzt angesehen»-Karte auf der Startseite (letzte 5 Module)
- «Weiterlernen»-Button am Ende jedes Inhalts-Moduls (auto-generiert)
- Difficulty-Filter-Chips auf Home (Einsteiger / Fortgeschritten / Experte)
- Modul-Suche auf Home (Eingabefeld, kombinierbar mit Filtern)
- Tagesstreak 🔥 auf Home, Belohnungen bei 7 / 30 / 100 / 365 Tagen
- Lokales Error-Log mit Anzeige in Einstellungen (max 50 Einträge, kein Tracking)
- Drittanbieter-iframes (YouTube, BTC Map, Bitcoin Deaths) laden erst bei Modul-Besuch — mehrere MB initial gespart
- **Inhalts-Phase 1**: Neues Modul «Kritik & Mythen» (10+10 Punkte), CBDC erweitert (130-Länder-Status, SNB, Wholesale/Retail, 7 Risiken, BTC-vs-CBDC-Tabelle), Inflation um Kaufkrafttabelle (USD −96 %, CHF −75 %) + Cantillon-Effekt + Fiat-vs-Bitcoin-Tabelle ergänzt, Blockchain um Byzantinisches Generals-Problem mit Mapping-Tabelle
- **Energie-Vergleichsgrafik**: Inline-SVG mit Goldabbau / Bankensystem / Netflix / Bitcoin / Wäschetrockner / Standby-Geräte / YouTube / Weihnachtsbeleuchtung — Bitcoin hervorgehoben, Quellen verlinkt (Cambridge CBECI, Galaxy Digital, IEA, EIA, NRDC, DOE)
- **Modul «Wusstest du?»**: 80 Bitcoin-Fakten in 10 Kategorien aus `bitcoin_funfacts.md` integriert, eigene URL `/funfacts`
- **Inhalts-Phase 2**: Lightning-Modul Praxis-Erweiterung (Channel-Liquidität, LSP, LNURL, Submarine Swaps, Risiken), neues Modul «Privacy» (CoinJoin, UTXO-Hygiene, KYC, 3 Privacy-Stufen), Hardware-Wallet-Walkthrough in `sicherheit` mit 12 Schritten (Tamper-Check bis Nachlass-Planung)
- **Lernpfade**: 5 thematische Pfade (Bitcoin Basics, Self-Custody, Bitcoin in der Schweiz, Technik tief, Bitcoin &amp; Gesellschaft), aktiver Pfad in localStorage, «Weiterlernen»-Button pfad-aware mit Pfad-Indikator + Schritt-Zähler, Pause/Wechsel-Funktion, Home-Banner mit nächstem Pfad-Modul
- **Inhalts-Audit**: Vergleich-Modul mit konkreten Altcoin-Analysen erweitert (ETH/SOL/XRP/BCH mit Daten, Premine/ICO-Mechanik, Marketcap-Realität); Geld-Modul mit «Warum exakt 21 Millionen?» — Halving-Tabelle, geometrische Reihe, mathematische Herleitung; El-Salvador-«90 %-Lightning»-Claim faktisch präzisiert (BIS-Studie 2024)
- **Faktencheck Runde 2**: «Mehr Private Keys als Atome im Universum»-Mythos korrigiert (2²⁵⁶≈10⁷⁷ liegt in derselben Größenordnung, nicht darüber); Top-500-Supercomputer-Vergleich präzisiert (ASIC vs General-Purpose); MicroStrategy/Strategy-Bestand auf 2024/2025-Niveau aktualisiert (250k bzw. 400k BTC); Bitcoin-Bestand 17 Jahre (statt 15/16); Altcoin-Anzahl quellenbasiert (13-25k); Raspberry-Pi-Node-Kosten realistisch (~CHF 200 inkl. SSD statt nur ~CHF 50 Pi)
- **Diskussionsfragen**: Aufklappbare «Zum Nachdenken»-Sektionen mit Reflexionsfragen in Geld, Kritik und Bitcoin-Schweiz (4 Fragen pro Modul, didaktische Struktur)
- **Engagement-Features**: Achievement-System mit 12 Badges (Toast + Galerie in Einstellungen); Anbieter-Wahl-Wizard mit 5-Fragen-Scoring im Bitcoin-Schweiz-Modul; animierte Blockchain-Kette im Blockchain-Modul (6 Blöcke, Glow-Fade-In bei neuen Blöcken); «Was-wäre-wenn»-Rechner mit Slider 2014-2025 + Faktor-Vergleich aller Jahre als Balkendiagramm
- **Wiki-Gap-Audit Phase 1**: 6 fundamentale Inhalte aus en.bitcoin.it ergänzt — Seed Phrase Deep-Dive in `sicherheit` (BIP39-Mechanik, Passphrase als 25. Wort, Plausible Deniability, häufige Fehler), UTXO-Modell narrativ in `blockchain` (Konto- vs UTXO-Modell, Wechselgeld, Coin Control), RBF + CPFP in `sicherheit` (festhängende TX retten), 0/1/3/6/144-Bestätigungs-Tabelle in `alltag`, Taproot/Schnorr-Upgrade in `entwicklung` (Adressen-Format `bc1p…`, MuSig2, DLCs), HTLC-Mechanik in `lightning` (Atomic Swaps, 3-Schritte-Trick), Chain-Analyse-Heuristiken in `privacy` (Common-Input, Address-Reuse, Round-Numbers, Wallet-Fingerprinting)
- **Wiki-Gap-Audit Phase 2**: Angriffsvektoren in `netzwerk` (51-%, Sybil, Eclipse — Mechanismus + warum sie in der Praxis scheitern); Difficulty einfach erklärt + 2-Wochen-Anpassungs-Regel + Mining-Pool-Ökonomie (Foundry/AntPool/F2Pool) + Stratum-V2-Dezentralisierung in `mining`; 2-of-3-Multisig-Vertiefung in `sicherheit` (Erbschafts-Beispiel mit Schlüssel-Verteilung, Tools wie Sparrow/Specter/Nunchuk/Casa, ab wann lohnt es sich); Fidelity-Bonds-Erklärung in `privacy` (Anti-Sybil bei JoinMarket)
- Retry-Button im Offline-Banner — manueller Fetch + auto-trigger bei `online`-Event
- API-Failure-Detection: Banner zeigt sich auch bei totalem Datenausfall trotz `navigator.onLine`
- Build-Check-Script `check.js` — validiert HTML, Modul-Konsistenz, Sitemap, Manifest, SW, SHA-256-Hashes
- Lesedauer-Badges automatisch aus Modul-Inhalt berechnet
- Service-Worker-Härtung: Stale-while-revalidate, Network-Timeout, Update-Banner-Flow
- nginx-Security: HSTS, CSP/X-Frame jetzt auf jeder URL ausgeliefert
- Sitemap mit 41 echten URLs statt Hash-Fragmenten
- Rabbit-Hole-Modul: A11y, Event-Delegation, robuster localStorage

---

## Priorität P0 – Sofort fixen

### [x] Spendenadresse verifizieren
- [x] Adresse fest in `SITE_CONFIG.donationAddr` hinterlegt
- [x] Prüfsumme/Hash der Adresse (`SITE_CONFIG.donationHash`)
- [x] QR-Code für BTC-Adresse anzeigen (`icons/donation-qr.svg`, SHA-256-verifiziert via `donationQrHash`)
- [x] Copy-Button mit Erfolgsmeldung
- [x] Hinweis: «SHA-256 lokal verifiziert»
- [ ] Aktuelle Warnung beheben — *Hash war korrekt, kein realer Fehler. UI-Klarstellung erfolgte.*
- [ ] Optional: Lightning-Adresse / LNURL — *braucht User-Input: welche Adresse?*
- [ ] Test einbauen, der bei falscher Adresse fehlschlägt — *braucht Test-Framework-Entscheidung*

### [x] Simulierte Sats klar kennzeichnen
- [x] Überall sichtbar: «Lern-Sats — keine echten Bitcoin» (Wallet-Banner, Stats, Mini-Counter)
- [x] Wallet-/Belohnungsbereich als Simulation markiert (goldener Pflicht-Banner)
- [x] Aufklappbare Erklärung im Wallet-Bereich («Was sind Lern-Sats?»)


---

## Priorität P1 – Nutzerführung verbessern

### [ ] Startseite vereinfachen
- [ ] Drei klare Einstiege erstellen: «Ich bin neu» / «Ich will Bitcoin kaufen» / «Ich will Bitcoin verstehen»
- [ ] Kurzen 5-Minuten-Einstieg für Anfänger bauen
- [ ] Button «Mit Modul 1 starten» prominenter platzieren
- [ ] Fortschritt und nächster Schritt direkt auf der Startseite anzeigen

### [x] Geführte Lernpfade eingebaut
> Neues Modul `pfade` (URL `/pfade`) mit 5 kuratierten Pfaden. Aktiver Pfad in localStorage, «Weiterlernen»-Button wird pfad-aware.
- [x] Lernpfad «Bitcoin Basics» — geld → inflation → analogien → kaufen → bitcoin-schweiz → sicherheit → dos
- [x] Lernpfad «Self-Custody» — kaufen → sicherheit → privacy → nodes → bitcoin-schweiz
- [x] Lernpfad «Bitcoin in der Schweiz» — bitcoin-schweiz → relai → schweiz → regulierung → sicherheit
- [x] Lernpfad «Technik tief» (entspricht «Mining & Energie» + Vertiefung) — whitepaper → blockchain → mining → energie → krypto → nodes
- [x] Lernpfad «Bitcoin & Gesellschaft» (entspricht «Fortgeschrittene» mit anderem Schwerpunkt) — inflation → cbdc → kritik → weltweit → institutionen → regulierung
- [x] Nach jedem Modul automatisch das nächste passende Modul empfehlen — `getNextInActivePath()` + `updateContinueButton()` mit Pfad-Erkennung
- [x] Aktiver-Pfad-Banner auf Home + Pause-Funktion + Pfad-Wechsel

### [x] Anfängerfreundlichkeit erhöhen *(teilweise)*
- [x] Fachbegriffe verlinkt — `linkifyScreen()` markiert 45 kuratierte Begriffe in Modul-Texten als klickbar (gestrichelte goldene Unterstreichung, Hover-Effekt)
- [x] Glossar verlinkt — Klick auf einen verlinkten Begriff navigiert zu `/lexikon`, öffnet das Akkordeon und scrollt mit Glow-Highlight zum Eintrag (`openLexikonTerm()`)
- [x] Schwierigkeit pro Modul anzeigen (Anfänger / Mittel / Fortgeschritten) — `MODULE_DIFFICULTY` + `addDifficultyBadges()`
- [x] Geschätzte Lesedauer pro Modul (`addReadingTimeBadges()` automatisch via 200 WPM)


---

## Priorität P1 – Vertrauen & Quellen

### [ ] Quellen-Badges einbauen
- [ ] Wichtige Aussagen mit Quellen versehen
- [ ] Pro Quelle: Link, Datum/Stand, Vertrauensniveau
- [ ] Externe Links als solche markieren
- [ ] Quellenbereich pro Modul ergänzen

### [ ] «Don't Trust, Verify»-Modus
- [ ] Button «Quelle anzeigen» bei kritischen Aussagen
- [ ] Button «Gegenargument anzeigen»
- [ ] Button «Selbst verifizieren»
- [ ] Mini-Anleitungen: Blockexplorer / Node / Whitepaper / Mining-Daten

### [x] Kritik-Modus ergänzt
> Neues Modul `kritik` (URL `/kritik`). Quellen: `06-kritik-modus.md` + `bitcoin_mythen.md`.
- [x] Modul «Kritik & Mythen» als eigenständiges Modul
- [x] Themen: Volatilität, Energie, Skalierung, Self-Custody, Kriminelle, Verbote, kein Wert, langsam, Macht, kompliziert + 10 Mythen (Tulpen, Hack, Reiche-Argument etc.)
- [x] Je Kritikpunkt: Kritik fair / Bitcoin-Antwort / praktische Konsequenz


---

## Priorität P2 – SEO & Teilbarkeit

### [x] Eigene URLs für Module
- [x] Jedes Modul hat eine eigene Route (`navigateTo` ↔ `history.pushState`)
- [x] URLs ohne `/module/` Prefix: `/blockchain`, `/lightning`, `/kaufen`, `/bitcoin-schweiz`
- [x] Browser-Zurück / -Vorwärts via `popstate`-Listener
- [x] Direktlinks zu Modulen (nginx `try_files` + JS `pathToKey`-Init-Routing)

### [x] Meta-Daten verbessern *(teilweise)*
- [x] Individueller `<title>` pro Modul (`updatePageMeta`)
- [ ] Individuelle Meta-Description pro Modul — *aktuell statisch im `<head>`*
- [x] Canonical URL ergänzt — pro Modul aktualisiert
- [x] OpenGraph URL pro Modul aktualisiert (`og:url`)
- [ ] OpenGraph-Titel pro Modul — *teilweise via `<title>`-Update*
- [ ] OpenGraph-Bild pro Modul erstellen — *braucht Design*

### [ ] Strukturierte Daten einbauen
- [x] JSON-LD `WebApplication` im `<head>`
- [ ] JSON-LD für Lerninhalte (`Course` / `LearningResource`)
- [ ] FAQ-Daten für häufige Fragen
- [ ] Quiz-/Question-Daten prüfen
- [ ] Breadcrumb-Daten einbauen

### [ ] Social Sharing verbessern
- [ ] Teilen-Button pro Modul
- [ ] Teilen-Button für Quiz-Ergebnisse
- [ ] Vorschautext generieren
- [ ] Optional: Bild für Lernfortschritt generieren


---

## Priorität P2 – Schweiz-Fokus ausbauen

### [x] Modul «Bitcoin in der Schweiz» erweitert
> Komplett neues Modul `bitcoin-schweiz` (URL `/bitcoin-schweiz`).
> Inhalts-Basis: `07-schweiz-praxisbereich.md`.
- [x] DCA in CHF erklärt
- [x] Schweizer Anbieter genannt (Relai, Pocket, Bittr, Bitcoin Suisse, Värdex, Bisq, Yuh, Swissquote)
- [x] Gebühren, Spread und KYC erklärt
- [x] Steuerliche Grundbegriffe erklärt
- [x] Unterschied Vermögenssteuer vs. Kapitalgewinn (privat steuerfrei) erklärt
- [x] Hinweis «keine Steuerberatung» mehrfach platziert

### [x] Praxis-Checklisten gebaut *(grosser Teil)*
- [x] «Meine ersten 100 CHF in Bitcoin» (6-Schritte-Plan + Vorab/Nach/Gross-Beträge-Checklisten)
- [x] «Seedphrase sicher sichern» (Niemals-Liste + Gute-Grundregeln-Liste)
- [x] Persistente Checkboxen (`data-checklist="..."` + `initChecklists()`, lokal in localStorage)
- [x] «Hardware Wallet einrichten» — vollständiger 12-Schritte-Walkthrough in `sicherheit` (Tamper-Check, Firmware, PIN, Seedphrase, Verifikation, Test-Transaktion, Wiederherstellung, Backup-Konzept, Nachlass)
- [ ] «Bitcoin an Familie vererben» — *teilweise in Schritt 12 abgedeckt, eigenes Detail-Tutorial fehlt*
- [ ] «Exchange zu Self-Custody» — *teilweise in Hardware-Walkthrough, eigene Schritt-für-Schritt-Form fehlt*
- [ ] «Node betreiben» — *Modul `nodes` existiert mit Konzept; Praxis-Walkthrough mit Umbrel/Start9 fehlt*

### [x] Lokaler Nutzen *(teilweise)*
- [x] BTC Map verlinkt (`btcmap.org/map?lightning`)
- [x] Händler / Akzeptanz erklärt (Sektion 9 + 10 im neuen Modul)
- [ ] Bitcoin-Meetups Schweiz verlinken
- [ ] Schweizer Bitcoin-Ressourcen sammeln


---

## Priorität P2 – Gamification verbessern

### [x] Lern-Sats sinnvoller einsetzen *(teilweise)*
- [x] Lern-Sats als Fortschrittssystem erklärt (Wallet-`<details>`-Block)
- [ ] Belohnungen besser visualisieren
- [x] Tagesstreak — `getCurrentStreak()` aus `appStats.dailyVisits`, Anzeige als 🔥-Badge auf Home, Sat-Belohnungen bei 7/30/100/365 Tagen (`STREAK_MILESTONES`)
- [ ] Badges für abgeschlossene Lernpfade
- [ ] Badge «Self-Custody verstanden» / «Mining verstanden» / «Lightning verstanden»

### [ ] Quiz verbessern
- [ ] Falsche Antworten besser erklären
- [ ] Nach Quiz falsche Fragen wiederholen
- [ ] Quiz als Lernkarten-Modus anbieten
- [ ] Schwierigkeit pro Frage markieren
- [ ] Zufallsfragen-Modus einbauen
- [ ] Abschlusszertifikat als lokale Grafik/PDF optional erzeugen

### [x] Fortschritt exportierbar machen
- [x] Fortschritt als JSON exportieren — `exportProgress()` in Einstellungen → JSON-Envelope mit Schema-Version
- [x] Fortschritt als JSON importieren — `importProgress(file)` mit Validierung, Migration, Confirm-Prompt, Reload
- [x] Reset-Funktion mit Sicherheitsabfrage *(Rabbit-Hole-Modul + Reset-Buttons in Einstellungen)*
- [x] LocalStorage-Versionierung — `PROGRESS_SCHEMA_VERSION = 1` + `migrateProgress()`-Hook für künftige Migrationen


---

## Priorität P3 – Technik & Performance

### [x] Ladezeit optimieren *(grosse Punkte erledigt)*
- [ ] Module lazy-loaden — *Module-HTML ist im Initial-DOM, würde ~300 KB sparen — eigener Refactor*
- [ ] Live-Daten erst nach initialem Render laden — *fetchAllData läuft async, blockt aber nicht; teilweise erledigt*
- [x] App-Shell sofort anzeigen (Service Worker precached)
- [ ] Grosse Inhalte in separate JSON-/Markdown-Dateien auslagern — *braucht Lazy-Load-Architektur*
- [x] Bilder komprimieren — *App nutzt 1 SVG-Icon + dynamisch erzeugten QR-SVG, beides minimal*
- [x] Fonts sparsam — *nutzt System-Fonts, keine externen Web-Fonts*
- [x] **Drittanbieter-iframes lazy** — YouTube/BTC Map/Bitcoin Deaths mit `data-src` statt `src=`, Aktivierung erst bei Modul-Besuch via `activateLazyIframes()`. Spart bei Initial-Load mehrere MB Drittanbieter-Bundles + vermeidet Cookie-/Daten-Verbindungen für nicht besuchte Module

### [ ] Core Web Vitals prüfen
- [ ] LCP messen
- [ ] INP messen
- [ ] CLS messen
- [ ] Lighthouse-Test durchführen
- [ ] Performance-Budget definieren

### [x] PWA härten
- [ ] Offline-Fallback testen *(SW-Strategie ist da, aber Modul-Content noch nicht offline)*
- [x] Service Worker Cache-Strategie geprüft & umgestellt (Stale-while-revalidate)
- [x] App-Shell precachen (`SHELL_FILES`)
- [ ] Modul-Inhalte offline verfügbar machen — *braucht Lazy-Loading-Architektur zuerst*
- [x] Update-Hinweis bei neuer Version (Update-Banner via `SKIP_WAITING`)

### [x] Fehlerbehandlung verbessern *(komplett)*
- [x] API-Fehler freundlich anzeigen — `_notifyApiFailure()` zeigt Banner bei totalem Ausfall, auch wenn `navigator.onLine` true sagt
- [x] Fallback für Live-BTC-Preis — `fetchWithFallback` Network → 1h-Cache → null
- [x] Offline-Status sichtbar (`offlineBanner` reagiert auf `online`/`offline` Events)
- [x] Retry-Button für fehlgeschlagene Daten — Button im Offline-Banner ruft `fetchAllData` + `fetchFearGreed` neu auf
- [x] Fehler lokal loggen, ohne Tracking — `logLocalError()` + `window.error` / `unhandledrejection` Hooks; Diagnose-Bereich in Einstellungen mit Anzeige + Lösch-Button; max 50 Einträge, kein Server


---

## Priorität P3 – Codequalität

### [ ] Struktur verbessern
- [ ] Module logisch trennen — *aktuell alles in einer index.html*
- [ ] Content, UI und State klar separieren
- [ ] Wiederverwendbare Komponenten definieren
- [x] Config-Datei für App-Daten — `SITE_CONFIG` zentralisiert
- [x] Magic Numbers entfernt (Beispiel: `RABBIT_REWARD`, `STEP_REWARD`, `RING_CIRCUMFERENCE` in rabbit-hole.js)

### [ ] Tests einbauen — *Test-Framework muss erst gewählt werden*
- [ ] Test für Spendenadresse-Hash
- [ ] Test für LocalStorage-Migration
- [ ] Test für Quiz-Auswertung
- [ ] Test für Fortschrittsberechnung
- [ ] Test für Offline-Fallback
- [ ] Test für Routing

### [x] Build-Checks
> Konsolidiert in `check.js` — `node check.js` läuft alle Checks, exit-code 0/1.
- [x] HTML validieren *(Tag-Balance, basic well-formedness)*
- [x] Links prüfen *(alle `navigateTo()`-Targets müssen valide Modul-Keys sein)*
- [x] Broken-Link-Check *(intern via Modul-Konsistenz; externe Links separater Job)*
- [x] Sitemap-Konsistenz *(jedes Modul in MODULES → eigene URL in sitemap.xml)*
- [x] Manifest prüfen *(Pflichtfelder name/start_url/icons + empfohlene Felder)*
- [x] Service Worker prüfen *(Cache-Version vorhanden, kein Auto-skipWaiting, Timeout-Check)*
- [x] Spendenadresse-Hash prüfen *(donationHash matcht donationAddr, donationQrHash matcht QR-Datei)*


---

## Priorität P4 – Inhaltliche Erweiterungen

### [ ] Neue Module *(alle: Inhalts-Arbeit)*
- [ ] Bitcoin vs. Fiatgeld
- [ ] Inflation einfach erklärt — *Modul `inflation` existiert, evtl. nur Anfänger-Variante zusätzlich*
- [ ] Warum 21 Millionen?
- [ ] Was ist ein Full Node? — *Modul `nodes` existiert*
- [ ] Was ist Mining wirklich? — *Modul `mining` existiert*
- [ ] Warum Proof of Work?
- [ ] Bitcoin und Energie — *Modul `energie` existiert*
- [ ] Bitcoin und Menschenrechte
- [ ] Bitcoin in autoritären Staaten
- [ ] Bitcoin vererben
- [ ] Multisig einfach erklärt
- [ ] Lightning einfach erklärt — *Modul `lightning` existiert*
- [ ] Gebühren verstehen
- [ ] UTXO-Management
- [ ] Privacy Basics
- [ ] CoinJoin erklären, ohne Anfänger zu erschlagen

### [ ] Inhalte entschärfen und präzisieren
- [ ] Stark wertende Aussagen mit Fakten untermauern
- [ ] Ironie und Maximalismus bewusst dosieren
- [ ] Anfänger nicht mit zu viel Ideologie erschlagen
- [ ] Klare Trennung Fakt / Meinung / Prognose / Bitcoin-maximalistische Einordnung


---

## Priorität P4 – UX-Details

### [x] Navigation verbessern
- [x] Suche eingebaut — `<input type="search">` + `filterBySearch()` filtert nach Name & Beschreibung, kombinierbar mit Gruppen+Difficulty
- [x] Modulfilter — Gruppen-Chips + Difficulty-Chips (Einsteiger / Fortgeschritten / Experte) auf Home
- [x] «Zuletzt angesehen» — `renderRecentModules()` zeigt letzte 5 auf Home, persistent über `visitedModules`
- [x] «Weiterlernen»-Button — `addContinueButtons()` hängt automatisch eine Folge-Modul-Karte an jeden Content-Screen

### [x] Accessibility *(im Rabbit-Hole-Modul vollständig, Hauptapp teilweise)*
- [x] Tastaturbedienung im Rabbit-Hole (`tabindex=0`, `role="button"`, Enter/Space)
- [ ] Tastaturbedienung Hauptapp prüfen
- [ ] Kontraste prüfen
- [x] ARIA-Labels in Rabbit-Hole, Bottom-Nav, FAB
- [x] Fokuszustände sichtbar (`:focus-visible`-Outline injiziert)
- [ ] Screenreader-Test durchführen

### [ ] Mobile UX
- [ ] Navigation auf Smartphone vereinfachen
- [ ] Quiz auf kleinen Screens testen
- [ ] Buttons fingerfreundlich machen
- [ ] Sticky-Fortschrittsanzeige prüfen
- [ ] PWA-Installationshinweis verbessern


---

## Nice-to-have

### [ ] Bitcoin-Tools
- [x] DCA-Rechner — Modul `stacking`
- [ ] Gebühren-Rechner
- [ ] Halving-Countdown
- [ ] Blockzeit-Anzeige — *teilweise im `netzwerk` Modul*
- [ ] Mempool-Status — *teilweise im `netzwerk` Modul*
- [ ] Kaufkraftvergleich CHF vs. BTC
- [ ] «Was wäre aus 100 CHF geworden?»-Rechner — *DCA-Simulator deckt das ab*

### [ ] Community
- [ ] Feedback-Button
- [ ] GitHub-Issues verlinken — *Footer-Link existiert*
- [ ] Verbesserungsvorschläge lokal sammeln
- [ ] Modul-Bewertung ohne Tracking
- [ ] Übersetzungen vorbereiten

### [ ] Fortgeschrittene Features
- [ ] Dark/Light Mode — *aktuell nur Dark*
- [ ] Druckansicht für Checklisten
- [ ] Lernzertifikat lokal erzeugen
- [ ] Markdown-basierte Content-Verwaltung
- [ ] Admin-freier Content-Build aus Dateien


---

# Empfohlene Reihenfolge — Status

| # | Aufgabe | Status |
|---|---------|--------|
| 1 | Spendenadresse fixen | ✅ Erledigt (v3.3.0) |
| 2 | Simulierte Sats klar kennzeichnen | ✅ Erledigt (v3.3.0) |
| 3 | Startseite mit drei Einstiegen umbauen | ⏸ Inhaltsentscheidung benötigt |
| 4 | Eigene URLs für Module bauen | ✅ Erledigt (v3.3.0) |
| 5 | Quellen-Badges ergänzen | ⏸ Inhalt benötigt |
| 6 | Kritik-Modus einbauen | ⏸ Inhalt benötigt |
| 7 | Schweiz-Praxisbereich ausbauen | ✅ Erledigt (v3.3.0, Modul `/bitcoin-schweiz`) |
| 8 | Quiz und Lernpfade verbessern | ⏸ Quiz teilweise, **Lernpfade ✅** |
| 9 | Performance optimieren | ✅ Gröbste Punkte erledigt (SWR, Timeout, App-Shell) |
| 10 | Tests und Build-Checks ergänzen | ⏸ Tooling-Entscheidung benötigt |
