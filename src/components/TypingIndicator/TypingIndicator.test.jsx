import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import TypingIndicator from ".";

test("announces that the reader is typing a reply", () => {
  render(<TypingIndicator />);

  expect(
    screen.getByRole("status", { name: "Yanıt yazılıyor" })
  ).toBeInTheDocument();
});
