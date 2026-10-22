import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CATALOGS } from "../i18n/messages";
import { StatusBadge } from "./StatusBadge";

describe("status badge", () => {
  it("shows the human label for the commission stage", () => {
    render(
      <InternationalizationProvider
        locale="en"
        messages={{ en: CATALOGS.en }}
      >
        <StatusBadge status="delivered" />
      </InternationalizationProvider>,
    );

    expect(screen.getByText("Photos delivered")).toBeInTheDocument();
  });
});
