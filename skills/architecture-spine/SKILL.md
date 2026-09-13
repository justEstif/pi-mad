---
name: architecture-spine
description: "Work out and record the architecture decisions that keep separately built parts of a system consistent, in a short architecture spine. Creates, updates, or validates one via a coaching path or a fast draft; works from a spec, a raw idea, or an existing codebase. Use when the user wants to create the technical architecture, draft an architecture spine or solution design, or validate one."
disable-model-invocation: true
---

# Architecture Spine

## Overview

You produce an **architecture spine**: a consistency contract that fixes only the **invariants** keeping independently-built units from diverging — the design paradigm, the boundary and dependency rules, how state is mutated, who owns shared data — the durable calls a future builder *can't* read off compliant code. Everything structural (stack, tree, full data shape) is **seed**: true at cold-start, owned by the code once it exists. Lead with a named paradigm — it carries a whole model for free — and keep the seed minimal.

One test decides what belongs:

> If two units one level down built this independently, could they choose incompatibly? Fix it here only when the answer is yes, **and** the call is non-obvious, **and** it's a real trade-off. Otherwise name it under Deferred and move on.

Default output is a **build substrate** — terse and convergent, so small agents and humans on small intents don't drift. When the goal is instead to align people, lead with a **discussion** doc that keeps the open questions in front. Match the spine to what's in front of you: a few decisions for a small thing, comprehensive for a platform; the whole system or the one slice a feature touches.

Record decisions, not rationale (rationale lives in the memlog). Carry shape in diagrams, not prose. Verify any named technology's current version and fit on the web before binding it.

## How you work

You're a coach, and the **Coaching path is the default** — the elicitation is the value, and it cuts against the instinct to just produce an architecture, so hold the line. Offer the choice before any drafting, in the user's language: **Coaching path** (we work it together — open-ended questions, I pull the decisions out of you and push back where one is thin) or **Fast path** (I draft the whole spine fast with `[ASSUMPTION]` tags you correct in review). Unless the user clearly wants speed, **coach; don't silently draft.** The load-bearing calls — paradigm, stack or starter, the major boundaries — are *shown, not silently made*: lay out the realistic alternatives you weighed and why you lean one way, then let the user choose. That rationale lives in the conversation and the memlog, never in the terse spine.

Elicit, don't quiz: open-ended "how are you thinking about X?" beats a multiple-choice menu; reserve a crisp either/or for a genuinely binary fork. On the Fast path, inferring and tagging *is* the job.

When the stack is open — greenfield, or a small/beginner project that could sit on a paved path — **recommend a well-known current starter** (verify the going choice on the web first): a good one pre-decides a coherent slab of the architecture for free and beats hand-rolling for a less-experienced user. For brownfield, **investigate before you decide** — read enough of the real code to ratify the conventions already there rather than invent new ones — and don't re-tell the user what the scan already shows. Any standing project constraints (approved stacks, banned dependencies, compliance guardrails) come from the repo's own docs — an `AGENTS.md`-style agent-instructions file or the user — not from assumption.

## Read the input to know the job

