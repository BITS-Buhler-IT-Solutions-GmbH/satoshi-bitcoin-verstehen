# BITS-SATOSHI-APP

## Einordnung — Teil des BITS-Betriebssystems

| | |
|---|---|
| **Was** | «Satoshi — Bitcoin verstehen»: interaktive Bildungs-PWA, 44 Module, live auf btc-klar.ch. |
| **Kategorie** | Eigenprodukt (ruht) |
| **Status** | live, Entwicklung ruht seit 28.04.2026 |
| **Läuft auf** | Hostpoint (Apache/.htaccess) |
| **Steckbrief** | `c:\DEV\BITS-SP-BITSOLUTIONSGMBH\docs\90-projektregister.md Abschnitt C` · Register `docs\90-projektregister.md` |
| **Hängt ab von** | — — Identitäten in `docs\20-schnittstellen.md` |
| **Wird genutzt von** | Öffentlichkeit |
| **Geteilte Güter** | — — Kopplungen in `docs\10-architektur.md §3.3` |
| **Standard** | `docs\95-projektstandard.md` · Einordnung erstellt am 28.09.2026, Prüfliste noch offen |

## Vor jeder Änderung

1. Hub `c:\DEV\BITS-SP-BITSOLUTIONSGMBH\docs\10-architektur.md §3` lesen — geteilte Dinge brechen mehrere Anwendungen gleichzeitig.
2. `git grep <Client-ID|Listenname|Feldname>` auch in den Nachbarprojekten aus «Hängt ab von» und «Wird genutzt von».
3. Statusangaben mit Datum; nach aussen wirkende Änderungen im Hub nachziehen (`95-projektstandard.md §3`).

## Stack und Befehle

| | |
|---|---|
| **Stack** | statische PWA, Node-Build |
| **Lokal starten** | `npm install && npm run dev` |
| **Tests** | Lighthouse-Berichte im Stammordner |
| **Deploy** | docs/Deployment (Hostpoint) |
| **Doku** | README.md, CONTRIBUTING.md, docs/ |

## Fallen und Regeln

- —
- Geheimnisse nie ins Repo und nie in den Projektordner (`95-projektstandard.md §5`): `.env`, `local.settings.json`, `*.pfx`, `*.key`, Exporte mit Personendaten.
- Deploy nur aus einem gepushten Stand; Version erhöhen, Tag setzen, `CHANGELOG.md` nachführen.
- Sprache: Doku, Kommentare, UI und Commits auf Deutsch (CH, «ss»); Bezeichner im Code Englisch.
