/**
 * Catalog loader: reads (never writes) the shelf's SKILL.md frontmatter so
 * trigger evals judge against the real shipped descriptions.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SHELF_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "skills");

export interface CatalogEntry {
  id: string;
  description: string;
}

/** Extract the YAML `description:` value from a SKILL.md frontmatter block. */
export function loadDescription(skillId: string): string {
  const path = join(SHELF_ROOT, skillId, "SKILL.md");
  const text = readFileSync(path, "utf8");
  const m = text.match(/^description:\s*(.+)$/m);
  if (!m) throw new Error(`no description frontmatter in ${path}`);
  let raw = m[1].trim();
  if (raw.startsWith(">")) {
    // YAML folded scalar — collapse lines until a dedented key. Rare; simple fallback.
    raw = raw.slice(1);
  }
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1);
  }
  return raw.replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
}

export function loadCatalog(skillIds: string[]): CatalogEntry[] {
  return skillIds.map((id) => ({ id, description: loadDescription(id) }));
}
