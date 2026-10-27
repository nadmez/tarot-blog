# Tarot Chat Sticky Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Group the `/tarot` chat into one `<article>` per question, pin each question to the top of a height-bounded chat pane while its answer scrolls, and scroll each new question to the top of the pane.

**Architecture:** `TarotChat` replaces its flat `messages` list and single `error` with a `turns` array (`{ question, answer, error }`). `ChatMessages` renders the turns inside an absolutely positioned scroll pane. Each question sits in a `sticky top-0` band that is a direct child of its own `<article>`, so the next turn's band pushes it off. A `useEffect` keyed on `turns.length` sets the pane's `scrollTop` to the new turn's `offsetTop`. The tarot page section gets a viewport-based `min-height` so the pane wrapper can take the remaining height.

**Tech Stack:** Next.js 16 App Router, React 19 (React Compiler on), Tailwind CSS 4, Vitest 5 + Testing Library (jsdom).

**Spec:** `specs/tarot-chat-sticky-questions.md`

## Global Constraints

- Use `pnpm` for every command. Never run `pnpm dev` or start/stop a dev server; ask the user to check the browser on their running server.
- Existing Tailwind tokens only (`bg-background`, `bg-primary`, `text-white`, `border-primary/10`, ...). No new hex colors.
- Error copy stays exactly `Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.`
- Pane keeps `role="log"`, `aria-label="Sohbet mesajları"`, `aria-live="polite"`.
- Typing indicator keeps `role="status"`, name `Yanıt yazılıyor`. Error keeps `role="alert"`.
- Question element keeps `data-role="user"`, answer keeps `data-role="bot"`.
- The card area (`CardSpread`, single `cards` state in `TarotChat`) is not changed by this plan.
- No end-to-end/browser test files. Unit tests only (`src/**/*.test.jsx`).
- Before claiming done: `pnpm test`, `pnpm lint`, `pnpm build` all pass.

## Review Focus

- A very long single word (no spaces) in a question must wrap inside the bubble instead of overflowing horizontally. Pinned by the `break-words` assertion in Task 1.
- The 3-line clamp must not show a sliver of a 4th line in the bubble's bottom padding. The clamp sits on an inner wrapper without padding, pinned in Task 1.
- On a phone-sized viewport the pane may sit at its `12rem` minimum and the page scrolls slightly. This is a layout check; Task 3 ends with a manual check on the user's running server.
- `position: sticky` inside the absolutely positioned scroll pane must actually pin on mobile Safari and Chrome. Manual check in Task 3.
- A failed turn's error must survive later successful questions. Today `setError(null)` clears it. Pinned by the TarotChat test in Task 1.

---

## File Structure

- Modify `src/components/ChatMessages/index.js`: renders `turns` as articles inside the scroll pane, owns the scroll-on-new-turn effect.
- Modify `src/components/ChatMessages/ChatMessages.test.jsx`: fixtures move from messages to turns; new structure and scroll tests.
- Modify `src/components/TarotChat/index.js`: `turns` state replaces `messages`, `error`, `isBotTyping`; root becomes a flex column that fills its parent.
- Modify `src/components/TarotChat/TarotChat.test.jsx`: per-turn error and typing indicator tests.
- Modify `src/app/tarot/page.js`: section fills the viewport below the header.
- Modify `src/app/tarot/page.test.jsx`: layout class assertion.

---

### Task 1: Render the conversation as sticky-question turns

**Files:**

- Modify: `src/components/ChatMessages/index.js`
- Modify: `src/components/TarotChat/index.js`
- Test: `src/components/ChatMessages/ChatMessages.test.jsx`, `src/components/TarotChat/TarotChat.test.jsx`

**Interfaces:**

- Produces: `ChatMessages({ turns = [] })` where `turns: Array<{ question: string, answer: string | null, error: string | null }>`. A turn is pending when `answer === null && error === null`.
- Produces: DOM shape per turn, relied on by Task 2 and by the cards plan:
  - pane (`role="log"`) → direct children are `<article>` elements, one per turn, in order
  - `<article>` → first child is the sticky band `div` → the question bubble `div[data-role="user"]` → `div.line-clamp-3` → markdown
  - then, in the article: answer bubble `div[data-role="bot"]` | `TypingIndicator` | `<p role="alert">{error}</p>`
- Produces: `TarotChat` state `turns` with the shape above; `const isBotTyping` is derived from the last turn being pending.

- [ ] **Step 1: Rewrite the ChatMessages tests for turns**

