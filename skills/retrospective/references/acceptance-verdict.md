# Decide: Routing and the Acceptance Verdict

Phase 4. Turn the consolidated findings into two outputs: routed action items the human can act on, and an honest verdict on whether the work met its acceptance criteria. This skill proposes; it does not auto-apply fixes or edit the project spec. The human decides what executes.

## Route each finding

Give every finding two independent dispositions:

- **What to do about this instance** — *fix now*, *defer*, or *accept as-is*. Fix-now findings become action items. Deferred findings carry enough context to be acted on later without re-investigation. Accepted deviations are recorded so later retros stop re-flagging them.
- **What would prevent the next one** — the upstream lesson: spec wording, work sizing, a missing convention or gate, or nothing. This is where a recurring finding becomes a process change rather than a one-off fix.

Findings from sub-agents or the team discussion are unverified reports, not established facts. Before an action item relies on one, re-check it against the primary source — reopen the file, the commit, the spec. A finding whose source does not hold up is dropped, not routed.

## Action items

Compile fix-now findings and process lessons into specific, owned action items. Each names what to change and who owns it. Two kinds are *proposed, not applied*:

- **Remediation** — code fixes are written up as action items (or spec-shaped work) for the normal dev loop to execute later. The retrospective does not run the dev loop itself; `build-loop` is the natural executor.
- **Spec reconciliation** — where the as-built diverges from the spec, propose the reconciliation as an action item with the evidence attached. The human applies it to the project's documents; an uncertain interpretation is never written into a spec automatically.

## Previous-retro follow-through

When a prior retrospective exists (`RETROSPECTIVE-*.md` from an earlier run), check whether the action items it committed to were completed. Read its Action items section and, for every item not already recorded as done, record one line in this retrospective's Previous-retro follow-through section:

- **The item** — quoted or tightly paraphrased exactly as the prior retro states it, with its named owner. This is what a later run needs to identify the item at all.
- **Whether it landed** — with the source that shows it: the commit, the file and line, the test. An item you cannot point at is "no evidence found", not "not done" — the reader must be able to tell a checked item from an unchecked one.
- **The status it argues for** — `done` for a landed item, `in-progress` for one demonstrably underway, or nothing. A proposal, never a write: only the user's confirmation justifies acting on it, and a headless run acts on nothing.

A run whose prior retro exists but carries no action items records exactly that. A run with no prior retro records that there was nothing to follow through on — so a missing file is never mistaken for "no outstanding items."

## The verdict

Judge the final state against the work's declared acceptance criteria. If the work declared none, profile the criteria from the diff and its documents and mark the verdict as **profiled** rather than declared. Weigh verification results (the Phase 2 behavior check) and unresolved findings. Render one of:

- **Accepted** — criteria demonstrably met in the evidence, no blocking findings open, and **no unfinished work** from the completeness gate.
- **Accepted-with-open-items** — criteria met, but named findings remain deferred and tracked — still only when the completeness gate found nothing unfinished.
- **Rejected** — criteria not met, a blocking finding stands unresolved, **or the completeness gate found unfinished work**.

### Unfinished work

The completeness gate's unfinished list is authoritative for this work's incomplete parts: scope the spec declares that no commit delivers, half-implemented pieces, uncommitted changes in the tree, work accepted-over at the user's insistence. When that list is non-empty:

- The **machine** verdict is **rejected**. Name every unfinished part in the Acceptance verdict section as the evidence. Do not soften this to accepted-with-open-items: unfinished delivery is not an open finding about a finished body of work — the work itself is incomplete.
- Record the unfinished parts in Work summary (interactive) or Assumptions (headless) as the Inputs section already requires.
- Headless runs have no human at the console: the document's verdict is **rejected** when the list was non-empty. Interactive runs may still let a human override (rule 1 below) after seeing the list.

If the completeness check did not run (for example, no readable spec and no established scope), do **not** render a rejected or accepted verdict from the absence of data — say the check was unavailable and weigh only the criteria and findings you have.

Three hard rules:

1. A human decision always overrides the machine verdict.
2. Work that fails its criteria with **no** human decision is recorded as **not accepted** — never as silently accepted.
3. A non-empty unfinished-work list makes the machine verdict **rejected**, including in headless mode.

The verdict and its evidence carry into the Phase 5 document.
