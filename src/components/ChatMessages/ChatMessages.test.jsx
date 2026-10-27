import { render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import ChatMessages from ".";

afterEach(() => vi.restoreAllMocks());

function stubTurnOffsets(step) {
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
    function () {
      return this.tagName === "ARTICLE"
        ? [...this.parentElement.children].indexOf(this) * step
        : 0;
    }
  );
}

const TURNS = [
  {
    question: "Aşk hayatım nasıl olacak?",
    answer: "Kartlar **umut dolu** bir dönem gösteriyor.",
    error: null,
  },
  { question: "Peki ya işim?", answer: null, error: null },
];
const ERROR_TEXT = "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.";

test("exposes the conversation as a polite live log", () => {
  render(<ChatMessages turns={[]} />);

  const log = screen.getByRole("log", { name: "Sohbet mesajları" });
  expect(log).toHaveAttribute("aria-live", "polite");
});

test("renders one article per turn in question order", () => {
  render(<ChatMessages turns={TURNS} />);
  const articles = screen.getAllByRole("article");
  expect(articles).toHaveLength(2);
  expect(
    within(articles[0]).getByText("Aşk hayatım nasıl olacak?")
  ).toBeInTheDocument();
  expect(within(articles[1]).getByText("Peki ya işim?")).toBeInTheDocument();
});

test("keeps the question before its answer inside the same turn", () => {
  render(<ChatMessages turns={TURNS} />);
  const [first] = screen.getAllByRole("article");
  const user = within(first)
    .getByText("Aşk hayatım nasıl olacak?")
    .closest("[data-role]");
  const bot = within(first)
    .getByText(/Kartlar/)
    .closest("[data-role]");
  expect(user).toHaveAttribute("data-role", "user");
  expect(bot).toHaveAttribute("data-role", "bot");
  expect(
    user.compareDocumentPosition(bot) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});

test("pins each question in an opaque band that is a direct child of its turn", () => {
  render(<ChatMessages turns={TURNS} />);
  screen.getAllByRole("article").forEach((article) => {
    const band = article.querySelector('[data-role="user"]').parentElement;
    expect(band.parentElement).toBe(article);
    expect(band).toHaveClass("sticky", "top-0", "z-10", "bg-background");
  });
});

test("clamps the question to three lines without dropping its text", () => {
  const long = "Uzun soru ".repeat(80).trim();
  render(
    <ChatMessages turns={[{ question: long, answer: null, error: null }]} />
  );
  const bubble = screen.getByText(long).closest('[data-role="user"]');
  expect(bubble).toHaveClass("break-words");
  const clamp = screen.getByText(long).closest(".line-clamp-3");
  expect(bubble.contains(clamp)).toBe(true);
  expect(clamp).not.toBe(bubble);
});

test("only the latest turn reserves the full pane height", () => {
  render(<ChatMessages turns={TURNS} />);
  const [first, last] = screen.getAllByRole("article");
  expect(first).not.toHaveClass("min-h-full");
  expect(last).toHaveClass("min-h-full");
});

test("shows the typing indicator only inside the pending turn", () => {
  render(<ChatMessages turns={TURNS} />);
  const [, pending] = screen.getAllByRole("article");
  expect(screen.getAllByRole("status")).toHaveLength(1);
  expect(
    within(pending).getByRole("status", { name: "Yanıt yazılıyor" })
  ).toBeInTheDocument();
});

test("shows the error inside the failed turn with no answer bubble", () => {
  render(
    <ChatMessages
      turns={[{ question: "Soru", answer: null, error: ERROR_TEXT }]}
    />
  );
  const article = screen.getByRole("article");
  expect(within(article).getByRole("alert")).toHaveTextContent(ERROR_TEXT);
  expect(article.querySelector('[data-role="bot"]')).toBeNull();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

test("renders markdown inside messages", () => {
  render(<ChatMessages turns={TURNS} />);

  expect(screen.getByText("umut dolu").tagName).toBe("STRONG");
});

test("is a positioned scroll pane inside a wrapper that fills the remaining height", () => {
  render(<ChatMessages turns={[]} />);
  const log = screen.getByRole("log");
  expect(log).toHaveClass("absolute", "inset-0", "overflow-y-auto", "min-h-48");
  expect(log.parentElement).toHaveClass("relative", "flex-1", "min-h-48");
});

test("scrolls a newly added turn to the top of the pane", () => {
  stubTurnOffsets(400);
  const { rerender } = render(<ChatMessages turns={[TURNS[0]]} />);

  rerender(<ChatMessages turns={TURNS} />);

  expect(screen.getByRole("log").scrollTop).toBe(400);
});

test("keeps the scroll position when the latest answer arrives", () => {
  stubTurnOffsets(400);
  const { rerender } = render(<ChatMessages turns={TURNS} />);
  const log = screen.getByRole("log");
  log.scrollTop = 120;

  rerender(
    <ChatMessages turns={[TURNS[0], { ...TURNS[1], answer: "Yeni yanıt" }]} />
  );

  expect(screen.getByText("Yeni yanıt")).toBeInTheDocument();
  expect(log.scrollTop).toBe(120);
});
