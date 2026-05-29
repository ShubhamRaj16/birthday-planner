import axios from 'axios';

function getApiBaseUrl() {
  // Server-side (SSR): window is not defined
  if (typeof window === 'undefined') {
    return process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
  }
  // Client-side: use the current hostname so co-hosts on home WiFi connect correctly
  return `http://${window.location.hostname}:3001/api/v1`;
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
