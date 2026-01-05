import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Retrieve all available keys from env variables
        // Supports RAPIDAPI_KEY, RAPIDAPI_KEY_2, RAPIDAPI_KEY_3, etc.
        const keys = Object.keys(process.env)
            .filter(key => key.startsWith('RAPIDAPI_KEY'))
            .sort() // Ensures order: KEY, KEY_2, KEY_3...
            .map(key => process.env[key])
            .filter(Boolean);

        if (keys.length === 0) {
            console.error('No RAPIDAPI_KEY found in environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        let lastError = null;

        // Try each key sequentially
        for (const key of keys) {
            try {
                const options = {
                    method: 'POST',
                    headers: {
                        'x-rapidapi-key': key,
                        'x-rapidapi-host': 'snap-video3.p.rapidapi.com',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({ url }).toString()
                };

                const response = await fetch('https://snap-video3.p.rapidapi.com/download', options);

                // Check specifically for rate limiting (429) or unauthorized (401/403)
                if (response.status === 429 || response.status === 401 || response.status === 403) {
                    console.warn(`Key ${key.slice(0, 5)}... failed with status ${response.status}. Rotating to next key.`);
                    lastError = { status: response.status, message: `Key limit reached or invalid (${response.status})` };
                    continue; // Try next key
                }

                // Handle successful or other content-related errors (like 400 Bad Request from API logic) normally
                const contentType = response.headers.get("content-type");
                let data;

                if (contentType && contentType.includes("application/json")) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        data = { message: text };
                    }
                }

                if (!response.ok) {
                    // If it's a content error (e.g. invalid video URL), return immediately, don't rotate
                    return NextResponse.json(
                        { error: data.message || 'Failed to fetch video data' },
                        { status: response.status }
                    );
                }

                return NextResponse.json(data);

            } catch (error) {
                console.error(`Attempt failed with key ${key.slice(0, 5)}...`, error);
                lastError = { status: 500, message: error.message };
                // Continue to next key on network errors
            }
        }

        // If all keys fail
        return NextResponse.json(
            { error: lastError?.message || 'All API keys exhausted or failed' },
            { status: lastError?.status || 500 }
        );

    } catch (error) {
        console.error('Download API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
