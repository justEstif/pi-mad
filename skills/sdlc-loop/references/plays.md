# The six plays, adapted to pi + pi-shelf

Per-stage detail behind the `sdlc-loop` conductor: what changes, getting started, concrete steps, governance, and how to measure. Adapted from an AI-native SDLC playbook to pi and the pi-shelf skill set.

Shared mechanics first — they apply to every play:

- **Committed artifact per stage.** Each stage ends by writing one artifact to version control (intent.md, SPEC.md, plan.md, the diff and its tests, review findings, the merged PR, the retro record) and the next stage begins by reading it. Early stages are markdown because a human and an agent can both read and act on the same file; from Build onward the artifact is code and its records.
- **The chain of commits is the audit trail.** Who asked for what, what was decided, what was built, who approved it — reconstructible from git history alone.
- **Human attention concentrates at the gates.** People review what the agent flagged rather than starting each stage from scratch. First you run each stage by hand; later, an accepted artifact can trigger the next stage automatically — the gates stay human either way.
- **Source of truth.** If a tracker (Jira, ServiceNow, a requirements tool) already holds the record for some artifact, pick one: the repo is canonical and the tracker links to commits, the tracker is canonical and the markdown is a working copy the agent reads and writes back, or linkage-only (artifact cites record ID; record cites commit SHA) as the minimum bar while transitioning.
- **Collapsibility.** Small work may collapse stages (see SKILL.md), but a collapsed stage still commits its artifact.

---

## Stage 1: Plan

### What changes

Ideas stop waiting for someone to write them up. Intent is captured once, in the originator's own words, as a version-controlled artifact the next stage can act on. Traditionally an idea passes through backlog entries, story points, and refinement meetings, with ownership transferring at each handoff — what reaches engineering is several steps removed from what the originator meant.

Entry routes: a person's idea, a filed ticket, an incident from monitoring, a retro finding (Stage 6 writes these). All routes produce the same artifact.

### Getting started

- Prerequisites: none.
- Infrastructure: an agreed intent template (shipped at `assets/intent-template.md`); a version-controlled home for intents the product owner watches — for one product, an `intent/` folder in the product repo keeps the artifact chain next to the code derived from it.

### Concrete steps

1. The originator describes the problem in their own words: what they cannot do today, who is affected, what better looks like, what is out of scope.
2. Run `idea-forge` first when the idea is half-formed — rotating skeptic personas until it can be acted on or dropped.
3. Run `brainstorming-coach`: the originator generates; the coach supplies only framing, questions, and polish — the questions an analyst would ask (scope, users, constraints, success).
4. Write `intent.md` from the template. The originator corrects everything misunderstood before commit.
5. Commit. Author and timestamp join the record; the gate reads the artifact and accepts or rejects.

### Governance

The committed intent.md is the evidence: author, timestamp, full revision history in git. The owner's accept/reject is recorded as the merge or the closing review. An accepted intent triggers Design.

### Measurement

- Leading: time from first conversation to committed intent.md — expect weeks to fall to hours.
- Lagging: survival rate (share of intents accepted into Design vs closed), and intent churn — intent.md commits dated after the first SPEC.md commit for the same change.

---

## Stage 2: Design

### What changes

Requirements and design collapse into one pass. Policy is applied while the spec is written, not discovered in a review weeks later. Traditionally analysts formalize, designers parse — accountability at the cost of a slow, lossy relay.

### Getting started

- Prerequisites: an accepted `intent.md`; policies that matter written as skills (pi-shelf ships review and spec skills; organization-specific policy belongs in project skills).
- Infrastructure: the product owner needs no engineering skill — only the loop and the skills loaded.

### Concrete steps

1. Dispatch `spec-distiller` with the accepted intent.md; demand flagged areas of concern, especially where constraints conflict.
2. Dispatch `architecture-spine` when separately-built parts need shared invariants — record the decisions that keep them consistent in a short spine.
3. Dispatch `story-slicer` when the work should be broken into value-ordered epics/stories, each sized for one dev agent, with Given/When/Then acceptance criteria.
4. The owner reviews the spec against the idea: does it solve the stated problem; are open questions answered or carried forward?
5. Resolve flagged concerns with their policy owners before engineering sees the spec.
6. Commit SPEC.md (+ spine, + stories). The file pair records what was asked for and what was decided. Accepting the spec starts Build.

### Governance

Policy is read as skills while the spec is written; the spec, the skill versions in force, and the review trail are all in version control. Flagged concerns route to named owners.

### Measurement

- Leading: elapsed time from intent.md commit to SPEC.md commit versus the old requirements-plus-design cycle.
- Lagging: requirements rework after build starts — SPEC.md commits dated after the first plan.md commit.

---

## Stage 3: Build

### What changes

Nothing is implemented without an accepted plan. Institutional knowledge becomes files the agent reads. Traditionally the plan stayed in the engineer's head; the first thing a reviewer saw was the finished diff, when rework is slow.

### Getting started

- Prerequisites: the accepted SPEC.md; repo conventions in an AGENTS.md/CLAUDE.md the agent reads at session start (commands, conventions, architecture, recurring mistakes — cut to what a new joiner needs, keep under a page).
- Infrastructure: pi with repo access; a test suite and build that run locally with one command each.

### Concrete steps

