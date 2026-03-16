// sw.js - The SpaceOS Reverse Proxy Engine
const PROXY_SERVER = 'https://uv.juli4n.workers.dev/main/'; // Replace with your backend URL

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Only intercept requests directed to our proxy path
    if (url.pathname.startsWith('/service/')) {
        let targetUrl = atob(url.pathname.split('/service/')[1]);
        
        const modifiedRequest = new Request(PROXY_SERVER + targetUrl, {
            method: event.request.method,
            headers: event.request.headers,
            body: event.request.body,
            referrer: event.request.referrer,
            mode: 'cors',
            credentials: 'omit'
        });

        event.respondWith(
            fetch(modifiedRequest).then(response => {
                // REVERSE PROXY LOGIC:
                // We recreate the response but strip security headers that block iframes
                const newHeaders = new Headers(response.headers);
                newHeaders.delete('X-Frame-Options');
                newHeaders.delete('Content-Security-Policy');
                newHeaders.set('Access-Control-Allow-Origin', '*');

                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders
                });
            })
        );
    }
});
