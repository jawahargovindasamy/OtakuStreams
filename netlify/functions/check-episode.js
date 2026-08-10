export const handler = async (event) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        if (event?.httpMethod === 'OPTIONS') {
            return {
                statusCode: 204,
                headers: corsHeaders,
                body: ''
            };
        }

        const queryParams = event?.queryStringParameters || {};
        let animeId = queryParams.animeId;
        let episode = queryParams.episode;
        let malId = queryParams.malId;

        if ((!animeId || !episode) && event?.path) {
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
                headers: corsHeaders,
                body: JSON.stringify({ 
                    success: false, 
                    message: "Missing animeId or episode",
                    isAvailable: false,
                    hasDub: false
                }),
            };
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://megaplay.buzz/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        };

        let isAvailable = false;
        let hasDub = false;
        let debugInfo = [];

        const subPatterns = [
            `https://megaplay.buzz/stream/ani/${animeId}/${episode}/sub`,
        ];
        if (malId) {
            subPatterns.push(`https://megaplay.buzz/stream/mal/${malId}/${episode}/sub`);
        }

        for (const url of subPatterns) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);

                const response = await fetch(url, { 
                    headers, 
                    signal: controller.signal 
                });
                clearTimeout(timeoutId);

                const bodyStr = await response.text();
                
                if (response.ok && !bodyStr.includes("Oops! Something went wrong")) {
                    isAvailable = true;
                    debugInfo.push({ url, status: 'Success' });
                    break;
                } else {
                    debugInfo.push({ url, status: `Failed (${response.status})` });
                }
            } catch (error) {
                debugInfo.push({ url, status: `Failed (${error.name}: ${error.message})` });
            }
        }

        if (isAvailable) {
            const dubPatterns = [
                `https://megaplay.buzz/stream/ani/${animeId}/${episode}/dub`,
            ];
            if (malId) {
                dubPatterns.push(`https://megaplay.buzz/stream/mal/${malId}/${episode}/dub`);
            }

            for (const url of dubPatterns) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2500);

                    const response = await fetch(url, { 
                        headers, 
                        signal: controller.signal 
                    });
                    clearTimeout(timeoutId);

                    const bodyStr = await response.text();

                    if (response.ok && !bodyStr.includes("Oops! Something went wrong")) {
                        hasDub = true;
                        debugInfo.push({ url, status: 'Success' });
                        break;
                    } else {
                        debugInfo.push({ url, status: `Failed (${response.status})` });
                    }
                } catch (error) {
                    debugInfo.push({ url, status: `Failed (${error.name}: ${error.message})` });
                }
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                isAvailable,
                hasDub,
                animeId,
                episode,
                malId,
                debug: debugInfo
            }),
        };
    } catch (err) {
        console.error("Netlify check-episode handler error:", err);
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: false,
                message: err.message || "Internal function error",
                isAvailable: false,
                hasDub: false
            }),
        };
    }
};
