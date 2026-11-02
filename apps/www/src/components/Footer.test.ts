import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import Footer from "./Footer.astro";

describe("footer", () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("offers a contact route and the current year", async () => {
    const html = await container.renderToString(Footer);

    expect(html).toContain("mailto:contact@shikanime.studio");
    expect(html).toContain(String(new Date().getFullYear()));
  });
});
