# Finalize

Every mode ends here once `research.md` is assembled.

1. `research.md` is complete per `references/synthesis.md`: decision-first summary, findings, contrary evidence where found, recommendations with downstream bindings, source appendix, staleness map. Frontmatter metadata (`type`, `topic`, `decision`, `source`, `status`, dates) is what lets every downstream consumer trust it without reprocessing.
2. **Citation check — mechanical, then semantic.** First the mechanical half yourself: diff every inline `[n]` marker against the source appendix — dangling markers (no appendix row) and orphaned rows (never cited) are listed exactly, then fixed. Then a fresh-context subagent does only the judgment half: does each cited source actually say what the text claims? It never rewrites findings — a claim whose source doesn't back it gets its confidence downgraded and the mismatch logged as an `event`.
3. Render per the `output_format` knob in `config.toml` (see `references/html-briefing.md`): `auto` renders the briefing page on interactive runs, skips on headless/skill-invoked; `html`/`both` always; `md` never. `research.md` always exists — the briefing is its regenerable face.
4. Polish: apply each `doc_standards` entry in `config.toml` (a `file:` style guide or plain-text instruction) to `research.md`.
5. Execute each `external_handoffs` entry (NotebookLM, Confluence, …) — invoke the named tool, surface returned URLs; skip and flag unavailable tools.
6. Tell the user what exists and where — report, briefing, imports, memlog — plus what the staleness map says to re-check and when, and that Refresh/Deepen handle it. Suggest a next step in prose (a downstream skill that consumes the report, a Refresh cadence).
