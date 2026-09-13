# BMAD → pi-shelf Migration Audit

Full audit of every not-yet-ported BMAD skill. Sources: `/tmp/bmad-method/skills/` (27), `bmad-cis/src/skills/` workshop suites (4), `bmad-builder/skills/` (3) + samples note, `web-bundles/` (verification only).

**Machinery** = number of files in the skill referencing `uv run` / `_bmad/` / `customize.toml` / `resolve_customization` / `{workflow.` / `{project-root}`. **State dep** = does the skill's core value assume BMAD-managed artifacts (PRD/epics/stories in `docs/`, `_bmad/` config, sprint-status, or `skill:` chaining to other BMAD skills)?

**web-bundles verified**: exactly the 6 already-ported dirs (`brainstorming-coach`, `market-and-industry-research`, `prd-coach`, `prfaq-coach`, `product-brief-coach`, `ux-coach`), confirmed by `bundles.json` (6 entries) and the README shelf table. Nothing further to port there.

**Key structural finding**: the web-bundle coaches already ported were *generated from* the corresponding bmad-method skills (`bmad-prd`, `bmad-prfaq`, `bmad-product-brief`, `bmad-ux`, `bmad-brainstorming`), so those five are duplicates. Conversely, the ported CIS coach skills are thin persona shells (SKILL.md + config.toml; menu prompts are one-line summaries) — the 4 CIS *workshops* hold the full methodology and are genuinely incremental.

## Summary table

| skill | source | files | machinery | state dep? | overlap | verdict |
|---|---|---|---|---|---|---|
| bmad | bmad-method | 16 | 14 | Y — routes/installs the BMAD tree itself | — | SKIP |
| bmad-agent-analyst | bmad-method | 3 | 2 | Y — menu dispatches to BMAD skills | persona only (6 lines in customize.toml) | SKIP |
| bmad-agent-architect | bmad-method | 3 | 2 | Y — same | same | SKIP |
| bmad-agent-dev | bmad-method | 3 | 2 | Y — same | same | SKIP |
| bmad-agent-pm | bmad-method | 3 | 2 | Y — same | same | SKIP |
| bmad-agent-ux-designer | bmad-method | 3 | 2 | Y — same | same | SKIP |
| bmad-architecture | bmad-method | 8 | 5 | partial — prefers SPEC.md/memlog, works from idea/codebase | none ported | PORT-WITH-WORK |
| bmad-brainstorming | bmad-method | 16 | 9 | partial | dup of brainstorming-coach + ideation-coach | SKIP |
| bmad-build | bmad-method | 17 | 4 | partial — epic/sprint machinery, core loop generic | none ported | PORT-WITH-WORK |
| bmad-build-auto | bmad-method | 14 | 5 | Y — unattended variant of bmad-build | dup of bmad-build | SKIP |
| bmad-code-review | bmad-method | 12 | 3 | partial (2 files) | dup of lens-review | SKIP |
| bmad-correct-course | bmad-method | 4 | 2 | Y — impact across PRD/epics/arch/UX docs | none | SKIP |
| bmad-create-epics-and-stories | bmad-method | 8 | 3 | Y as-is (validates PRD/arch docs); genericizable | none | PORT-WITH-WORK |
| bmad-customize | bmad-method | 4 | 3 | Y — authors `_bmad/custom/` overrides | — | SKIP |
| bmad-deep-recon | bmad-method | 21 | 11 | partial — research firewall excludes project context | partial vs market-research | PORT-WITH-WORK |
| bmad-forge-idea | bmad-method | 5 | 3 | N | light vs pressure-test | PORT |
| bmad-party-mode | bmad-method | 10 | 8 | Y as-is (roster = installed BMAD agents); genericizable | distinct from lens-review | PORT-WITH-WORK |
| bmad-prd | bmad-method | 9 | 4 | partial | dup of prd-coach (template + validation checklist already ported) | SKIP |
| bmad-prfaq | bmad-method | 11 | 3 | partial | dup of prfaq-coach | SKIP |
| bmad-product-brief | bmad-method | 4 | 2 | partial | dup of product-brief-coach | SKIP |
| bmad-project-context | bmad-method | 5 | 2 | N — explicitly standalone-aware | none | PORT |
| bmad-qa-generate-e2e-tests | bmad-method | 4 | 2 | Y — story-driven paths | thin generic value | SKIP |
| bmad-retrospective | bmad-method | 14 | 7 | Y as-is (sprint-status, story files); git evidence is generic | none | PORT-WITH-WORK |
| bmad-spec | bmad-method | 6 | 2 | partial — "downstream skills" is framing, not dependency | none | PORT-WITH-WORK |
| bmad-sprint-planning | bmad-method | 11 | 7 | Y — epics → sprint-status.yaml | — | SKIP |
| bmad-ux | bmad-method | 18 | 5 | partial | dup of ux-coach (SKILL ported; IDE asset library is richer) | SKIP |
| bmad-walkthrough | bmad-method | 10 | 3 | N (2 incidental story refs) | none (lens-review = agent critique, this = guided human review) | PORT |
| bmad-cis-design-thinking | bmad-cis | 4 | 2 | N | substance missing from ported design-thinking-coach | PORT-WITH-WORK |
| bmad-cis-innovation-strategy | bmad-cis | 4 | 2 | N | substance missing from ported innovation-coach | PORT-WITH-WORK |
| bmad-cis-problem-solving | bmad-cis | 4 | 2 | N | substance missing from ported problem-solving-coach | PORT-WITH-WORK |
| bmad-cis-storytelling | bmad-cis | 4 | 2 | N | substance missing from ported storytelling-coach | PORT-WITH-WORK |
| bmad-bmb-setup | bmad-builder | 6 | 6 | Y — writes `_bmad/config*.yaml`, help CSV | — | SKIP |
| bmad-eval-runner | bmad-builder | 13 | 6 | N — platform-agnostic by design (adapter seam) | none; high value to pi-mad itself | PORT-WITH-WORK |
| bmad-module-builder | bmad-builder | 20 | 11 | Y — scaffolds BMAD module packaging | — | SKIP |