Replace `MESSAGES` with turns fixtures and replace the "renders user and bot messages in order" test. Delete the old "scrolls to the newest message when messages change" test (Task 2 replaces it). Keep "exposes the conversation as a polite live log" and "renders markdown inside messages" (switch it to `turns={TURNS}`).

```jsx
const TURNS = [
  {
    question: "Aşk hayatım nasıl olacak?",
    answer: "Kartlar **umut dolu** bir dönem gösteriyor.",
    error: null,
  },
  { question: "Peki ya işim?", answer: null, error: null },
];
const ERROR_TEXT = "Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.";

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

test("is a positioned scroll pane inside a wrapper that fills the remaining height", () => {
  render(<ChatMessages turns={[]} />);
  const log = screen.getByRole("log");
  expect(log).toHaveClass("absolute", "inset-0", "overflow-y-auto", "min-h-48");
  expect(log.parentElement).toHaveClass("relative", "flex-1", "min-h-48");
});
```

Add `within` to the `@testing-library/react` import.

- [ ] **Step 2: Add TarotChat tests for per-turn errors and typing indicator**

Append to `TarotChat.test.jsx` (add `within` to the import):

```jsx
test("keeps the error inside the failed question's turn after asking again", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(okResponse({ message: "Yanıt", cards: CARDS }))
  );
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(<TarotChat />);

  ask("Soru 1");
  await screen.findByRole("alert");
  ask("Soru 2");
  await screen.findByText("Yanıt");

  const [failed, answered] = screen.getAllByRole("article");
  expect(within(failed).getByText("Soru 1")).toBeInTheDocument();
  expect(within(failed).getByRole("alert")).toHaveTextContent(ERROR_TEXT);
  expect(within(answered).queryByRole("alert")).not.toBeInTheDocument();
  expect(within(answered).getByText("Yanıt")).toBeInTheDocument();
});

test("shows the typing indicator inside the pending question's turn", async () => {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
  render(<TarotChat />);

  ask("Soru");

  const article = screen.getByRole("article");
  expect(within(article).getByText("Soru")).toBeInTheDocument();
  expect(
    await within(article).findByRole("status", { name: "Yanıt yazılıyor" })
  ).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm test src/components/ChatMessages src/components/TarotChat`
Expected: FAIL. The new ChatMessages tests fail because `turns` is not a prop yet and there are no `article` elements. The new TarotChat tests fail because there are no `article` elements.

- [ ] **Step 4: Implement `ChatMessages({ turns = [] })` in `src/components/ChatMessages/index.js`**

- Remove the scroll-to-bottom `useEffect` (Task 2 adds the new effect). Keep `logRef` on the pane.
- Outer wrapper: `<div className="relative min-h-48 flex-1">`.
- Pane: same `role`, `aria-live`, `aria-label` and `ref`, with classes `absolute inset-0 flex min-h-48 flex-col gap-3 overflow-y-auto scroll-smooth rounded-3xl border border-primary/10 bg-background px-4 pb-4`. There is no top padding: the band's `pt-4` provides it, so the band sticks flush to the pane's top edge.
- Each turn `<article key={index}>` uses `flex shrink-0 flex-col gap-3`, plus `min-h-full` when `index === turns.length - 1`.
- Band: `<div className="sticky top-0 z-10 flex flex-col bg-background pt-4 pb-1">`. It contains the question bubble, which has `data-role="user"`, `onCopy={copySelectionAsPlainText}`, the existing bubble classes, `BUBBLE_STYLES.user` and `break-words`. Inside the bubble: `<div className="line-clamp-3"><ReactMarkdown>{turn.question}</ReactMarkdown></div>`.
- After the band, render exactly one of these:
  - the answer bubble (`data-role="bot"`, the existing classes, `onCopy`, markdown) when `turn.answer !== null`
  - `<p role="alert" className="px-2 text-sm text-red-700">{turn.error}</p>` when `turn.error !== null`
  - otherwise `<TypingIndicator />`, imported from `../TypingIndicator`

- [ ] **Step 5: Move `TarotChat` to `turns` state in `src/components/TarotChat/index.js`**

