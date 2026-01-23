export default async function handler(req, res) {
    const { type, id, episodeId } = req.query;
    const projectId = "new-jesuspod";

    // 1. Resolve Target URL
    let redirectUrl = "https://jesuspod.netcraftglobal.com/";
    let collection = "";

    const episodeQuery = episodeId ? `?episodeId=${encodeURIComponent(episodeId)}` : "";

    if (type === "podcast" && id) {
        collection = "Newchannels";
        redirectUrl = `https://jesuspod.netcraftglobal.com/podcastplayer/${encodeURIComponent(id)}${episodeQuery}`;
    } else if (type === "radio" && id) {
        collection = "Radio";
        redirectUrl = `https://jesuspod.netcraftglobal.com/radio-player?id=${encodeURIComponent(id)}`;
    }

    // 2. Bot Detection
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|discordbot|slackbot|googlebot|bingbot/i.test(userAgent);

    if (!isBot) {
        // Real User -> Instant Redirect
        return res.redirect(302, redirectUrl);
    }

    // 3. Fetch Data for Bots
    let title = "JesusPOD";
    let description = "Listen to Christian Podcasts and Radio Stations on JesusPOD.";
    let image = "https://jesuspod.netcraftglobal.com/icon.png";

    if (collection && id) {
        try {
            const docId = encodeURIComponent(id);
            // Using existing Firestore project
            const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const fields = data.fields || {};

                if (fields.title?.stringValue) {
                    title = fields.title.stringValue;
                }
                if (fields.description?.stringValue) {
                    const rawDesc = fields.description.stringValue.replace(/<[^>]*>?/gm, '');
                    description = rawDesc.substring(0, 160) + (rawDesc.length > 160 ? "..." : "");
                } else {
                    description = `Listen to ${title} on JesusPOD.`;
                }
                if (fields.imageUrl?.stringValue) {
                    image = fields.imageUrl.stringValue;
                }
            }
        } catch (error) {
            console.error("Firestore fetch error:", error);
        }
    }

    // 4. Return HTML for Bots
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(title)} - JesusPOD</title>
        <meta name="description" content="${escapeHtml(description)}">

        <meta property="og:type" content="website">
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:description" content="${escapeHtml(description)}">
        <meta property="og:image" content="${escapeHtml(image)}">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${escapeHtml(title)}">
        <meta name="twitter:description" content="${escapeHtml(description)}">
        <meta name="twitter:image" content="${escapeHtml(image)}">
    </head>
    <body></body>
    </html>
    `;

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
