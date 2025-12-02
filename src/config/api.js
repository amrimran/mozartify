import axios from "axios";

const isProduction = import.meta.env.PROD;

export const API_CONFIG = {
  // BASE_URL: isProduction
  //   ? "https://mozartify-production.up.railway.app/api"
  //   : "http://localhost:10000/api",
  BASE_URL: isProduction
    ? "https://mozartify-production-01c1.up.railway.app/api"
    : "http://localhost:10000/api",
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};



axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.timeout = API_CONFIG.TIMEOUT;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized - Session issue:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export const API_BASE_URL = API_CONFIG.BASE_URL;

console.log("🔗 API Configuration (Cookie-based):", {
  environment: isProduction ? "production" : "development",
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: axios.defaults.withCredentials,
});
