---
name: spec-writer
description: Use ONLY when the user explicitly asks to write, draft, or produce a spec -- e.g. "write a spec for X", "spec this out before we build it", "create a spec I can feed to the TDD pipeline", or "draft acceptance criteria for X". Produces a concrete, testable spec file formatted specifically to hand to the tdd-pipeline skill's test-writer step. Do NOT use this automatically just because the user asked to implement or fix something -- ordinary feature/bugfix requests should go straight to implementation (or to tdd-pipeline if they ask for that) without a detour through spec-writer unless the user asked for a spec by name.
---

# Spec Writer

## Purpose

`tdd-pipeline` needs a clear, concrete spec before it can spawn a test-writer --
a vague feature name isn't enough for an isolated subagent to write a meaningful
failing test from. This skill's only job is producing that spec, and producing it
honestly: by asking about the gaps instead of guessing through them.

Guessing is the failure mode to avoid. A spec that quietly assumes an answer to
"what happens on empty input?" hands the test-writer a blind spot it will never
know to question -- it'll just write a test around whatever was assumed. Asking
costs you thirty seconds now; a wrong assumption baked into a spec costs a wasted
pipeline round later.

## Before writing anything: interview the user

Take the user's raw request and check it against these dimensions. Some are
always worth asking about regardless of how detailed the request already sounds
-- edge cases and error handling are exactly the kind of thing people describe
correctly for the happy path and forget to mention otherwise, so probe for them
even when the rest of the request feels complete.

| Dimension | When to ask |
|---|---|
| Core behavior, trigger, and observable result | **Blocking.** If you can't state in one sentence what happens and how you'd know it worked, ask before drafting anything else. |
| Edge cases (empty/missing/invalid/boundary input) | **Always ask**, even if the request sounds complete. |
| Error handling (what should happen when something goes wrong, not just the success path) | **Always ask**, same reason. |
| Scope boundaries (what this explicitly should *not* do) | Ask if the request could plausibly be read more broadly than intended. |
| Related existing code/files/conventions | Ask only if you don't already know and it would change how acceptance criteria are worded (e.g. matching an existing validation pattern). |

If the request actually bundles multiple unrelated behaviors (e.g. "add login
and also fix the signup email bug"), say so and ask whether to split it into
separate specs. `tdd-pipeline` works best on one coherent behavior per run --
a test-writer handed a grab-bag spec will produce a sprawling, hard-to-verify
test file. Splitting is usually the right call; bundle only if the user insists
they're genuinely inseparable.

Ask everything you need in one batch (e.g. one `AskUserQuestion` call, or one
consolidated message) rather than trickling questions out one at a time -- the
user shouldn't have to go back and forth more than once to get a spec written.

## Writing the spec

Once you have real answers (not assumptions) for the blocking dimension and the
always-ask dimensions, write the spec to `specs/<slug>.md` at the project root
(create the `specs/` directory if it doesn't exist). Derive `<slug>` from the
title in kebab-case, e.g. `specs/reject-empty-email-on-signup.md`. If that file
already exists, ask whether to overwrite it or save alongside it with a `-2`
suffix -- don't silently clobber a spec that might represent someone else's
work in progress.

Use this exact template:

```markdown
# <Title>

## Summary
One or two sentences: what this feature/fix does and why, in plain language.

## Scope
One coherent behavior this spec covers. If it was split from a larger request,
say so here.

## Acceptance criteria
Plain "must" statements. Each one should be independently testable -- if a
bullet has "and" joining two unrelated checks, split it into two bullets.
- The system must ...
- The system must ...

## Edge cases and error handling
What must happen for empty/invalid/boundary input and failure states. Every
edge case you asked about goes here with its answer -- this is what stops the
test-writer from guessing.
- When ..., the system must ...

## Out of scope
Explicitly not covered by this spec, so the code-writer doesn't over-build.
- ...

## Context / notes
Optional: relevant existing files, conventions, or prior art worth pointing to.
Do not mention end-to-end / browser testing here (see "Keep specs free of e2e").

## Open questions
Only include this section if something genuinely couldn't be resolved after
asking (rare -- if you did the interview above properly, this should usually be
empty or omitted entirely).
```

Keep every acceptance-criteria and edge-case bullet phrased as an observable,
testable outcome ("must show X", "must return Y", "must reject Z") rather than
an implementation detail ("must use a regex") -- the test-writer needs to know
what to assert on, not how to build it. Implementation choices belong to the
code-writer, not the spec.

## Keep specs free of e2e

A spec is handed to `tdd-pipeline`, whose agents act on whatever it mentions.
If a spec brings up Playwright, `e2e/`, or "optional e2e checks" -- even as a
suggestion or an out-of-scope note -- an agent downstream may treat that as a
cue to write or run browser tests. The user wants e2e testing to happen only
when they invoke it themselves (via the `playwright-tester` skill), never as a
side effect of a spec.

So, in every section of the spec (acceptance criteria, edge cases, out of
scope, context/notes):

- Do not mention Playwright, Cypress, `e2e/`, end-to-end, or browser-automation
  tests, and do not suggest e2e checks -- not even as "optional".
- Do not write criteria that can only be verified in a real browser (e.g. real
  navigation, HTTP status of a live server, pixel/visual layout). Phrase them as
  what a unit or component test can observe: rendered output, attributes,
  props, DOM structure, text, links, accessible names.
- If the project has an existing e2e suite, ignore it when filling in Context /
  notes; point only to unit-level conventions (e.g. the Vitest + Testing
  Library setup and existing `*.test.*` files).
- If something genuinely needs a live browser to verify, leave it out of the
  spec and tell the user in your reply that it isn't covered, so they can
  decide whether to run `playwright-tester` on their own.

## Example

**User asks:** "spec out a feature where users can't submit the contact form
with an empty message"

**You ask** (one batch): What should the user see when they try to submit with
an empty message -- inline error text, a blocked submit button, both? Does
"empty" include whitespace-only input? Should any other field's validation
change, or is this scoped to the message field only?

**User answers:** Inline error text under the field, submit stays disabled
either way; whitespace-only counts as empty; scoped to message field only.

**You write** `specs/reject-empty-contact-message.md` with acceptance criteria
like "The system must show an inline error under the message field when the
form is submitted with an empty message" and "The system must treat
whitespace-only input as empty," plus an Out of Scope line noting other fields'
validation is unchanged.

## After saving

Tell the user the file path and that it's ready to hand to the pipeline, e.g.:
"Saved to `specs/reject-empty-contact-message.md`. Run the TDD pipeline against
it whenever you're ready." Don't invoke `tdd-pipeline` yourself unless the user
asks you to in the same breath -- this skill's job ends at producing the spec.
