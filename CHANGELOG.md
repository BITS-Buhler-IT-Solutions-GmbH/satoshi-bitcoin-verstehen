# Changelog — BITS-SATOSHI-APP

Format nach [Keep a Changelog](https://keepachangelog.com/de/), Versionen nach SemVer.
Jede deployte Version bekommt hier einen Eintrag mit Datum.

## [Unreleased]

## [3.6.0] — 12.10.2026

### Lernen — 12.10.2026
- Persönlicher Lernstart mit drei Fragen zu Vorwissen, Ziel und Lerntempo; empfiehlt bestehende Pfade, ohne den aktiven Pfad ungefragt zu wechseln.
- Wallet-Führerschein mit fünf fiktiven Situationen: Empfangsadresse, betrügerischer Support, Gebühren, Backup und Geräteverlust.
- Erklärungen, passende Vertiefungsmodule und gezielte Wiederholung falscher Antworten; Übungsergebnisse bleiben getrennt von Modulabschlüssen und Sats.
- Lernprofil und Übungsergebnisse lokal gespeichert, in Fortschritts-Backups integriert und beim vollständigen Zurücksetzen entfernt.

### Gestaltung — 12.10.2026
- Neue Startseite «Follow the White Rabbit» mit grosser Typografie, Bitcoin-Orange und animierter SVG-Netzwerkvisualisierung.
- Persönlicher Lerneinstieg mit Pfadfortschritt, Themenkarten mit SVG-Icons und schwebende Navigation mit Tastaturbedienung.
- Rabbit-Hole-Karte zeigt alle vier bestehenden Kapitel und ihren tatsächlichen Abschlussstand.
- Responsive Darstellung und reduzierte Bewegung berücksichtigt; PWA-Farben an das neue Erscheinungsbild angepasst.

## [3.5.0] — 07.10.2026 (noch nicht deployt)

### Nutzerführung
- Prominenter Einstieg «Mit Modul 1 starten» bzw. «Weiterlernen» direkt unter dem Titel; Marktdaten und Spielstatistik unter der Modulübersicht.
- Besuche und bewusst bestätigte Modulabschlüsse getrennt gespeichert; Lernpfade und Fortschrittsring zählen Abschlüsse. Bestehende Besuche bleiben erhalten.
- Modulabschluss am Inhaltsende mit separater Anzeige bestandener Modul-Quizfragen; Rabbit-Hole-Abschlüsse zählen ebenfalls.

### Robustheit
- Fehlertolerante Browser-Speicherzugriffe und Typprüfungen beim Laden; Hinweis bei Schreibfehlern.
- Fortschrittsimport prüft alle Felder vor dem Schreiben, stellt bei Schreibfehlern den bisherigen Stand wieder her und speichert Lernpfad und Versionskennung im richtigen Format.
- Exportschema 2 enthält Modulabschlüsse; ältere Backups bleiben importierbar, Besuche werden nicht automatisch zu Abschlüssen.
- Hintergrund-Initialisierung verarbeitet Aufgaben auch bei Idle-Timeout und ohne `requestIdleCallback`.

## [3.4.0] — 04.10.2026 (noch nicht deployt)

### Inhalt
- Bitcoin-Volksinitiative: Scheitern dokumentiert (rund 50'000 von 100'000 Unterschriften, Frist 30.06.2026 abgelaufen), alle Querverweise angepasst.
- Zeitkritische Zahlen auf Stand Herbst 2026 gebracht (Strategy, Spot-ETFs, El Salvador, Bhutan, Metaplanet, Hashrate, Pool-Anteile, Blockchain-Grösse, Lightning, Stablecoins, Staatsschulden, Gold, Zentralbankbilanzen).
- Chronologie bis 2026 ergänzt; Entwicklung um OP_RETURN-Streit/BIP-110 und BIP-360; Layer 2 um Ark und Spark.
- Regulierung: CARF seit 2026, Bargeld-Abstimmung 8.3.2026, MiCA-Übergangsfrist, GENIUS/CLARITY Act, geplante Abschaffung der DE-Haltefrist, AT Krypto-Tausch steuerneutral.
- Energie nach Cambridge-Bericht 2025; unbelegter Streaming-Vergleich durch Stromverbrauch Schweiz (BFE) ersetzt.
- Über 100 sachliche Korrekturen (Technik, Geschichte, Ökonomie, Zitate ohne Beleg entfernt, KYC bei Relai/Pocket).

### Technik
- Was-wäre-wenn-Rechner: doppelte `updateWhatIf()` entfernt, Jahr 2026 ergänzt, Wechselkurs-Fallbacks korrigiert; Halving-Ziel dynamisch.
- News-Feed: XSS-Härtung (DOMParser, nur http(s)-Links/Bilder, `escapeHtml` maskiert `'`).
- Service Worker v38: fremde Ursprünge werden nicht mehr dauerhaft gecacht, alternative.me als API mit TTL.
- Tote YouTube-Links entfernt bzw. korrigiert.
- Datenschutzerklärung legt Umami-Reichweitenmessung offen; Haftungsausschluss nach Art. 100 OR; Urheberrecht mit MIT-Lizenz in Einklang.

### Technische Optimierung
- Performance (Lighthouse lokal, Median aus 3 Läufen): Total Blocking Time −43 %, Main-Thread-Arbeit −33 %, Time to Interactive −15 %.
  - Service Worker: kein Reload beim Erstbesuch mehr (Produktion: ~2,7 s doppeltes Laden laut Lighthouse), Registrierung nach `load`.
  - IntersectionObserver nur noch für den aktiven Screen (vorher ~800 Elemente aller Screens), nach Sichtbarkeit abgemeldet.
  - Kaninchen-CSS statisch in `index.html` statt Laufzeit-Injektion (Long Task ~340 ms), Home-Karte im ersten Layout.
  - Zuletzt bekannte Kurse sofort aus dem Cache, Daten-Fetch ohne Idle-Wartezeit; Zähler animieren vom aktuellen Wert.
  - Eine gemeinsame CoinGecko-URL (USD/EUR/CHF) für Home, Netzwerk und Rechner.
- News: eigener Proxy `public/api/feed.php` (Whitelist, 15-Min-Cache, `api/cache/` gesperrt); tote Proxys entfernt.
- Social: X-Timeline-Widget entfernt (von X eingestellt), Direktlink.
- CSP: Twitter/codetabs/allorigins entfernt, `gateway.umami.is` ergänzt (Umami war blockiert), YouTube über `youtube-nocookie.com`.
- Barrierefreiheit: `role="button"`/`tabindex` + Enter/Leertaste für klickbare div/span, `:focus-visible`, globales `prefers-reduced-motion`; Pfeiltasten-Navigation ignoriert Formularfelder.
- PWA/SEO: PNG-Icons 192/512, maskable, Apple-Touch-Icon, `og-image.png` (1200×630); `noscript`-Liste vollständig.
- Rabbit Hole: Kapitel 4 (bitcoin-schweiz, privacy, kritik, funfacts) am Ende angehängt, Zahlen dynamisch.
- Build: `npm run build` (= `sw:stamp` + `check` + `compress`); `check.js` prüft neu JS-Syntax, JSON-LD, «ß», SW-Stamp, Aktualität, Icons, Kaninchen und Kompressions-Stand; Dev-Server liefert gzip.

### Dokumentation
- 28.09.2026: CLAUDE.md mit Einordnungs-Block angelegt, Projekt im Hub-Register erfasst (Konsolidierung Phase 1).

## Bisheriger Stand
- live, Entwicklung ruht seit 28.04.2026
