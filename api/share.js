export default async function handler(req, res) {
    const { type, id, episodeId } = req.query;
    const projectId = "new-jesuspod";

    // 1. Resolve Target URL
    let redirectUrl = "https://www.jesuspod.com/";
    let collection = "";

    const episodeQuery = episodeId ? `?episodeId=${encodeURIComponent(episodeId)}` : "";

    if (type === "podcast" && id) {
        collection = "Newchannels";
        redirectUrl = `https://www.jesuspod.com/podcastplayer/${encodeURIComponent(id)}${episodeQuery}`;
    } else if (type === "radio" && id) {
        collection = "Radio";
        redirectUrl = `https://www.jesuspod.com/radio-player?id=${encodeURIComponent(id)}`;
    }

    // 2. Bot Detection

    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    const isBot = /bot|crawler|spider|facebookexternalhit|whatsapp|telegram|twitter|linkedin|discord/i.test(userAgent);

    if (!isBot) {
        // Real User -> Instant Redirect
        return res.redirect(302, redirectUrl);
    }

    // 3. Fetch Data for Bots
    let title = "JesusPOD";
    let description = "Listen to Christian Podcasts and Radio Stations on JesusPOD.";
    let image = "https://www.jesuspod.com/icon.png";

    if (collection && id) {
        try {
            const docId = encodeURIComponent(id);
            // Using existing Firestore project
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;

            const response = await fetch(url);
            let fields = {};

            if (response.ok) {
                const data = await response.json();
                fields = data.fields || {};
            } else {
                // FALLBACK: If direct document fetch by ID fails, attempt a query by _id or id field
                // This handles "virtual" IDs passed to the share link
                const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
                const queryPayload = {
                    structuredQuery: {
                        from: [{ collectionId: collection }],
                        where: {
                            compositeFilter: {
                                op: "OR",
                                filters: [
                                    { fieldFilter: { field: { fieldPath: "_id" }, op: "EQUAL", value: { stringValue: id } } },
                                    { fieldFilter: { field: { fieldPath: "id" }, op: "EQUAL", value: { stringValue: id } } }
                                ]
                            }
                        },
                        limit: 1
                    }
                };

                const qResponse = await fetch(queryUrl, {
                    method: 'POST',
                    body: JSON.stringify(queryPayload)
                });

                if (qResponse.ok) {
                    const qData = await qResponse.json();
                    if (qData && qData.length > 0 && qData[0].document) {
                        fields = qData[0].document.fields || {};
                    }
                }
            }

            if (Object.keys(fields).length > 0) {
                // Map Title
                title = fields.title?.stringValue || fields.name?.stringValue || title;

                // Map Description
                if (fields.description?.stringValue) {
                    const rawDesc = fields.description.stringValue.replace(/<[^>]*>?/gm, '');
                    description = rawDesc.substring(0, 160) + (rawDesc.length > 160 ? "..." : "");
                } else if (title) {
                    description = `Listen to ${title} on JesusPOD.`;
                }

                // Map Image (Check all common field names)
                const rawImage = fields.image?.stringValue ||
                    fields.imageUrl?.stringValue ||
                    fields.thumbnail?.stringValue ||
                    fields.thumbnailUrl?.stringValue ||
                    fields.image_url?.stringValue ||
                    fields.img?.stringValue ||
                    fields.poster?.stringValue ||
                    fields.download?.mapValue?.fields?.imageUrl?.stringValue;

                if (rawImage) {
                    image = rawImage;
                }

                // Ensure image is an absolute URL
                if (image && image.startsWith('/')) {
                    image = `https://www.jesuspod.com${image}`;
                }

                // If it's an episode share, we can optionally append episode info to title
                if (episodeId && type === "podcast") {
                    // Since we can't easily fetch episode title from RSS here without slowing down,
                    // we just improve the channel title to indicate it's an episode
                    title = `${title} (Podcast Episode)`;
                }
            }
        } catch (error) {
            console.error("Firestore fetch error:", error);
        }
    }


    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHtml(title)} - JesusPOD</title>
<meta name="description" content="${escapeHtml(description)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="JesusPOD">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(image)}">
${image.startsWith('https') ? `<meta property="og:image:secure_url" content="${escapeHtml(image)}">` : ''}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">

<!-- ✅ AUTO REDIRECT FOR REAL USERS -->
<meta http-equiv="refresh" content="0; url=${redirectUrl}" />

<script>
  // Extra safety for browsers
  setTimeout(() => {
    window.location.href = "${redirectUrl}";
  }, 100);
</script>
</head>

<body>
<p>Redirecting...</p>
</body>
</html>
`;


    // Cache response for 24 hours (Vercel Edge Cache)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(html);
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
