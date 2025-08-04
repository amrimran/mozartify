// src/config/api.js
// Centralized API configuration for your frontend

const isProduction = import.meta.env.PROD; // Vite's built-in production check

export const API_CONFIG = {
  // All APIs now route through the main server (no ports needed in production)
  MAIN_API: isProduction
    ? "https://mozartify.onrender.com" // Single entry point - mainserver.js routes internally
    : "http://localhost:3000", // Local development - direct to service

  // All services use the same base URL in production (mainserver.js handles routing)
  SECONDARY_API: isProduction
    ? "https://mozartify.onrender.com" // Routes to port 3001 internally
    : "http://localhost:3001", // Local development

  TERTIARY_API: isProduction
    ? "https://mozartify.onrender.com" // Routes to port 3002 internally
    : "http://localhost:3002", // Local development

  QUATERNARY_API: isProduction
    ? "https://mozartify.onrender.com" // Routes to port 3003 internally
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
  tertiaryAPI: API_CONFIG.TERTIARY_API,
  quaternaryAPI: API_CONFIG.QUATERNARY_API,
});