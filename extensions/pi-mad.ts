/**
 * /pi-mad — choose which pi-mad skills load. One command, no subcommands.
 *
 * Opens a checkbox browser: type to search (matches names AND tags), ↑↓ to
 * move, enter toggles the highlighted skill and saves immediately, esc closes.
 * An optional argument pre-fills the search — `/pi-mad coach` opens filtered
 * to the coach skills, `/pi-mad review` to the review family.
 *
 * Model: ALLOWLIST. All pi-mad skills are OFF by default; enabling a skill
 * adds `skills/<name>/**` to the package entry's `skills` filter in settings
 * (`~/.pi/agent/settings.json`, or a project `.pi/settings.json` if the entry
 * lives there). Empty array = none load; no `skills` key = all load.
 * New skills from package updates therefore stay OFF until enabled.
 *
 * First run: a one-time migration turns a fresh entry into `[]` (default-off)
 * and converts legacy `!skill` exclusion filters into an equivalent allowlist.
 * Changes apply on the next pi start (skills load at startup).
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey, truncateToWidth } from "@earendil-works/pi-tui";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(PACKAGE_ROOT, "skills");
const MARKER = "pi-mad";
const ROWS = 14;

interface SettingsLocation {
	file: string;
	scope: "global" | "project";
	settings: any;
	entry: any; // the packages[] element for this package
	index: number;
}

function readJson(file: string): any | null {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return null;
	}
}

function writeJson(file: string, data: any): void {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function isOurEntry(e: any): boolean {
	const source = typeof e === "string" ? e : e?.source;
	return typeof source === "string" && source.includes(MARKER);
}

/** Find the settings file whose packages[] contains this package. Global first, then project. */
export function locate(): SettingsLocation | null {
	const candidates: Array<{ file: string; scope: "global" | "project" }> = [
		{ file: path.join(os.homedir(), ".pi", "agent", "settings.json"), scope: "global" },
	];
	const project = path.join(process.cwd(), ".pi", "settings.json");
	if (project !== candidates[0].file) candidates.push({ file: project, scope: "project" });

	for (const { file, scope } of candidates) {
		const settings = readJson(file);
		if (!settings) continue;
		const packages = settings.packages;
		if (!Array.isArray(packages)) continue;
		const index = packages.findIndex(isOurEntry);
		if (index === -1) continue;
		return { file, scope, settings, entry: packages[index], index };
	}
	return null;
}

export function listSkills(): string[] {
	if (!fs.existsSync(SKILLS_DIR)) return [];
	return fs
		.readdirSync(SKILLS_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, "SKILL.md")))
		.map((d) => d.name)
		.sort();
}

const tagCache = new Map<string, string[]>();
function tagsFor(skill: string): string[] {
	if (tagCache.has(skill)) return tagCache.get(skill)!;
	let tags: string[] = [];
	try {
		const { fm } = extractFrontmatter(path.join(SKILLS_DIR, skill, "SKILL.md"));
		const raw = (fm.metadata as any)?.tags;
		if (typeof raw === "string") tags = raw.split(/[\s,]+/).filter(Boolean);
	} catch {
		/* unparseable frontmatter: no tags */
	}
	tagCache.set(skill, tags);
	return tags;
}

function extractFrontmatter(file: string): { fm: any } {
	const text = fs.readFileSync(file, "utf8");
	const parts = text.split(/^---\n/m);
	if (parts.length < 3) throw new Error("no frontmatter");
	return { fm: Bun.YAML.parse(parts[1]) };
}

/** Legacy v1 filters: `!glob` / `-exact` negations. Used only by the one-time migration. */
function legacyExcludes(entry: any, skill: string): boolean {
	if (typeof entry === "string" || !Array.isArray(entry?.skills)) return false;
	const rel = `skills/${skill}`;
	return entry.skills.some((f: string) => {
		if (typeof f !== "string" || !/^[!-]/.test(f)) return false;
		const pattern = f.slice(1);
		const regex = new RegExp(
			`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\0").replace(/\*/g, "[^/]*").replace(/\0/g, ".*")}$`,
		);
		return f.startsWith("-") ? pattern === rel : regex.test(rel);
	});
}

/** A skill loads iff there is no skills filter at all, or its allowlist entry is present. */
export function isEnabled(entry: any, skill: string): boolean {
	if (typeof entry === "string" || !Array.isArray(entry?.skills)) return true;
	return entry.skills.includes(`skills/${skill}/**`);
}

/** Write the allowlist: one glob per enabled skill. Empty set -> `[]` = none load. */
export function setAllowlist(loc: SettingsLocation, enabledSet: Set<string>): void {
	let entry = loc.entry;
	if (typeof entry === "string") {
		entry = { source: entry };
		loc.settings.packages[loc.index] = entry;
		loc.entry = entry;
	}
	entry.skills = [...enabledSet].sort().map((s) => `skills/${s}/**`);
	writeJson(loc.file, loc.settings);
}

