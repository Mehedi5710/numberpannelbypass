// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();

// Original API base URL
const upstreamBase = 'http://147.135.212.197/crapi/st/viewstats';

// Main proxy route: matches your original path
app.get('/crapi/st/viewstats', async (req, res) => {
  try {
    // Copy all query parameters (?token=... etc.)
    const params = new URLSearchParams(req.query);

    // Require token from query – same logic as Vercel version
    if (!params.has('token')) {
      res.status(400).send('Missing required parameter: token');
      return;
    }

    const upstreamUrl = `${upstreamBase}?${params.toString()}`;

    // Call original API
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
    });

    // Forward HTTP status
    res.status(upstreamResponse.status);

    // Forward headers (skip problematic ones)
    upstreamResponse.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === 'content-encoding') return;
      if (k === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    // Forward body EXACTLY (no JSON parse, no modification)
    const bodyText = await upstreamResponse.text();
    res.send(bodyText);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).send('Bad Gateway (proxy error)');
  }
});

// Render gives PORT via env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
