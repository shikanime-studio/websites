import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
    inspectorPort: false,
  }),
  site: "https://labs.shikanime.studio",
  vite: {
    plugins: [tailwindcss()],
    css: {
      transformer: "lightningcss",
    },
  },
});
