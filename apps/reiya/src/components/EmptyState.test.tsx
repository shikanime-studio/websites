import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("empty state", () => {
  it("has a neutral default message", () => {
    render(<EmptyState />);

    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(
      screen.getByText("We couldn't find anything matching your criteria."),
    ).toBeInTheDocument();
  });

  it("renders a custom action when one is given", () => {
    render(
      <EmptyState
        title="No commissions"
        description="Try another filter."
        action={<button type="button">Reset filters</button>}
      />,
    );

    expect(screen.getByText("No commissions")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset filters" }),
    ).toBeInTheDocument();
  });
});
