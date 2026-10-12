# Satoshi App — Deployment bei Hostpoint (Nginx)

> Anleitung für Hostpoint Webhosting / Managed Flex Server mit Nginx

---

## 1. Voraussetzungen

- Hostpoint-Konto mit Webhosting oder Managed Flex Server
- Domain (z.B. `btc-klar.ch`) im Hostpoint Control Panel eingerichtet
- Nginx ist aktiviert (Standard bei Hostpoint)
- FTP/SFTP-Zugang oder SSH-Zugang

---

## 2. Document Root ermitteln

Im **Hostpoint Control Panel**:
1. Einloggen unter [admin.hostpoint.ch](https://admin.hostpoint.ch)
2. **Hosting** → **Websites** → Domain auswählen → **Bearbeiten**
3. Unter **Document Root** steht der Pfad, z.B.:

```
/home/BENUTZERNAME/www/btc-klar.ch/
```

> Bei älteren Setups kann es auch `/home/BENUTZERNAME/public_html/btc-klar.ch/` sein.

---

## 3. SSL aktivieren

Im **Hostpoint Control Panel**:
1. **Hosting** → **Websites** → Domain auswählen → **Bearbeiten**
2. **SSL/TLS** → **Let's Encrypt** aktivieren
3. Haken setzen bei **HTTPS erzwingen** (leitet HTTP automatisch auf HTTPS um)
4. Speichern

> Hostpoint verwaltet das Zertifikat automatisch — kein Certbot, kein manueller Renewal nötig.

**Wichtig:** HTTPS ist Pflicht für Service Worker und PWA-Installation.

---

## 4. Dateien hochladen

### Per SFTP (empfohlen: FileZilla, WinSCP, Cyberduck)

**Zugangsdaten** (im Hostpoint Control Panel unter **FTP/SFTP**):
- Server: `BENUTZERNAME.ftp.infomaniak.com` oder wie im Panel angezeigt
- Port: `22` (SFTP) oder `21` (FTP)
- Benutzer/Passwort: wie im Panel konfiguriert

### Dateien ins Document Root hochladen:

```
/home/BENUTZERNAME/www/btc-klar.ch/
├── index.html          ← Hauptdatei
├── manifest.json       ← PWA-Manifest
├── sw.js               ← Service Worker
└── icons/
    └── icon.svg        ← App-Icon
```

### Per SSH (falls verfügbar — Managed Flex Server)

```bash
# Vom lokalen Rechner:
scp index.html manifest.json sw.js BENUTZER@SERVER:/home/BENUTZER/www/btc-klar.ch/
scp icons/icon.svg BENUTZER@SERVER:/home/BENUTZER/www/btc-klar.ch/icons/
```

> `.htaccess` wird bei Nginx **nicht** benötigt und **nicht** ausgewertet.

---

## 5. Nginx-Konfiguration bei Hostpoint

### Variante A: Hostpoint Webhosting (Standard)

Hostpoint konfiguriert Nginx **über das Control Panel** — keine manuelle Config-Datei nötig. Die wichtigsten Einstellungen:

1. **Hosting** → **Websites** → Domain → **Bearbeiten**
2. **Webserver**: Nginx (sollte Standard sein)
3. **SSL/TLS**: Let's Encrypt + HTTPS erzwingen ✓
4. **GZIP**: Ist bei Hostpoint standardmässig aktiv

**Was Hostpoint automatisch macht:**
- HTTPS-Redirect ✓
- GZIP-Kompression ✓
- SSL-Zertifikat ✓
- Korrekte MIME-Types ✓

**Was du manuell prüfen solltest:**
- Security Headers (siehe Abschnitt 5.1)
- Cache-Control für Service Worker (siehe Abschnitt 5.2)

### Variante B: Managed Flex Server (volle Kontrolle)

Beim Flex Server kannst du die Nginx-Konfiguration direkt bearbeiten:

```bash
# Custom Nginx-Config erstellen
sudo nano /etc/nginx/sites-available/btc-klar.ch
```

→ Inhalt der Datei `nginx.conf` aus dem Projektordner hineinkopieren.

```bash
# Aktivieren
sudo ln -s /etc/nginx/sites-available/btc-klar.ch /etc/nginx/sites-enabled/

# Testen & Laden
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5.1 Security Headers (falls nicht über Panel möglich)

Falls Hostpoint keine Custom-Header über das Panel unterstützt, kann die `nginx.conf` (bei Flex Server) oder ein Workaround mit einer kleinen `.user.ini` / Custom-Config verwendet werden.

Die wichtigsten Header für die App:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cloud.umami.is; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://api.blockchain.info https://blockchain.info https://api.coingecko.com https://mempool.space https://api.alternative.me https://cloud.umami.is https://gateway.umami.is; frame-src https://www.youtube.com; manifest-src 'self';
```

> **Tipp:** Bei Standard-Webhosting den Hostpoint-Support kontaktieren, um Custom-Header setzen zu lassen. Oder per Meta-Tags im HTML als Fallback (bereits in `index.html` vorhanden für CSP).

### 5.2 Cache-Control für Service Worker

**Kritisch:** Der Service Worker (`sw.js`) darf **nie** gecacht werden, sonst bekommen Benutzer keine Updates.

Bei **Flex Server** — in der Nginx-Config:
```nginx
location = /sw.js {
    add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0" always;
    expires off;
}
```

Bei **Standard-Webhosting** — Hostpoint-Support bitten, für `sw.js` den Header `Cache-Control: no-store` zu setzen. Alternativ: Query-String-Trick (weniger elegant, aber funktioniert):

In `index.html` die SW-Registration anpassen:
```javascript
navigator.serviceWorker.register('sw.js?v=7')
```

Bei jedem Update die Nummer erhöhen → Browser behandelt es als neue Datei.

---

## 6. Testen

### Im Browser

1. `https://btc-klar.ch` öffnen → App sollte laden
2. **F12** → **Application** → **Service Workers** → Status: "activated and is running"
3. **F12** → **Application** → **Manifest** → Wird erkannt, Icons geladen
4. **Lighthouse** (F12 → Lighthouse → PWA) → Grüne Checks für PWA

### Per Terminal (vom lokalen Rechner)

```bash
# HTTPS funktioniert?
curl -I https://btc-klar.ch

# Security Headers?
curl -s -D- https://btc-klar.ch -o /dev/null | grep -iE "x-frame|x-content|content-security|referrer"

# GZIP aktiv?
curl -s -H "Accept-Encoding: gzip" -I https://btc-klar.ch | grep -i "content-encoding"

# SW nicht gecacht?
curl -s -I https://btc-klar.ch/sw.js | grep -i "cache-control"

# Manifest erreichbar?
curl -s -I https://btc-klar.ch/manifest.json | grep -i "content-type"
```

### Checkliste

- [ ] `https://btc-klar.ch` lädt korrekt
- [ ] HTTPS-Redirect funktioniert (http → https)
- [ ] Service Worker ist registriert (DevTools → Application)
- [ ] PWA ist installierbar (Chrome: "App installieren" in Adressleiste)
- [ ] Manifest wird erkannt
- [ ] API-Aufrufe funktionieren (Kurs wird geladen)
- [ ] Offline-Modus funktioniert (Flugmodus → App öffnen)
- [ ] Icon wird als Favicon angezeigt

---

## 7. Updates einspielen

### Schritt-für-Schritt

1. **Lokal ändern:**
   - Code in `index.html` anpassen
   - `APP_VERSION` erhöhen (z.B. `'2.0.0'` → `'2.1.0'`)
   - Neuen Eintrag im `CHANGELOG`-Array hinzufügen
   - `SHELL_CACHE` in `sw.js` erhöhen (z.B. `'satoshi-v7'` → `'satoshi-v8'`)

2. **Dateien hochladen** (per SFTP oder SCP):
   - `index.html` ersetzen
   - `sw.js` ersetzen

3. **Fertig!** Kein Server-Restart nötig.

### Was dann passiert

```
Benutzer öffnet App
    → Browser prüft sw.js (nicht gecacht)
    → SW erkennt: neue Cache-Version!
    → Neuer SW wird im Hintergrund installiert
    → Update-Banner erscheint: "🔄 Update verfügbar"
    → Benutzer tippt "Jetzt aktualisieren"
    → App lädt neu mit der aktuellen Version
    → "Neu in v2.1.0" Badge erscheint → Link zum Changelog
```

> **Wichtig:** Benutzer-Daten (Fortschritt, Quiz, Sats) bleiben bei Updates immer erhalten — sie liegen im localStorage, nicht im Cache.

---

## 8. Auswertung / Statistiken

### Option A: Hostpoint eigene Statistiken

Im **Control Panel** → **Hosting** → **Statistiken**:
- Hostpoint bietet grundlegende Webstatistiken (Zugriffe, Besucher, Traffic)
- Keine zusätzliche Installation nötig

### Option B: Nginx Access-Logs (Flex Server)

```bash
# Pfad der Logs (bei Hostpoint typisch):
/var/log/nginx/btc-klar.ch.access.log

# Heutige Besucher (Unique IPs)
awk '{print $1}' /var/log/nginx/btc-klar.ch.access.log | sort -u | wc -l

# Meistbesuchte Seiten
awk '{print $7}' /var/log/nginx/btc-klar.ch.access.log | sort | uniq -c | sort -rn | head -20

# Zugriffe pro Tag
awk '{print $4}' /var/log/nginx/btc-klar.ch.access.log | cut -d: -f1 | tr -d '[' | sort | uniq -c

# Geräte / Browser
awk -F'"' '{print $6}' /var/log/nginx/btc-klar.ch.access.log | sort | uniq -c | sort -rn | head -10
```

### Option C: GoAccess (Flex Server — Live-Dashboard)

```bash
# Installieren
sudo apt install goaccess -y

# Terminal-Dashboard
sudo goaccess /var/log/nginx/btc-klar.ch.access.log --log-format=COMBINED

# HTML-Report (als geschützte Seite)
sudo goaccess /var/log/nginx/btc-klar.ch.access.log --log-format=COMBINED \
  -o /home/BENUTZER/www/btc-klar.ch/stats.html
```

Report absichern (in Nginx-Config):
```nginx
location = /stats.html {
    auth_basic "Statistiken";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

### Option D: Privacy-First Analytics (alle Hosting-Varianten)

Ohne Server-Zugang die beste Option — ein Script-Tag in `index.html`:

| Tool | Kosten | Cookie-frei | Self-hosted |
|------|--------|-------------|-------------|
| **Plausible** | ab €9/Mt (Cloud) oder gratis (self-hosted) | Ja | Möglich |
| **Umami** | Gratis (self-hosted) | Ja | Ja |

Beide sind DSGVO-konform ohne Consent-Banner.

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Seite zeigt Hostpoint-Standardseite | Dateien im richtigen Document Root? Im Panel prüfen |
| `403 Forbidden` | Dateirechte: `chmod 644` für Dateien, `chmod 755` für Ordner |
| `404 Not Found` | `index.html` vorhanden? Gross-/Kleinschreibung prüfen |
| SW registriert nicht | HTTPS aktiv? Service Worker braucht HTTPS |
| Alte Version wird angezeigt | `SHELL_CACHE` in `sw.js` erhöht? Hard-Reload: `Ctrl+Shift+R` |
| manifest.json wird nicht erkannt | MIME-Type prüfen: muss `application/json` sein |
| API-Daten laden nicht | CSP-Header prüfen (connect-src muss die API-Domains enthalten) |
| PWA nicht installierbar | Manifest + SW + HTTPS — alle drei müssen funktionieren |
| Icons werden nicht angezeigt | Pfad `icons/icon.svg` korrekt? SVG MIME-Type: `image/svg+xml` |

---

## Hostpoint-Support kontaktieren

Falls du bei der Konfiguration nicht weiterkommst:
- **Telefon:** 0844 04 04 04
- **E-Mail:** support@hostpoint.ch
- **Live-Chat:** Im Control Panel (Mo–Fr 8–18 Uhr)

Nützliche Referenzen:
- [Document Root ermitteln](https://support.hostpoint.ch/de/produkte/webhosting/erste-schritte/wo-liegt-das-document-root-meiner-website)
- [Pfade & Verzeichnisse](https://support.hostpoint.ch/de/produkte/webhosting/haeufig-gestellte-fragen/pfade-verzeichnisse-system)
- [Nginx Caching](https://support.hostpoint.ch/de/produkte/webhosting/haeufig-gestellte-fragen/caching-mit-nginx)
- [Flex Server FAQ](https://support.hostpoint.ch/de/produkte/flex-server/haeufig-gestellte-fragen-zu-flex-server)
