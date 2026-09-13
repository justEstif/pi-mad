---
name: lens-review
description: 'Runs one or more review lenses — adversarial critique, edge-case hunting, verification gaps, structure, and prose — over a diff, pull request, or artifact, and reports triaged findings. Use only when the user explicitly asks you to review content — code or documents, one or many. A request to act on feedback from an earlier review is a change, not a review. Never invoke this uninvited, including on edits you just made.'
disable-model-invocation: true
---

# Lens Review

Review content through lenses — each a distinct method and stance — and report findings in one canonical shape. Report what is real — never pad to look thorough. Each lens sets its own stance toward the content and toward zero findings: for most an empty result is valid; the adversarial lens requires at least ten concrete findings and treats an empty list as a signal to re-check; the editorial lenses hold content sacrosanct and critique only how it is organized and expressed.

The lens set is what `config.toml`'s `lenses` table holds, not a fixed list. Never claim a capability from this file; read the configured lenses and work from those.

## Inputs

- **content** — what to review: a diff, branch, uncommitted changes, file, spec, story, or any document. Args: `[path]`.
- **lenses** (optional) — one or more lens codes or names, however the caller expresses them — a spoken request, for example. Default: every applicable lens (a full review).
- **also_consider** (optional) — areas to keep in mind alongside each lens's normal analysis.
- **claims** (optional) — the change's own narrative: the commit messages it covers, or whatever description of it the caller supplied. Goes to the edge-case lens alone.

## Conventions

- Defaults live in `config.toml` next to this file; edit values directly. Request-level statements override them.
- Bare paths (e.g. `references/lens-edge-case-hunter.md`) resolve from this skill's directory, where `config.toml` lives.
- In `style_guide`, `review_guidance`, and `persistent_facts`, a value prefixed `file:` is a path or glob — load that file's contents. If a `file:` value cannot be read, name the failed file in the output header and continue: the shipped baseline for `style_guide`, the remaining entries otherwise.

## Execution

1. **Resolve settings:** read defaults from `config.toml`; request-level statements override them. Hold `persistent_facts` as standing context for the session, and treat `review_guidance` entries as standing review directives for every lens.
2. **Load the content.** Stage it once as a file: when the content is a branch, uncommitted work, or a commit range, use the repository's version-control tooling to write the unified diff to a uniquely-named file in the system temp directory and take that file's absolute path as the content. A branch means its diff against the merge base with its base branch; uncommitted work includes untracked files. Stage `claims` to its own file the same way — it is input for one lens, staged separately precisely so the other lenses never see it. If the content is empty or cannot be decoded as text, say what's wrong and ask for reviewable content. Classify the content — diff, source file, function, or document — and whether it is **code** or **docs**; scope rules and lens applicability both depend on it. A document that defines behavior (spec, requirements, plan, story) is `docs` that a behavioral lens may still apply to; judge by `when`.
3. **Select lenses** from `config.toml`'s `lenses`. A lens with an empty `instruction` is disabled. If the user named lenses, run exactly those only — `applies_to` and `when` do not filter an explicit request. Otherwise run every enabled lens whose `applies_to` covers the content class (`any` always covers) and whose `when` applies.
4. **Announce the plan** in one line before running anything: the content class, the lenses about to run, and — when any lens has `after` set — that it runs on top of the named lens's findings.
5. **Run the independent lenses** — every selected lens without `after`. Each sees the content and `also_consider`, never another lens's findings. Follow each lens's `instruction`; the shipped lenses load their reference file just-in-time, so load only what runs. When subagents are available, launch every independent lens before handling any lens's result. Try running them simultaneously: spawn one per lens; give it the lens `instruction` with the skill directory and all content paths resolved absolute (a lens prompt carries the path and the lens reads the file, never the content bytes; inline the content only when it was never staged as a file), any `also_consider` areas, the standing review directives, the `claims` path to the edge-case lens alone (marked to leave unread until its instructions call for it), and the constraint "Return ONLY your findings — no other output. Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer." Otherwise run the lenses sequentially yourself, completing one before starting the next.
6. **Run the dependent lenses** — every selected lens with `after`, once the lens it names has completed, passing that lens's findings in. A lens whose `after` target was not selected or produced nothing still runs, with no prior findings. Dependent lenses that name different targets are independent of each other: launch every ready one before handling any of their results. Try running them simultaneously. When subagents are available, spawn them with the same constraint as independent lenses: "Return ONLY your findings — no other output. Do not invoke any skill, and do not spawn subagents of your own — you are the reviewer. Return your findings as text in your final message; do not route them through any findings-reporting tool the host may offer."
7. **Assemble and present** per Output below. Keep every lens's findings — overlap between lenses is signal, not duplication; note it in the markdown report rather than deduping. If `config.toml`'s `on_complete` is set, execute it after the findings are delivered.

## Output

One JSON array holding every finding from every lens. Each finding carries:

- `lens` — the code of the lens that produced it
- `location` — where in the content (file:line-range for code, section for documents)
- `trigger_condition` — the problem, or the condition that exposes it, in one line
- `guard_snippet` — the concrete fix, guard, or missing check
- `potential_consequence` — what goes wrong if it ships as-is

Each lens file refines these semantics for its findings and may add lens-specific fields (e.g. `kind`/`confidence` on deletion findings, `gap_shape`/`consumer`/`evidence` on verification-gap findings). A lens file may instead declare its own findings shape and rendering — the editorial lenses render a findings table — and that shape wins for that lens's findings. `[]` is valid when nothing is found. No severity, priority, or ranking anywhere.

Present per `config.toml`'s `output_format` — `"json"` (the raw array in a fenced json block), `"markdown"`, or `"both"` — unless the caller requested a specific shape. The markdown report groups findings by lens, each rendered in its declared shape: a short block per finding rendering the fields plus any extras worth surfacing, one line for a lens that found nothing, and a plain clean statement when the whole review is clean. Shape the report per `config.toml`'s `output_preferences`.

When `config.toml`'s `report_path` is set, write the report there; otherwise present it in chat.

## Not this skill

A simulated multi-persona discussion (debate, focus group, red-team panel) is not a lens review: it produces a conversation, not triaged findings. That is the **roundtable** skill's job. Come back here when the user wants structured critique of a diff, document, or artifact.

