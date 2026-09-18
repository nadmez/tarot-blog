---
name: sync-claude-memories
description: Copy Claude Code project memories into this repo's .cursor/rules. Use when the user asks to sync Claude memories, copy Claude memory files into Cursor rules, refresh claude-memory-*.mdc files, or run the sync-claude-memories agent. Never use this skill to write user-level Cursor rules or to copy memories from a different project.
disable-model-invocation: true
---

# Sync Claude memories into this project

Copy Claude Code memories for **the current workspace only** into `.cursor/rules/claude-memory-*.mdc`.

This skill is manual. Do not run it unless the user asked to sync, copy, or refresh Claude memories.

## Guardrails

- Write only inside this repo's `.cursor/rules/`.
- Never write to `~/.cursor/rules`, user rules, or another project's `.cursor/rules`.
- Never copy memories from a Claude project folder that does not match this workspace path.
- Never copy session transcripts (`.jsonl`), settings, secrets, or Claude plugins.
- Only create or update files that include `managed-by: sync-claude-memories`.
- Leave every other Cursor rule untouched.

## Workflow

1. Confirm the git root is this workspace. Stop if the user is not in a project they asked to sync.
2. Run the locator. From the repo root:

```bash
node .cursor/skills/sync-claude-memories/scripts/find-claude-memory.mjs
```

Pass the git root as an argument if the current directory is unclear:

```bash
node .cursor/skills/sync-claude-memories/scripts/find-claude-memory.mjs "<git-root>"
```

3. If the script exits non-zero or `ok` is false, stop. Tell the user this workspace has no matching Claude memory folder. Do not search sibling Claude projects for a fallback.
4. For each `memories[]` item, write `.cursor/rules/<ruleFile>` using the template below.
5. Delete managed `claude-memory-*.mdc` files whose source memory no longer exists.
6. Report created, updated, unchanged, and deleted files. Quote the Claude source path that was used.

## Rule template

```markdown
---
description: <memory description, plus "Applies only to this repository.">
alwaysApply: true
---

<!-- managed-by: sync-claude-memories -->
<!-- source-memory: <file> -->

# <short title> (this repo only)

<actionable body from the Claude memory>

Apply this only while working in this repository.
```

Keep each rule under 50 lines. Drop Claude-only metadata (`originSessionId`, `modified`, `node_type`). Rewrite the body as an instruction Cursor should follow, not as a chat recap.

`alwaysApply: true` is safe because these files live in **this repo**. Do not copy them into global Cursor config.

## Manual invocation

Ask in this project's Cursor chat:

- `Use the sync-claude-memories agent`
- `Sync Claude memories into Cursor rules`

Or attach the skill with `@sync-claude-memories`.
