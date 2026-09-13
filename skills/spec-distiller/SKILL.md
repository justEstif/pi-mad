---
name: spec-distiller
description: "One-shot distiller, not a coach: turns any input — idea, brief, PRD, transcript, or mixed notes — directly into a short SPEC.md with a five-field kernel (Why, Capabilities, Constraints, Non-goals, Success signal); use prd-coach or product-brief-coach when you want to draw the document out in conversation instead. With update and validate modes and an optional story-break. Use when the user wants to create a spec, distill something into a spec, update or validate a spec, or break a spec into stories."
disable-model-invocation: true
---

# Spec Distiller

## Overview

Takes any intent input — vague idea, brain dump, PRD, GDD, RFC, brief, Slack thread, customer email, meeting transcript, mockups, mixed multi-source — and produces **SPEC.md** carrying the five-field kernel (Why, Capabilities, Constraints, Non-goals, Success signal) plus companion files for load-bearing content that does not fit or would bloat the kernel with expansive line-item detail. Together they are the machine contract downstream skills and implementing agents build from.

Multiple runs may update the same spec over time. Downstream skills read it as-is: an architecture spine can be drafted against it, and a story breakdown can slice it — see `story-slicer` for the full facilitated breakdown.

## Conventions

- Bare paths (e.g. `assets/spec-template.md`) resolve from this skill's directory.

## Workspace

The spec is **always a folder**, named `specs/spec-{slug}/` under the project working directory by default unless the user points elsewhere.

`{slug}` describes the thing being specced, not the input shape:

- Source artifact already carries a slug (e.g., `prd-foo-bar-2026-05-23/`): inherit (`foo-bar`).
- Sparse, in-chat, or multi-source input: ask the user for one.

Same slug = same folder. A second run with the same `{slug}` lands at the existing spec folder and updates in place, preserving capability IDs.

**No input.** Ask the user to share a file path, paste content, explain the idea in detail, or point to a source.

Inside the spec folder:

```
<spec-folder>/
  SPEC.md                  ← uppercase, the kernel — DERIVED from .memlog.md, never hand-edited
  <companion-1>.md         ← optional, content-typed (e.g. glossary.md); spec-authored ones are derived too
  <companion-2>.md
  stories.yaml             ← optional, written only by Story Breakdown — fixed name, never in companions:
  .memlog.md               ← canonical, append-only memory; what SPEC.md is distilled from
```

## Memory and derivation

`.memlog.md` is canonical — an append-only, chronological record of every decision, constraint, capability (with its stable `CAP-N`), assumption, open question, and bit of user direction, one line each in the order it happened, never edited or reordered. Write each entry as a single markdown line tagged with its type:

```
- [decision] Postgres over Mongo — team already operates it at scale
- [capability] CAP-3 — offline playback for downloaded tracks
- [event] spec finalized
```

Types: `decision`, `constraint`, `capability`, `assumption`, `question`, `direction`, `note`, `event`. `SPEC.md` and every spec-authored companion are **derived on each run** from the memlog (the decision-of-record) plus the sources it cites for raw content — never hand-patched.

Deriving the contract from a living log instead of editing the contract in place is what lets the steps around the spec (UX, architecture, epics) run in any order and feed the same spec without merge drift: the log only accumulates, the artifact is re-rendered. So the spec is updated *only* by re-deriving it here — this skill is its single writer; a hand-edit to `SPEC.md` from outside is unsupported and is overwritten on the next derive.

At create, open the memlog with one line: `- [event] spec opened — topic: <what is being specced>`. Never read it back except to resume an existing spec.

## The Operation

Read the input and its ancillary linked materials. If there is no input, follow the no-input branch in **Workspace** (ask). If a prior `.memlog.md` exists at the target folder, read it — the operation becomes an update, and the memlog (not the rendered `SPEC.md`) is the authority on what was decided and on capability IDs. Preserve those IDs; new capabilities get the next unused `CAP-N`; never reuse retired IDs. Otherwise this is a create, and the first move is opening the memlog.

When the input is structured and pre-sorted (a PRD with an addendum, a GDD, a brief produced by an upstream flow), trust the authored separation: lift kernel-fitting content into SPEC.md, lift overflow into appropriately-named companions. When the input is mixed (a brain dump, a transcript, an RFC, a customer email), do the sorting yourself: walk each claim, apply the three-lens load-bearing test (Spec Law rule 7), and route to the kernel field or a companion.

