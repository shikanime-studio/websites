import { describe, expect, it } from "vitest";
import config from "./docusaurus.config";

describe("docusaurus config", () => {
  it("serves the canonical docs origin at the root", () => {
    expect(config.url).toBe("https://docs.shikanime.studio");
    expect(config.baseUrl).toBe("/");
  });

  it("fails the build on broken links", () => {
    expect(config.onBrokenLinks).toBe("throw");
  });
});
