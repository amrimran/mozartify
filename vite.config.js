import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_API_URL),
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    build: {
      outDir: "dist", // Ensure matches Render publish directory
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
    appType: "spa", // SPA fallback
  };
});

