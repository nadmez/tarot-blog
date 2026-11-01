import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import TarotPage, { metadata } from "./page";

test("has Turkish page metadata", () => {
  expect(metadata.title).toBe("Tarot Okuması | Tarot Falı");
  expect(metadata.description).toMatch(/tarot/i);
});

const INTRO = "Sorunuzu yazın; üç kart çekelim ve birlikte yorumlayalım.";

test("fills the viewport below the site header so the chat pane takes the rest", () => {
  render(<TarotPage />);
  expect(screen.getByRole("region", { name: INTRO })).toHaveClass(
    "min-h-[calc(100dvh-73px)]",
    "flex",
    "flex-col"
  );
});

test("shows the intro in the accent label style and no page heading", () => {
  render(<TarotPage />);

  const intro = screen.getByText(INTRO);
  expect(intro).toHaveClass(
    "text-sm",
    "font-medium",
    "uppercase",
    "tracking-widest",
    "text-accent"
  );
  expect(screen.queryByText("Sezgisel Rehberlik")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Tarot Okuması" })
  ).not.toBeInTheDocument();

  const cards = screen.getByRole("region", { name: "Çekilen kartlar" });
  const input = screen.getByLabelText("Sorunuzu yazın");
  expect(
    intro.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(
    cards.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
