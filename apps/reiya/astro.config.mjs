import cloudflare from "@astrojs/cloudflare";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import tidewave from "tidewave/vite-plugin";

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    react(),
    sitemap(),
  ],
  output: "server",
  adapter: cloudflare({
    imageService: "compile",
    platformProxy: {
      enabled: true,
    },
  }),
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": ["same-origin", "same-origin-allow-popups"],
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
  },
  site: "https://reiya.shikanime.studio",
  vite: {
    optimizeDeps: {
      exclude: ["better-auth"],
    },
    plugins: [tailwindcss(), tidewave()],
    resolve: {
      // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
      // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
      alias: {
        ...(process.env.NODE_ENV === "production"
          ? { "react-dom/server": "react-dom/server.edge" }
          : {}),
      },
    },
    ssr: {
      external: ["node:async_hooks", "node:module"],
    },
  },
});
