// API configuration for Firebase deployment
const isDevelopment = window.location.hostname === 'localhost';

const API_BASE = isDevelopment 
  ? 'http://localhost:3001/api'
  : 'https://us-central1-lumberjack-23104.cloudfunctions.net';

export const API_ENDPOINTS = {
  health: `${API_BASE}/health`,
  upload: `${API_BASE}/upload`,
  markdown: `${API_BASE}/markdown`,
  parsers: `${API_BASE}/parsers`
};

export default API_ENDPOINTS;
