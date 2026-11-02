import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileIcon } from "./FileIcon";

function iconClass(type: string | undefined) {
  const { container } = render(<FileIcon type={type} />);
  return container.querySelector("svg")?.getAttribute("class") ?? "";
}

describe("file icon", () => {
  it("uses a question mark when the type is unknown", () => {
    expect(iconClass(undefined)).toContain("file-question-mark");
  });

  it("picks an icon from the media type", () => {
    expect(iconClass("video/mp4")).toContain("file-play");
    expect(iconClass("audio/mpeg")).toContain("file-headphone");
    expect(iconClass("text/plain")).toContain("file-text");
    expect(iconClass("application/json")).toContain("file-code");
    expect(iconClass("application/zip")).toContain("file-archive");
    expect(iconClass("image/png")).toMatch(/lucide-file$/);
  });
});
