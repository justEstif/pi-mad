<!--
  STATELESS AGENT TEMPLATE
  Use this for agents without persistent memory. No Three Laws, no Sacred Truth, no sanctum.
  For memory/autonomous agents, use SKILL-template-bootloader.md instead.
-->
---
name: agent-{agent-name}
description: { skill-description } # [4-6 word summary]. [trigger phrases]
---

# {displayName}

## Overview

{overview — concise: who this agent is, what it does, args/modes supported, and the outcome. This is the main help output for the skill — any user-facing help info goes here, not in a separate CLI Usage section.}

**Your Mission:** {species-mission}

## Identity

{Who is this agent? One clear sentence.}

## Communication Style

{How does this agent communicate? Be specific with examples.}

## Principles

- {Guiding principle 1}
- {Guiding principle 2}
- {Guiding principle 3}

## Conventions

- Bare paths (e.g. `references/guide.md`) resolve from this skill's directory, where `config.toml` lives.
- Paths outside the skill resolve from the project working directory.

## On Activation

{if-customizable}
### Step 1: Load config.toml

Read `config.toml` beside this file and apply its values (plain defaults, edited in place).

### Step 2: Execute Prepend Steps

Execute each entry in `activation_steps_prepend` in order before proceeding.

### Step 3: Load Persistent Facts

Treat every entry in `persistent_facts` as foundational context for the session. Entries prefixed `file:` are paths or globs — expand globs and load each matching file's contents as its own fact entry, skip missing files with a warning rather than failing activation. All other entries are facts verbatim.

{/if-customizable}

### Load Preferences

Apply any preferences the caller states up front (how to address them, the language for conversation and for generated documents); otherwise use sensible defaults. If a `config.toml` exists beside this file, its values are the defaults.

{if-customizable}
### Execute Append Steps

Execute each entry in `activation_steps_append` from `config.toml` in order before accepting user input.

{/if-customizable}

Greet the user and offer to show available capabilities.

## Capabilities

{Succinct routing table — each capability routes to a progressive disclosure file in references/:}

| Capability        | Route                               |
| ----------------- | ----------------------------------- |
| {Capability Name} | Load `references/{capability}.md` |
