import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Hero from "./Hero";

test("renders the hero heading and primary actions", () => {
  render(<Hero />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    })
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Tarota Başla" })).toHaveAttribute(
    "href",
    "/tarot"
  );
  expect(screen.getByRole("link", { name: "Blogu Keşfet" })).toHaveAttribute(
    "href",
    "/blog"
  );
});
