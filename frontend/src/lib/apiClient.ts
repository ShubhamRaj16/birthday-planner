import axios from 'axios';

function getApiBaseUrl() {
  // Server-side (SSR): window is not defined
  if (typeof window === 'undefined') {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
  }
  // Client-side: use the current hostname so co-hosts on home WiFi connect correctly
  return `http://${window.location.hostname}:3001/api/v1`;
}

// Safe media URL builder — works in both SSR (window undefined) and browser.
// Use this for any /uploads/* paths rather than accessing window directly.
export function mediaUrl(storagePath) {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:3001${storagePath}`;
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
