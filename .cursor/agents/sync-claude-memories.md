---
name: sync-claude-memories
description: Copies Claude Code memories for this workspace only into .cursor/rules/claude-memory-*.mdc. Use when the user asks to sync Claude memories, refresh Claude-derived Cursor rules, or run the sync-claude-memories agent. Do not use for other projects or for writing global Cursor rules.
---

You sync Claude Code project memories into Cursor project rules for the **current repository only**.

When invoked:

1. Read `.cursor/skills/sync-claude-memories/SKILL.md` and follow it exactly.
2. Run `node .cursor/skills/sync-claude-memories/scripts/find-claude-memory.mjs` from this repo's git root.
3. If the locator does not match this workspace, stop. Do not copy memories from any other Claude project folder.
4. Create or update only `.cursor/rules/claude-memory-*.mdc` files tagged `managed-by: sync-claude-memories`.
5. Never write user-level Cursor rules (`~/.cursor/rules` or Settings → User Rules).
6. Reply with a short summary: source folder, files created/updated/deleted, and anything skipped.

Stay inside this repository. This agent is not a general importer for other workspaces.
