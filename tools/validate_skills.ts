#!/usr/bin/env bun
// Deterministic skill validator (ported from an upstream validate_skills script).
// Usage: bun tools/validate_skills.ts [dirs...]   (default: skills/)
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, basename, dirname, relative, extname } from "node:path";

const rootDirs = process.argv.slice(2).length ? process.argv.slice(2) : ["skills/"];
const SKIP_DIRS = new Set(["node_modules", ".git"]);
const SCAN_EXTENSIONS = new Set([".md", ".yaml", ".yml"]);

const NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TIME_ESTIMATE_PATTERNS = [
  /takes?\s+\d+\s*min/i,
  /takes?\s+about\s+\d+\s+minutes?/i,
  /~\s*\d+\s*min/i,
  /estimated\s+time/i,
  /\bETA\b/,
];
const COMPILE_TIME_SUB_REGEX = /\{\{-?\s*(?:config|workflow)\.[^}]*\}\}/;
const INSTALLED_PATH_RE = /installed_path/i;

const findings: { rule: string; path: string; message: string }[] = [];

function walk(dir: string, fn: (p: string) => void, top = true): void {
  let entries: string[];
  try {
    entries = readdirSync(dir).sort();
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e)) continue;
    const full = join(dir, e);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, fn, false);
    else fn(full);
  }
}

function discoverSkillDirs(): string[] {
  const dirs: string[] = [];
  for (const root of rootDirs) {
    if (!existsSync(root)) continue;
    walk(root, () => {}, false);
    // walk with dir visitor instead:
    const stack = [root];
    while (stack.length) {
      const d = stack.pop()!;
      for (const e of readdirSync(d).sort()) {
        if (SKIP_DIRS.has(e)) continue;
        const full = join(d, e);
        try {
          if (!statSync(full).isDirectory()) continue;
        } catch {
          continue;
        }
        if (existsSync(join(full, "SKILL.md"))) dirs.push(full);
        stack.push(full);
      }
    }
  }
  return dirs.sort();
}

function frontmatterBlock(content: string): string | null {
  const trimmed = content.replace(/^\s+/, "");
  if (!trimmed.startsWith("---")) return null;
  let end = trimmed.indexOf("\n---\n", 3);
  if (end === -1) {
    if (trimmed.endsWith("\n---")) end = trimmed.length - 4;
    else return null;
  }
  return trimmed.slice(3, end).trim();
}

function stripQuotes(v: string): string {
  if (
    (v.startsWith("'") && v.endsWith("'")) ||
    (v.startsWith('"') && v.endsWith('"'))
  )
    return v.slice(1, -1);
  return v;
}

function parseFrontmatter(content: string): Record<string, string> | null {
  const block = frontmatterBlock(content);
  if (block === null) return null;
  const result: Record<string, string> = {};
  let currentKey: string | null = null;
  let currentValue = "";
  for (const line of block.split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0 && !/^[ \t]/.test(line)) {
      if (currentKey !== null) result[currentKey] = stripQuotes(currentValue.trim());
      currentKey = line.slice(0, colon).trim();
      currentValue = line.slice(colon + 1);
    } else if (currentKey !== null) {
      if (line.trim().startsWith("#")) continue;
      currentValue += "\n" + line;
    }
  }
  if (currentKey !== null) result[currentKey] = stripQuotes(currentValue.trim());
  return result;
}

function stripCodeBlocks(content: string): string {
  return content.replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, ""));
}

function add(rule: string, path: string, message: string) {
  findings.push({ rule, path, message });
}

for (const dir of discoverSkillDirs()) {
  const dirName = basename(dir);
  const skillMd = join(dir, "SKILL.md");
  const files: string[] = [];
  walk(dir, (p) => files.push(p));
  files.sort();

  if (!existsSync(skillMd)) {
    add("SKILL-01", dir, "SKILL.md not found in skill directory.");
    continue;
  }

  const content = readFileSync(skillMd, "utf8");
  const fm = parseFrontmatter(content);

  if (!fm || !("name" in fm)) {
    add("SKILL-02", skillMd, "Frontmatter is missing the `name` field.");
  } else if (fm.name === "") {
    add("SKILL-02", skillMd, "Frontmatter `name` field is empty.");
  }
  if (!fm || !("description" in fm)) {
    add("SKILL-03", skillMd, "Frontmatter is missing the `description` field.");
  } else if (fm.description === "") {
    add("SKILL-03", skillMd, "Frontmatter `description` field is empty.");
  }

  const name = fm?.name;
  const description = fm?.description;

  if (name) {
    if (name.length > 64 || !NAME_REGEX.test(name)) {
      add(
        "SKILL-04",
        skillMd,
        `name "${name}" is not lowercase letters/digits/hyphens (max 64 chars).`
      );
    }
    if (name !== dirName) {
      add("SKILL-05", skillMd, `name "${name}" does not match directory name "${dirName}".`);
    }
  }

  if (description) {
    if (description.length > 1024) {
      add(
        "SKILL-06",
        skillMd,
        `description is ${description.length} characters (max 1024).`
      );
    }
  }

  // Body content after frontmatter
  const trimmed = content.replace(/^\s+/, "");
  let body = trimmed;
  if (trimmed.startsWith("---")) {
    const endIdx = trimmed.indexOf("\n---\n", 3);
    if (endIdx !== -1) body = trimmed.slice(endIdx + 4);
    else if (trimmed.endsWith("\n---")) body = trimmed.slice(trimmed.length);
  }
  if (body.trim() === "") {
    add("SKILL-07", skillMd, "SKILL.md has no content after frontmatter.");
  }

  for (const file of files) {
    if (!SCAN_EXTENSIONS.has(extname(file))) continue;
    const fileContent = readFileSync(file, "utf8");
    const stripped = stripCodeBlocks(fileContent);
    const lines = stripped.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (INSTALLED_PATH_RE.test(lines[i])) {
        add("PATH-02", file, `\`installed_path\` reference found (line ${i + 1}).`);
      }
      if (COMPILE_TIME_SUB_REGEX.test(lines[i])) {
        add(
          "TPL-01",
          file,
          `Render-time {{ config.* }} / {{ workflow.* }} expression found (line ${i + 1}).`
        );
      }
      for (const pat of TIME_ESTIMATE_PATTERNS) {
        if (pat.test(lines[i])) {
          add("SEQ-02", file, `Time estimate pattern found (line ${i + 1}): "${lines[i].trim()}"`);
          break;
        }
      }
    }
  }
}

const cwd = process.cwd();
for (const f of findings) {
  console.log(`${f.rule} ${relative(cwd, f.path) || f.path}: ${f.message}`);
}
console.log(`\n${findings.length} finding(s) across ${rootDirs.join(", ")}`);
process.exit(findings.length > 0 ? 1 : 0);