Distill the input into the five-field kernel using `assets/spec-template.md` as the skeleton. When input is rich, extract directly — no elicitation. When input is sparse, choose: **express** (best-effort distill, every gap becomes an `open_questions[]` entry) or **guided** (walk the five fields with the user one at a time). Ask the user which they want.

A recognized domain implication the input leaves unaddressed *is* such a gap — name it as an `open_questions[]` entry (healthcare input silent on PHI/HIPAA, payments silent on PCI, control systems silent on fail-safe) and move on. Flag it; never invent the answer or coach toward it. If these dominate, the input is too thin — suggest the user develop the idea first (`idea-forge` pressure-tests it, or a fuller requirements-coaching pass draws the vision out).

Write lean from the first pass: every sentence must earn its place. Decoration costs tokens and dilutes downstream readers.

Log each decision, capability, constraint, and accepted change to `.memlog.md` as it is made — that running record is what the render reads. Because the log is append-only, a later entry supersedes an earlier one on the same point while the history stays intact. When two currently-live sources or companions disagree on the same field, or an either/or never got resolved, surface it to the user rather than silently choosing — the resolution is itself a new memlog entry.

If the input is genuinely too thin to distill (e.g. "an app for hikers" with no surrounding context), stop and say so. This skill distills; it does not coach.

## Load-bearing

A claim is **load-bearing** if any consumer (downstream skill, implementing agent, verification pass) would change a decision without it.

## Companions

When load-bearing content does not fit the five-field kernel, it lives in a companion. The kernel cites it; the companion holds it. Companions are part of the contract; every consumer reads `companions:` in SPEC.md frontmatter to discover them. Companions follow the same lean discipline as SPEC.md (Spec Law rule 8).

**Spawn a companion when the content needs more than one kernel-shape line:** multi-item catalogs (per-entity matrices like archetypes, drinks, modes, routes), tables, diagrams (always), editorial voice rules, long-form reference material the kernel cites by name (glossary, brownfield notes, project conventions). Single-line decision-benders stay in Constraints; intent+success pairs stay in Capabilities. If a kernel field is starting to bullet into sub-bullets, the content has outgrown the kernel and wants a companion.

Companions are either:

