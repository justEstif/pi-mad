/**
 * /pi-mad — enable/disable pi-mad skills from inside the session.
 *
 * Usage:
 *   /pi-mad                    interactive toggle browser (changes save immediately)
 *   /pi-mad list               show enabled/disabled state
 *   /pi-mad on <skill...>      enable skills
 *   /pi-mad off <skill...>     disable skills
 *   /pi-mad reset              enable all (drop filters)
 *
 * Writes the pi-mad entry in your settings (`~/.pi/agent/settings.json`, or a
 * project `.pi/settings.json` if the package entry lives there) using the
 * package object form's exclusion filters — e.g. { skills: ["!prd-coach"] } —
 * so `pi update` and manual edits stay compatible. Restart pi to apply.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Container, DynamicBorder, type SelectItem, SelectList, Text } from "@earendil-works/pi-tui";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(PACKAGE_ROOT, "skills");
const MARKER = "pi-mad";

interface SettingsLocation {
	file: string;
	scope: "global" | "project";
	settings: any;
	entry: any; // the packages[] element for this package (string index kept separately)
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
function locate(): SettingsLocation | null {
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

function listSkills(): string[] {
	if (!fs.existsSync(SKILLS_DIR)) return [];
	return fs
		.readdirSync(SKILLS_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, d.name, "SKILL.md")))
		.map((d) => d.name)
		.sort();
}

function globToRegex(pattern: string): RegExp {
	const escaped = pattern
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "\0")
		.replace(/\*/g, "[^/]*")
		.replace(/\0/g, ".*")
		.replace(/\?/g, "[^/]");
	return new RegExp(`^${escaped}$`);
}

/** Exclusion filters (`!pattern` / `-exact`) inside the entry's skills filter. */
function exclusions(entry: any): string[] {
	if (typeof entry === "string" || !Array.isArray(entry?.skills)) return [];
	return entry.skills.filter((f: string) => typeof f === "string" && /^[!-]/.test(f));
}

function isEnabled(entry: any, skill: string): boolean {
	const rel = `skills/${skill}`;
	return !exclusions(entry).some((p) => {
		const pattern = p.slice(1); // strip ! or -
		return p.startsWith("-") ? pattern === rel : globToRegex(pattern).test(rel);
	});
}

/** Ensure object form, then apply exclusions = exactly the given set. Empty set -> key removed (load all). */
function setEnabled(loc: SettingsLocation, enabledSet: Set<string>, allSkills: string[]): void {
	let entry = loc.entry;
	if (typeof entry === "string") {
		entry = { source: entry };
		loc.settings.packages[loc.index] = entry;
		loc.entry = entry;
	}
	const filters: string[] = [];
	for (const skill of allSkills) {
		if (!enabledSet.has(skill)) filters.push(`!skills/${skill}`);
	}
	// preserve any non-exclusion filters the user added by hand
	const userFilters = Array.isArray(entry.skills) ? entry.skills.filter((f: string) => !/^[!-]/.test(f)) : [];
	entry.skills = [...filters, ...userFilters];
	if (entry.skills.length === 0) delete entry.skills;
	writeJson(loc.file, loc.settings);
}

