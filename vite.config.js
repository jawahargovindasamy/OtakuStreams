import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"


export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/mal-api': {
        target: 'https://api.myanimelist.net/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mal-api/, '')
      },
      '/animeschedule-api': {
        target: 'https://animeschedule.net/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/animeschedule-api/, '')
      },
      '/api/check-episode': {
        target: 'https://megaplay.buzz/api/anime/episode/ani',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/check-episode/, '')
      }
    }
  }
})
