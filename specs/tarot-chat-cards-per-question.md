# Tarot chat: cards tied to their question

## Summary

On `/tarot`, every question keeps the three cards drawn for it. The single card area
above the chat pane always shows the cards of the question currently at the top of the
chat pane. Scrolling back to an earlier question brings back the cards drawn for it.

## Scope

One coherent behavior: storing cards per question (turn), and making the existing
card area show the cards of the turn at the top of the chat pane.

This spec was split from a larger request and depends on
`specs/tarot-chat-sticky-questions.md`. That spec introduces the turns (`<article>`
per question), the scrolling chat pane, and scrolling a new question to the top.

## Acceptance criteria

### Cards stored per question

- The system must keep the cards returned for each question with that question's
  turn.
- Sending a new question must not discard the cards of earlier turns.
- The answer to a question must only set the cards of that question's turn. It must
  not change any other turn's cards.

### Which cards the card area shows

- The card area must stay a single section above the chat pane, with accessible name
  `Çekilen kartlar`.
- The "active turn" is the turn at the top of the chat pane: the last turn whose top
  edge is at or above the pane's current scroll position.
- The card area must show the cards of the active turn.
- When the user scrolls the chat pane so that an earlier turn becomes active, the
  card area must switch to that turn's cards.
- When the user scrolls back down so that a later turn becomes active, the card area
  must switch to that later turn's cards.
- When the pane is scrolled to its very top, the first turn must be active.
- Each shown card must keep its current rendering: an image whose `alt` is the card
  name, and a caption with the card name.

### Sending a new question

- When the user submits a question, its new turn must become active immediately,
  without waiting for a scroll event. The card area must then show three empty
  placeholders.
- When the answer for the active turn arrives, the card area must show that turn's
  cards.

## Edge cases and error handling

- When no question has been asked yet, the card area must show three empty
  placeholders (each with the screen-reader text `Kart henüz çekilmedi`).
- While a turn's answer is loading, that turn's cards must be three empty
  placeholders.
- When a turn's request fails, that turn's cards must be three empty placeholders,
  both right after the failure and whenever that turn becomes active later.
- When an answer arrives with an empty or missing card list, that turn's cards must
  be three empty placeholders.
- When the user scrolls up to an earlier turn while a newer answer is loading, and
  that answer arrives, the card area must keep showing the earlier (active) turn's
  cards. The new cards must appear once the user scrolls back so the newer turn is
  active.
- When two turns drew the same card names, the card area must still show the cards
  of the active turn, with no duplicated or missing cards.

## Out of scope

- Sticky questions, pane height and scroll-on-send. Those are in
  `specs/tarot-chat-sticky-questions.md`.
- Rendering cards inside each turn in the chat pane.
- Changing the card visuals, sizes, placeholder design, or the entry animation. The
  animation may replay when the card area switches turns; no requirement either way.
- Any change to the `/api/chat` request or response shape (`message`, `cards[]` with
  `name`, `name_short`, `image_url`).

## Context / notes

- Relevant files:
  - `src/components/TarotChat/index.js` currently holds a single `cards` state that
    is reset on each submit.
  - `src/components/CardSpread/index.js` renders the cards or 3 placeholders from a
    `cards` prop. It can stay a presentational component.
  - `src/components/ChatMessages/index.js` renders the scrolling pane after the
    sticky-questions spec.
- Active-turn contract (so tests and code agree in jsdom, which has no layout): the
  active turn is recomputed on the chat pane's `scroll` event. It is the last turn
  `<article>` whose `offsetTop` is less than or equal to the pane's `scrollTop` plus
  1px, falling back to the first turn. Tests can stub `offsetTop` on the turn
  articles, set the pane's `scrollTop`, and dispatch a `scroll` event on the pane.
- The existing `TarotChat.test.jsx` test "shows a typing indicator, disables input
  and resets cards while waiting" stays valid: the new turn is active and shows
  placeholders.
- Testing conventions: Vitest + Testing Library, colocated `*.test.jsx` files.