export default function piMadExtension(pi: ExtensionAPI) {
	const allSkills = listSkills();

	const applyVerb = (
		ctx: any,
		verb: "on" | "off" | "reset",
		names: string[],
	): void => {
		const loc = locate();
		if (!loc) {
			ctx.ui.notify("pi-mad package entry not found in global or project settings", "error");
			return;
		}
		const enabled = new Set(allSkills.filter((s) => isEnabled(loc.entry, s)));
		if (verb === "reset") {
			names = allSkills;
		} else {
			const unknown = names.filter((n) => !allSkills.includes(n));
			if (unknown.length) {
				ctx.ui.notify(`unknown skills: ${unknown.join(", ")}`, "error");
				return;
			}
		}
		for (const n of names) verb === "off" ? enabled.delete(n) : enabled.add(n);
		setEnabled(loc, enabled, allSkills);
		ctx.ui.notify(`pi-mad: ${enabled.size}/${allSkills.length} enabled (${loc.scope}) — restart pi to apply`, "info");
	};

	pi.registerCommand("pi-mad", {
		description: "Enable/disable pi-mad skills",
		getArgumentCompletions: (prefix) => {
			const words = prefix.split(/\s+/).filter(Boolean);
			const verb = words[0] ?? "";
			if (verb === "on" || verb === "off") {
				const partial = words[1] ?? "";
				return allSkills.filter((s) => s.startsWith(partial)).map((s) => ({ value: s, label: s }));
			}
			if (words.length <= 1 && ["list", "reset", "on", "off"].some((v) => v.startsWith(verb))) {
				return ["list", "on", "off", "reset"].map((v) => ({ value: v, label: v }));
			}
			return null;
		},
		handler: async (args, ctx) => {
			const [verb, ...names] = args.trim().split(/\s+/).filter(Boolean);

			if (verb === "on" || verb === "off" || verb === "reset") {
				if (verb !== "reset" && names.length === 0) {
					ctx.ui.notify(`Usage: /pi-mad ${verb} <skill...>`, "error");
					return;
				}
				applyVerb(ctx, verb, names);
				return;
			}

			if (verb === "list") {
				const loc = locate();
				if (!loc) {
					ctx.ui.notify("pi-mad package entry not found in settings", "error");
					return;
				}
				const lines = allSkills.map(
					(s) => `${isEnabled(loc.entry, s) ? "✓" : "✗"} ${s}`,
				);
				ctx.ui.notify(`${loc.scope}: ${loc.file}\n${lines.join("\n")}`, "info");
				return;
			}

			// Interactive browser
			const loc = locate();
			if (!loc) {
				ctx.ui.notify("pi-mad package entry not found in global or project settings", "error");
				return;
			}
			const enabled = new Set(allSkills.filter((s) => isEnabled(loc.entry, s)));
			let dirty = false;

			const items = (): SelectItem[] =>
				allSkills.map((s) => ({
					value: s,
					label: `${enabled.has(s) ? "✓" : "✗"} ${s}`,
					description: enabled.has(s) ? "enabled" : "disabled",
				}));

			await ctx.ui.custom<void>((tui, theme, _kb, done) => {
				let query = "";
				const container = new Container();
				container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));
				const header = new Text(theme.fg("accent", theme.bold(`pi-mad skills — ${enabled.size}/${allSkills.length} enabled · ${loc.scope}`)), 1, 0);
				container.addChild(header);
				const searchLine = new Text(theme.fg("muted", "search: │"), 1, 0);
				container.addChild(searchLine);
				const selectList = new SelectList(items(), Math.min(allSkills.length, 14), {
					selectedPrefix: (t: string) => theme.fg("accent", t),
					selectedText: (t: string) => theme.fg("accent", t),
					description: (t: string) => theme.fg("muted", t),
					scrollInfo: (t: string) => theme.fg("dim", t),
					noMatch: (t: string) => theme.fg("warning", t),
				});
								selectList.onSelect = (item: SelectItem) => {
					const name = item.value as string;
					const nowEnabled = !enabled.has(name);
					if (nowEnabled) enabled.add(name);
					else enabled.delete(name);
					dirty = true;
					setEnabled(loc, enabled, allSkills);
					// SelectList stores items by reference — mutate in place and rerender
					item.label = `${nowEnabled ? "✓" : "✗"} ${name}`;
					item.description = nowEnabled ? "enabled" : "disabled";
					header.setText(theme.fg("accent", theme.bold(`pi-mad skills — ${enabled.size}/${allSkills.length} enabled · ${loc.scope} (saved)`)));
					tui.requestRender();
				};
				selectList.onCancel = () => done();
				container.addChild(selectList);
				container.addChild(new Text(theme.fg("dim", "enter toggle (saves) • type to search • ↑↓ navigate • esc close"), 1, 0));
				container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));
				const updateSearch = () => {
					searchLine.setText(theme.fg("muted", `search: ${query}│`));
					selectList.setFilter(query);
				};
				return {
					render: (w: number) => container.render(w),
					invalidate: () => container.invalidate(),
					handleInput: (data: string) => {
						if (/^[\x20-\x7E]$/.test(data)) {
							query += data;
							updateSearch();
						} else if (data === "\x7f") {
							query = query.slice(0, -1);
							updateSearch();
						} else {
							selectList.handleInput(data);
						}
						tui.requestRender();
					},
				};
			});

			if (dirty) ctx.ui.notify("pi-mad: saved — restart pi to apply", "info");
		},
	});
}
