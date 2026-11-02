import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterButton } from "./FilterBar";

describe("filter button", () => {
  it("reports the click", async () => {
    const onClick = vi.fn();
    render(<FilterButton label="Characters" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Characters" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("only shows the chevron when the filter has options", () => {
    const { container, rerender } = render(<FilterButton label="All" />);
    expect(container.querySelector("svg")).toBeNull();

    rerender(<FilterButton label="All" hasDropdown />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("marks the active filter with the accent style", () => {
    render(<FilterButton label="All" active />);

    expect(screen.getByRole("button", { name: "All" }).className).toContain(
      "text-accent",
    );
  });
});
