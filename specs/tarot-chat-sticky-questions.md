# Tarot chat: sticky questions with scrollable answers

## Summary

On `/tarot`, group the conversation into one block ("turn") per question. While the
user reads an answer, that answer's question stays pinned to the top of the chat pane
and only the answer scrolls underneath it. Each new question is brought to the top of
the pane, and scrolling back up pins the earlier question above its own answer.

## Scope

One coherent behavior: turn grouping, sticky questions inside a height-bounded chat
pane, and scroll positioning when a new question is sent.

This spec was split from a larger request. Tying the tarot cards to their question is
covered separately in `specs/tarot-chat-cards-per-question.md`, which depends on this
spec. The card area's behavior does not change in this spec.

## Acceptance criteria

### Turn grouping

- The system must render one turn per submitted question inside the chat pane, in the
  order the questions were asked.
- Each turn must be an `<article>` element.
- Each turn must contain its question, followed in DOM order by that question's answer
  once it arrives.
- The question element must keep `data-role="user"` and the answer element must keep
  `data-role="bot"`.
- The answer must belong to the turn of the question it replies to. It must not be
  placed in any other turn.
- Messages must still render markdown (for example `**metin**` renders a `<strong>`).
- Copying a selection from a message must still put plain text on the clipboard, as
  it does today.

### Chat pane

- The chat pane must remain the single element with `role="log"`, accessible name
  `Sohbet mesajları` and `aria-live="polite"`, and it must contain all turns.
- The chat pane must be the element that scrolls vertically (its own vertical
  overflow scrolls). It must not grow taller as the conversation gets longer.
- On the `/tarot` page, the tarot section must fill the viewport height below the
  sticky site header. Within it, the card area and the input must keep their natural
  height and the chat pane must take all remaining height. On a phone, the card area,
  the chat pane and the input are then all visible together.
- The chat pane must keep a minimum height of `12rem` (the current `min-h-48`).

### Sticky question

- Each turn's question must be sticky at the top edge of the chat pane.
- Each turn's question must be sticky only within its own turn. It must be a direct
  child of its turn's `<article>`, not of the pane. As a result, the next turn's
  question pushes it off the top, and scrolling back into an earlier turn pins that
  earlier turn's question.
- The sticky question must span the full width of the pane and have an opaque
  background matching the pane background. Answer text scrolling beneath it must not
  show through it or beside it.
- The sticky question must stack above the answer content of its turn.
- The question bubble inside the sticky band must keep its current look: right
  aligned, primary background, white text, rounded.
- The question bubble must be visually limited to 3 lines, with an ellipsis when the
  text is longer. The full question text must remain in the DOM, so it is still
  readable by screen readers and in the page text.

### Scrolling when a question is sent

- When the user submits a question, the system must scroll the chat pane so that the
  new turn's top edge is at the pane's top edge.
- When the answer (or an error) for that question arrives, the system must not change
  the chat pane's scroll position.
- The latest turn must be at least as tall as the chat pane's visible height, so its
  question can reach the top of the pane even when its answer is short or still
  loading.
- Turns other than the latest one must be only as tall as their content.

## Edge cases and error handling

- When no question has been asked yet, the chat pane must contain no turns and be
  empty.
- While an answer is loading, the typing indicator (`role="status"`, name
  `Yanıt yazılıyor`) must render inside the pending turn, below its question. It must
  not render anywhere else.
- When the request for a question fails (network error or non-OK response), that
  turn must keep its question and show the error alert (`role="alert"`, text exactly
  `Bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.`) below the question,
  inside that turn. The turn must have no answer bubble.
- After a failure, the input must be re-enabled. Asking again must create a new turn.
  The failed turn and its error must stay in place.
- An error must appear only inside the turn whose request failed. Successful turns
  must not show an error.
- When a question is longer than 3 lines, the bubble must show 3 lines with an
  ellipsis. Its full text must still be present in the DOM.
- With only one turn, its question must still be sticky.
- If the user scrolls the pane while an answer is loading, the arriving answer must
  not move the pane's scroll position.
- There is no limit on the number of turns. Every turn follows the same rules.

## Out of scope

- Tying cards to their question or changing what the card area shows. That is the
  companion spec `specs/tarot-chat-cards-per-question.md`.
- Tap-to-expand for clamped questions.
- A "jump to latest" button or a new-message badge.
- Persisting the conversation across reloads.
- Any change to the `/api/chat` request or response, the conversation id, the sounds,
  or `ChatInput` behavior.
- Changing the page intro text or the site header.

## Context / notes

- Relevant files:
  - `src/components/TarotChat/index.js` keeps the flat `messages` list, a single
    `cards` array, `isBotTyping` and a single `error`. The error and the typing
    indicator currently render outside the log.
  - `src/components/ChatMessages/index.js` renders the `role="log"` pane. It
    currently scrolls to the bottom (`scrollTop = scrollHeight`) whenever `messages`
    changes.
  - `src/components/TypingIndicator/index.js` renders the typing indicator.
  - `src/app/tarot/page.js` wraps everything in a section with an intro header.
  - `src/components/Header/index.js` is `sticky top-0 z-50`.
- Scroll contract (so tests and code agree in jsdom, which has no layout): the chat
  pane is the positioned `offsetParent` of its turns. "Scroll the new turn to the
  top" means setting the pane's `scrollTop` to the new turn's `offsetTop`. Tests can
  stub `offsetTop` on the `<article>` elements and assert the pane's `scrollTop`.
- Styling must use existing Tailwind tokens (`bg-background`, `bg-primary`,
  `text-white`, etc.). Tailwind 4 provides `sticky`, `top-0`, `line-clamp-3` and
  `dvh` units out of the box.
- These existing tests encode behavior this spec replaces and must be updated:
  `ChatMessages.test.jsx` ("scrolls to the newest message when messages change",
  which asserts the old scroll-to-bottom), and any `TarotChat.test.jsx` expectation
  about where the alert or typing indicator render.
- Testing conventions: Vitest + Testing Library, colocated `*.test.jsx` files.
