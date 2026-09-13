---
name: sdlc-loop
description: "Conduct an idea-to-production delivery loop: six stages (Plan, Design, Build, Test, Deploy, Maintain) run as a loop where each stage commits one artifact the next stage reads — intent.md, SPEC.md, plan.md, diff + tests, review findings, merged PR — and a human accepts each gate. Use when starting work from an idea, ticket, or incident, or when the user wants the whole delivery chain orchestrated. This skill conducts and enforces handoffs; it dispatches stage work to other skills."
disable-model-invocation: true
---

# SDLC Loop

## Overview

Conductor for an AI-native delivery loop. Six stages — Plan, Design, Build, Test, Deploy, Maintain — form a **loop, not a pipeline**: work that ships comes back as findings, and findings restart the loop as a fresh intent. Each stage ends by committing one artifact the next stage reads. The chain of accepted commits IS the audit trail: who asked for what, what was decided, what was built, what was found, and who approved it.

This skill is only the conductor. It does not brainstorm, spec, implement, or review — it dispatches to the mapped stage skills and enforces the artifact handoffs. Nothing advances until the previous stage's artifact is committed and accepted by a human.

**MANDATORY READ** `references/plays.md` before conducting a full loop for the first time in a session, and whenever per-stage detail is needed (what changes, concrete steps, governance, how to measure).

## The loop

```
     PLAN ──gate──► DESIGN ──gate──► BUILD ──gate──► TEST ──gate──► DEPLOY
   intent.md       SPEC.md         plan.md         triaged        human merge
   accepted        accepted        accepted        findings       approval;
   by owner        by owner        by engineer     + walkthrough  merged PR is
                                                   for reviewer   the artifact
      ▲                                                            │
      │            MAINTAIN (retrospective on shipped work)        │
      └────  findings + breached expectations = NEXT intent.md ◄───┘
```

Every arrow is a gate. A gate is a human decision on a committed artifact, not a meeting and not a formality. The artifact records the decision; the merge or closing comment records the accept.

## Stage → skill → artifact

| Stage | Dispatch to | Committed artifact | Human accepts |
|---|---|---|---|
| Plan | `brainstorming-coach` (offer `idea-forge` first when the idea is still fuzzy) | `intent.md` from `assets/intent-template.md` | Originator/product owner accepts the intent |
| Design | `spec-distiller`; plus `architecture-spine` when separately-built parts need shared invariants; plus `story-slicer` when story breakdown is wanted | `SPEC.md` (+ architecture spine, + stories) | Owner accepts the spec; flagged concerns resolved first |
| Build | `build-loop` (spec → plan → implement → review) | `plan.md` from `assets/plan-template.md`, then diff + tests | Engineer accepts the plan before code is written |
| Test / Review | `lens-review` on the diff, then `change-walkthrough` to coach the human reviewer | Triaged review findings on the diff | Reviewer approves; findings are gate input, never the gate |
| Deploy | — (out of scope) | Merged PR / merge commit | Human approves the merge |
| Maintain | `retrospective` on the completed work | Retro findings + acceptance verdict | Owner triages findings into the next loop |

## Workspace

Default home for a loop is one folder per delivery under the project working directory:

```
sdlc/<slug>/
  intent.md        ← Plan output; the loop's entry artifact
  SPEC.md          ← Design output (or a pointer to spec-distiller's own specs/ folder)
  plan.md          ← Build output, written before implementation
  review.md        ← optional: triaged findings summary handed to the gate
  retro/           ← Maintain outputs
```

Dispatched skills may prefer their own workspaces (spec-distiller writes `specs/spec-<slug>/`; build-loop manages its own session files). Let them, and record the real path in the next artifact's header. Every artifact names its upstream artifact (path + date) — e.g. `plan.md` opens with `(from intent.md <date>)` — so the chain is reconstructible from any single file. Commit each artifact as it is accepted; the commits are the audit trail.

If an external tracker (Jira, ServiceNow) is the source of truth for some artifact, keep one direction of linkage: the markdown artifact cites the record ID, and the loop treats the tracker as canonical for that artifact.

## Gate rules

- **Accept advances; reject reworks in place.** On acceptance the next stage starts by reading the accepted artifact. On rejection the work returns to the SAME stage: revise the artifact, re-present it, re-run the stage's skill. Never carry a rejected artifact forward and patch downstream.
- **Findings inform gates; they are not gates.** Review findings, eval results, and retro verdicts are input the human weighs. No agent output approves or blocks a stage on its own.
- **The gate decides with the record in view.** At each gate, present: the artifact, the diff between what was asked (upstream artifact) and what is proposed, and any flagged concerns — then ask for accept or reject.
- **Higher-risk work gets a higher gate.** Routine changes gate with the owner/engineer; anything the user classes as sensitive (security, data, infra, public API) goes to the named human, matching the organization's own escalation habits.

## Write-back rule (the loop closes)

Maintain is not the end; it is the feed. When a retrospective finishes, or a success signal from `intent.md` is measured and missed, or an incident lands: write the finding as a NEW `intent.md` in the Plan template — problem, proposed outcome, affected users and systems, constraints, open questions — and start the loop again. Dismissed findings are recorded too, with a reason, so the same finding does not return unexplained. A finding too small for a loop is a one-line fix; see Collapsing stages.

## Collapsing stages

