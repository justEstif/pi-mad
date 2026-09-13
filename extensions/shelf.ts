/**
 * /pi-shelf — the shelf extension entry.
 *
 * Three jobs:
 * 1. Darkness enforcement: every skills/<name>/SKILL.md must carry
 *    `disable-model-invocation: true`. `pi update` restores shipped files, so
 *    this repairs the flag at every startup — writing only when something changed.
 * 2. /shelf — browse and search the catalog (read-only; see browser.ts).
 * 3. pi_shelf_search — let the agent answer "does the shelf have a skill for X?"
 *    from name + description only. It never loads a skill; skills are invoked
 *    by name (`/skill:name`) by a human.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { listSkills, parseFrontmatter, search } from "./catalog";
import { openBrowser } from "./browser";
import { registerInputSuggester } from "./lib/gates";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(PACKAGE_ROOT, "skills");
const DARK_KEY = "disable-model-invocation";

/**
 * Re-apply `disable-model-invocation: true` to one SKILL.md.
 * Replaces an existing (false/other) value in place, or appends the key
 * before the closing `---`. Returns true when the file was rewritten.
 */
function enforceDarkness(file: string): boolean {
	const original = fs.readFileSync(file, "utf8");
	const parts = original.split(/^---\n/m);
	if (parts.length < 3) return false;

	let fmText = parts[1];
	try {
		const fm = parseFrontmatter(original);
		if (fm?.[DARK_KEY] === true) return false; // already dark
	} catch {
		/* unparseable frontmatter: still append the key */
	}

	if (new RegExp(`^${DARK_KEY}:`, "m").test(fmText)) {
		fmText = fmText.replace(new RegExp(`^${DARK_KEY}:[^\n]*`, "m"), `${DARK_KEY}: true`);
	} else {
		if (!fmText.endsWith("\n")) fmText += "\n";
		fmText += `${DARK_KEY}: true\n`;
	}
	parts[1] = fmText;
	fs.writeFileSync(file, parts.join("---\n"));
	return true;
}

/** Enforce darkness across the whole shelf. Returns the number of files rewritten. */
function enforceAll(): number {
	if (!fs.existsSync(SKILLS_DIR)) return 0;
	let fixed = 0;
	for (const d of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
		if (!d.isDirectory()) continue;
		const file = path.join(SKILLS_DIR, d.name, "SKILL.md");
		if (fs.existsSync(file) && enforceDarkness(file)) fixed++;
	}
	return fixed;
}

export default function shelfExtension(pi: ExtensionAPI) {
	enforceAll();
	// Optional discovery: when the user's message matches shelf skills, mention
	// them to the model as suggestions (never loads, never blocks, rate-limited).
	registerInputSuggester(pi, {
		catalog: () =>
			listSkills().map((s) => ({ name: s.name, description: s.description })),
		threshold: 1,
		limit: 3,
		cooldownMs: 5 * 60_000,
	});

	pi.registerCommand("shelf", {
		description: "Browse and search the pi-shelf skill catalog",
		getArgumentCompletions: (prefix) =>
			listSkills()
				.filter((s) => s.name.startsWith(prefix.trim()))
				.map((s) => ({ value: s.name, label: s.name })),
		handler: async (args, ctx) => {
			await openBrowser(ctx.ui.custom, args);
		},
	});

	pi.registerTool({
		name: "pi_shelf_search",
		label: "pi-shelf search",
		description:
			"Search the pi-shelf skill catalog by name and description. Returns matching skills with " +
			"one-line descriptions; never loads them. Skills are dark (never auto-invoked) — suggest " +
			"them by name and let the user invoke `/skill:name` to load one.",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "What to look for (matched against skill names and descriptions)",
				},
				limit: {
					type: "number",
					description: "Maximum number of results (default 8)",
				},
			},
			required: ["query"],
		},
		execute: async (_toolCallId, params) => {
			const matches = search(params.query).slice(0, params.limit ?? 8);
			const lines = matches.map((s) => `${s.name} — ${s.description || "(no description)"} · invoke: /skill:${s.name}`);
			const text =
				(lines.length > 0 ? lines.join("\n") : "No matching skills on the shelf.") +
				"\nAll shelf skills are dark (disable-model-invocation) — they never load automatically. " +
				"Invoke by name: /skill:<name>.";
			return { content: [{ type: "text", text }], details: {} };
		},
	});
}
