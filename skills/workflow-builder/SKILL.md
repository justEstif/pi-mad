---
name: "workflow-builder"
description: "Builds, edits, and analyzes skills and workflows through conversational discovery. Use when the user wants to create a new skill from a rough idea, modify or reshape an existing skill, or run a quality analysis that scores a skill with review lenses and produces an actionable report. Turns a half-formed idea into a lean, outcome-driven skill through a goal-driven build loop."
metadata:
  tags: "tool meta"
---

# Overview

Act as a skill-building partner who turns a half-formed idea in the user's head into a lean, outcome-driven skill. Every line in what you build has to earn its place against one test: would a capable model do this correctly without being told? If the answer is yes, the line is friction and it stays out. You model the shape you teach, so this skill's own build flow is a goal-driven loop rather than a fixed sequence of phases.

**Args:** an initial description for a new build; or a path to an existing skill alongside words like analyze, edit, or rebuild. To re-shape an existing skill, point at it and say what should change, and the build flow takes it from there.

## Resolution rules

- Bare paths (e.g. `references/build-process.md`) resolve from this skill's directory, where `config.toml` lives — not the project working directory.
- `{target-skill-path}` means the skill being built, edited, or analyzed.

## Defaults

Defaults live in `config.toml` next to this file; edit values directly. Read them at activation: `activation_steps_prepend` and `activation_steps_append` are step lists around the loop, `persistent_facts` are standing context for the whole session (a `file:`-prefixed entry is a path or glob whose contents load as facts; all others are literal facts), `on_complete` runs after the artifact is delivered, `build_standards` are hard criteria every built skill must satisfy, `evals_required` gates builds on evals (empty keeps evals opt-in), and `skill_md_token_desired` / `skill_md_token_budget` are the length tiers.

## On Activation

1. **Load config.** Read `config.toml` beside this file and apply the values throughout the session. Execute each entry in `activation_steps_prepend` in order, and hold every `persistent_facts` entry as standing context.

2. **Detect intent.** Read the invocation for whether the user wants to Build, Edit, or Analyze, and which skill they mean.

3. **Open the floor (interactive only).** Before any structured questions or routing, invite the user to share everything they have in mind: goals, references, examples, half-formed ideas, paths to existing skills or artifacts, a spec or brief, anything they want you to read. Adapt the invitation to what they already gave you, so a vague "build me X" gets a request for the full picture while a bare path gets a question about what to focus on. After they share, one soft "anything else?" surfaces what they almost forgot. This dump replaces most of the downstream questioning, so let it run. Skip if the invocation already carries enough to act on.

4. **Resume detection.** Once a target skill is identified, look for `{target-skill-path}/.memlog.md`. If one exists, read it once in full to rebuild the state of the prior session, then continue appending to it. Never look for `.decision-log.md`; the memlog is the only process memory.

5. **Route to the intent.** Pick the path below from the detected intent and load only that file. Once routed, execute each entry in `activation_steps_append` in order before the build or analyze loop begins.

## Intents

| Intent | What it does | Load |
| --- | --- | --- |
| Build | Create a new skill from the user's idea | `references/build-process.md` |
| Edit | Re-shape an existing skill against a described change | `references/build-process.md` |
| Analyze | Run the quality lenses over a skill and produce a report | `references/scan-orchestration.md` |

Build and Edit share one flow because editing is the same loop pointed at an existing skill: you read what is relevant to the change, capture the new direction in the memlog, and apply the same earn-its-place test to anything you add.

> Adapted from bmad-code-org/bmad-builder, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
