globalThis.process ??= {};
globalThis.process.env ??= {};
const GET = () => {
  const sitemapUrl = new URL("sitemap-index.xml", "https://links.shikanime.studio");
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
      `Sitemap: ${sitemapUrl.href}`
    ].join("\n")
  );
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
