# pi-shelf — product.md

Source of truth for what this repo is and is not. Tagged assumptions marked **[A#]**.

## What it is

A personal skill shelf for [pi](https://github.com/badlogic/pi-mono): one repo, one resource type (**skills** — workflows are skills), 30 of them, all-dark. The agent never auto-invokes anything from the shelf; it can search and suggest, but a human names the skill to pull it.

For one person: the author. **[A1: audience-of-one.** No default-experience design for strangers, no catalog marketing. If the repo ever goes public-facing, revisit flags, README, and the settings-filter question.]

## How it works

- **All-dark** — every skill ships `disable-model-invocation: true`; nothing pollutes the system prompt. `/skills` lists them (that's the trigger surface); opt-in is per session, by name (`/skill:name`).
- **Flag enforcement** — `pi update` restores shipped files, so the extension re-applies the flag at startup. The shelf defends its own darkness.
- **Discovery** — `pi_shelf_search` tool (agent answers "does the shelf have a skill for X?" without loading), `/shelf` palette (search, enter loads), and a quiet input suggester (strong match → the agent may offer in one sentence, or stay silent; never loads). A typo guard steers "did you mean" on `/skill:` misses.
- **Division of labor** — methodology skills live here; machine wiring (local CLIs, auth, command-policy gates) stays in dotfiles beside its tools.

## Hard rules

- **Native first.** Custom code only where pi has no answer. No machinery between shelf and agent: no load-time templating, no resolve/merge steps, no settings `skills` filter.
- **Killed, do not resurrect:** default-off allowlist + migration, enable/disable manager, per-project hot-set filter, `metadata.tags`, agents as repo content.
- **agentskills.io conformance** — shelf SKILL.md files are never templated.
- **Knap** (markdown templating) allowed only inside generator skills (agent-builder, workflow-builder, product-design-init), never in loading.
- **Merge-first** — fold incoming skills into existing ones (especially CSV-library coaches) rather than adding near-duplicates.

## Tooling

`bun tools/validate_skills.ts skills/` — deterministic conformance gate (0 findings required). `evals/` — model-backed trigger evals (19 probes, `PI_PROVIDER=… PI_MODEL=… npx vitest run evals/trigger.eval.ts`); baseline evals scaffolded but skipped.

## Assumptions

- **[A1]** Audience-of-one; distribution dead.
- **[A3]** All-dark + search beats filtered auto-loading — the old design exists in git history if this fails in practice.
- **[A4]** Merge-first won't dilute the coaches; if merged modes feel bolted on, split back out.

## Non-goals

Being a framework (machinery loses, content wins) · distributing to an audience · agents as shipped content · per-project skill policies · load-time templating.
