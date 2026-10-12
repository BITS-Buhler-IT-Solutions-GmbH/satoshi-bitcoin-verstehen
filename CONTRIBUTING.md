# Beitragen zu Satoshi — Bitcoin Verstehen

Danke für dein Interesse! Hier erfährst du, wie du zum Projekt beitragen kannst.

## Voraussetzungen

- Grundkenntnisse in HTML, CSS und JavaScript
- Ein lokaler Webserver (z.B. `npx serve .` oder VS Code Live Server)
- Git

## Projekt lokal einrichten

```bash
git clone https://github.com/bmarc82/satoshi-bitcoin-verstehen.git
cd satoshi-bitcoin-verstehen
npx serve .
```

Die App läuft unter `http://localhost:3000`.

## Architektur

Die App ist bewusst als **Single-File SPA** ohne Build-Step aufgebaut:

- `index.html` — Gesamte App (HTML + CSS + JS, ~15'000 Zeilen)
- `rabbit-hole.js` — Geführte Reise & Hidden Rabbits (separates IIFE)
- `sw.js` — Service Worker für Offline-Caching

**Wichtig:**
- Kein Framework, kein TypeScript, kein Bundler
- Vanilla JS mit `var` und klassischen Funktionen (bewusst, für maximale Kompatibilität)
- CSS ist inline im `<style>`-Block
- JavaScript ist inline im `<script>`-Block

## Wie du beitragen kannst

### Bugs melden

1. Öffne ein [Issue](../../issues) mit:
   - Beschreibung des Problems
   - Schritte zum Reproduzieren
   - Erwartetes vs. tatsächliches Verhalten
   - Browser & Gerät

### Code beitragen

1. **Fork** das Repository
2. Erstelle einen **Feature-Branch**: `git checkout -b feature/mein-feature`
3. Mache deine Änderungen
4. **Teste** lokal im Browser (Chrome, Firefox, Safari)
5. **Commit**: `git commit -m "Add: kurze Beschreibung"`
6. **Push**: `git push origin feature/mein-feature`
7. Erstelle einen **Pull Request**

### Was wir suchen

| Bereich | Beispiele |
|---------|-----------|
| **Quiz-Fragen** | Neue Fragen mit korrekter Antwort, Erklärung und Modul-Link |
| **Module** | Neue Bildungsinhalte (z.B. Privacy, Taproot, Nostr) |
| **Übersetzungen** | Englisch, Französisch, Italienisch |
| **Accessibility** | ARIA-Labels, Keyboard-Navigation, Screen Reader |
| **Performance** | Lazy Loading, Code-Splitting |
| **Design** | Responsive-Verbesserungen, neue Animationen |
| **Bugs** | Fixes für gemeldete Issues |

### Quiz-Fragen hinzufügen

Quiz-Fragen befinden sich im `QUIZ_QUESTIONS`-Array in `index.html`:

```javascript
{
  cat: 'basics',        // Kategorie: basics, tech, history, economics, security, bonus
  q: 'Deine Frage?',
  opts: ['A', 'B', 'C', 'D'],  // 4 Antwortmöglichkeiten
  correct: 2,           // Index der richtigen Antwort (0-basiert)
  reward: 40000,        // Belohnung in Sats
  explain: 'Erklärung der Antwort.',
  link: 'modul-key',    // Verlinktes Modul
  linkLabel: 'Mehr erfahren'
}
```

## Code-Stil

- **Einrückung:** 2 Spaces
- **Strings:** Single Quotes in JS
- **Semikolons:** Ja
- **Kommentare:** Auf Deutsch, wo nötig
- **Funktionen:** `function name() {}` statt Arrow Functions (IE11-Kompatibilität im rabbit-hole.js)
- **CSS-Variablen:** Nutze die bestehenden `--gold`, `--bg`, `--surface`, `--text`, `--muted` etc.

## Commit-Nachrichten

```
Add: neue Quiz-Frage zu Lightning
Fix: Wallet-Anzeige bei 0 Sats
Update: Chronologie um 2026 erweitert
Remove: veraltete API-Referenz
```

## Wichtige Hinweise

- **SW Cache bumpen:** Nach Änderungen an `index.html`, `rabbit-hole.js` oder `manifest.json` `npm run sw:stamp` ausführen (bzw. `npm run build`) — `check.js` schlägt sonst fehl
- **Lernreise erweitern:** Neue Module in `rabbit-hole.js` nur als neues Kapitel **am Ende** anhängen (Fortschritt ist index-basiert) und im Modul ein `hidden-rabbit` setzen — `check.js` prüft beides
- **Klickbare Elemente:** Wenn möglich `<button>`/`<a>` verwenden; `div`/`span` mit `onclick` bekommen automatisch `role="button"` + Tastaturbedienung (`enhanceClickables`)
- **Sats-Budget:** Das Gesamtbudget darf 100'000'000 Sats (1 BTC) nicht überschreiten
- **Keine externen Abhängigkeiten:** Keine npm-Pakete, keine CDN-Links (ausser Umami Analytics)
- **Keine persönlichen Daten:** Fortschritt bleibt lokal (localStorage); einzig Umami misst anonym und cookielos Seitenaufrufe (in der Datenschutzerklärung offengelegt)

## Lizenz

Mit deinem Beitrag stimmst du zu, dass er unter der [MIT-Lizenz](LICENSE) veröffentlicht wird.

---

Fragen? Öffne ein Issue oder kontaktiere uns über die App (Impressum).