/** All on: remove the skills filter entirely. */
export function clearFilter(loc: SettingsLocation): void {
	if (typeof loc.entry === "string") return;
	if (loc.entry.skills !== undefined) {
		delete loc.entry.skills;
		writeJson(loc.file, loc.settings);
	}
}

/** One-time migration to default-off + allowlist. Marker file prevents re-running after a manual reset. */
export function migrateOnce(): void {
	const loc = locate();
	if (!loc) return;
	const marker = path.join(path.dirname(loc.file), ".pi-mad-migrated");
	if (fs.existsSync(marker)) return;
	try {
		const skills = typeof loc.entry === "object" ? loc.entry.skills : undefined;
		if (!Array.isArray(skills)) {
			setAllowlist(loc, new Set()); // fresh install -> all OFF
		} else if (skills.some((f: any) => typeof f === "string" && /^[!-]/.test(f))) {
			setAllowlist(loc, new Set(listSkills().filter((s) => !legacyExcludes(loc.entry, s)))); // v1 -> allowlist
		}
	} finally {
		fs.writeFileSync(marker, "pi-mad default-off migration applied\n");
	}
}

export default function piMadExtension(pi: ExtensionAPI) {
	migrateOnce();
	const allSkills = listSkills();

	pi.registerCommand("pi-mad", {
		description: "Choose which pi-mad skills load (search + toggle, off by default)",
		getArgumentCompletions: (prefix) =>
			listSkills()
				.filter((s) => s.startsWith(prefix.trim()))
				.map((s) => ({ value: s, label: s })),
		handler: async (args, ctx) => {
			const loc = locate();
			if (!loc) {
				ctx.ui.notify("pi-mad package entry not found in global or project settings", "error");
				return;
			}
			const enabled = new Set(allSkills.filter((s) => isEnabled(loc.entry, s)));
			let saved = false;

			await ctx.ui.custom<void>((tui, theme, _kb, done) => {
				let query = args.trim();
				let sel = 0;

				const filtered = () => {
					const q = query.toLowerCase();
					if (!q) return allSkills;
					return allSkills.filter(
						(s) => s.toLowerCase().includes(q) || tagsFor(s).some((t) => t.toLowerCase().includes(q)),
					);
				};

				const toggle = (name: string) => {
					const nowEnabled = !enabled.has(name);
					if (nowEnabled) enabled.add(name);
					else enabled.delete(name);
					setAllowlist(loc, enabled);
					saved = true;
				};

				const border = () => theme.fg("accent", "─".repeat(200));

				return {
					render: (w: number) => {
						const list = filtered();
						if (sel >= list.length) sel = Math.max(0, list.length - 1);
						const start = Math.max(0, Math.min(sel - Math.floor(ROWS / 2), Math.max(0, list.length - ROWS)));
						const view = list.slice(start, start + ROWS);

						const lines: string[] = [border()];
						lines.push(
							theme.fg(
								"accent",
								theme.bold(
									` pi-mad skills — ${enabled.size}/${allSkills.length} enabled · ${loc.scope}${saved ? " · saved" : ""}`,
								),
							),
						);
						lines.push(theme.fg("muted", ` search: ${query}│`));
						if (list.length === 0) {
							lines.push(theme.fg("warning", " no matching skills"));
						}
						for (let i = 0; i < view.length; i++) {
							const name = view[i];
							const idx = start + i;
							const check = enabled.has(name) ? "✓" : "✗";
							const tags = tagsFor(name).join(", ");
							const prefix = idx === sel ? "❯ " : "  ";
							const label = `${prefix}${check} ${name}`;
							const tagText = tags ? theme.fg("muted", `  ${tags}`) : "";
							const raw = idx === sel ? theme.fg("accent", label) : label;
							lines.push(truncateToWidth(`${raw}${tagText}`, w));
						}
						if (list.length > ROWS) {
							lines.push(theme.fg("dim", ` ${start + 1}–${Math.min(start + ROWS, list.length)} of ${list.length}`));
						}
						lines.push(theme.fg("dim", " enter toggle · type to search · ↑↓ move · esc close — restart pi to apply"));
						lines.push(border());
						return lines.map((l) => truncateToWidth(l, w));
					},
					invalidate: () => {},
					handleInput: (data: string) => {
						const list = filtered();
						if (/^[\x20-\x7E]$/.test(data)) {
							query += data;
							sel = 0;
						} else if (data === "\x7f") {
							query = query.slice(0, -1);
							sel = 0;
						} else if (matchesKey(data, Key.up)) {
							sel = Math.max(0, sel - 1);
						} else if (matchesKey(data, Key.down)) {
							sel = Math.min(list.length - 1, sel + 1);
						} else if (matchesKey(data, Key.enter)) {
							if (list.length > 0) toggle(list[sel]);
						} else if (matchesKey(data, Key.escape) || data === "\x03") {
							done();
						}
						tui.requestRender();
					},
				};
			});

			ctx.ui.notify(`pi-mad: ${enabled.size}/${allSkills.length} enabled — restart pi to apply`, "info");
		},
	});
}
