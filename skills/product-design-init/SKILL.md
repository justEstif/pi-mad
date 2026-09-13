---
name: product-design-init
description: "Scaffolds a repo-local product-design skill with a 5-mode request router (Shape, Implement, Review, Copy, Harden), an operating contract, routed references, shipped-PR exemplars, and eval placeholders into the current repository. Use when setting up design standards for a repo so agents learn why patterns exist, not just what shipped. Interviews the user first, then writes .agents/skills/product-design/ files; ships structure only and never invents standards content; also writes the deterministic content-standards track (DESIGN.md judgment, brand.css token vocabulary, named anti-patterns) and supersedes the standalone init-design-system skill."
disable-model-invocation: true
---

# Product Design Init

One-shot generator that scaffolds a **repo-local `product-design` skill** into the user's repository, following a published product-design skill structure: a 5-mode request router, an operating contract, routed references, exemplars from shipped PRs, and a coverage-gaps list. It ships **structure, not standards** — every reference file is an empty scaffold with guidance comments. Only the user's team can record their product judgment. It also writes the deterministic content-standards track below (DESIGN.md judgment + brand.css vocabulary + named anti-patterns) and **supersedes the standalone `init-design-system` skill** — nothing else needs to bootstrap a repo design system.

Run once per repository. Afterwards, design work in that repo is governed by the generated skill, not this one.

## 1. Interview — HALT first

Ask the user (via the question tool when available; otherwise plain questions in chat) and **HALT until you have answers**:

1. **Product name** — including sub-products, if any.
2. **Surfaces** — e.g. dashboard, settings, onboarding, marketing.
3. **Where standards live today** — design system? written docs? tribal knowledge? nothing?
4. **Brand voice notes** — tone, verb preferences, words to avoid.
5. **Existing linters/CI** — eslint, stylelint, Biome, CI workflows that could host design rules.

If the user cannot answer some items, continue and leave those as `TODO(...)` placeholders. **NEVER invent answers** to keep moving.
**Why:** the scaffold substitutes the user's product reality into the templates; guessed names, surfaces, or voice produce a skill that misroutes decisions from day one.
**Instead:** mark unresolved items `TODO(...)`, fill what you can from the repo itself (package.json, docs, existing configs), and list every remaining placeholder in the close-out.

## 2. Scaffold the repository

Copy assets from this skill's directory into the target repo, substituting `{{PRODUCT_NAME}}`, `{{SURFACES_LIST}}`, `{{STANDARDS_HOME}}`, `{{VOICE_NOTES}}`, `{{LINTERS}}` (unresolved → `TODO(...)`):

| Source (this skill) | Destination (user repo) |
| ------------------- | ----------------------- |
| `assets/SKILL.template.md` | `.agents/skills/product-design/SKILL.md` |
| `assets/references/` (8 files) | `.agents/skills/product-design/references/` |
| `assets/exemplars/pr-template.md` | `.agents/skills/product-design/exemplars/pr-template.md` |
| `assets/tooling-evals/FIXTURES-README.md` | `tooling/evals/FIXTURES-README.md` |
| `assets/brand.css` (template) | `.agents/skills/product-design/references/brand.css` (placeholders replaced, per §2b) |

Do not create anything else. Do not copy upstream standards content, design-system rules, or any invented guidance into the scaffolds.

## 2b. Content-standards track (DESIGN.md + brand.css + anti-patterns)

Alongside the router scaffold, generate the design-system layer the agents can actually obey mechanically. Pi (and any agent) has no taste by default — taste lives in the project, encoded as three parts: prose judgment, a stylesheet with a documented class/token vocabulary, and named anti-patterns. This track was absorbed from the former `init-design-system` skill.

