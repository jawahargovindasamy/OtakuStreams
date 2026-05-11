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
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always needed first
          "vendor-react": ["react", "react-dom"],
          // Router
          "vendor-router": ["react-router-dom"],
          // Radix UI component library
          "vendor-radix": [
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-toast",
          ],
          // Carousel + icons + http
          "vendor-ui": [
            "embla-carousel-react",
            "embla-carousel-autoplay",
            "lucide-react",
            "axios",
          ],
        },
      },
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
      '/.netlify/functions/check-episode': {
        target: 'https://megaplay.buzz/api/anime/episode/ani',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/\.netlify\/functions\/check-episode/, '')
      }
    }
  }
})

