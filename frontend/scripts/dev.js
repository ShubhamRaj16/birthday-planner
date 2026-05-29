const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clientConfig = require('../config/webpack.client');
const serverConfig = require('../config/webpack.server');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

// Development overrides
clientConfig.mode = 'development';
serverConfig.mode = 'development';
clientConfig.output.filename = 'js/[name].js';
clientConfig.output.chunkFilename = 'js/[name].chunk.js';

// Build and watch SSR server
const serverCompiler = webpack(serverConfig);

serverCompiler.hooks.done.tap('ServerBuildDone', () => {
  if (serverProcess) serverProcess.kill();

  serverProcess = spawn('node', [path.join(__dirname, '../dist/server/index.js')], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development', PORT: 3000 },
  });
});

serverCompiler.watch({ ignored: /node_modules/ }, (err) => {
  if (err) console.error('Server build error:', err);
});

// Dev server for client (hot reload)
const devServer = new WebpackDevServer(
  {
    hot: true,
    port: 3001,
    devMiddleware: { writeToDisk: true },
    proxy: [
      {
        context: () => true,
        target: 'http://localhost:3000',
        bypass: (req) => {
          if (
            req.url.startsWith('/static') ||
            req.url.startsWith('/ws') ||
            req.url.startsWith('/sockjs-node')
          ) {
            return req.url;
          }
          return undefined;
        },
      },
    ],
  },
  webpack(clientConfig)
);

devServer.start().then(() => {
  console.log('Webpack Dev Server running on http://localhost:3001');
  console.log('\nAvailable servers:');
  console.log('   - App (dev):   http://localhost:3001');
  console.log('   - SSR server:  http://localhost:3000');
  console.log('   - Backend API: http://localhost:3001/api/v1 (separate process)');
  console.log('\nRoutes:');
  console.log('   - http://localhost:3001/           -> Dashboard');
  console.log('   - http://localhost:3001/children   -> Children');
  console.log('   - http://localhost:3001/events     -> Events');
  console.log('   - http://localhost:3001/calendar   -> Calendar');
  console.log('   - http://localhost:3001/reminders  -> Reminders');
});

process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  if (serverProcess) serverProcess.kill();
  process.exit(0);
});