Stages are collapsible for small work. The artifact chain is always explicit.

- **One-line fixes** (typo, config value, obvious guard): Plan and Design collapse into a single `intent.md` that also states the fix and the proof. Build applies it; Test can be a quick lens-review pass; Deploy is the merge; Maintain usually skips.
- **Small features**: Plan may stay a single intent; Design runs; Build and Test run fully.
- **A collapsed stage is a shared artifact, not an absent one.** If Plan and Design share one file, that file is both. Never skip an artifact silently — the chain must still read end to end.
- Collapses are the user's call. Propose the collapse ("this is small enough to fold Plan and Design into one intent.md — ok?") rather than deciding unilaterally.

## Per-stage dispatch

### Plan → intent.md

- Route in: an idea in someone's head, a ticket, an incident, a retro finding. If the idea is still fuzzy or half-formed, offer `idea-forge` first (skeptic pressure-test) and then brainstorm.
- Dispatch `brainstorming-coach`: the originator speaks in their own words; the skill supplies framing and questions only. Cover scope, affected users, constraints, what success looks like, what is out of scope.
- Read the draft intent back and let the originator correct everything misunderstood BEFORE committing — the artifact is valuable because it is the originator's meaning, not the agent's paraphrase.
- Commit `assets/intent-template.md` filled in. Header carries author and date.
- Ask at the gate: "Does this say what you meant?"

### Design → SPEC.md

- Read `intent.md`. Dispatch `spec-distiller` on it. Ask explicitly for flagged areas of concern — places where constraints conflict or a policy cannot be satisfied.
- Add `architecture-spine` when the change touches separately-built parts that must stay consistent (multiple modules, teams, or systems share invariants).
- Add `story-slicer` when the user wants the work broken into epics/stories or sized for multiple build sessions.
- Flagged concerns are resolved with the human before the gate, not discovered during Build.
- Ask at the gate: does the spec solve the stated problem? Are the intent's open questions answered or consciously carried forward?

### Build → plan.md + diff + tests

- Read `SPEC.md` (+ spine/stories if present). Dispatch `build-loop`; it runs clarify → spec check → plan → implement → its own adversarial review.
- Record build-loop's implementation plan as `plan.md` in the loop folder, using `assets/plan-template.md` exactly: `# Plan: <title> (from intent.md <date>)`, then `## Files that change`, `## Order of work`, `## Risks`, `## Proof`. The plan is accepted before implementation starts.
- When implementation departs from the plan, update `plan.md` in the same commit — the audit trail must show plan and diff agreeing, or explain where they diverge.
- Bug fixes: failing test first, then the fix (build-loop enforces this; the conductor verifies it happened).

### Test / Review → findings on the diff

- The loop request is the review invitation — say the stage aloud ("Review stage: running lens-review over the diff") so the invocation is explicit.
- Dispatch `lens-review` on the diff. Triage its findings: what is Important (breaks behavior, leaks data, breaches policy) versus nits (cap and summarize).
- Route Important findings back to Build as rework; re-review the fix. The stage repeats until findings are clear or consciously accepted.
- Then dispatch `change-walkthrough` to coach the human reviewer: what the change is for, what to look at closely, how to test it. The human's review — not the lens output — is what passes the gate.
- Ask at the gate: findings are attached; do you approve the merge?

### Deploy → merged PR

- Out of scope for this skill: no deploy tooling, no pipelines, no environment promotion. The stage is the gate only — a human approves the merge, and the merge commit is the committed artifact that closes the delivery.
- Review findings and their resolutions are part of what the approver sees.

### Maintain → next intent.md

- When the work has shipped and lived a little, offer `retrospective` on the completed body of work: it gathers the record (diffs, commits, docs), surfaces cross-cutting defects, and produces sourced findings, action items, and an acceptance verdict.
- Apply the write-back rule: verdict, findings, and any breached success signal become the next loop's `intent.md`, attributed to this loop's artifacts.
- Entry routes other than retros — incidents, alerts, production surprises — enter as Plan with the incident as the problem statement.

## Entry points

The loop can start wherever the user already has an upstream artifact; each earlier stage is then backed into, not skipped:

- Idea / ticket / incident → start at Plan.
- An existing `intent.md` → start at Design.
- An existing spec → start at Build.
- An existing diff or PR → start at Test.
- Recently completed work → start at Maintain.

If the entry artifact is missing or too thin to act on, back up one stage and write it — never invent a missing upstream artifact from memory.

## Hard rules

- **NEVER advance past a gate without an explicit human acceptance.** **Why:** the chain of accepted commits is the audit trail; an unaccepted artifact means the next stage builds on a decision nobody made. **Instead:** hold at the gate, restate exactly what awaits acceptance, and rework within the same stage on rejection.
- **NEVER do stage work inline** — writing the spec, implementing, or reviewing the diff yourself instead of dispatching. **Why:** the stage skills carry their own process depth (facilitation rules, hard gates, review lenses) that inline imitation loses. **Instead:** dispatch the mapped skill and enforce the handoff between artifacts.
- **NEVER drop an artifact from the chain**, even when stages collapse. **Why:** the chain is the only record of who asked for what and who approved it; a missing link silently breaks auditability. **Instead:** merge collapsed stages into one explicitly shared artifact and say so.

> Pattern from Anthropic's AI-native SDLC playbook. Not affiliated with Anthropic.