1. Dispatch `build-loop` with the SPEC. It enforces a hard definition of ready and runs clarify → spec check → plan → implement → adversarial review.
2. The implementation plan is recorded as `plan.md` in the loop folder — exactly `# Plan: <title> (from intent.md <date>)` with `## Files that change`, `## Order of work`, `## Risks`, `## Proof`.
3. Interrogate the plan before accepting: what could this break; which step is riskiest; what options were rejected. An engineer who never saw the conversation should be able to implement from the plan alone.
4. Accept the plan, then implement — with a solid plan, often a single pass.
5. When implementation departs from the plan, update plan.md in the same commit.
6. Give the loop a feedback path: tests that run in one command, a failing test written first for bug fixes, visual checks for UI. The agent checks its own work before a human sees it.

### Governance

Design review happens before code exists, when changing course is editing a document. Plan and revisions are logged; routine changes gate with the engineer, higher-risk work with the tech lead. The eventual diff is checked against the committed plan at the Test gate. An agent fixing code must never weaken the check on that code — reject any fix diff that edits the tests.

### Measurement

- Leading: share of changes that merge from the first implementation pass; time from plan acceptance to merged PR.
- Lagging: rework cycles per change; how often the merged diff still matches plan.md.

---

## Stage 4: Test / Review

### What changes

Every stage checks its own work before a human sees it, and review runs in both directions. Traditionally QA gated stage boundaries and review capacity was planned around human output — PRs queued, quality varied with reviewer load.

### Getting started

- Prerequisites: the diff and its tests from Build; the upstream artifacts (intent, SPEC, plan) the review checks compliance against.
- Infrastructure: none beyond the review skills.

### Concrete steps

1. Dispatch `lens-review` over the diff. Its lenses — adversarial critique, edge-case hunting, verification gaps, structure, prose — are the passes; findings come back triaged.
2. Rank findings: Important is reserved for what breaks behavior, leaks data, or breaches a policy; style and naming are nits — cap and summarize them.
3. Route Important findings back to Build as rework; re-review the fix. Repeat until findings are clear or consciously accepted.
4. Dispatch `change-walkthrough` to coach the human reviewer: what the change is for, what to look at closely, how to test it.
5. The human approves or rejects. Findings are gate input — they never approve or block on their own.

### Governance

Separation of duties: the agent that wrote the code has no way to approve it. Approval is a human decision informed by the findings; the PR thread — findings, fixes, approvals — is the audit record. Repeat mistakes flagged twice become a convention (AGENTS.md/CLAUDE.md or a skill) as part of the review, so the same class is caught from the next change onward.

Continuous evals are the AI-native stage-gate QA: the agent's own configuration (conventions files, skills) gets regression-tested like code. pi-shelf ships `skill-evals` for exactly this; every incident also adds an eval (see Stage 6).

### Measurement

- Leading: time to first review (should fall to minutes); first-pass CI success rate for agent-written changes.
- Lagging: review time per PR; defects caught before merge versus escaped to production.

---

## Stage 5: Deploy

### What changes

The agent does everything up to the production gate and nothing past it. Review runs before merge; the merge itself stays human. Governance is enforced as the work happens, not in meetings after the fact.

### Getting started

- Prerequisites: the Test gate working — findings, walkthrough, and an identified approver.
- Infrastructure: none in this skill. `sdlc-loop` stops at the gate by design.

### Concrete steps

1. Present the gate package: the diff, triaged findings and their resolutions, the walkthrough, and the upstream chain (intent → spec → plan).
2. The human approves the merge. The merge commit is the committed artifact.
3. Anything beyond the merge — pipelines, environment promotion, release authorization, rollback rehearsal — is the organization's existing deploy machinery, out of scope here. The pattern to carry over: express each surviving approval gate explicitly, tier autonomy by environment (free in dev, prepared-but-authorized in prod), and keep rollback the most rehearsed path.

### Governance

The gate condition is enforced every time, for everyone, and defines what counts as approval. Allow/block decisions and waits are visible per gate. Separation of duties is preserved: the authoring agent cannot pass the gate.

### Measurement

- Leading: time spent waiting at each gate; time to first review.
- Lagging: gate violations reaching production; DORA measures from the existing pipeline.

---

## Stage 6: Maintain

### What changes

The loop closes. Work that shipped is examined; what it teaches re-enters the pipeline as a new intent.md. Traditionally maintenance was reactive — tickets waited, post-mortem actions never reached the codebase.

### Getting started

- Prerequisites: a completed, merged body of work with its artifact chain intact; or an incident with a problem statement.
- Infrastructure: the record the work left — diffs, commits, docs, session notes.

### Concrete steps

1. After the work has shipped and lived a little, run `retrospective`: it gathers the record, surfaces cross-cutting defects no single step shows, and produces sourced findings, action items, and an acceptance verdict.
2. Check the intent's success signal against reality. A breached expectation is a finding like any other.
3. Write the findings forward: each actionable finding becomes a NEW intent.md in the Plan template, and the loop restarts. The chain of intents is the history of the loop feeding itself.
4. Dismissals are recorded with a reason — recorded dismissals tune future loops and stop findings returning unexplained.
5. Incidents and production surprises enter the same way: the incident is the problem statement, the intent gets committed, Plan proceeds. Each incident also becomes a regression eval (Stage 4) so the class is protected going forward.

### Governance

Findings and triage decisions are logged; fixes go through the normal gates — a retro finding gets no shortcut to production. The service/feature owner triages: fix now, schedule, or dismiss with reason.

### Measurement

- Leading: time from breach (or retro verdict) to a committed intent.md in the queue.
- Lagging: share of findings that become merged fixes; repeat incidents of the same class, which should fall as fixes and evals accumulate.

---

