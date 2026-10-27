# Tarot Chat Cards Per Question Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the cards drawn for each question with its turn. The single card area above the chat pane shows the cards of the turn at the top of the pane.

**Architecture:** `ChatMessages` gains an `onActiveTurnChange(index)` callback, fired from the pane's `scroll` event. The index is the last `<article>` whose `offsetTop <= scrollTop + 1`, falling back to `0`. `TarotChat` stores `cards` on each turn, drops its standalone `cards` state, and keeps an `activeTurn` index. The index is set to the new turn on submit and updated by the callback. `CardSpread` renders `turns[activeTurn]?.cards ?? []`, so an empty list falls back to its existing placeholders.

**Tech Stack:** Next.js 16 App Router, React 19 (React Compiler on), Tailwind CSS 4, Vitest 5 + Testing Library (jsdom).

**Spec:** `specs/tarot-chat-cards-per-question.md`

**Prerequisite:** `docs/superpowers/plans/2026-10-27-tarot-chat-sticky-questions.md` is fully implemented. This plan relies on its turn shape, its DOM shape (articles are the pane's direct children) and its scroll-on-new-turn effect.

## Global Constraints

- Use `pnpm` for every command. Never run `pnpm dev` or start/stop a dev server; ask the user to check the browser on their running server.
- Card area stays one section with accessible name `Çekilen kartlar`, and placeholders keep the screen-reader text `Kart henüz çekilmedi` (3 of them).
- `CardSpread` is not modified. Cards keep `alt` = card name and a `figcaption` with the name.
- No change to the `/api/chat` request/response shape (`message`, `cards[]` with `name`, `name_short`, `image_url`).
- No end-to-end/browser test files. Unit tests only (`src/**/*.test.jsx`).
- Before claiming done: `pnpm test`, `pnpm lint`, `pnpm build` all pass.

## Review Focus

- Smooth scrolling to a new turn sends scroll events while it moves past earlier turns, so the card area can briefly flash earlier turns' cards before settling on the new placeholders. The end state is pinned by tests. The flash itself is only a manual check (Task 2, Step 6). If it is distracting, the fix is to drop `scroll-smooth` from the pane.
- Smooth scrolling can stop a fraction of a pixel short of the target `offsetTop`. The `+ 1` tolerance covers it, pinned by the `799`/`798` boundary assertions in Task 1.
- A scroll event with no turns yet must not crash, and reports `0`. Pinned in Task 1.
- An answer that arrives while the user is scrolled up must not take over the card area. Pinned in Task 2.
- Two turns that drew the same card names (identical React keys in `CardSpread`) must still show exactly three cards. Pinned in Task 2.

---

## File Structure

- Modify `src/components/ChatMessages/index.js`: `onScroll` handler that reports the active turn index.
- Modify `src/components/ChatMessages/ChatMessages.test.jsx`: active-turn reporting tests.
- Modify `src/components/TarotChat/index.js`: per-turn `cards`, `activeTurn` state, wiring.
- Modify `src/components/TarotChat/TarotChat.test.jsx`: per-question card tests.

---

### Task 1: Report the turn at the top of the pane

**Files:**

- Modify: `src/components/ChatMessages/index.js`
- Test: `src/components/ChatMessages/ChatMessages.test.jsx`

**Interfaces:**

- Consumes: `ChatMessages({ turns })` and the `stubTurnOffsets(step)` test helper from the sticky-questions plan.
- Produces: `ChatMessages({ turns = [], onActiveTurnChange })`. `onActiveTurnChange` is optional, `(index: number) => void`, and is called on every pane `scroll` event.

- [ ] **Step 1: Write the failing tests**

```jsx
const THREE_TURNS = [
  { question: "Bir", answer: "Yanıt bir", error: null },
  { question: "İki", answer: "Yanıt iki", error: null },
  { question: "Üç", answer: "Yanıt üç", error: null },
];

test("reports the turn at the top of the pane when it scrolls", () => {
  stubTurnOffsets(400);
  const onActiveTurnChange = vi.fn();
  render(
    <ChatMessages turns={THREE_TURNS} onActiveTurnChange={onActiveTurnChange} />
  );
  const log = screen.getByRole("log");

  log.scrollTop = 450;
  fireEvent.scroll(log);
  expect(onActiveTurnChange).toHaveBeenLastCalledWith(1);

  log.scrollTop = 0;
  fireEvent.scroll(log);
  expect(onActiveTurnChange).toHaveBeenLastCalledWith(0);

  log.scrollTop = 799;
  fireEvent.scroll(log);
  expect(onActiveTurnChange).toHaveBeenLastCalledWith(2);

  log.scrollTop = 798;
  fireEvent.scroll(log);
  expect(onActiveTurnChange).toHaveBeenLastCalledWith(1);
});

test("reports the first turn when scrolled with no turns", () => {
  const onActiveTurnChange = vi.fn();
  render(<ChatMessages turns={[]} onActiveTurnChange={onActiveTurnChange} />);

  fireEvent.scroll(screen.getByRole("log"));

  expect(onActiveTurnChange).toHaveBeenLastCalledWith(0);
});

test("scrolls without a change handler", () => {
  render(<ChatMessages turns={THREE_TURNS} />);
  expect(() => fireEvent.scroll(screen.getByRole("log"))).not.toThrow();
});
```

Add `fireEvent` to the `@testing-library/react` import.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/components/ChatMessages`
Expected: FAIL. `onActiveTurnChange` is never called.

- [ ] **Step 3: Add `onScroll` to the pane in `ChatMessages`**

Compute the index from the pane's `event.currentTarget`. Walk `children` and keep the last index `i` whose `offsetTop <= scrollTop + 1`, starting from `0`. Then call `onActiveTurnChange?.(index)`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/components/ChatMessages`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatMessages
git commit -m "Report the tarot chat turn at the top of the pane"
```

---

### Task 2: Store cards per question and show the active turn's cards

**Files:**

- Modify: `src/components/TarotChat/index.js`
- Test: `src/components/TarotChat/TarotChat.test.jsx`

**Interfaces:**

- Consumes: `ChatMessages({ turns, onActiveTurnChange })` from Task 1.
- Produces: turn shape `{ question: string, answer: string | null, error: string | null, cards: Array<{ name, name_short, image_url }> }`. `ChatMessages` ignores `cards`.

- [ ] **Step 1: Write the failing tests**

Add the fixtures and helpers below. Add `afterEach(() => vi.restoreAllMocks())` next to the existing `vi.unstubAllGlobals()`, and add `within` to the import if it is missing.

```jsx
const OTHER_CARDS = [
  {
    name: "The Moon",
    name_short: "ar18",
    image_url: "/assets/images/themoon.jpeg",
  },
  {
    name: "The Star",
    name_short: "ar17",
    image_url: "/assets/images/thestar.jpeg",
  },
  {
    name: "The Tower",
    name_short: "ar16",
    image_url: "/assets/images/thetower.jpeg",
  },
];

function stubTurnOffsets(step) {
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(
    function () {
      return this.tagName === "ARTICLE"
        ? [...this.parentElement.children].indexOf(this) * step
        : 0;
    }
  );
}

function scrollPaneTo(top) {
  const log = screen.getByRole("log");
  log.scrollTop = top;
  fireEvent.scroll(log);
}

async function askAndWait(text, reply) {
  ask(text);
  await screen.findByText(reply);
  await waitFor(() =>
    expect(screen.getByLabelText("Sorunuzu yazın")).toBeEnabled()
  );
}

const cardArea = () => screen.getByRole("region", { name: "Çekilen kartlar" });
```

```jsx
test("shows the cards of the question scrolled to the top of the pane", async () => {
  stubTurnOffsets(400);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 1", cards: CARDS }))
      .mockResolvedValueOnce(
        okResponse({ message: "Yanıt 2", cards: OTHER_CARDS })
      )
  );
  render(<TarotChat />);

  await askAndWait("Soru 1", "Yanıt 1");
  await askAndWait("Soru 2", "Yanıt 2");
  expect(
    within(cardArea()).getByRole("img", { name: "The Moon" })
  ).toBeInTheDocument();

  scrollPaneTo(0);
  expect(
    within(cardArea()).getByRole("img", { name: "The Magician" })
  ).toBeInTheDocument();
  expect(
    within(cardArea()).queryByRole("img", { name: "The Moon" })
  ).not.toBeInTheDocument();

  scrollPaneTo(400);
  expect(
    within(cardArea()).getByRole("img", { name: "The Moon" })
  ).toBeInTheDocument();
  expect(
    within(cardArea()).queryByRole("img", { name: "The Magician" })
  ).not.toBeInTheDocument();
});

