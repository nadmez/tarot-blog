import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import TarotPage, { metadata } from "./page";

test("has Turkish page metadata", () => {
  expect(metadata.title).toBe("Tarot Okuması | Tarot Falı");
  expect(metadata.description).toMatch(/tarot/i);
});

test("renders the page heading followed by the tarot chat", () => {
  render(<TarotPage />);

  const heading = screen.getByRole("heading", {
    level: 1,
    name: "Tarot Okuması",
  });
  const cards = screen.getByRole("region", { name: "Çekilen kartlar" });
  const input = screen.getByLabelText("Sorunuzu yazın");

  expect(
    heading.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(
    cards.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
