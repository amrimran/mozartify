// src/config/api.js - Simple, working version
const isProduction = import.meta.env.PROD;

export const API_CONFIG = {

  BASE_URL: isProduction
    ? "https://mozartify.onrender.com"
    : "http://localhost:10000",

  MAIN_API: isProduction
    ? "https://mozartify.onrender.com"
    : "http://localhost:10000",

  MUSIC_API: isProduction
    ? "https://mozartify.onrender.com"
    : "http://localhost:10000",

  ADMIN_API: isProduction
    ? "https://mozartify.onrender.com"
    : "http://localhost:10000",

  INBOX_API: isProduction
    ? "https://mozartify.onrender.com"
    : "http://localhost:10000",

  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Export for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_BASE_URL_1 = API_CONFIG.MUSIC_API;
export const API_BASE_URL_2 = API_CONFIG.INBOX_API;
export const API_BASE_URL_3 = API_CONFIG.ADMIN_API;

// Axios configuration
export const axiosConfig = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: API_CONFIG.DEFAULT_HEADERS,
};

console.log("🔗 API Configuration:", {
  environment: isProduction ? "production" : "development",
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
});