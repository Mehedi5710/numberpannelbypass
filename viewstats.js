// api/viewstats.js

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Base API you are masking
  const upstreamBase = 'http://147.135.212.197/crapi/st/viewstats';

  // Pass all parameters exactly (token must come from user)
  const params = new URLSearchParams(req.query);

  // If user did NOT provide token → return error
  if (!params.has('token')) {
    res.status(400).send('Missing required parameter: token');
    return;
  }

  const upstreamUrl = `${upstreamBase}?${params.toString()}`;

  try {
    // Fetch original API
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET'
    });

    // Copy status
    res.status(upstreamResponse.status);

    // Copy all safe headers
    upstreamResponse.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === 'content-encoding') return;
      if (k === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    // Return EXACT original body (text, JSON, HTML… anything)
    const body = await upstreamResponse.text();
    res.send(body);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Bad Gateway (proxy error)');
  }
}
