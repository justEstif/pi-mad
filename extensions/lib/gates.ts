import {
	isToolCallEventType,
	type ExtensionAPI,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { resolve } from "node:path";

export interface GateBlock {
	block: true;
	reason: string;
	terminate?: boolean;
}

export interface BashGateOptions {
	/** Stable name included in diagnostics. */
	name: string;
	/** Return true when this gate governs the shell command. */
	matches: (command: string) => boolean;
	/** Return a block decision, or nothing to allow the command. */
	check: (
		command: string,
		ctx: ExtensionContext,
	) => GateBlock | undefined | Promise<GateBlock | undefined>;
}

/** Register a reusable gate around matching model-issued bash commands. */
export function registerBashGate(pi: ExtensionAPI, options: BashGateOptions): void {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return;
		const command = event.input.command ?? "";
		if (!options.matches(command)) return;

		const decision = await options.check(command, ctx);
		if (!decision) return;
		return {
			...decision,
			reason: `${options.name}: ${decision.reason}`,
		};
	});
}

export type SkillLoadState = "unloaded" | "queued" | "loaded";

export interface SkillLoadTracker {
	getState(): SkillLoadState;
	isLoaded(): boolean;
	/** Queue slash-command expansion once. Safe to call repeatedly. */
	ensureLoaded(instructions?: string): boolean;
}

export interface SkillLoadTrackerOptions {
	name: string;
	/** Known SKILL.md paths. Suffix matching by skill directory is also used. */
	paths?: string[];
}

/**
 * Track both ways a skill enters model context: slash-command expansion and a
 * successful agent read of its SKILL.md. State is scoped to the Pi session.
 */
export function createSkillLoadTracker(
	pi: ExtensionAPI,
	options: SkillLoadTrackerOptions,
): SkillLoadTracker {
	let state: SkillLoadState = "unloaded";
	const command = `/skill:${options.name}`;
	const knownPaths = new Set((options.paths ?? []).map((path) => resolve(path)));
	const skillPathSuffix = `/${options.name}/SKILL.md`;

	pi.on("session_start", () => {
		state = "unloaded";
	});

	pi.on("input", (event) => {
		if (event.text.trimStart().startsWith(command)) state = "loaded";
	});

	pi.on("tool_result", (event) => {
		if (event.toolName !== "read" || event.isError) return;
		const path = (event.input as { path?: unknown }).path;
		if (typeof path !== "string") return;
		const normalized = resolve(path.replace(/^@/, ""));
		if (knownPaths.has(normalized) || normalized.endsWith(skillPathSuffix)) {
			state = "loaded";
		}
	});

	return {
		getState: () => state,
		isLoaded: () => state === "loaded",
		ensureLoaded(instructions) {
			if (state !== "unloaded") return false;
			state = "queued";
			const suffix = instructions ? ` ${instructions}` : "";
			pi.sendUserMessage(`${command}${suffix}`, {
				deliverAs: "steer",
				expandPromptTemplates: true,
			});
			return true;
		},
	};
}

export interface SkillBashGateOptions extends SkillLoadTrackerOptions {
	gateName?: string;
	matches: (command: string) => boolean;
	loadInstructions?: string;
}

/** Block matching bash calls and queue a required skill on the first attempt. */
export function registerSkillBashGate(
	pi: ExtensionAPI,
	options: SkillBashGateOptions,
): SkillLoadTracker {
	const tracker = createSkillLoadTracker(pi, options);
	registerBashGate(pi, {
		name: options.gateName ?? `${options.name}-skill-gate`,
		matches: options.matches,
		check: () => {
			if (tracker.isLoaded()) return;
			tracker.ensureLoaded(options.loadInstructions);
			return {
				block: true,
				reason: `${options.name} skill is not loaded. Its load has been queued; follow it, then retry the command.`,
			};
		},
	});
	return tracker;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gate taxonomy
//
//   hard gate        block a matching bash command while a condition holds
//   skill gate       block once + auto-queue a REQUIRED skill load (steer)
//   suggest gate     never block; on a matching bash command, mention an
//                    OPTIONAL skill to the model once per session
//   input suggester  never block; on user message text matching the catalog,
//                    mention candidate skills to the model (rate-limited)
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillSuggestGateOptions extends SkillLoadTrackerOptions {
	gateName?: string;
	matches: (command: string) => boolean;
	suggestion?: string;
}

/** Non-blocking: on the first matching command with the skill not loaded,
 *  steer-mention it to the model. Never blocks, fires once per session. */
export function registerSkillSuggestGate(
	pi: ExtensionAPI,
	options: SkillSuggestGateOptions,
): SkillLoadTracker {
	const tracker = createSkillLoadTracker(pi, options);
	let fired = false;
	registerBashGate(pi, {
		name: options.gateName ?? `${options.name}-suggest`,
		matches: options.matches,
		check: () => {
			if (fired || tracker.isLoaded()) return;
			fired = true;
			pi.sendUserMessage(
				options.suggestion ??
					`[pi-shelf] optional: the ${options.name} skill may help with this command — consider loading it with /skill:${options.name}.`,
				{ deliverAs: "steer" },
			);
		},
	});
	return tracker;
}

export interface CatalogEntry {
	name: string;
	description: string;
}

export interface InputSuggesterOptions {
	/** Catalog to match against (name + description). */
	catalog: () => CatalogEntry[];
	/** Min word length considered. Default 5. */
	minWordLength?: number;
	/** Distinct matching words required per skill. Default 1. */
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
 *  steer-mention candidates ("consider loading: X, Y"). Never blocks. */
export function registerInputSuggester(
	pi: ExtensionAPI,
	options: InputSuggesterOptions,
): void {
	const minLen = options.minWordLength ?? 5;
	const threshold = options.threshold ?? 1;
	const limit = options.limit ?? 3;
	const cooldownMs = options.cooldownMs ?? 5 * 60_000;
	const mentioned = new Set<string>();
	let lastFire = 0;

	pi.on("input", (event) => {
		const now = Date.now();
		if (now - lastFire < cooldownMs) return;
		const words = [
			...new Set(
				event.text
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

		lastFire = now;
		for (const p of picks) mentioned.add(p.name);
		pi.sendUserMessage(
			`[pi-shelf] skills that may fit this request: ${picks
				.map((p) => p.name)
				.join(", ")}. Mention them to the user; do not load anything unless asked.`,
			{ deliverAs: "steer" },
		);
	});
}
