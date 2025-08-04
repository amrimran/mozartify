import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Optional: Define global constants
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_API_URL),
    },
    server: {
      proxy: {
        // Proxy API requests in development to avoid CORS issues
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
    // SPA fallback configuration
    build: {
      rollupOptions: {
        output: {
          manualChunks: undefined,
        }
      }
    },
    // Ensure SPA behavior
    appType: 'spa'
  };
});