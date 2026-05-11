const axios = require('axios');

exports.handler = async function (event, context) {
    try {
        let { animeId, episode, malId } = event.queryStringParameters;

        if (!animeId || !episode) {
            const pathParts = event.path.split('/').filter(Boolean);
            const checkIndex = pathParts.findIndex(p => p === 'check-episode');
            if (checkIndex !== -1 && pathParts.length >= checkIndex + 3) {
                animeId = pathParts[checkIndex + 1];
                episode = pathParts[checkIndex + 2];
            }
        }

        if (!animeId || !episode) {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    success: false, 
                    message: "Missing animeId or episode"
                }),
            };
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://megaplay.buzz/'
        };

        let isAvailable = false;
        let hasDub = false;
        let debugInfo = [];

        // Construct patterns using both AniList and MAL IDs
        const subPatterns = [
            `https://megaplay.buzz/stream/ani/${animeId}/${episode}/sub`,
        ];
        if (malId) {
            subPatterns.push(`https://megaplay.buzz/stream/mal/${malId}/${episode}/sub`);
        }

        for (const url of subPatterns) {
            try {
                const response = await axios.get(url, { headers, timeout: 8000 });
                const bodyStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                
                if (response.status === 200 && !bodyStr.includes("Oops! Something went wrong")) {
                    isAvailable = true;
                    debugInfo.push({ url, status: 'Success' });
                    break;
                } else {
                    debugInfo.push({ url, status: 'Failed (Oops page)' });
                }
            } catch (error) {
                debugInfo.push({ url, status: `Failed (${error.message})` });
            }
        }

        // Only check dub if the episode is available
        if (isAvailable) {
            const dubPatterns = [
                `https://megaplay.buzz/stream/ani/${animeId}/${episode}/dub`,
            ];
            if (malId) {
                dubPatterns.push(`https://megaplay.buzz/stream/mal/${malId}/${episode}/dub`);
            }

            for (const url of dubPatterns) {
                try {
                    const response = await axios.get(url, { headers, timeout: 5000 });
                    const bodyStr = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

                    if (response.status === 200 && !bodyStr.includes("Oops! Something went wrong")) {
                        hasDub = true;
                        break;
                    }
                } catch (error) {
                    // Silently fail
                }
            }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                isAvailable: isAvailable,
                hasDub: hasDub,
                animeId,
                episode,
                malId,
                debug: debugInfo
            }),
        };
    } catch (err) {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                message: err.message,
                isAvailable: false,
                hasDub: false
            }),
        };
    }
};
