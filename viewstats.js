// api/viewstats.js

export default async function handler(req, res) {
  // Only allow GET (change if you need POST etc.)
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Base upstream URL
  const upstreamBase = 'http://147.135.212.197/crapi/st/viewstats';

  // Copy all query params from the request (including token)
  const params = new URLSearchParams(req.query);
  const upstreamUrl = `${upstreamBase}?${params.toString()}`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
    });

    // Forward status code
    res.status(upstreamResponse.status);

    // Forward headers (careful not to override forbidden ones)
    upstreamResponse.headers.forEach((value, key) => {
      // You can filter some headers if needed
      if (key.toLowerCase() === 'content-encoding') return;
      if (key.toLowerCase() === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    // Forward body as-is (no JSON.parse → keeps it raw)
    const bodyText = await upstreamResponse.text();
    res.send(bodyText);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Bad Gateway (proxy error)');
  }
}
