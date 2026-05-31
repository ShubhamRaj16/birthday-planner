import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { ServerStyleSheet } from 'styled-components';
import { Provider } from 'react-redux';
import App from '../App';
import { renderHTML } from './html';
import { createStore } from '../redux/store';
import { generateHeadTags } from '../services/seoService';
import { serverRoutes } from '../routes/serverRoutes';

function validateEnv() {
  const errors = [];
  if (process.env.PORT && Number.isNaN(Number(process.env.PORT))) {
    errors.push('PORT must be a valid number');
  }
  if (
    process.env.NODE_ENV &&
    !['development', 'production', 'test'].includes(process.env.NODE_ENV)
  ) {
    errors.push(
      `NODE_ENV="${process.env.NODE_ENV}" is not recognised (expected: development, production, test)`
    );
  }
  if (errors.length) {
    errors.forEach((e) => console.error(`[env] ${e}`));
    process.exit(1);
  }
}

function getClientAssets() {
  const manifestPath = path.join(clientBuildPath, 'asset-manifest.json');

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return {
      js: manifest.entrypoints
        .filter((asset) => asset.endsWith('.js'))
        .map((asset) => `/static/${asset}`),
    };
  } catch (_error) {
    const jsPath = path.join(clientBuildPath, 'js');

    try {
      const files = fs.readdirSync(jsPath);
      const byEntrypointOrder = ['runtime', 'vendors', 'main'];
      const js = byEntrypointOrder
        .map((name) =>
          files.find((file) => file.startsWith(`${name}.`) || file === `${name}.js`)
        )
        .filter(Boolean)
        .map((file) => `/static/js/${file}`);

      if (js.length > 0) return { js };
    } catch {
      // fall through to final fallback
    }

    console.warn('Asset manifest not found. Falling back to /static/js/main.js');
    return { js: ['/static/js/main.js'] };
  }
}

function getAbsoluteUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  return `${protocol}://${req.get('host')}${req.originalUrl}`;
}

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;
const clientBuildPath = path.resolve(process.cwd(), 'dist/client');
const isDevelopment = process.env.NODE_ENV !== 'production';

// Convert route patterns to regexes so /events/1 matches /events/:id
const knownPatterns = serverRoutes
  .filter((r) => r.path !== '*')
  .map((r) => new RegExp('^' + r.path.replace(/:[^/]+/g, '[^/]+') + '$'));

// Read once at startup — server restarts on recompile in dev so this stays fresh
const clientAssets = getClientAssets();

function getStatusCode(req) {
  if (isDevelopment) return 200;
  return knownPatterns.some((re) => re.test(req.path)) ? 200 : 404;
}

// Serve static files
app.use('/static', express.static('dist/client'));

// SSR middleware
app.get('*', async (req, res) => {
  const store = createStore();
  const sheet = new ServerStyleSheet();

  try {
    const headTags = generateHeadTags(req.path, getAbsoluteUrl(req));

    const content = ReactDOMServer.renderToString(
      sheet.collectStyles(
        <React.StrictMode>
          <Provider store={store}>
            <StaticRouter location={req.url}>
              <App routes={serverRoutes} />
            </StaticRouter>
          </Provider>
        </React.StrictMode>
      )
    );

    const styles = sheet.getStyleTags();
    const initialState = store.getState();

    const html = renderHTML({
      content,
      styles,
      initialState,
      headTags,
      assets: clientAssets,
    });

    res.status(getStatusCode(req)).send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    sheet.seal();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Birthday Planner SSR server running on http://0.0.0.0:${PORT}`);
  console.log(`SSR enabled with hydration support`);
  console.log(`Backend API expected at http://localhost:3001/api/v1`);
});
