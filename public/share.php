<?php
// ==============================
// JesusPOD Dynamic Share Page
// For WhatsApp / Facebook / Twitter Preview
// Example:
// share.php?type=podcast&id=ABC123
// share.php?type=radio&id=XYZ456
// ==============================

// ------------------------------
// 1. Get Params Safely
// ------------------------------
$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : '';
$id   = isset($_GET['id']) ? trim($_GET['id']) : '';

// ------------------------------
// 2. Default Meta Data
// ------------------------------
$title       = "JesusPOD";
$description = "Listen to Christian Podcasts and Radio Stations on JesusPOD.";
$image       = "https://jesuspod.netcraftglobal.com/icon.png";
$redirectUrl = "https://jesuspod.netcraftglobal.com/";

// ------------------------------
// 3. Firebase Config
// ------------------------------
$projectId = "new-jesuspod";
$collection = "";

// ------------------------------
// 4. Resolve Type
// ------------------------------
$episodeQuery = "";
if (isset($_GET['episodeId'])) {
    $episodeQuery = "?episodeId=" . urlencode($_GET['episodeId']);
}

if ($type === "podcast" && $id) {
    // Matches React app 'Newchannels' collection
    $collection  = "Newchannels"; 
    $redirectUrl = "https://jesuspod.netcraftglobal.com/podcastplayer/" . urlencode($id) . $episodeQuery;
} elseif ($type === "radio" && $id) {
    $collection  = "Radio";
    $redirectUrl = "https://jesuspod.netcraftglobal.com/radio-player?id=" . urlencode($id);
}

// ------------------------------
// 5. Fetch Firestore Data
// ------------------------------
if ($collection && $id) {

    $docId = rawurlencode($id);
    $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/$collection/$docId";

    $context = stream_context_create([
        "http" => [
            "method"  => "GET",
            "timeout" => 5
        ]
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response !== false) {
        $data = json_decode($response, true);

        if (!empty($data['fields'])) {
            $fields = $data['fields'];

            if (!empty($fields['title']['stringValue'])) {
                $title = $fields['title']['stringValue'];
            }

            if (!empty($fields['description']['stringValue'])) {
                $description = mb_strimwidth(strip_tags($fields['description']['stringValue']), 0, 160, "...");
            } else {
                $description = "Listen to $title on JesusPOD.";
            }

            if (!empty($fields['imageUrl']['stringValue'])) {
                $image = $fields['imageUrl']['stringValue'];
            }
        }
    }
}

// Current URL for OG tag
$currentUrl = "https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

// ------------------------------
// 6. Bot Detection & Redirect
// ------------------------------
$userAgent = strtolower($_SERVER['HTTP_USER_AGENT'] ?? '');
$isBot = preg_match('/facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|googlebot|bingbot/i', $userAgent);

if (!$isBot) {
    // Real user -> direct 302 redirect (no HTML body downloaded)
    header("Location: $redirectUrl", true, 302);
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Primary Meta -->
<title><?php echo htmlspecialchars($title); ?> - JesusPOD default</title>
<meta name="description" content="<?php echo htmlspecialchars($description); ?>">

<!-- Open Graph / Facebook / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:title" content="<?php echo htmlspecialchars($title); ?>">
<meta property="og:description" content="<?php echo htmlspecialchars($description); ?>">
<meta property="og:image" content="<?php echo htmlspecialchars($image); ?>">
<meta property="og:url" content="<?php echo htmlspecialchars($currentUrl); ?>">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?php echo htmlspecialchars($title); ?>">
<meta name="twitter:description" content="<?php echo htmlspecialchars($description); ?>">
<meta name="twitter:image" content="<?php echo htmlspecialchars($image); ?>">

<!-- Auto Redirect -->
<script>
    window.location.replace("<?php echo $redirectUrl; ?>");
</script>
</head>

<body>
    <!-- Empty body for invisible redirect -->
</body>
</html>
