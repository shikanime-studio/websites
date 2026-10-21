import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFound } from "./NotFound";

describe("not found page", () => {
  it("explains the dead end and offers a way home", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: "This page doesn't exist" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
