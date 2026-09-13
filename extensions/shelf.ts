/**
 * /pi-shelf — the shelf extension entry.
 *
 * Three jobs:
 * 1. Darkness enforcement: every skills/<name>/SKILL.md must carry
 *    `disable-model-invocation: true`. `pi update` restores shipped files, so
 *    this repairs the flag at every startup — writing only when something changed.
 * 2. /shelf — browse, search, and load (a command palette; see browser.ts).
 * 3. pi_shelf_search + the input suggester — let the agent answer "does the
 *    shelf have a skill for X?" and quietly offer candidates. Nothing loads
 *    without a human: skills are invoked by name (`/skill:name`), by hand or
 *    via enter in the browser.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { invalidate, listSkills, parseFrontmatter, search } from "./catalog";
import { openBrowser } from "./browser";
import { registerInputSuggester } from "./suggest";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(PACKAGE_ROOT, "skills");
const DARK_KEY = "disable-model-invocation";

/**
 * Re-apply `disable-model-invocation: true` to one SKILL.md.
 * Replaces an existing (false/other) value in place, or appends the key
 * before the closing `---`. Returns "rewritten" when the file changed,
 * "broken" when the frontmatter is unparseable (flag still appended).
 */
function enforceDarkness(file: string): "clean" | "rewritten" | "broken" {
	const original = fs.readFileSync(file, "utf8");
	const parts = original.split(/^---\n/m);
	if (parts.length < 3) return "broken";

	let fmText = parts[1];
	let broken = false;
	try {
		const fm = parseFrontmatter(original);
		if (fm?.[DARK_KEY] === true) return "clean"; // already dark
	} catch {
		broken = true; // unparseable frontmatter: still append the key
	}

	if (new RegExp(`^${DARK_KEY}:`, "m").test(fmText)) {
		fmText = fmText.replace(new RegExp(`^${DARK_KEY}:[^\n]*`, "m"), `${DARK_KEY}: true`);
	} else {
		if (!fmText.endsWith("\n")) fmText += "\n";
		fmText += `${DARK_KEY}: true\n`;
	}
	parts[1] = fmText;
	fs.writeFileSync(file, parts.join("---\n"));
	return broken ? "broken" : "rewritten";
}

/** Enforce darkness across the whole shelf. Returns the broken file names. */
function enforceAll(): string[] {
	if (!fs.existsSync(SKILLS_DIR)) return [];
	const broken: string[] = [];
	for (const d of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
		if (!d.isDirectory()) continue;
		const file = path.join(SKILLS_DIR, d.name, "SKILL.md");
		if (!fs.existsSync(file)) continue;
		if (enforceDarkness(file) === "broken") broken.push(d.name);
	}
	return broken;
}

export default function shelfExtension(pi: ExtensionAPI) {
	const broken = enforceAll();
	invalidate(); // enforcer may have rewritten SKILL.md files; drop any stale snapshot

	// Malformed frontmatter is otherwise silent (empty description, maybe undark)
	// — tell the human once per session which files need fixing.
	if (broken.length > 0) {
		pi.on("session_start", (_event, ctx) => {
			ctx.ui.notify(
				`pi-shelf: unparseable frontmatter in ${broken.join(", ")} — run \`bun tools/validate_skills.ts skills/\` to diagnose`,
				"warning",
			);
		});
	}

	// Quiet discovery: when the user's message strongly matches shelf skills,
	// the agent may offer them in one sentence — or say nothing. Never loads.
	registerInputSuggester(pi, {
		catalog: () =>
			listSkills().map((s) => ({ name: s.name, description: s.description })),
	});

	pi.registerCommand("shelf", {
		description: "Browse, search, and load pi-shelf skills",
		getArgumentCompletions: (prefix) =>
			listSkills()
				.filter((s) => s.name.startsWith(prefix.trim()))
				.map((s) => ({ value: s.name, label: s.name })),
		handler: async (args, ctx) => {
			await openBrowser(ctx.ui.custom, args, (skill) => {
				// Enter is the human act: expand /skill:<name> as if typed.
				pi.sendUserMessage(`/skill:${skill.name}`, {
					expandPromptTemplates: true,
				});
			});
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
