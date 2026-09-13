/**
 * suggest — proactive (but quiet) skill discovery.
 *
 * Watches user messages, matches words against the catalog, and steer-mentions
 * candidate skills to the model — never loading, never blocking, rate-limited.
 * The model is explicitly permitted to stay silent; suggestions surface to the
 * human only when the agent offers them naturally.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export interface CatalogEntry {
	name: string;
	description: string;
}

export interface InputSuggesterOptions {
	/** Catalog to match against (name + description). */
	catalog: () => CatalogEntry[];
	/** Min word length considered. Default 5. */
	minWordLength?: number;
	/** Distinct matching words required per skill. Default 2 — one shared
	 *  word ("review", "design") hits too many descriptions to mean anything. */
	threshold?: number;
	/** Max suggestions per fire. Default 3. */
	limit?: number;
	/** Ms between fires. Default 5 min. */
	cooldownMs?: number;
}

const STOP = new Set([
	"about", "after", "again", "could", "doing", "every", "have", "here",
	"might", "please", "should", "their", "there", "these", "those", "want",
	"what", "where", "which", "while", "would", "your", "think", "stuff",
	"things", "something", "session", "little", "helps", "using",
]);

/** Match user message words against catalog names/descriptions and
 *  steer-mention candidates. Never blocks, never loads. */
export function registerInputSuggester(
	pi: ExtensionAPI,
	options: InputSuggesterOptions,
): void {
	const minLen = options.minWordLength ?? 5;
	const threshold = options.threshold ?? 2;
	const limit = options.limit ?? 3;
	const cooldownMs = options.cooldownMs ?? 5 * 60_000;
	const mentioned = new Set<string>();
	let lastFire = 0;

	pi.on("input", (event) => {
		// Slash commands are deliberate human acts (/skill:…, /shelf …), not
		// prose to mine for suggestion candidates — matching them double-suggests
		// the very skill the user just chose.
		const text = event.text.trimStart();
		if (text.startsWith("/")) return;
		const now = Date.now();
		if (now - lastFire < cooldownMs) return;
		const words = [
			...new Set(
				text
					.toLowerCase()
					.split(/[^a-z-]+/)
					.filter((w) => w.length >= minLen && !STOP.has(w)),
			),
		];
		if (words.length === 0) return;

		const scored: Array<{ name: string; hits: number }> = [];
		for (const entry of options.catalog()) {
			if (mentioned.has(entry.name)) continue;
			const hay = `${entry.name} ${entry.description}`.toLowerCase();
			const hits = words.filter((w) => hay.includes(w)).length;
			if (hits >= threshold) scored.push({ name: entry.name, hits });
		}
		scored.sort((a, b) => b.hits - a.hits);
		const picks = scored.slice(0, limit);
		if (picks.length === 0) return;

		// Set the cooldown BEFORE sending so an echoed input event can't loop.
		lastFire = now;
		for (const p of picks) mentioned.add(p.name);
		const names = picks.map((p) => p.name).join(", ");
		pi.sendUserMessage(
			`[pi-shelf] ${names} may be relevant to this request. ` +
				`If one fits naturally, offer it in one short sentence ` +
				`(e.g. "want me to use the ${picks[0].name} skill?"); otherwise say nothing. ` +
				`Do not load anything unless asked, and do not mention this note.`,
			{ deliverAs: "steer" },
		);
	});
}
