/**
 * browser — the /shelf TUI. Read-only.
 *
 * Type to search (matches name + description), ↑↓ to move, esc to close.
 * No toggling, no saving — darkness is enforced at startup by shelf.ts.
 */

import { Key, matchesKey, truncateToWidth } from "@earendil-works/pi-tui";
import { listSkills, search, type SkillEntry } from "./catalog";

const ROWS = 14;

/** Opens the browser inside ctx.ui.custom. Resolves when the user presses esc. */
export async function openBrowser(
	custom: <T>(render: (tui: any, theme: any, kb: any, done: (value: T) => void) => any) => Promise<T>,
	initialQuery = "",
): Promise<void> {
	await custom<void>((tui: any, theme: any, _kb: any, done: () => void) => {
		const allSkills = listSkills();
		let query = initialQuery.trim();
		let sel = 0;

		const filtered = (): SkillEntry[] => search(query);

		const border = () => theme.fg("accent", "─".repeat(200));

		return {
			render: (w: number) => {
				const list = filtered();
				if (sel >= list.length) sel = Math.max(0, list.length - 1);
				const start = Math.max(0, Math.min(sel - Math.floor(ROWS / 2), Math.max(0, list.length - ROWS)));
				const view = list.slice(start, start + ROWS);

				const lines: string[] = [border()];
				lines.push(theme.fg("accent", theme.bold(` pi-shelf — ${allSkills.length} skills (all dark)`)));
				lines.push(theme.fg("muted", ` search: ${query}│`));
				if (list.length === 0) {
					lines.push(theme.fg("warning", " no matching skills"));
				}
				for (let i = 0; i < view.length; i++) {
					const skill = view[i];
					const idx = start + i;
					const prefix = idx === sel ? "❯ " : "  ";
					const label = `${prefix}${skill.name}`;
					const desc = skill.description ? `  ${skill.description.slice(0, 100)}` : "";
					const raw = idx === sel ? theme.fg("accent", label) : label;
					lines.push(truncateToWidth(`${raw}${theme.fg("muted", desc)}`, w));
				}
				if (list.length > ROWS) {
					lines.push(theme.fg("dim", ` ${start + 1}–${Math.min(start + ROWS, list.length)} of ${list.length}`));
				}
				lines.push(theme.fg("dim", " type to search · ↑↓ move · esc close"));
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
				} else if (matchesKey(data, Key.escape) || data === "\x03") {
					done();
					return;
				}
				tui.requestRender();
			},
		};
	});
}
