const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clientConfig = require('../config/webpack.client.cjs');

// SPA dev server. SSR was removed in Phase 7 (SCRUM-66) — there is no longer a
// separate server bundle to build/watch; webpack-dev-server serves the client
// bundle directly with history fallback for client-side routing.
clientConfig.mode = 'development';
clientConfig.output.filename = 'js/[name].js';
clientConfig.output.chunkFilename = 'js/[name].chunk.js';

const PORT = Number(process.env.PORT) || 3002;
const API_TARGET = process.env.API_TARGET || 'http://localhost:3001';

const devServer = new WebpackDevServer(
  {
    hot: true,
    port: PORT,
    host: '0.0.0.0',
    historyApiFallback: true,
    // Convenience proxy so a relative /api works in dev; the app may also call
    // the backend directly at <hostname>:3001 for the co-host scenario.
    proxy: [{ context: ['/api'], target: API_TARGET, changeOrigin: true }],
  },
  webpack(clientConfig)
);

devServer.start().then(() => {
  console.log(`Webpack Dev Server (SPA) running on http://localhost:${PORT}`);
  console.log(`   - Open:        http://localhost:${PORT}`);
  console.log(`   - /api proxy:  ${API_TARGET}`);
  console.log(`   - Backend API: http://localhost:3001  (start separately)`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down dev server...');
  process.exit(0);
});
