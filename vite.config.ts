import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Load env variables
const API_URL = process.env.VITE_API_URL;

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
