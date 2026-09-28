import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ApproachSection from ".";

test("renders approach section with labelled heading and eyebrow", () => {
  render(<ApproachSection />);

  const section = screen.getByRole("region", {
    name: "Lorem ipsum dolor sit amet consectetur.",
  });
  expect(section).toHaveAttribute("aria-labelledby", "approach-heading");

  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "Lorem ipsum dolor sit amet consectetur.",
    })
  ).toHaveAttribute("id", "approach-heading");

  expect(screen.getByText("Benim Yaklaşımım")).toBeInTheDocument();
});
