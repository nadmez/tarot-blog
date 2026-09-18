#!/usr/bin/env node
/**
 * Locate Claude Code memory files that belong to THIS workspace only.
 * Refuses to return memories from any other Claude project folder.
 */
import { homedir } from "node:os";
import { join, basename } from "node:path";
import { readdir, readFile, access, constants } from "node:fs/promises";
import { execSync } from "node:child_process";

function encodeClaudeProjectDir(absPath) {
  return absPath.replace(/[^A-Za-z0-9]/g, "-");
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { attrs: {}, body: raw.trim() };
  }

  const attrs = {};
  let currentKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const keyed = line.match(/^\s*([A-Za-z0-9_]+):\s*(.*)$/);
    if (keyed) {
      currentKey = keyed[1];
      attrs[currentKey] = keyed[2].replace(/^["']|["']$/g, "").trim();
      continue;
    }
    if (currentKey && /^\s+\S/.test(line)) {
      attrs[currentKey] = `${attrs[currentKey] ?? ""} ${line.trim()}`.trim();
    }
  }

  return { attrs, body: match[2].trim() };
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function looksSecret(text) {
  return /api[_-]?key|secret|password|credential|private[_-]?key|BEGIN (RSA |OPENSSH )?PRIVATE KEY/i.test(
    text,
  );
}

function resolveWorkspace(argv) {
  const requested = argv[2];
  if (requested) return requested;

  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf8",
    }).trim();
  } catch {
    return process.cwd();
  }
}

async function pathExists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function findMatchingProjectDir(projectsRoot, encodedName) {
  if (await pathExists(join(projectsRoot, encodedName))) {
    return encodedName;
  }

  const entries = await readdir(projectsRoot, { withFileTypes: true }).catch(
    () => [],
  );
  const match = entries.find(
    (entry) =>
      entry.isDirectory() &&
      entry.name.toLowerCase() === encodedName.toLowerCase(),
  );
  return match?.name ?? null;
}

async function main() {
  const workspace = resolveWorkspace(process.argv);
  const encodedName = encodeClaudeProjectDir(workspace);
  const projectsRoot = join(homedir(), ".claude", "projects");
  const matchedDir = await findMatchingProjectDir(projectsRoot, encodedName);
  const memoryDir = matchedDir
    ? join(projectsRoot, matchedDir, "memory")
    : null;

  if (!matchedDir || !(await pathExists(memoryDir))) {
    console.log(
      JSON.stringify(
        {
          ok: false,
          workspace,
          encodedName,
          error:
            "No Claude Code memory folder matches this workspace. Refusing to copy memories from any other project.",
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  const names = await readdir(memoryDir);
  const memories = [];

  for (const name of names) {
    if (!name.endsWith(".md") || name.toUpperCase() === "MEMORY.MD") continue;

    const path = join(memoryDir, name);
    const raw = await readFile(path, "utf8");
    const { attrs, body } = parseFrontmatter(raw);

    if (looksSecret(`${name}\n${raw}`)) continue;
    if (attrs.node_type && attrs.node_type !== "memory") continue;

    const slug = slugify(attrs.name || basename(name, ".md"));
    memories.push({
      file: name,
      path,
      name: attrs.name || basename(name, ".md"),
      description: attrs.description || "",
      type: attrs.type || "",
      slug,
      ruleFile: `claude-memory-${slug}.mdc`,
      body,
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        workspace,
        encodedName: matchedDir,
        memoryDir,
        indexFile: join(memoryDir, "MEMORY.md"),
        memories,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
