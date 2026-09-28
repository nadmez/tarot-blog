import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "./page";

test("renders home sections in order: Hero, ApproachSection, RecentPosts", () => {
  const { container } = render(<Home />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", {
      level: 2,
      name: "Lorem ipsum dolor sit amet consectetur.",
    })
  ).toBeInTheDocument();

  expect(
    screen.getByRole("heading", { level: 2, name: "Son Yazılar" })
  ).toBeInTheDocument();

  const heroHeading = screen.getByRole("heading", { level: 1 });
  const approachHeading = screen.getByRole("heading", {
    level: 2,
    name: "Lorem ipsum dolor sit amet consectetur.",
  });
  const recentHeading = screen.getByRole("heading", {
    level: 2,
    name: "Son Yazılar",
  });

  expect(
    heroHeading.compareDocumentPosition(approachHeading) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(
    approachHeading.compareDocumentPosition(recentHeading) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