test("keeps the earlier question's cards when a newer answer arrives while scrolled up", async () => {
  stubTurnOffsets(400);
  let resolveSecond;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 1", cards: CARDS }))
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve;
        })
      )
  );
  render(<TarotChat />);

  await askAndWait("Soru 1", "Yanıt 1");
  ask("Soru 2");
  scrollPaneTo(0);
  resolveSecond(okResponse({ message: "Yanıt 2", cards: OTHER_CARDS }));
  await screen.findByText("Yanıt 2");

  expect(
    within(cardArea()).getByRole("img", { name: "The Magician" })
  ).toBeInTheDocument();
  expect(
    within(cardArea()).queryByRole("img", { name: "The Moon" })
  ).not.toBeInTheDocument();

  scrollPaneTo(400);
  expect(
    within(cardArea()).getByRole("img", { name: "The Moon" })
  ).toBeInTheDocument();
});

test("shows placeholders when a failed question is scrolled back to the top", async () => {
  stubTurnOffsets(400);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 2", cards: CARDS }))
  );
  render(<TarotChat />);

  ask("Soru 1");
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
  await askAndWait("Soru 2", "Yanıt 2");

  scrollPaneTo(0);
  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
  expect(within(cardArea()).queryByRole("img")).not.toBeInTheDocument();
});

