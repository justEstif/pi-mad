/**
 * browser — the /shelf TUI. A command palette over the catalog.
 *
 * Type to search (matches name + description), ↑↓ to move, enter loads the
 * selected skill (sends /skill:name and closes), esc clears the query first
 * and closes on second press. Darkness is enforced at startup by shelf.ts;
 * loading is always a human act — enter is that act.
 */

import { Key, matchesKey, truncateToWidth } from "@earendil-works/pi-tui";
import { listSkills, search, type SkillEntry } from "./catalog";

const ROWS = 14;

/** Truncate at a word boundary with an ellipsis. */
function ellipsize(text: string, max: number): string {
	if (text.length <= max) return text;
	const cut = text.slice(0, max);
	const atWord = cut.lastIndexOf(" ");
	return `${(atWord > max * 0.6 ? cut.slice(0, atWord) : cut).trimEnd()}…`;
}

/** Opens the browser inside ctx.ui.custom. Resolves when the user closes it.
 *  onPick, when given, receives the skill selected with enter. */
export async function openBrowser(
	custom: <T>(render: (tui: any, theme: any, kb: any, done: (value: T) => void) => any) => Promise<T>,
	initialQuery = "",
	onPick?: (skill: SkillEntry) => void,
): Promise<void> {
	await custom<void>((tui: any, theme: any, _kb: any, done: () => void) => {
		const allSkills = listSkills();
		let query = initialQuery.trim();
		let sel = 0;

		const filtered = (): SkillEntry[] => search(query);

		return {
			render: (w: number) => {
				const list = filtered();
				if (sel >= list.length) sel = Math.max(0, list.length - 1);
				const start = Math.max(0, Math.min(sel - Math.floor(ROWS / 2), Math.max(0, list.length - ROWS)));
				const view = list.slice(start, start + ROWS);

				const lines: string[] = [];
				lines.push(
					theme.fg("accent", theme.bold(` pi-shelf — ${allSkills.length} skills · none run without you`)),
				);
				lines.push(theme.fg("muted", ` search: ${query}│`));
				if (list.length === 0) {
					lines.push(
						theme.fg("muted", ` no matches for "${query || " "}" — try fewer letters`),
					);
				}
				for (let i = 0; i < view.length; i++) {
					const skill = view[i];
					const idx = start + i;
					const prefix = idx === sel ? "❯ " : "  ";
					const label = `${prefix}${skill.name}`;
					const desc = skill.description ? `  ${ellipsize(skill.description, 90)}` : "";
					const raw = idx === sel ? theme.fg("accent", label) : label;
					lines.push(truncateToWidth(`${raw}${theme.fg("muted", desc)}`, w));
					// The selected row shows its full description — that's the row
					// being decided on, and near-twin names differ past the truncation.
					if (idx === sel && skill.description) {
						lines.push(theme.fg("dim", truncateToWidth(`   ${skill.description}`, w)));
					}
				}
				if (list.length > ROWS) {
					lines.push(theme.fg("dim", ` ${start + 1}–${Math.min(start + ROWS, list.length)} of ${list.length}`));
				}
				lines.push(theme.fg("dim", " enter loads · type to search · ↑↓ move · esc clears/closes"));
				lines.push(theme.fg("accent", "─".repeat(w)));
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
					if (list.length > 0) {
						const picked = list[sel];
						done();
						onPick?.(picked);
						return;
					}
				} else if (matchesKey(data, Key.escape) || data === "\x03") {
					if (query) {
						query = "";
						sel = 0;
					} else {
						done();
						return;
					}
				}
				tui.requestRender();
			},
		};
	});
}
