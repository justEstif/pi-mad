---
name: {skill-name}
description: {one-line summary plus the trigger phrases that should route here, e.g. "Use when the user says X or wants to Y"}
---

<!-- BUILDER SCAFFOLD GUIDANCE — DELETE THIS WHOLE COMMENT BLOCK BEFORE SHIPPING.

This is a starting point, not a shape to fill in mechanically. Keep the role
paragraph, the activation block, and whatever the skill actually needs. Cut the
rest. Every surviving line should beat its own absence.

Pick the archetype that matches what you are building and keep only its parts:

- One-shot action. The skill does a single thing and returns. Keep the role
  paragraph and a short outcome statement. Drop multi-stage routing, memlog, and
  resume. Most skills are this; resist adding more.

- Producer of a durable artifact (brief, PRD, report, deck). Keep memlog as the
  process memory, a finalize beat that distills the memlog into the artifact, and
  the output-path handling. This is the archetype that earns memlog.

- Multi-intent router. The skill handles a few related jobs behind one entry.
  Keep an intent table that routes to references, and name the stages with
  descriptive words, never numbered prefixes.

Customization: only add the config-loading activation step and reference
config.toml values if the author accepted config.toml. If they declined,
use hardcoded paths and ship no config.toml at all.

-->

# {skill-name}

{One paragraph stating the destination: the stance the skill acts from, the
outcome it produces, who consumes that output, and the bar that consumer sets.
Write it once; do not restate it lower down.}

## Resolution rules

- Bare paths (e.g. `references/guide.md`) resolve from this skill's directory, where `config.toml` lives.
- Paths outside the skill resolve from the project working directory.

## On Activation

1. If a `config.toml` exists beside this file, read it and apply the values; otherwise use the hardcoded defaults written below. Use sensible defaults for anything missing rather than requiring configuration.

<!-- Keep step 2 only for artifact-producing skills that carry process memory. -->
2. Resume check. Look for an existing `.memlog.md` in the run folder. If one is found, read it once to rebuild state and continue appending one typed bullet at a time; otherwise create `.memlog.md` and append entries as decisions land.

## {Body}

{The body is whatever the skill needs and nothing more. State each beat as the
outcome you want, reserving exact procedure for the few places a wrong move costs
something. Name stages with descriptive words, never numbered prefixes.}
