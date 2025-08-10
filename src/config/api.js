// src/config/api.js
// Fixed API configuration for your frontend

const isProduction = import.meta.env.PROD;

// In production, everything goes through one server
// In development, services run on different ports
export const API_CONFIG = {
  // Backend API (your actual Render backend domain)
  BASE_URL: isProduction
    ? "https://mozartify.onrender.com" // Your Render backend domain
    : "http://localhost:10000", // Local development - main server

  // All APIs use the same backend URL in production
  MAIN_API: isProduction
    ? "https://mozartify.onrender.com" // Backend domain
    : "http://localhost:10000",

  // All services route through the same backend server
  MUSIC_API: isProduction
    ? "https://mozartify.onrender.com" // Backend domain
    : "http://localhost:10000",

  ADMIN_API: isProduction
    ? "https://mozartify.onrender.com" // Backend domain
    : "http://localhost:10000",

  INBOX_API: isProduction
    ? "https://mozartify.onrender.com" // Backend domain
    : "http://localhost:10000",

  // Request configuration
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Export for backward compatibility with your existing code
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_BASE_URL_1 = API_CONFIG.MUSIC_API;
export const API_BASE_URL_2 = API_CONFIG.INBOX_API;
export const API_BASE_URL_3 = API_CONFIG.ADMIN_API;

// Axios configuration with credentials (important for sessions)
export const axiosConfig = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // CRITICAL: This enables session cookies
  headers: API_CONFIG.DEFAULT_HEADERS,
};

// Create axios instance with proper configuration
import axios from 'axios';

export const apiClient = axios.create(axiosConfig);

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("🌐 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ API Response Error:", error.response?.status, error.config?.url);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log("🔐 Unauthorized - redirecting to login");
      // You can add automatic redirect logic here if needed
      // window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

console.log("🔗 API Configuration Loaded:", {
  environment: isProduction ? "production" : "development",
  baseURL: API_CONFIG.BASE_URL,
  mainAPI: API_CONFIG.MAIN_API,
  withCredentials: true,
});

export default apiClient;