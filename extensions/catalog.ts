/**
 * catalog — read-only view over the shelf's skills.
 *
 * Pure logic, shared by the /shelf browser and the pi_shelf_search tool:
 * list every skills/<name>/SKILL.md, parse its frontmatter (name, description,
 * disable-model-invocation), and search by name + description text.
 * Disabling is metadata, not removal: a disabled skill is hidden from search,
 * suggestions, and the pi_shelf_search tool, but stays on disk (pi update
 * restores shipped files, so moving/deleting would not stick). The /skill:name
 * handle still works — pi owns that path; the shelf only curates discovery.
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
	/** Hidden from search/suggestions — toggled with `d` in the /shelf browser. */
	disabled: boolean;
}

const DISABLED_FILE = path.join(PACKAGE_ROOT, ".shelf-disabled");

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

/** Read the persisted disabled-list (a JSON array of skill names). */
function loadDisabled(): Set<string> {
	try {
		const parsed = JSON.parse(fs.readFileSync(DISABLED_FILE, "utf8"));
		return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === "string") : []);
	} catch {
		return new Set();
	}
}

/** Toggle a skill's disabled flag and persist it. */
export function setDisabled(name: string, disabled: boolean): void {
	const set = loadDisabled();
	if (disabled) set.add(name);
	else set.delete(name);
	fs.writeFileSync(DISABLED_FILE, `${JSON.stringify([...set].sort(), null, "\t")}\n`);
	invalidate();
}

/** All shelf skills, sorted by name. A directory counts as a skill iff it has a SKILL.md. */
export function listSkills(): SkillEntry[] {
	if (cache) return cache;
	if (!fs.existsSync(SKILLS_DIR)) return [];
	const disabled = loadDisabled();
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
			return { name: dir, description, dark, disabled: disabled.has(dir) };
		})
		.sort((a, b) => a.name.localeCompare(b.name));
	cache = entries;
	return entries;
}

/** Ranked, case-insensitive match over name + description: name-prefix
 *  matches first, then name-contains, then description-contains — so the list
 *  reorders usefully as you type instead of only filtering. Empty query: all. */
export function search(query: string, opts?: { includeDisabled?: boolean }): SkillEntry[] {
	const q = query.trim().toLowerCase();
	const all = listSkills().filter((s) => opts?.includeDisabled || !s.disabled);
	if (!q) return all;
	const rank = (s: SkillEntry): number =>
		s.name.toLowerCase().startsWith(q) ? 0
		: s.name.toLowerCase().includes(q) ? 1
		: s.description.toLowerCase().includes(q) ? 2
		: 3;
	return all
		.map((s) => ({ s, r: rank(s) }))
		.filter((x) => x.r < 3)
		.sort((a, b) => a.r - b.r || a.s.name.localeCompare(b.s.name))
		.map((x) => x.s);
}
