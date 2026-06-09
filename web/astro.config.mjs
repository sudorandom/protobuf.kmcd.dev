import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://protobuf.kmcd.dev",
  integrations: [react(), sitemap()],
  vite: {
    optimizeDeps: {
      exclude: ["@bufbuild/protobuf"],
    },
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
  },
});
