import axios from 'axios';

const isProduction = import.meta.env.PROD;

export const API_CONFIG = {
  BASE_URL: isProduction
    ? "https://mozartify.onrender.com"
    : "http://localhost:10000",
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// ✅ CORRECT ORDER - Set baseURL FIRST, then withCredentials
axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.timeout = API_CONFIG.TIMEOUT;

export const API_BASE_URL = API_CONFIG.BASE_URL;

console.log("🔗 API Configuration (Cookie-based):", {
  environment: isProduction ? "production" : "development",
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: axios.defaults.withCredentials,  // ✅ Verify it's actually set
});