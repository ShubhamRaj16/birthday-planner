const path = require('path');
const express = require('express');

// Production static server for the SPA (SSR removed in Phase 7 / SCRUM-66).
// Serves the built client bundle and falls back to index.html for client-side
// routes. Binds 0.0.0.0 so a co-host on the same WiFi can reach it.
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distDir = path.resolve(__dirname, '../dist/client');

app.use(express.static(distDir));

// SPA history fallback — any non-asset path returns index.html.
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Birthday Planner web (SPA) running on http://0.0.0.0:${PORT}`);
});
