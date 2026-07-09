import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Django backend REST API (adjust host/port to match your Django server)
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Django Channels websocket endpoint
      "/ws": {
        target: "ws://localhost:8000",
        ws: true,
      },
    },
  },
});
