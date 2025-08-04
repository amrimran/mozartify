// src/config/api.js
// Centralized API configuration for your frontend

const isProduction = import.meta.env.PROD; // Vite's built-in production check

export const API_CONFIG = {
  // Main API endpoints (combined backend)
  MAIN_API: isProduction
    ? "https://mozartify.onrender.com:3000" // Your deployed backend
    : "http://localhost:3000", // Local development

  // Secondary API (if you have separate services)
  SECONDARY_API: isProduction
    ? "https://mozartify.onrender.com:3001" // Same backend for now
    : "http://localhost:3001", // Local development

  TERTIARY_API: isProduction
    ? "https://mozartify.onrender.com:3002" // Same backend for now
    : "http://localhost:3002", // Local development

  QUATERNARY_API: isProduction
    ? "https://mozartify.onrender.com:3003" // Same backend for now
    : "http://localhost:3003", // Local development

  // Timeout settings
  TIMEOUT: 30000, // 30 seconds

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Export individual URLs for backward compatibility
export const API_BASE_URL = API_CONFIG.MAIN_API;
export const API_BASE_URL_1 = API_CONFIG.SECONDARY_API;
export const API_BASE_URL_2 = API_CONFIG.TERTIARY_API;
export const API_BASE_URL_3 = API_CONFIG.QUATERNARY_API;


// Axios configuration
export const axiosConfig = {
  baseURL: API_CONFIG.MAIN_API,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
  headers: API_CONFIG.DEFAULT_HEADERS,
};

console.log("🔗 API Configuration:", {
  environment: isProduction ? "production" : "development",
  mainAPI: API_CONFIG.MAIN_API,
  secondaryAPI: API_CONFIG.SECONDARY_API,
});
