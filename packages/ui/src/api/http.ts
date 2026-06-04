import axios from 'axios';

// ─── Transport layer (DIP) ──────────────────────────────────────────────────
// This is the ONLY module in the app allowed to reference axios directly.
// Components, pages, hooks, and slices must go through an `api/*.api.ts`
// repository module — never import this `http` instance directly in the UI.
// (Enforced by `no-restricted-imports` in .eslintrc.js for components/ + pages/.)

function getApiBaseUrl(): string {
  // Server-side (SSR): window is not defined
  if (typeof window === 'undefined') {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
  }
  // Client-side: use the current hostname so co-hosts on home WiFi connect correctly
  return `http://${window.location.hostname}:3001/api/v1`;
}

const http = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default http;
