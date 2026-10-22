import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { I18nProvider } from "../i18n";
import { StatusBadge } from "./StatusBadge";

describe("status badge", () => {
  it("shows the human label for the commission stage", () => {
    render(
      <I18nProvider>
        <StatusBadge status="delivered" />
      </I18nProvider>,
    );

    expect(screen.getByText("Photos delivered")).toBeInTheDocument();
  });
});