1. **Confirm there is nothing to adopt first.** Existing `.pi/skills/` or `.agents/skills/` design skills, `DESIGN.md`/`design.md` at the root, a theme config (Tailwind config, global CSS custom properties), or a component library (`src/components/ui/`, shadcn). If found → stop; use it as the only source of truth and never override with global defaults.
2. **Gather brand inputs**: existing site, logo, marketing assets, or reference screenshots (desktop AND mobile, plus hover/empty/loading states). If none exist, confirm direction with the user before inventing anything — never invent placeholder brand values.
3. **Write `DESIGN.md` at the repo root** (or fill the scaffold's judgment reference) with the project's design judgment: scope, reader and task, and **observable** rules — "evidence tables use the full available width", not "make the table less cramped". A rule that can't be checked can't be followed reliably. Include the reader's-job rule: same tokens, different page structure per artifact — a planning page puts controls first, a proposal leads with the recommendation. One design system ≠ one template.
4. **Write `.agents/skills/product-design/references/brand.css`**: copy this skill's `assets/brand.css` template and REPLACE every placeholder with the project's real brand values from step 2. Document the class/token vocabulary in the scaffold so the agent composes named classes and never needs to read the CSS.
5. **Name the anti-patterns** in the scaffold's rules reference. Named generated-design failures are recognized and avoided far more reliably than vibes. Include at minimum: generic-SaaS-dashboard drift, centered-everything, decorative gradients substituting for hierarchy, truncated/width-starved tables, equal-weight card grids that bury the primary action, emoji-as-icon.
6. **Route corrections to the narrowest enforcing place**: judgment → scaffold prose; repeatable mechanics → named class in `brand.css`; mechanical failure (width-starved tables, missing focus states) → deterministic check via browser screenshots, not prose. Never hand-tune a generated page.

Pitfalls: never ship `assets/brand.css` placeholder values as a real brand — it is a template to replace. Real reference images beat adjectives — "clean and modern" is not a spec. Check state coverage (hover, focus-visible, disabled, empty, error), not just the happy path.

## 3. Wire the trigger (propose; do not silently edit)

Offer this block for the repo's persistent agent instructions (AGENTS.md / CLAUDE.md) and edit the file only with user confirmation:

```
When shaping, editing, or reviewing user-facing UI, load
.agents/skills/product-design/SKILL.md.

Applies to:
- user-facing pages and components in {{SURFACES_LIST}}
- copy, interaction, accessibility, responsive behavior, and states

Skip:
- backend-only work with no user-visible effect
- telemetry, generated files, documentation, and marketing
```

## 4. Close: print the maintenance loop

Finish by printing this loop (adapted from the published workflow):

- **Review evidence → propose guideline updates.** Collect design feedback (PR comments, issues, support threads) as raw evidence; group and verify it separately from judgment; every candidate stays pending until a human accepts it into the narrowest destination — a routed reference, an exemplar, a lint rule, an eval, or coverage-gaps.md.
- **Coverage-gaps tracks unstandardized areas.** Any decision agents repeatedly make without a recorded standard gets a row in `coverage-gaps.md` until the team accepts one.
- **Prefer deterministic checks.** If code can identify the failure without rendering, avoid false positives, and name a concrete fix → propose a lint rule; otherwise keep it as agent guidance. New standards and product policy always require a human decision.
- **Keep guidance current.** Standards change as the product changes; every update needs evidence plus human review, and rules that stop helping get removed.

Recommend wiring the deterministic subset as linters/CI using the repo's own guardrails approach (offer the `repo-guardrails` skill if available), and building the first eval fixtures per `tooling/evals/FIXTURES-README.md` once real copy/interface decisions exist.

Report: files written, placeholders still marked `TODO(...)`, and the suggested AGENTS.md trigger block.

## Boundaries

- **NEVER ship invented or upstream-owned standards** (their product-judgment bullets, design-system rules, named upstream tooling) in any scaffold.
  **Why:** the generated skill must encode the user's product judgment, not borrow authority from another team's decisions; borrowed rules are unverifiable against this repo and mislead every later agent.
  **Instead:** ship headings, guidance comments, and the rule-record format; the team fills content with evidence and human acceptance.
- **NEVER blur the modes the generated skill enforces** — an audit must not become edits, a copy pass must not become a redesign, hardening must not change direction.
  **Why:** mode separation is the core of the generated skill's value; collapsing modes recreates the unscoped-design problem the router exists to prevent.
  **Instead:** keep each scaffold's mode contract intact verbatim and let the generated skill's own router resolve ambiguity at request time.
- Keep placeholders visible (`TODO(...)`); never delete a scaffold file for being empty, and never fill it with plausible-sounding standards to look complete.

