/**
 * catalog — read-only view over the shelf's skills.
 *
 * Pure logic, shared by the /shelf browser and the pi_shelf_search tool:
 * list every skills/<name>/SKILL.md, parse its frontmatter (name, description,
 * disable-model-invocation), and search by name + description text.
 * No tags, no settings, no toggling.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(PACKAGE_ROOT, "skills");

export interface SkillEntry {
	/** Directory name under skills/ — also the /skill:name handle. */
	name: string;
	description: string;
	dark: boolean;
}

// The shelf only changes at pi startup (pi update + the darkness enforcer in
// shelf.ts), so a module-level snapshot is safe for the session. Without it the
// browser re-reads and re-parses every SKILL.md on every keystroke.
let cache: SkillEntry[] | null = null;

/** Invalidate the snapshot (called by the startup enforcer after rewrites). */
export function invalidate(): void {
	cache = null;
}

/** Parse the text between the leading --- markers. Throws when there is no frontmatter. */
export function parseFrontmatter(text: string): any {
	const parts = text.split(/^---\n/m);
	if (parts.length < 3) throw new Error("no frontmatter");
	return Bun.YAML.parse(parts[1]);
}

/** All shelf skills, sorted by name. A directory counts as a skill iff it has a SKILL.md. */
export function listSkills(): SkillEntry[] {
	if (cache) return cache;
	if (!fs.existsSync(SKILLS_DIR)) return [];
	const entries = fs
		.readdirSync(SKILLS_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, "SKILL.md")))
		.map((d) => {
			const dir = d.name;
			let description = "";
			let dark = false;
			try {
				const fm = parseFrontmatter(fs.readFileSync(path.join(SKILLS_DIR, dir, "SKILL.md"), "utf8"));
				if (typeof fm?.description === "string") description = fm.description;
				dark = fm?.["disable-model-invocation"] === true;
			} catch {
				/* unparseable frontmatter: bare entry, still browsable */
			}
			return { name: dir, description, dark };
		})
		.sort((a, b) => a.name.localeCompare(b.name));
	cache = entries;
	return entries;
}

/** Case-insensitive substring match over name + description. Empty query matches everything. */
export function search(query: string): SkillEntry[] {
	const q = query.trim().toLowerCase();
	const all = listSkills();
	if (!q) return all;
	return all.filter(
		(s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
	);
}
