# Finalize: The Retrospective Document

Phase 5. Finalize the retrospective document — the run's single write. It has been a working artifact since the work was fixed: created as a skeleton and filled as each phase completed, so this phase finalizes rather than writes it from scratch.

## The document

The document lives at `RETROSPECTIVE-<work-slug>.md` in the project working directory — a fixed name per work, so a resumed run finds it — as readable markdown; the slug names the retro'd work (e.g. `RETROSPECTIVE-auth-refactor.md`). Ensure the project working directory is writable before relying on it.

Open the document with YAML frontmatter a machine can read without parsing the prose — a gate or orchestrator keys off `verdict` to decide whether to start the next body of work:

```
---
work: <work-slug>
date: <date>
verdict: accepted | accepted-with-open-items | rejected
criteria: declared | profiled
headless: true | false
---
```

Keep `verdict` in sync with the Acceptance verdict section below. A rejected verdict does not invalidate the document — `verdict` records *the run's judgment of the work*, and the document is worth keeping whichever way it went. A gate or orchestrator that acts on the verdict reads this frontmatter; nothing else in the repo carries it.

Sections:

- **Work summary** — which work, the diff range, the steps or units completed, anything the completeness gate found unfinished and the user accepted retro-ing over, the evidence inventory (what was available, what was missing).
- **Findings** — grouped by aggregate view and by lens, each with its source reference and disposition (fix now / defer / accept). This is the record; do not summarize away the provenance.
- **Behavior verification** — what was exercised end to end and what was observed, or an explicit note that runtime behavior was not exercised.
- **Previous-retro follow-through** — if a prior retro exists, whether its action items landed, with evidence, and the status each one argues for (`references/acceptance-verdict.md` specifies what to record).
- **Action items** — the routed fix-now items and process lessons, each with an owner. Note which are proposed remediation or spec reconciliations awaiting human application.
- **Acceptance verdict** — accepted / accepted-with-open-items / rejected, whether the criteria were declared or profiled, and the evidence behind the call.
- **Open questions** — what a human answer would materially change, and anything the analyses could not resolve.
- **Assumptions** — in headless runs, every choice made without the user: which work was selected, the completeness-gate result including any unfinished list, a machine **rejected** verdict forced by unfinished work or rendered with no human decision, each proposed item. Omit in interactive runs — an interactive run records the same facts where the user confirmed them, in Work summary.

Do not state time estimates anywhere in the document.

## Finish

Report where the document was saved, the verdict, and the action-item count.

## On Complete

If the run has a terminal instruction from its caller, follow it before exiting; otherwise exit normally.
