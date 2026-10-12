<?php
/**
 * RSS-Proxy für das News-Modul (ersetzt die ausgefallenen öffentlichen
 * CORS-Proxys codetabs/allorigins).
 *
 * Sicherheit: Es werden NUR Feeds aus der Whitelist geladen — der Client
 * übergibt eine ID, keine URL (kein offener Proxy, kein SSRF).
 * Cache: 15 Minuten auf Disk; fällt die Quelle aus, wird der letzte
 * Stand bis 24 h weiter ausgeliefert.
 *
 * Aufruf: /api/feed.php?id=blocktrainer
 */

declare(strict_types=1);

const FEEDS = [
    'blocktrainer' => 'https://www.blocktrainer.de/feed.xml',
];
const CACHE_TTL   = 900;        // 15 Minuten
const STALE_MAX   = 86400;      // 24 h Notreserve
const MAX_BYTES   = 2_000_000;  // 2 MB
const TIMEOUT_SEC = 8;

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

$id = isset($_GET['id']) ? (string) $_GET['id'] : '';
if (!array_key_exists($id, FEEDS)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=UTF-8');
    exit('Unbekannter Feed');
}

$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir) && !@mkdir($cacheDir, 0750, true)) {
    $cacheDir = sys_get_temp_dir();
}
$cacheFile = $cacheDir . '/feed-' . $id . '.xml';
$age = is_file($cacheFile) ? time() - (int) filemtime($cacheFile) : PHP_INT_MAX;

function send_xml(string $xml, int $maxAge): void {
    header('Content-Type: application/xml; charset=UTF-8');
    header('Cache-Control: public, max-age=' . $maxAge);
    echo $xml;
    exit;
}

function looks_like_feed(string $body): bool {
    return strpos($body, '<rss') !== false || strpos($body, '<feed') !== false || strpos($body, '<channel') !== false;
}

if ($age < CACHE_TTL) {
    send_xml((string) file_get_contents($cacheFile), CACHE_TTL - $age);
}

$body = false;
if (function_exists('curl_init')) {
    $ch = curl_init(FEEDS[$id]);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
        CURLOPT_TIMEOUT        => TIMEOUT_SEC,
        CURLOPT_USERAGENT      => 'btc-klar.ch Feed-Proxy',
        CURLOPT_BUFFERSIZE     => 65536,
        CURLOPT_NOPROGRESS     => false,
        CURLOPT_PROGRESSFUNCTION => static function ($r, $dlTotal, $dlNow) { return $dlNow > MAX_BYTES ? 1 : 0; },
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($status !== 200) $body = false;
} else {
    $ctx = stream_context_create(['http' => ['timeout' => TIMEOUT_SEC, 'user_agent' => 'btc-klar.ch Feed-Proxy']]);
    $body = @file_get_contents(FEEDS[$id], false, $ctx, 0, MAX_BYTES);
}

if (is_string($body) && $body !== '' && strlen($body) <= MAX_BYTES && looks_like_feed($body)) {
    @file_put_contents($cacheFile, $body, LOCK_EX);
    send_xml($body, CACHE_TTL);
}

// Quelle nicht erreichbar → letzter bekannter Stand
if ($age < STALE_MAX) {
    header('X-Feed-Stale: 1');
    send_xml((string) file_get_contents($cacheFile), 300);
}

http_response_code(502);
header('Content-Type: text/plain; charset=UTF-8');
echo 'Feed derzeit nicht erreichbar';