**builder/samples/** (1 line): 7 samples = 5 persona-shell demo agents (`bmad-agent-code-coach`, `creative-muse`, `diagram-reviewer`, `dream-weaver`, `sentinel`), `bmad-excalidraw` (guided/autonomous Excalidraw diagramming — only mildly interesting given pi's excalidraw MCP; still a demo, SKIP), `sample-module-setup` (module-setup demo). All demos for the builder module; nothing to port.

## PORT — porting notes

### bmad-forge-idea → `idea-forge`
- **What**: standalone questioning session that pressure-tests one half-formed idea with rotating personas until the user can act on it or drop it with conviction; optional `forged-idea.md` output.
- **Strip**: activation ceremony (resolve_customization/resolve_config), memlog.py + resume machinery, `resolve_personas.py` (personas are already inline in SKILL.md's "The personas" section), persona-inheritance detection.
- **Inline**: persona roster, open-session intent discovery, the forge question loop, exits.
- **Description**: "Pressure-test a half-formed idea in a questioning conversation with rotating skeptic personas until you can act on it or drop it with confidence."
- Overlap note: pressure-test = elicitation menu applied to *recent output* as a refinement checkpoint; this runs a full session on *an idea in your head*. Complementary — cross-reference, don't merge.

### bmad-project-context → `repo-context`
- **What**: conversational setup/adoption/refresh/audit of a repo's `AGENTS.md` agent-instructions block, plus recording observed agent mistakes as pitfalls. Five intents: setup, adopt, refresh, record, audit.
- **Strip**: two resolve_customization/config steps (skill already has explicit "Standalone: skip" fallback), persistent_facts handling.
- **Keep verbatim**: `references/best-practices.md` and `references/template.md` (loaded "before anything else" — they are the skill's judgment core), the 5-intent detection and step flows.
- **Description**: "Author, adopt, refresh, and audit a repository's AGENTS.md agent instructions, and record observed agent mistakes as pitfalls."

### bmad-walkthrough → `change-walkthrough`
- **What**: guides a *human* through reviewing a change: orientation (what/why) → walkthrough pass → detail pass → how to test → wrap-up. Produces a review trail.
- **Strip**: the `render_skill.py` loader (point directly at the step files / inline them), absolute-snapshot-path convention, 2 incidental story/epic references in step-01 and step-04 (genericize to "the change").
- **Inline**: workflow.md + the 5 step files flatten naturally into one SKILL.md (~small).
- **Description**: "Walk a human through reviewing a code change: what it's for, what to look at closely, and how to test it."
- Distinct from lens-review (agent critique): this one coaches the user's own review. Cross-reference both.

## PORT-WITH-WORK — porting notes

### bmad-spec → `spec-distiller`
- **What**: condenses any input (idea, brief, PRD, transcript, notes) into `SPEC.md` carrying a five-field kernel (Why / Capabilities / Constraints / Non-goals / Success signal) plus companion files; update/validate/stories modes. The strongest single portable in the set.
- **Surgery**: memlog is woven through "Workspace", "Memory and derivation", "The Operation" — rewrite those to plain conversational/file memory; drop resolve_* activation, headless schemas; keep kernel, Spec Law, Self-Validate, `assets/spec-template.md`, `assets/stories-schema.md`.
- **Decouple**: references to bmad-architecture/bmad-build downstream become prose ("downstream skills can build from this").
- **Description**: "Distill any input — idea, brief, PRD, transcript, notes — into a short SPEC.md with a five-field kernel, plus update, validate, and story-break modes."

### bmad-architecture → `architecture-spine`
- **What**: produces an "architecture spine" — a short consistency contract fixing only the invariants that keep independently-built units from diverging (paradigm, boundaries, state ownership), as coaching or fast path.
- **Surgery**: memlog.py woven into "How a run works" — replace with append-to-notes convention; drop parent-spine/memlog chaining to bmad-spec (keep "inherit settled decisions from any input doc" as prose); drop reviewer-gate's BMAD script assumptions.
- **Keep**: the one-test heuristic, coaching/fast paths, brownfield "ratify don't re-decide", `assets/spine-template.md`; optionally keep `lint_spine.py` if it has no `_bmad/` deps (check before reuse).
- **Description**: "Write a minimal architecture spine — only the invariants separately-built parts can't choose independently — via coaching or fast draft."

### bmad-build → `build-loop`
- **What**: delegated implementation loop: clarify intent → investigate → generate spec (with a strong "Ready for Development" standard) → plan → implement test-first → adversarial review → present. 
- **Surgery**: drop `render_skill.py` loader, `compile-epic-context.md`, `sync-sprint-status.md`, story-key/sprint-status resolution in step-01; keep spec-template, the READY standard, step-02–05, review-prompts (edge-case-hunter, verification-gap), references/claims-check + deletion-check.
- **Input change**: accept a feature request / issue / bug report directly instead of epic stories.
- **Description**: "Turn a delegated feature or fix into working code through clarify → spec → plan → implement → adversarial review, with a hard definition of ready."
- Note: `bmad-build-auto` is the same loop unattended; if unattended iteration matters later, derive it from the ported skill rather than porting separately.

### bmad-create-epics-and-stories → `story-slicer`
- **What**: step-file facilitation that breaks requirements into value-ordered epics and stories with Given/When/Then acceptance criteria; `templates/epics-template.md` is the asset.
- **Surgery**: step-01 "validate prerequisites" hard-requires BMAD PRD/architecture/UX doc paths — change to "any requirements input: PRD, brief, spec, or user-provided notes"; drop persona/config activation; keep the step sequence (design epics → create stories → final validation) and template.
- **Description**: "Break requirements into epics and user stories with complete acceptance criteria, organized by user value."

### bmad-deep-recon → `deep-recon`
- **What**: research director with three services (draft a deep-research prompt, process a finished report into a cited digest, run the research via parallel web fan-out), 6 research types, strong epistemics ("never conclude from training data alone"; research firewall).
- **Surgery**: 11 machinery files — drop memlog.py + recon_kit.py run-folder plumbing or reimplement as plain file convention; keep the epistemics rules, `types/*.md`, and the draft/process reference docs verbatim.
- **Overlap resolution**: market-research (ported) covers market/industry/competitive/regulatory + already drafts a deep-research handoff brief. Keep deep-recon for what market-research lacks: the process-a-report service, user-voice/academic-lit/domain/technical types, and the run-mode fan-out. Add cross-references both ways; do not merge.
- **Description**: "Frame decision-grade research and run it three ways: draft a prompt for your own tool, process a finished report into a cited digest, or fan out parallel web research here."

### bmad-party-mode → `roundtable`
- **What**: orchestrates a multi-persona roundtable discussion (agent-to-agent and with the user), with cast authoring (focus groups, debates, scenes) and run modes (subagent, auto, agent-team).
- **Surgery**: 8 machinery files — drop resolve_party.py roster resolution (roster = installed BMAD agents) and party memlog; replace with "invent or inline-name the cast" (the skill already supports inline casts and `create-party.md` authoring). Keep "Keep It Feeling Like a Party" dynamics, mode references, and authoring guide.
- **Distinct from lens-review**: lens-review is structured critique; roundtable is simulated discussion. Cross-reference.
- **Description**: "Run a lively roundtable between distinct invented personas — debates, focus groups, red-team panels — or author and save a recurring cast."

### bmad-retrospective → `retrospective`
- **What**: evidence-based retro of completed work: gathers the record (diff, commits, docs, logs), surfaces cross-cutting defects no single step shows, produces sourced findings + action items + acceptance verdict.
- **Surgery**: 7 machinery files — drop sprint_status.py and story/epic/sprint-status references; rebase evidence gathering on `git_evidence.py` (diffs/commits, generic) + "whatever docs the work left behind"; keep sourced-findings discipline ("a claim you cannot point at is not a finding"), `references/retro-document.md`, `team-discussion.md`, `acceptance-verdict.md`.
- **Scope change**: "epic" → any completed body of work (feature, milestone, agent dev loop).
- **Description**: "Run an evidence-based retrospective on a completed body of work: sourced findings, action items, and an acceptance verdict."

### bmad-cis-design-thinking → merge into `design-thinking-coach`
- **What**: the full facilitated workflow (context → challenge statement → EMPATHIZE → DEFINE → IDEATE → PROTOTYPE → TEST, with energy checkpoints) plus `design-methods.csv` library and output template.
- **Why**: the ported design-thinking-coach is a persona shell whose menu prompt is a one-line summary of exactly this workflow — the workshop *is* the missing body.
- **Port**: strip the 6-step activation ceremony; append the Execution workflow as the coach's session flow; inline the CSV as a knowledge file; keep template.md. Update the description to cover facilitated end-to-end runs.

### bmad-cis-innovation-strategy → merge into `innovation-coach`
- **What**: disruption-opportunity analysis and business-model innovation workflow + `innovation-frameworks.csv` + template; "brutal truth" strategic-advisor stance.
- **Port**: same pattern — workshop body becomes the coach's session flow; CSV inlined; persona shell kept.

### bmad-cis-problem-solving → merge into `problem-solving-coach`
- **What**: systematic diagnosis workflow (root cause before solutions → options → implementation/validation plan) + `solving-methods.csv` + template.
- **Port**: same pattern as above.

### bmad-cis-storytelling → merge into `storytelling-coach`
- **What**: narrative crafting workflow (story development, emotional arc, channel adaptation) + `story-types.csv` + template.
- **Port**: same pattern as above.

### bmad-eval-runner → `skill-evals`
- **What**: platform-agnostic skill evaluation in 4 modes — baseline (skill vs bare model), variant (does a section earn its place), quality (rubric grading), trigger (description fires/stays quiet, with optimization loop). Includes eval-format spec, grader, description-optimization and self-improvement guides.
- **Surgery**: 6 machinery files — write a pi adapter for the adapter seam (an `adapter-claude-code.json` ships as the example); drop its bundled memlog.py; keep the 4-mode methodology, eval format, grader, and optimization references intact.
- **Why it matters**: this is the quality gate pi-mad can use on itself; highest leverage non-coach skill in the audit.
- **Description**: "Evaluate a skill four ways — baseline vs bare model, section-stripping variants, rubric quality, and trigger firing — and optimize its description from the results."

## SKIP list (one-line reasons)

- **bmad** — router/help/setup/doctor for the BMAD install; pure infrastructure.
- **bmad-agent-{analyst,architect,dev,pm,ux-designer}** — persona dispatchers; ~6 lines of persona + a menu of other BMAD skills; no standalone payload.
- **bmad-brainstorming** — duplicate: the ported brainstorming-coach was generated from it (ideation-coach also covers this space). Optional harvest: the 3-stance model (facilitator/partner/ideate-for-me) could enrich ideation-coach later.
- **bmad-build-auto** — unattended variant of bmad-build; fold into the build-loop port if ever needed.
- **bmad-code-review** — substantially duplicated by ported lens-review (same adversarial/edge-case/verification lineage). Optional harvest: `claims-check.md` + `deletion-check.md` are two lenses lens-review lacks.
- **bmad-correct-course** — sprint change management whose whole job is impact analysis across BMAD PRD/epics/arch/UX artifacts.
- **bmad-customize** — authors TOML overrides for the BMAD customization system.
- **bmad-prd** — duplicate of prd-coach (template + validation checklist already ported).
- **bmad-prfaq** — duplicate of prfaq-coach.
- **bmad-product-brief** — duplicate of product-brief-coach.
- **bmad-qa-generate-e2e-tests** — story-driven paths, thin generic payload (a checklist + framework detection an agent already knows).
- **bmad-sprint-planning** — readiness gate + sprint-status.yaml generation from BMAD epics; pure sprint machinery.
- **bmad-ux** — duplicate of ux-coach at the SKILL level. Optional harvest: its `assets/` (color-themes, design-directions, 5 example DESIGN/EXPERIENCE spines, excalidraw wireframe guide) could enrich ux-coach later.
- **bmad-bmb-setup** — BMAD module installer/config writer.
- **bmad-module-builder** — scaffolds BMAD module packaging (module.yaml, setup skills, help CSVs).

## Recommended batch split for parallel porting workers

| batch | skills | rationale |
|---|---|---|
| **A — spec chain** (bmad-method) | spec-distiller, architecture-spine, story-slicer, idea-forge | the planning chain (idea → spec → architecture → stories); one worker keeps terminology consistent across the chain |
| **B — dev loop** (bmad-method) | build-loop, change-walkthrough, retrospective | the implementation/evidence loop; shares review-prompt style and git-evidence conventions |
| **C — research & collab** (bmad-method) | deep-recon, roundtable, repo-context | independent skills; worker must coordinate cross-references with market-research and lens-review |
| **D — CIS merge** (bmad-cis) | 4 workshop → coach merges (design-thinking, innovation, problem-solving, storytelling) | single repetitive pattern; one worker, four nearly identical merges |
| **E — evals** (bmad-builder) | skill-evals (incl. writing the pi adapter) | specialist work; adapter seam design is self-contained |

Batches A–C touch only new skills/ dirs; D modifies the 4 existing CIS coach skills; E is standalone. No two batches share a target file.

## Final count

- **PORT: 3** — idea-forge (bmad-forge-idea), repo-context (bmad-project-context), change-walkthrough (bmad-walkthrough)
- **PORT-WITH-WORK: 12** — spec-distiller, architecture-spine, build-loop, story-slicer, deep-recon, roundtable, retrospective, 4 CIS coach merges, skill-evals
- **SKIP: 19** — see table and skip list
- Total audited: 34 skills + web-bundles verification (nothing new) + builder samples (nothing to port)
