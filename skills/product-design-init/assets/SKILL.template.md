---
name: product-design
description: "Single entry point for product design and user-facing product implementation in {{PRODUCT_NAME}}. Use whenever work changes what a user sees, understands, chooses, or does: shaping requirements and flows; building or redesigning pages and components; reviewing URLs, screenshots, or diffs; improving product copy, information architecture, component choice, hierarchy, layout, interaction, accessibility, responsive behavior, and loading, empty, error, permission, or destructive states. Trigger on design, UX, UI, usability, flow, onboarding, settings, dashboard, build, improve, fix, audit, review, polish, simplify, or production-ready requests across {{SURFACES_LIST}}. Also use when backend behavior changes a user-visible outcome. Not for backend-only work with no user-visible effect, tests with no shipped UI impact, telemetry-only work, documentation, or marketing content."
---

# {{PRODUCT_NAME}} Product Design

Make the interface correct for the user, the product, and {{PRODUCT_NAME}}. Working code is not enough: choose the right interaction, make scope and consequences clear, cover reality beyond the happy path, and verify the rendered result.

Skip backend-only work with no user-visible effect, telemetry, console-only errors, generated files, and tests with no shipped UI impact.

## Scaffold Status

The files under this skill's references directory shipped as **scaffolds** — headings and guidance comments, not standards. Until the team records accepted decisions in them:

- Treat this skill as structure and process. It defines how to decide; it does not yet record what {{PRODUCT_NAME}} decided.
- When a routed reference has no accepted guidance for the problem, follow the closest existing repo convention for that surface, say plainly that no standard exists, and add a row to the coverage-gaps reference.
- **NEVER improvise a "{{PRODUCT_NAME}} standard"** from taste, a single file, or a single screenshot.
  **Why:** shipped code proves what exists, not what is correct; a fabricated standard misroutes every decision that cites it.
  **Instead:** cite the concrete repo pattern you followed as adjacent evidence, mark the uncertainty explicitly, and record the open question in coverage gaps.

## Operating Contract

- **Start with the job, not the pixels.** Identify who is acting, what they are trying to accomplish, the product object involved, and what the system will change.
- **Define the outcome before the output.** Establish the current user problem, desired behavior, success signal, and non-goals before choosing a surface or component.
- **Use evidence, not taste.** Trace decisions to product behavior, canonical repo guidance, an accepted design decision, or a verified adjacent pattern.
- **Separate facts from decisions.** Mark assumptions and unresolved product choices explicitly; do not hide them inside implementation details.
- **Treat shipped code as evidence, not automatic precedent.** Check it against current components, product behavior, and explicit guidance before repeating it.
- **Choose the smallest coherent intervention.** Consider better defaults, behavior, or reuse before adding UI. Do not solve one job by creating unrelated settings or abstractions.
- **Decide before decorating.** Resolve information architecture, component semantics, interaction, and state behavior before styling or rewriting copy.
- **Design every reachable state.** Include only states the product can actually enter, but do not stop at the populated success case.
- **Verify the real surface.** Source inspection establishes behavior; a rendered interface establishes visual and interaction quality. Never claim visual verification from code alone.

## Request Modes

Resolve the mode from the user's verb and artifact before acting.

| Mode      | Typical request                                            | Required behavior                                                                                                                                                     |
| --------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shape     | "Design this flow", "How should this work?", feature brief without settled UI | Frame the problem and evidence, compare material alternatives, then define the flow, states, acceptance criteria, risks, and open decisions. Do not edit unless asked. |
| Implement | "Build", "fix", "improve", "make compliant"                | Resolve material product decisions, then implement the smallest coherent end-to-end change within scope. Do not absorb unrelated review findings.                     |
| Review    | "Audit", "critique", "what's wrong?", code review          | Inspect source and rendered evidence, then report prioritized findings. Do not edit unless asked.                                                                     |
| Copy      | "Fix the copy", "rewrite these errors"                     | Edit user-facing language, accessible names, and directly required markup only. Report structural blockers without silently broadening scope.                         |
| Harden    | "Polish", "production-ready", "handle edge cases"          | Preserve the settled product direction while fixing state, resilience, responsive, accessibility, and finish defects.                                                 |