The input itself tells you what kind of job this is — read it rather than quizzing the user about it. A spec package (`SPEC.md` + its companions and `.memlog.md`) is the richest start and the spine's natural home, so fold the spine back into it as an adopted companion. But you'll also get a raw idea, a sprawling architecture document to distill down, an existing codebase to derive a spine *from* (ratify the conventions the code already shows — don't re-document them), the slice of one a new feature touches, or an existing spine to extend or pressure-test. Prefer a `.memlog.md` over re-reading the source it came from. Distill whatever you're given; mark real gaps as open questions instead of inventing answers. The spine's **altitude** mirrors what it augments and keeps the level below coherent — initiative→features, feature→epics, epic→stories. Inherit what's already settled — by the input (a spec, a PRD, standing project docs) or by existing code — silently; don't re-decide or re-ask it. If the input is too thin to build on, say so and suggest distilling it first (`spec-distiller`). If the conversation surfaces requirements-level answers the spec never captured, list them as open questions and offer to route them back into the spec rather than silently expanding the spine.

**Inheriting a parent spine** (e.g. pointed at one epic of a system whose feature/initiative spine already exists, or at any higher-altitude spine or settled-decisions doc): load the parent `ARCHITECTURE-SPINE.md` first and treat its `AD`s, conventions, and paradigm as **binding, read-only** constraints — log each as a `constraint` entry, list them under the spine's *Inherited Invariants* (parent `AD` IDs, never renumbered), and don't re-derive them. Your job is only what the parent **left open**: its `Deferred` items plus the divergences this slice's stories could hit. A new `AD` that contradicts or weakens an inherited one is a **conflict to surface**, not a local override. A slice spine fixes the invariants the slice's stories must share — it does **not** expand per-story detail.

## How a run works

The **memlog** (`.memlog.md` in the run folder) is the run's working memory: every decision, constraint, version, assumption, and open question lands as one append-only line — for a decision, capture what it binds and the divergence it prevents. Use the same line format as `spec-distiller`: `- [type] one-line gist, reason included`, with types `decision`, `constraint`, `version`, `assumption`, `question`, `direction`, `event`. It carries no lifecycle status — terminal moments are logged as `[event]` entries. The spine file itself is **distilled from the memlog at the end**, not written as you go. Each surviving decision becomes an `AD-n` (stable ID, `Binds`/`Prevents`/`Rule`, `[ADOPTED]` when the user or existing reality already settled it); a decision that lives only in a diagram still gets logged. Resume a prior run by reloading its memlog; never edit or reorder entries.

## Opening the run

Detect the intent from the conversation and input — **create** (the default), **update** an existing spine, or **validate** one (see those sections). If the real ask is a capability contract, that's `spec-distiller`; if it's an epic-and-story breakdown, that's `story-slicer` — say so and step aside.

1. For a create: bind a run folder — `architecture/architecture-{name}-{date}/` under the project working directory by default, or wherever the user prefers. **At epic/slice altitude, scope the folder to the slice** (carry its identity in the folder name) so per-slice runs don't collide. Seed `ARCHITECTURE-SPINE.md` from `assets/spine-template.md`, open the memlog, and tell the user the path.
2. Interactive create: offer the working mode — **Coaching path** (default) or **Fast path** (see *How you work*) — before any drafting.
3. **Mandatory, both paths, before drafting:** ask whether the spine is the only deliverable — and if not, draw out the *purpose and audience* rather than a document type. "An architecture doc" balloons into bloat; what they actually need might be a one-detail explainer for a single team or a non-technical vision piece for a board. Purpose right-sizes the artifact and may call for extra elicitation up front, not just a finale add-on.

## Reviewer Gate

The spine's pre-handoff review. MANDATORY READ: load `references/reviewer-gate.md` when finalizing or validating. It runs a deterministic `scripts/lint_spine.py` pass, then a rubric walker (good-spine checklist) plus review lenses dispatched as parallel subagents against `ARCHITECTURE-SPINE.md`, scaled to stakes. At Finalize you apply the clear fixes; under the Validate intent you deliver a report and then get user input.

## Finalize

Walk the sequence; reviewer fixes land before polish.

1. **Distill.** Write the spine from the memlog (brownfield: + the code sweep) — invariants first, seed minimal, every `AD` carrying Binds/Prevents/Rule, `Deferred` naming what it won't decide. No placeholders; never invent to fill a gap. The template's `<!-- -->` notes are guidance — act on them, then strip them; the finished spine carries no template comment, and only the diagrams that convey the structure (as many as the altitude needs, valid mermaid). Sweep the breadth the altitude owns — every structural dimension is decided, deferred, or an open question; a whole dimension left silent (e.g. the operational/environmental envelope: deployment & environments, infra/provider strategy, operations) is the failure, not a clean spine. A long coaching run distills cleaner in a subagent; the parent falls back inline.
2. **Reconcile inputs.** A subagent per load-bearing input checks it against the spine and returns what didn't land — especially a quiet requirement (a tone, a constraint) the `AD` structure dropped. Before the gate.
3. **Reviewer pass.** Run the Reviewer Gate (`references/reviewer-gate.md`). Resolve before polish.
4. **Triage.** Open questions and `[ASSUMPTION]` tags: blockers (unsafe for what's next) resolved one at a time; the rest deferred with a revisit condition in the memlog.
5. **Renderings & polish.** The spine is the build deliverable; with it and the memlog now in place, produce any *additional* human-facing artifact the user needs, scoped to the purpose and audience drawn out up front. The up-front question already flagged whether one's needed; if it wasn't, still offer one here, seeding concrete options: an interactive HTML+SVG deck to walk a team through the architecture and drive discussion, a fuller HTML/md solution design, a C4 set, or a view of how the work splits across teams/epics. Build only what they pick, right-sized to that purpose. Polish applies to that prose only — never to the spine, which stays terse and carries decisions in `AD-n` blocks and diagrams by design.
6. **Close.** Set the spine's own frontmatter `status: final`, `updated: <date>`; log a `[event] spine finalized` entry. Share paths. Next, **lead with the spec**: recommend adopting/refreshing the spine as a spec companion (`spec-distiller` keeps `AD` IDs stable so downstream can cite them) — always the top recommendation when a spec was an input, and a useful next step even when it wasn't. Then break the work into stories (`story-slicer`).

## Update

Amend an existing spine or provided artifact. Resume from its `.memlog.md` (the authority on what was decided), not the rendered spine. Capture the change as new memlog entries; **keep `AD` IDs stable** — amend a Rule in place, add the next `AD-n` for a new decision, never renumber or reuse a retired ID. Then re-distill (Finalize step 1), run the Reviewer Gate (`references/reviewer-gate.md`), and close as in Finalize. An update that overrides something from a source input: offer to update that source too, so upstream and the spine don't silently diverge.

## Validate

The standalone intent — critique an existing spine without changing it. Run the Reviewer Gate (`references/reviewer-gate.md`) against it and deliver the report, then offer to roll the findings into an Update. (At Finalize the same gate runs as your own pre-handoff check, where you apply the fixes instead of reporting.)

