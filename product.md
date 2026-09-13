# pi-shelf — product.md

**Status:** v1, forged 2026 (idea-forge session → this brief). Source of truth for what this repo is and is not. Tagged assumptions marked **[A#]**.

## What it is

A personal, curated skill shelf for [pi](https://github.com/badlogic/pi-mono) — one repo, one resource type (**skills**; workflows are skills), all-dark by default. The agent never auto-invokes anything from the shelf; the agent can *search* it, *suggest* from it, and *enforce* it — but a human names the skill to pull it. Formerly **pi-mad** (a BMAD-METHOD port project); renamed when the vision shifted from "ported framework" to "personal library."

## Who it's for

One person: the author. **[A1: audience-of-one; distribution is dead.** Consequence: no default-experience design for strangers, no catalog maintenance burden, README is identity + pointer, not marketing.] If that assumption ever breaks (public gallery, teammates), revisit: default flags, README, and the settings-filter question all reopen.

## Jobs it does

1. **Home for curated skills** — so they don't live in dotfiles. Skills are methodology (portable content), not machine wiring (local CLIs, auth, host config — those stay in dotfiles beside their tools).
2. **Context discipline** — every skill ships `disable-model-invocation: true` ("all-dark"). Nothing pollutes the system prompt; `/skills` still lists them (by design — that's how you trigger `/skill:name`). Opt-in is per session, by name.
3. **Agent discovery** — a `pi_shelf_search` tool lets the agent answer "does the shelf have a skill for X?" from name + description only: suggest, never load. This is the necessary custom piece; pi has no native equivalent.
4. **Pleasant browsing** — the `/shelf` command: search + toggle UI over the catalog, matching description text (no tag system — tags were killed as a maintenance surface).
5. **Flag enforcement** — `pi update` restores shipped SKILL.md files, so the extension re-applies `disable-model-invocation` at startup. The shelf defends its own darkness.
6. **Quiet suggestions** — an input suggester watches user messages; on a strong match it lets the agent offer candidate skills in one sentence, with explicit permission to stay silent. Never loads. (Command-level gates — blocking bash patterns until a skill is loaded — are machine-side policy and live in dotfiles, not here.)

## Hard rules (locked)

- **Native first.** Custom code only where pi has no answer (search tool, flag enforcer, browser UX, gate lib). No machinery between the shelf and the agent: no templating at load time, no resolve/merge steps, no settings `skills` filter.
- **Killed, do not resurrect:** default-off allowlist + migration layer (double curation); `pi_mad_skills`-style enable/disable manager (nothing to manage); per-project hot-set via settings filter (pi can't override the flag per project; restart tax); `metadata.tags` (search matches descriptions); agents as repo content (personas = skills + notes files).
- **agentskills.io conformance** — shelf SKILL.md files are never templated; `disable-model-invocation` is a pi extension field, silently ignored elsewhere: acceptable.
- **Knap** (knap.md, Liquid-style markdown templating) is allowed **only inside generator skills** (`render`/`batch` + `validate` pre-render gate) — currently agent-builder, workflow-builder, product-design-init. Never a dependency of loading or the extension.
- **Merge-first for incoming skills** — fold new content into existing shelf skills (especially the CSV-library coaches) rather than adding near-duplicates.

## Contents (current + planned)

- **30 skills** ported from BMAD lineage (BMAD-METHOD, bmad-cis workshops, bmad-builder), machinery stripped per PORTING.md. Upstream re-audit 2026-09: nothing further worth porting; web-bundles, builder samples, persona shells exhausted.
- **5 movers from dotfiles**, 4 as merges:
  - `craft-message` → `storytelling-coach` (sharpen mode over story-types.csv)
  - `show-me` → `diagram-studio` (explain mode: code-shape sketches, HTML artifacts)
  - `init-design-system` → `product-design-init` (one design bootstrap, both lineages kept as sections)
  - `skill-creator` → `skill-evals` (one lifecycle meta-skill: create/audit/eval/optimize)
  - `repo-guardrails` → standalone (pairs with the gate library)
  - Result: 30 → 31 skills.
- **Vendored:** `bmad-method/tools/validate_skills.py` (deterministic frontmatter/quality gate; no `_bmad` deps) as the shelf's conformance check, feeding skill-evals.

## Structure

```
pi-shelf/
  extensions/
    shelf.ts          # entry: /shelf command + pi_shelf_search tool + flag enforcer
    catalog.ts        # frontmatter reading, search index, flag repair
    browser.ts        # /shelf command palette
    suggest.ts        # quiet input suggester
  skills/             # 31 skills, all-dark, tagless
  tools/              # validate_skills.py (vendored)
  README.md (identity + install + pointer) · PORTING.md · AUDIT.md · LICENSE
```

## Assumptions register

- **[A1]** Audience-of-one; distribution dead. — basis for half the hard rules; first thing to revisit if the repo goes public-facing.
- **[A2]** ~~The gates pattern generalizes beyond git-workflow.~~ Resolved: gates are machine-side command policy and moved back to dotfiles; the shelf keeps only its input suggester.
- **[A3]** All-dark + search is a better experience than filtered auto-loading. — unproven until lived with for a few weeks; the settings-filter design exists in git history if this fails.
- **[A4]** Merge-first won't dilute the coaches — merging assumes the CSV methodology is the skeleton and incoming content is a mode. If modes feel bolted on, split back out.

## Explicit non-goals

- Being a framework (the BMAD lesson: machinery loses, content wins).
- Distributing to an audience, gallery polish, semver contract. **[A1]**
- Agents as shipped content; per-project skill policies; load-time templating.

## Open verification items

- Confirm `/skills` behavior with dark package skills matches expectation (listed, invocable, no prompt footprint).
- Knap adoption inside generator skills is optional — plain agent-side substitution remains fine when loops/tables/filters aren't needed.
