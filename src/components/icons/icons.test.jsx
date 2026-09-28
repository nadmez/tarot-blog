import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  CardsIcon,
  ChevronIcon,
  CloseIcon,
  MenuIcon,
  MoonIcon,
  StarIcon,
} from ".";

const ICONS = [
  { name: "MoonIcon", Icon: MoonIcon },
  { name: "StarIcon", Icon: StarIcon },
  { name: "CardsIcon", Icon: CardsIcon },
  { name: "ChevronIcon", Icon: ChevronIcon },
  { name: "MenuIcon", Icon: MenuIcon },
  { name: "CloseIcon", Icon: CloseIcon },
];

test.each(ICONS)("$name renders an svg element", ({ Icon }) => {
  const { container } = render(<Icon />);
  expect(container.querySelector("svg")).toBeInTheDocument();
  expect(container.firstChild?.nodeName.toLowerCase()).toBe("svg");
});

test.each(ICONS)(
  "$name forwards className and aria-hidden to svg",
  ({ Icon }) => {
    const { container } = render(
      <Icon className="test-icon-class" aria-hidden="true" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("test-icon-class");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  }
);
