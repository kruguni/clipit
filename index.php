<?php
// Proxy all requests to Node.js app running on port 3000
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$url = 'http://127.0.0.1:3000' . $uri;

// Forward all headers including cookies
$headers = [];
foreach (getallheaders() as $name => $value) {
    $lname = strtolower($name);
    // Forward all headers except host and accept-encoding (let curl handle compression)
    if ($lname !== 'host' && $lname !== 'accept-encoding') {
        $headers[] = "$name: $value";
    }
}

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
curl_setopt($ch, CURLOPT_ENCODING, ''); // Handle gzip/deflate automatically
curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1); // Force HTTP/1.1

if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $input = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
}

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(502);
    echo 'Proxy Error: ' . curl_error($ch);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$headerStr = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

curl_close($ch);

// Forward response headers
$headerLines = explode("\r\n", $headerStr);
foreach ($headerLines as $line) {
    if (empty(trim($line))) continue;
    if (stripos($line, 'HTTP/') === 0) continue;
    if (stripos($line, 'Transfer-Encoding:') === 0) continue;
    if (stripos($line, 'Connection:') === 0) continue;
    if (stripos($line, 'Content-Encoding:') === 0) continue; // curl already decoded
    if (stripos($line, 'Content-Length:') === 0) continue; // will be recalculated

    if (stripos($line, 'Set-Cookie:') === 0) {
        header($line, false);
    } else if (stripos($line, 'Location:') === 0) {
        header($line);
    } else {
        header($line);
    }
}

http_response_code($httpCode);
header('Content-Length: ' . strlen($body));

// Disable caching for HTML pages
if (strpos($uri, '/_next/static') === false) {
    header('Cache-Control: no-cache, no-store, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');
}

echo $body;