When intent is ambiguous, use the narrowest mode supported by the verb. A URL, screenshot, route, or component identifies scope; it does not by itself authorize edits.

A **material decision** changes the user's task, default, scope, consequence, navigation, interaction surface, or reachable states. Copy mechanics, token replacement, and established component substitutions usually are not material.

## Decision Authority

Resolve conflicts in this order:

1. The user's explicit goal and constraints.
2. Verified user/product evidence and system truth.
3. This repository's persistent agent instructions.
4. Accepted product/design decisions and exemplars with stable evidence.
5. Verified adjacent shipped patterns in the same product area.
6. General interface heuristics.

## Workflow

### 1. Set scope and mode

Name the target surface and request mode in the work plan or review notes.

### 2. Load product context

Read the standards home ({{STANDARDS_HOME}}) and scan the references index plus exemplars for a shipped decision that already covers the problem.

### 3. Model the product decision

For material changes, work through the product-judgment reference: who is the user, what job changes, what does the system now do on their behalf.

### 4. Map the surface and states

Inventory entry points, visible regions, overlays, transitions, exits, and return paths. Map only reachable states, including loading, empty, sparse, populated, validation, error, permission, disabled, optimistic, stale, destructive, and responsive variants.

### 5. Load the routed references

| Need                                                        | Load                                    |
| ----------------------------------------------------------- | --------------------------------------- |
| Material product decision (task, default, scope, consequence) | references/product-judgment.md        |
| Hierarchy, layout, component choice, interaction quality     | references/interface-quality.md         |
| Loading, empty, error, permission, destructive, stale states | references/resilience.md                |
| Any user-facing language or accessible name                  | references/copy.md + references/glossary.md |
| Known interaction patterns (forms, modals, navigation)       | references/patterns.md                  |
| Mechanically checkable rules and their stable IDs            | references/rules.md                     |
| Whether a standard exists at all for this area               | references/coverage-gaps.md             |
| Design system and accessibility guidance                     | {{STANDARDS_HOME}}                      |
| Proven shipped decisions worth repeating                     | exemplars/ (see pr-template.md)         |

### 6. Decide, then implement

For each non-mechanical change, be able to answer: what user problem does this solve, why is this component appropriate, what consequence must the interface communicate, which evidence supports the decision, and what is the smallest coherent change?

### 7. Verify

1. Confirm the primary job and acceptance criteria.
2. Run repository lint checks ({{LINTERS}}).
3. Inspect relevant compact and wide viewports.
4. Exercise every materially changed reachable state.
5. Verify keyboard order, focus movement, loading behavior, and pointer/touch targets.
6. Test long content, large values, constrained width, and localization/RTL risk.

## Review Output

Lead with findings, ordered by user impact:

- **P0:** blocks the primary task, creates severe accessibility failure, or can cause unrecoverable user harm.
- **P1:** likely task failure, misleading consequence, missing critical state, or major responsive/accessibility defect.
- **P2:** meaningful friction, inconsistency, weak hierarchy, or recoverability issue.
- **P3:** minor craft or consistency improvement.

For each finding include: file/line or rendered location, verification status, canonical source (or "no standard — coverage gap"), user consequence, and smallest concrete fix.

## Skill Integrity

- Add or change a rule only after current-source verification and human acceptance.
- Record scope, rationale, evidence, exceptions, and a bad/good example, using the record format inside each reference.
- Prefer the narrowest destination: a routed reference, an exemplar, a lint/eval check, or a coverage gap.
- Keep deterministic checks mechanical. Keep judgment in prose with its evidence and degree of freedom.
- Never promote one screenshot, one shipped file, or one reviewer comment into a universal rule by itself.

