---
name: retrospective
description: 'Run an evidence-based retrospective on a completed body of work — a feature, milestone, or agent dev loop: gather the record it left (diffs, commits, docs, session notes), surface the cross-cutting defects no single step shows, and produce sourced findings, action items, and an acceptance verdict. Use when the user says "run a retrospective" or asks to retro completed work.'
---

# Retrospective

**Goal:** Review a completed body of work by reading the evidence it left — its spec or planning documents, whatever notes and records the work produced, the full diff, the commits, and session logs when they exist. A completed run leaves a record; this skill reads that record, surfaces the defects no single step could show, and judges the work against the criteria it set for itself.

Every finding you report carries a source reference (file, line, commit, or log). A claim you cannot point at — an invented root cause, a pattern the diff does not actually show — is not a finding. Drop it.

## Conventions

- `{date}` is the current system datetime. Never state time estimates — AI has changed development speed, so hour/day/week predictions are noise.
- The retrospective document is a fixed name, `RETROSPECTIVE-<work-slug>.md`, in the project working directory, so a resumed run finds it (see Working state and resumption).

## Modes

Interactive by default. With `-H`/`--headless`: skip every confirmation, take the work from the invocation, never open the team discussion, render the verdict on the evidence alone, and record each assumption made without the user (which work was selected, the machine verdict, each proposed item) into the retrospective document's Assumptions section so the audit trail survives. The Phase 4 acceptance fail-safe still applies in headless runs.

## Inputs

| Input | Where | Use |
|-------|-------|-----|
| the work | invocation argument, or the most recently completed body of work in the repo | what to retro |
| its spec / planning documents | whatever the work left: a spec, brief, design notes, or issue description | the intent to judge as-built work against, plus any declared acceptance criteria |
| diff range and commits | the repository's version control | the work's actual footprint (see `references/evidence-gathering.md`) |
| docs the work left behind | README/AGENTS changes, changelogs, PR descriptions, notes, ADRs | what the work claimed about itself |
| previous retrospective (optional) | `RETROSPECTIVE-*.md` from an earlier run | check whether its action items landed |
| session logs (optional) | conversation/session records for the work's steps | process lessons; record the gap when absent |

## Completeness gate

Before Phase 1, check the work is actually finished: part of the declared scope that never landed (a half-implemented piece, uncommitted changes still in the tree, a spec still in progress, work promised in the spec that no commit touches). Establish this from the diff, the commits, and the spec — not from anyone's assurance. When something is unfinished, interactively list it and ask whether to retro anyway: if the user declines, stop and report — do not enter Phase 1; if they accept, record what was accepted-over in the document's Work summary. Headless, proceed and record the same list in the Assumptions section — do not invent a confirmation. Either way the list sits in the document, and Phase 4's machine verdict is **rejected** when any part of the work remained unfinished (see `references/acceptance-verdict.md`); a human may override interactively.

## Working state and resumption

The retrospective document is the working artifact, not only the final output. Once the work is fixed, create it as a skeleton (`references/retro-document.md` names the sections) and write each phase's result into it as you finish — inventory, then findings with sources, then dispositions and verdict. Continuity is re-reading the file.

If a retrospective document for this work already exists, load it, reconcile its recorded state against the current evidence — the current evidence wins, since commits may have landed and questions may have been answered since — and resume at the first incomplete phase instead of redoing finished ones.

## Flow

Run the phases in order. A default run stops at a written evidence report and verdict; the team discussion in Phase 3 is opt-in.

Before Phase 1, interactively invite the user's going-in concerns ("anything you want weighted — a step that felt rushed, a risky interaction between two parts of the work?"). Use any answer to focus the Phase 1–2 analysis; it directs attention but never becomes a finding without a source.

### Phase 1 — Gather

Enumerate what the work actually produced and record what is missing. Read fully and follow `references/evidence-gathering.md` for the inventory checklist, the `scripts/git_evidence.py` pre-pass that derives the diff range, commit list, and per-file change volume, and the missing-evidence rule: each later analysis declares what it needs and records a narrowed scope when the evidence is absent, so a reader can always tell "checked and clean" from "never checked."

### Phase 2 — Analyze

Produce findings, each with a source reference, from three angles:

- **Aggregate views** — the defects no single diff hunk shows: architecture delta, duplication map, god-class growth, pattern divergence, spec-to-implementation reconciliation. Read fully and follow `references/aggregate-views.md` for the catalog and how to derive each (deterministic scripts first).
- **Diff-scope review** — do not reimplement review. Invoke **`lens-review`** on the work's diff for the code lenses (adversarial, edge-case, verification-gap), weighting the boundaries between work units, where no single session ever saw both sides. Fold its findings in. If `lens-review` is unavailable, run those lenses inline over the diff on a narrowed scope and record the narrowing.
- **Behavior check (when the work changed runtime behavior)** — exercise the changed flows end to end and record what you observed. Passing tests do not substitute for running the system.

Consolidate: merge, dedupe, and provenance-link findings. Drop any finding you cannot tie to a source.

### Phase 3 — Team Discussion (opt-in)

Skip by default; never runs headless. When the user asks to "discuss it as a team," "run a roundtable," or similar, hold a multi-persona discussion seeded with the Phase 2 findings — through a roundtable skill (e.g. `roundtable`, if installed) so independent personas react to real evidence: the god class the diff really grew, the verification gap that is actually there, the wins the evidence confirms. Read fully and follow `references/team-discussion.md` for how to seed it and keep it grounded. If no roundtable skill is available, run the discussion inline over the Phase 2 findings and record the narrowing. The rule: personas speak only to findings with sources.

### Phase 4 — Decide

- **Action items** — compile fix-now findings and process lessons into specific, owned action items. Fixes and spec reconciliations are *proposed here*, not auto-applied; the human decides what to execute.
- **Acceptance verdict** — judge the final state against the work's declared acceptance criteria (profile it from the diff and docs if none were declared): **accepted**, **accepted-with-open-items**, or **rejected** — one spelling, everywhere a machine reads it. Unfinished work from the completeness gate forces the machine verdict to **rejected**. A human decision always overrides. Work that fails its criteria with no human decision is recorded as *not accepted* — never as silently accepted. Read fully and follow `references/acceptance-verdict.md` for the rubric, the finding-routing dispositions, and the previous-retro follow-through record.

### Phase 5 — Finalize

Finalize the retrospective document. Read fully and follow `references/retro-document.md` for the document's sections and the terminal instruction that ends the run. Where the Phase 4 follow-through has evidence a *previous* run's action item landed, record the proposed status transition in the document — the evidence justifies proposing it, and only the user's confirmation justifies acting on it; a headless run records what it would have proposed and acts on nothing.

> Adapted from BMAD-METHOD, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
