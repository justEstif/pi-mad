/**
 * /pi-shelf — the shelf extension entry.
 *
 * Two jobs:
 * 1. Darkness enforcement: every skills/<name>/SKILL.md must carry
 *    `disable-model-invocation: true`. `pi update` restores shipped files, so
 *    this repairs the flag at every startup — writing only when something changed.
 * 2. pi_shelf_search
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import { invalidate, listSkills, parseFrontmatter, search } from "./catalog";

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

/** Levenshtein distance — small enough to inline. */
function editDistance(a: string, b: string): number {
	const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
	for (let j = 0; j <= b.length; j++) dp[0][j] = j;
	for (let i = 1; i <= a.length; i++)
		for (let j = 1; j <= b.length; j++)
			dp[i][j] = Math.min(
				dp[i - 1][j] + 1,
				dp[i][j - 1] + 1,
				dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
	return dp[a.length][b.length];
}

/** "Did you mean" for /skill:<name> misses: when the user invokes an unknown
 *  skill name, steer the closest catalog name (edit distance <= 2) so pi's own
 *  unknown-skill error is immediately followed by the fix. */
function registerSkillTypoGuard(pi: ExtensionAPI): void {
	const seen = new Set<string>();
	pi.on("input", (event) => {
		const m = event.text.trim().match(/^\/skill:([a-z0-9-]+)\s*$/i);
		if (!m) return;
		const typed = m[1].toLowerCase();
		if (seen.has(typed)) return;
		const names = listSkills().map((s) => s.name);
		if (names.includes(typed)) return;
		const near = names
			.map((n) => ({ n, d: editDistance(typed, n) }))
			.filter((x) => x.d <= 2)
			.sort((a, b) => a.d - b.d)[0];
		if (!near) return;
		seen.add(typed);
		pi.sendUserMessage(
			`[pi-shelf] no skill named "${typed}" — did you mean /skill:${near.n}?`,
			{ deliverAs: "steer" },
		);
	});
}

export default function shelfExtension(pi: ExtensionAPI) {
	registerSkillTypoGuard(pi);
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
