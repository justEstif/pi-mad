# Evidence Gathering

Phase 1 of the retrospective. Enumerate what the completed work produced, so every later analysis works from real artifacts instead of memory. Output is an inventory: what exists, what is missing, and the diff range the rest of the retro will read.

## Inventory checklist

Collect what the work produced and note the source path or range of each:

- **Work spec / planning documents** — the spec, brief, design notes, or issue description the work started from, including any declared acceptance criteria. If the spec declares how the work will be judged, that governs Phase 4; if not, note that the verdict will be profiled from the diff.
- **Docs the work left behind** — updated README/AGENTS/docs, changelog entries, PR descriptions, ADRs, session notes. These are the work's account of itself; Phase 2 reconciles them against the code.
- **Diff range and commits** — the full set of changes the work introduced. Establish the range from the first and last commits of the work (or ask the user for it). The range must *include* the first commit: `A..B` excludes `A`, so use the parent of the first commit as the left endpoint — `<first-commit>^..<last-commit>` — or the whole first step of the work disappears from the diff, the commit attribution, and the verdict evidence. Then run `python3 {this skill's directory}/scripts/git_evidence.py --repo <project working directory> --range <range> --units <unit-ids>` to get, as JSON, the commit list and the per-file change volume — added / deleted / net across the range — that Phase 2 reads. Pass `--units` when the work split into named units (tasks, issues, sub-specs): each commit then carries `units` — *every* id its subject names, so a commit spanning two units counts for both. Record the range explicitly; Phase 2's aggregate views and the `lens-review` pass both read it. When the range cannot be established, say so and narrow the scope rather than guessing. Read the output keys precisely: each commit carries `is_merge` and `units`. `files` sums non-merge commits only. `merge_files` is each measured merge's diff against its first parent, so it *restates* the churn that merge brought in plus whatever the conflict resolution added — never add it into `files`, and never read it as merge-introduced work on its own. `merges_measured` counts the merges on the range head's first-parent spine; `merge_count` counts every merge in the range, so a gap between the two means merges went unmeasured. `binary_revisions` is unmeasured churn, not zero churn.
- **Previous retrospective** — `RETROSPECTIVE-*.md` from an earlier run, if one exists, so Phase 4 can check whether its action items landed.
- **Session logs** — conversation or session records for the work's steps, when available. They are the only record of *why* a step took an unexpected turn — what was tried and abandoned. They are also the evidence most likely to be deleted or expire, so capture references now.

## Per-unit records

A well-recorded body of work often splits into named units, each leaving its own record — build-loop specs under `specs/` (each carrying `baseline_commit` in its frontmatter), per-task spec folders, or per-issue branches. Map them onto the checklist above: each unit's record is its intent and context; its diff baseline comes from its frontmatter or branch point.

The diff range then differs per unit. Each unit records its own baseline, so there is no single work-wide range. The range end is the next unit's baseline in work order, which is exact when the tooling adds no commit of its own after the work. For the last unit, when nothing records the end, derive it from the history — usually `HEAD`, though not always — and mark it inferred rather than recorded. A baseline that is absent or is not a revision leaves that unit with no commit or diff evidence — record that too. Group the units sharing an identical range and run `git_evidence.py` once per distinct range, passing that group's ids as one comma-separated `--units` value. No `^` is needed here: unlike the work-wide range above, the recorded baseline is already the pre-change commit. Ranges may overlap or diverge; count a shared commit or file change once in the aggregate views while keeping each unit's range as its provenance.

## Missing evidence

Evidence availability varies; never hide a gap. Each later analysis declares what it needs and, when that input is absent, records a narrowed scope rather than guessing. A reader of the final retro must always be able to tell **"checked and clean"** from **"never checked."**

- Missing session logs → process-lesson analysis is skipped, and the retro says so.
- No declared acceptance criteria → the verdict is profiled from the diff and docs, flagged as profiled rather than declared.
- Sub-agents unavailable → analyses that would delegate run inline over a narrowed scope, and the narrowing is recorded.

Carry the inventory forward into Phase 2 as the authoritative list of what is available to read.
