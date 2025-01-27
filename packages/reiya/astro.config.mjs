import cloudflare from "@astrojs/cloudflare";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    react(),
    sitemap(),
    tailwind(),
  ],
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: "https://reiya.shikanime.studio",
});
