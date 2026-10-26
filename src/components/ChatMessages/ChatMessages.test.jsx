import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import ChatMessages from ".";

const MESSAGES = [
  { role: "user", content: "Aşk hayatım nasıl olacak?" },
  { role: "bot", content: "Kartlar **umut dolu** bir dönem gösteriyor." },
];

test("exposes the conversation as a polite live log", () => {
  render(<ChatMessages messages={[]} />);

  const log = screen.getByRole("log", { name: "Sohbet mesajları" });
  expect(log).toHaveAttribute("aria-live", "polite");
});

test("renders user and bot messages in order and marks their role", () => {
  render(<ChatMessages messages={MESSAGES} />);

  const user = screen.getByText("Aşk hayatım nasıl olacak?").closest("div");
  expect(user).toHaveAttribute("data-role", "user");

  const bot = screen.getByText(/Kartlar/).closest("[data-role]");
  expect(bot).toHaveAttribute("data-role", "bot");
  expect(
    user.compareDocumentPosition(bot) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});

test("renders markdown inside messages", () => {
  render(<ChatMessages messages={MESSAGES} />);

  expect(screen.getByText("umut dolu").tagName).toBe("STRONG");
});

test("scrolls to the newest message when messages change", () => {
  const { rerender } = render(<ChatMessages messages={[MESSAGES[0]]} />);
  const log = screen.getByRole("log");
  Object.defineProperty(log, "scrollHeight", {
    configurable: true,
    value: 480,
  });

  rerender(<ChatMessages messages={MESSAGES} />);

  expect(log.scrollTop).toBe(480);
});