- Replace `messages`, `error`, `isBotTyping` state with `const [turns, setTurns] = useState([])`. Keep the `cards` state and its behavior unchanged.
- `const lastTurn = turns.at(-1); const isBotTyping = lastTurn !== undefined && lastTurn.answer === null && lastTurn.error === null;`
- In `handleSubmit(prompt)`: `const index = turns.length;` then append `{ question: prompt, answer: null, error: null }`. Keep `setCards([])`, the pop sound and the conversation id. On success, set `answer: data.message` on the turn at `index` (via `prev.map`). On failure, set `error: ERROR_MESSAGE` on that turn. Remove the `finally` block.
- Render: `<div className="flex min-h-0 flex-1 flex-col gap-4">` → `<CardSpread cards={cards} />`, `<ChatMessages turns={turns} />`, `<ChatInput onSubmit={handleSubmit} isLoading={isBotTyping} />`. Remove the old wrapper div, the out-of-log `TypingIndicator` and the out-of-log alert, and remove the `TypingIndicator` import from this file.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm test src/components/ChatMessages src/components/TarotChat`
Expected: PASS, including all pre-existing TarotChat tests: placeholders, posting, conversation id, resetting cards while waiting, error alert, non-OK response, and sounds.

- [ ] **Step 7: Commit**

```bash
git add src/components/ChatMessages src/components/TarotChat
git commit -m "Group tarot chat into turns with sticky questions"
```

---

### Task 2: Scroll each new question to the top of the pane

**Files:**

- Modify: `src/components/ChatMessages/index.js`
- Test: `src/components/ChatMessages/ChatMessages.test.jsx`

**Interfaces:**

- Consumes: Task 1's DOM shape (articles are the pane's direct children).
- Produces: scroll contract for the cards plan. After a turn is added, `pane.scrollTop === lastArticle.offsetTop`. The scroll position is not touched when an existing turn changes.

- [ ] **Step 1: Write the failing tests**

Add `afterEach(() => vi.restoreAllMocks())` and import `afterEach`, `vi` from `vitest`.

```jsx
function stubTurnOffsets(step) {
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
    function () {
      return this.tagName === "ARTICLE"
        ? [...this.parentElement.children].indexOf(this) * step
        : 0;
    }
  );
}

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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/components/ChatMessages`
Expected: FAIL. In "scrolls a newly added turn", `scrollTop` is `0` instead of `400`.

- [ ] **Step 3: Add the effect in `ChatMessages`**

Use `useEffect` with deps `[turns.length]`. Read `logRef.current.lastElementChild`; if it exists, set `logRef.current.scrollTop = last.offsetTop`. Deps on `length` only are what keep the position stable when an answer arrives.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/components/ChatMessages src/components/TarotChat`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatMessages
git commit -m "Scroll each new tarot question to the top of the chat pane"
```

---

### Task 3: Make the tarot section fill the viewport below the header

**Files:**

- Modify: `src/app/tarot/page.js:14`
- Test: `src/app/tarot/page.test.jsx`

**Interfaces:**

- Consumes: Task 1's `TarotChat` root (`flex min-h-0 flex-1 flex-col`) and `ChatMessages` wrapper (`relative min-h-48 flex-1`).

The site header is `73px` tall on mobile: `py-4` (32px), plus the 40px menu button, plus the 1px bottom border. On desktop it is about 71px. The section uses `min-h` (not `h`). It fills the screen when the content fits, and grows (the page scrolls) when the pane's `12rem` minimum doesn't fit. The absolute pane means chat content never grows the section.

- [ ] **Step 1: Write the failing test**

```jsx
test("fills the viewport below the site header so the chat pane takes the rest", () => {
  render(<TarotPage />);
  expect(screen.getByRole("region", { name: "Tarot Okuması" })).toHaveClass(
    "min-h-[calc(100dvh-73px)]",
    "flex",
    "flex-col"
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/app/tarot`
Expected: FAIL. The section is missing the `min-h-[calc(100dvh-73px)]` class.

- [ ] **Step 3: Update the section classes in `src/app/tarot/page.js`**

The new classes are `mx-auto flex min-h-[calc(100dvh-73px)] max-w-3xl flex-col gap-6 px-4 py-4 sm:px-6 md:py-14`. This changes mobile vertical padding from `py-10` to `py-4`, which gives the pane 48px more on phones.

- [ ] **Step 4: Run the full verification**

Run: `pnpm test`, then `pnpm lint`, then `pnpm build`
Expected: every test passes (the 54 baseline tests, minus the removed scroll-to-bottom test, plus the new ones). Lint reports no errors. The build succeeds.

- [ ] **Step 5: Manual check on the user's running dev server**

Ask the user whether their dev server is running, and do not start one. On `/tarot` at a 390×844 viewport, ask two questions with long answers and confirm:

- The question pins while its answer scrolls.
- The second question pushes the first off the top.
- Scrolling up pins the first question again.
- No answer text shows through or beside the band.
- The input stays visible.

- [ ] **Step 6: Commit**

```bash
git add src/app/tarot
git commit -m "Size tarot page so the chat pane fills the screen"
```
