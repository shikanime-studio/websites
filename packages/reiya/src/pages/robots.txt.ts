import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const sitemapUrl = new URL("sitemap-index.xml", import.meta.env.SITE);
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /~partytown/",
      "Disallow: /~partytown/*",
      "Disallow: /ig/",
      "Disallow: /mal/",
      "Disallow: /x/",
      "Disallow: /li/",
      "Disallow: /ds/",
      `Sitemap: ${sitemapUrl.href}`,
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
};