test.each([
  ["an empty card list", { message: "Yanıt", cards: [] }],
  ["no card list", { message: "Yanıt" }],
])("shows placeholders for an answer with %s", async (_, body) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse(body)));
  render(<TarotChat />);

  await askAndWait("Soru", "Yanıt");

  expect(screen.getAllByText("Kart henüz çekilmedi")).toHaveLength(3);
});

test("shows exactly three cards when two questions drew the same cards", async () => {
  stubTurnOffsets(400);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 1", cards: CARDS }))
      .mockResolvedValueOnce(okResponse({ message: "Yanıt 2", cards: CARDS }))
  );
  render(<TarotChat />);

  await askAndWait("Soru 1", "Yanıt 1");
  await askAndWait("Soru 2", "Yanıt 2");
  scrollPaneTo(0);

  expect(within(cardArea()).getAllByRole("img")).toHaveLength(3);
});
```

Add `fireEvent` and `within` to the `@testing-library/react` import if they are missing.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test src/components/TarotChat`
Expected: FAIL. "shows the cards of the question scrolled to the top" and "keeps the earlier question's cards" fail because the card area keeps the newest cards after scrolling to `0`. "shows placeholders when a failed question is scrolled back" fails because the card area still shows the second turn's cards after scrolling to `0`. The empty, missing and same-cards tests may already pass, and that is expected.

- [ ] **Step 3: Implement per-turn cards in `TarotChat`**

- Remove the `cards` state and both `setCards` calls.
- Add `const [activeTurn, setActiveTurn] = useState(0)`.
- In `handleSubmit`, append `{ question: prompt, answer: null, error: null, cards: [] }` and call `setActiveTurn(index)` in the same handler, before the fetch. On success, set `answer: data.message, cards: data.cards ?? []` on the turn at `index`.
- Render `<CardSpread cards={turns[activeTurn]?.cards ?? []} />` and `<ChatMessages turns={turns} onActiveTurnChange={setActiveTurn} />`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test src/components/TarotChat src/components/ChatMessages`
Expected: PASS, including the existing "resets cards while waiting" test (the new turn is active and shows placeholders).

- [ ] **Step 5: Run the full verification**

Run: `pnpm test`, then `pnpm lint`, then `pnpm build`
Expected: every test passes, lint reports no errors, and the build succeeds.

- [ ] **Step 6: Manual check on the user's running dev server**

Ask the user whether their dev server is running, and do not start one. On `/tarot` at a 390×844 viewport, ask three questions and confirm:

- Scrolling up switches the card area to each earlier question's cards.
- Scrolling down switches it back.
- After sending, the card area ends on placeholders for the new question.

Note any card flashing during the smooth scroll (see Review Focus).

- [ ] **Step 7: Commit**

```bash
git add src/components/TarotChat
git commit -m "Tie tarot cards to their question in the chat"
```
