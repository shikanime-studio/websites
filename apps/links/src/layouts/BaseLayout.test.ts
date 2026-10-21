import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import BaseLayout from "./BaseLayout.astro";

describe("base layout", () => {
  let container: AstroContainer;

  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it("renders the page title and description", async () => {
    const html = await container.renderToString(BaseLayout, {
      props: { title: "Shikanime", description: "Links" },
      slots: { default: "<p>hello</p>" },
    });

    expect(html).toContain("<title>Shikanime</title>");
    expect(html).toContain('content="Links"');
    expect(html).toContain("<p>hello</p>");
  });
});
