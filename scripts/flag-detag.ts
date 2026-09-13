#!/usr/bin/env bun
// For every skills/SKILL.md:
//  - remove the `metadata:` block (metadata: line + its indented tag lines)
//   - ensure `disable-model-invocation: true` in frontmatter
// Everything else preserved byte-for-byte. Idempotent.

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const skillsDir = join(import.meta.dir, "..", "skills");

let flagged = 0;
let metadataRemoved = 0;

for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const path = join(skillsDir, entry.name, "SKILL.md");
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    console.error(`SKIP (no SKILL.md): ${entry.name}`);
    continue;
  }

  // Locate frontmatter
  if (!content.startsWith("---\n")) {
    console.error(`SKIP (no frontmatter): ${entry.name}`);
    continue;
  }
  const end = content.indexOf("\n---\n", 3);
  if (end === -1) {
    console.error(`SKIP (unterminated frontmatter): ${entry.name}`);
    continue;
  }
  const fm = content.slice(0, end); // includes leading ---\n

  let newFm = fm;
  let removed = false;

  // Remove metadata: block: the `metadata:` line plus following more-indented lines
  const lines = newFm.split("\n");
  const out: string[] = [];
  let skipping = false;
  for (const line of lines) {
    if (/^metadata:\s*$/.test(line)) {
      skipping = true;
      removed = true;
      continue;
    }
    if (skipping) {
      if (line === "" || /^[ \t]+\S/.test(line) || /^\s*#/.test(line)) continue;
      skipping = false;
    }
    out.push(line);
  }
  newFm = out.join("\n");

  if (removed) metadataRemoved++;

  if (!/^disable-model-invocation:/m.test(newFm)) {
    // insert after description line
    const descIdx = newFm.split("\n").findIndex((l) => /^description:/.test(l));
    const insertAt = descIdx === -1 ? newFm.split("\n").length - 1 : descIdx + 1;
    const ls = newFm.split("\n");
    ls.splice(insertAt, 0, "disable-model-invocation: true");
    newFm = ls.join("\n");
    flagged++;
    console.log(`FLAG: ${entry.name}`);
  } else {
    console.log(`OK (already flagged): ${entry.name}`);
  }

  const updated = newFm + content.slice(end);
  if (updated !== content) writeFileSync(path, updated);
}

console.log(`\nDone. flagged=${flagged} metadataBlocksRemoved=${metadataRemoved}`);