- **Spec-authored** companions are written by this skill and live as **siblings of SPEC.md** (e.g., `glossary.md`, `patron-archetypes.md`). They are owned here and may be edited on update operations.
- **Adopted** companions are load-bearing artifacts written by an upstream flow that downstream still needs to read. They are referenced into `companions:` by relative path but NOT edited here (e.g., a `DESIGN.md` or `EXPERIENCE.md` from a UX run, an integration partner's API spec, an architecture spine). The originating flow owns them.

Two rules govern companions:

1. **Name spec-authored companions for the content type they hold.** `glossary.md`, `<entity-class>.md` (e.g. `patron-archetypes.md`, `medication-routes.md`, `flight-modes.md`), `stack.md`, `conventions.md`, `brownfield.md`, `architecture-diagrams.md`, `state-machines.md`, `failure-modes.md`, `compliance-references.md`. The principle: "a reader should know what is inside before opening it." Adopted companions keep whatever name their originating flow gave them.
2. **Diagrams always land in a companion**, regardless of size. SPEC.md kernel holds prose only. Mermaid blocks, ASCII diagrams, and image references all live in a companion (e.g. `architecture-diagrams.md`), with sibling image files referenced from there.

Pre-existing project-wide docs (e.g. `project-context.md`) that downstream needs are listed as **adopted companions**, never duplicated into SPEC.md or a spec-authored companion.

`stories.yaml`, when produced, is spec-authored but deliberately **not** a companion — see Story Breakdown below.

## Spec Law

Every spec must satisfy these eight rules. The operation aims for them; the self-validate sweep enforces them.

1. **Each capability has both `intent` and `success`.** Missing either = not a capability.
2. **Intents describe WHAT, not HOW.** Implementation prescription belongs in a companion (stack, conventions).
3. **Constraints actually bend design decisions.** A "constraint" that rules nothing out is decoration.
4. **Non-goals are explicit.** At least one. Absence means downstream skills fill the vacuum.
5. **Success signal is concrete enough to test or demonstrate against.** "Users love it" doesn't qualify.
6. **Capability IDs are stable and unique.** Never reused, never renumbered.
7. **Preservation.** Every load-bearing source claim lands in SPEC.md or a companion. Wrapper ceremony does not.
8. **Lean prose.** Every sentence carries load-bearing content. Cut decoration, hedges, backstory, throat-clearing. Applies to SPEC.md, companions, and `.memlog.md`.

## Self-Validate

After every create or update, sweep the resulting artifact in **two passes** before presenting.

**Pass 1 — Coherence.** Judge the spec against Spec Law rules 1–6 and 8. For anything that fails or feels weak, attempt to fix it without inventing content the input did not support. Calls made without direct confirmation become `assumptions[]`; gaps that could not be filled become `open_questions[]`.

**Pass 2 — Preservation.** Walk the source claim by claim. Confirm each load-bearing claim landed in SPEC.md or a companion. Wrapper-ceremony drops are logged under "Wrapper-only content" so the drop is on the record, not silent.

Record the verdict for each pass to `.memlog.md` as an `[event]` entry. In interactive mode, review it with the user.

## Validate and no change signal

When the user points the skill at an existing spec folder (or its SPEC.md) with no change signal, offer to:

- **Validate** — run both Self-Validate passes against the spec as it stands and report the findings without rewriting anything;
- **Review** — walk the assumptions or open questions with the user;
- or determine what they actually want to do.

## Story Breakdown (optional)

Requires `SPEC.md` on disk — run the normal Operation first if it doesn't exist yet. Offer it at most once per run when the input reads as multiple independently shippable slices; a decline ends the offer for this run, not forever. Also run it on direct request ("break this into stories") whenever `SPEC.md` exists. When a spec update runs and `stories.yaml` exists, check the story descriptions against the updated spec; if any no longer matches, say so and offer to re-run Story Breakdown. The update itself never rewrites `stories.yaml`.

Either way, walk the capabilities and constraints with the user and propose a story per independently reviewable slice — this is a conversation, not a silent render. For each story, ask the user for `spec_checkpoint`, `done_checkpoint`, and any `invoke_dev_with` note rather than defaulting them silently; capturing that human judgment is what the fields are for. If the conversation surfaces load-bearing detail beyond dispatch notes (a constraint, a design decision), route it into SPEC.md or a companion — `invoke_dev_with` carries dispatch notes only (Spec Law rule 7 still applies).

This is the lightweight in-spec slice. When the user wants a full facilitated breakdown — epics organized by user value, Given/When/Then acceptance criteria per story — that is `story-slicer`, which can take this spec as its requirements input.

The output is `stories.yaml`, a sibling of `SPEC.md` inside the spec folder, discovered by that fixed name — same convention as `SPEC.md` and `.memlog.md`. Never list it in `companions:` and never point a frontmatter key at it: companions carry the what-to-build contract every consumer reads; `stories.yaml` is input for whichever tool dispatches the stories.

Field definitions, the validity rules, and a worked example live in `assets/stories-schema.md`. Before writing or re-writing the file, check every entry against those rules; fix violations rather than presenting a file that fails them. Record the check's verdict to `.memlog.md` as an `[event]` entry, the same discipline as Self-Validate.

Derive `stories.yaml` from `.memlog.md` exactly like any other spec-authored artifact: log each proposed story (`[decision]`) as the user agrees to it, then render. On a later run against the same spec folder, re-derive the same way, handling ids per the schema's update semantics.

## Output

Share the spec folder path conversationally. Name the capability count, the companions produced, and the verdict in one or two sentences. Name the story count too if `stories.yaml` was written this run. If `assumptions[]` or `open_questions[]` are non-empty, list them (short — one line each) and invite the user to walk through them. Make clear that addressing them can update the source input (if it was a file), the spec, or both — whichever combination the user prefers. Do not dump JSON or present a wall of output.

## After Spec is Output

Any update to the spec — resolved assumptions, answered open questions, other changes — is appended to `.memlog.md` as it happens. When a change overrides something that came from a source input, offer to update that source too, so upstream and the spec don't silently diverge.

Natural next steps downstream: draft an architecture spine against the spec (`architecture-spine`), or break it into stories (`story-slicer`).

## Frontmatter conventions

- `companions:` array of `.md` files downstream MUST read alongside SPEC.md to have the full contract. Paths may point inside the spec folder (spec-authored companions like `glossary.md`) or outside it (adopted companions like `../planning-artifacts/ux-designs/ux-foo-bar-2026-05-23/DESIGN.md`). The split between spec-authored and adopted is implicit by path; downstream treats both the same.
- `sources:` array of paths to files that were **fully absorbed** into the SPEC, with no remaining downstream value (e.g., a PRD whose every load-bearing claim is now in the kernel). Listed for audit and for re-reading on update. Downstream does NOT read these. Files that downstream still needs to read belong in `companions:`, not here.
- **Do not list** the memlog, README files, organizational artifacts, or any operational record of how upstream flows produced their artifacts. Those are not source content; they are process metadata that downstream consumers don't need.

