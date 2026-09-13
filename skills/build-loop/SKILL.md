---
name: build-loop
description: 'Turn a delegated feature request, issue, or bug fix into working, reviewed code through clarify → spec → plan → implement → adversarial review, with a hard definition of ready. Use when the user delegates implementation work; a bare issue link counts. Skip obvious mechanical maintenance such as typo-only, formatting-only, ignore-file, or configuration-hygiene edits. Do not volunteer for user-directed interactive edits or version-control operations that only record existing work.'
disable-model-invocation: true
---

# Build Loop

**Goal:** Turn delegated intent into a hardened, reviewable change.

**CRITICAL:** If a step directs you to another file, read it fully and follow it. No exceptions.

Subagents, when the capability is available, are an important part of this workflow. Use them as directed by the workflow steps. If you need an explicit user instruction to run them, ask once now for the whole workflow run.

## READY FOR DEVELOPMENT STANDARD

A specification is "Ready for Development" when:

- **Actionable**: Every task has a file path and specific action.
- **Logical**: Tasks ordered by dependency.
- **Testable**: All ACs use Given/When/Then.
- **Complete**: No placeholders or TBDs.
- **Sufficient**: No known requirement, acceptance, dependency, or implementation gaps remain unresolved.
- **Coherent**: No unresolved ambiguities or internal contradictions.

## SCOPE STANDARD

A specification should target a **single user-facing goal** within **900–1600 tokens**:

- **Single goal**: One cohesive feature, even if it spans multiple layers/files. Multi-goal means >=2 **top-level independent shippable deliverables** — each could be reviewed, tested, and merged as a separate PR without breaking the others. Never count surface verbs, "and" conjunctions, or noun phrases. Never split cross-layer implementation details inside one user goal.
  - Split: "add dark mode toggle AND refactor auth to JWT AND build admin dashboard"
  - Don't split: "add validation and display errors" / "support drag-and-drop AND paste AND retry"
- **900–1600 tokens**: Optimal range for LLM consumption. Below 900 risks ambiguity; above 1600 risks context-rot in implementation agents.
- **Neither limit is a gate.** Both are proposals with user override.

## Conventions

- Defaults live in `config.toml` next to this file; edit values directly. They are plain defaults: the route-selection rule, the implementation handoff, the review layers, and the post-completion behavior. Each step names the default it uses.
- Step files and `spec-template.md` resolve from this skill's directory. Project paths resolve from the project working directory. Specs and the deferred-work log live under `specs/` in the project working directory.
- Whenever this workflow captures or records a version-control revision, obtain the full canonical identifier directly from version control and preserve it verbatim.

## WORKFLOW ARCHITECTURE

This uses **step-file architecture** for disciplined execution:

- **Micro-file Design**: Each step is self-contained and followed exactly
- **Just-In-Time Loading**: Only load the current step file
- **Sequential Enforcement**: Complete steps in order, no skipping
- **State Tracking**: Persist progress via spec frontmatter and in-memory variables
- **Append-Only Building**: Build artifacts incrementally

### Step Processing Rules

1. **READ COMPLETELY**: Read the entire step file before acting
2. **FOLLOW SEQUENCE**: Execute sections in order
3. **WAIT FOR INPUT**: Halt at checkpoints and wait for human
4. **LOAD NEXT**: When directed, read fully and follow the next step file

### Critical Rules (NO EXCEPTIONS)

- **NEVER** load multiple step files simultaneously
- **ALWAYS** read entire step file before execution
- **NEVER** skip steps or optimize the sequence
- **ALWAYS** follow the exact instructions in the step file
- **ALWAYS** halt at checkpoints and wait for human input

## FIRST STEP

Read fully and follow `step-01-clarify-and-route.md` to begin the workflow.

> Adapted from BMAD-METHOD, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
