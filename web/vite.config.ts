import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("framer-motion") ||
              id.includes("lucide-react")
            ) {
              return "vendor";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
});
