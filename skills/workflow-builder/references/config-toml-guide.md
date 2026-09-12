# config.toml Guide

config.toml is the only customizability mechanism a built skill ships with. There are no installer questions, no settings or options concept inside the skill. When a skill needs end-user customization, it gets a `config.toml` with the plain defaults baked in and the skill-specific points offered where they apply. When it does not, it ships fixed with hardcoded paths, and anyone who needs a change forks it. Either way the file, when present, is plain data the skill reads directly — there is no resolver step, no override merging, and no indirection.

This guide covers when to emit config.toml, what goes in it, and which mechanisms are forbidden.

## The Ask

Whether a skill gets a config.toml is a decision made once during the build, interactive-only, defaulting to NO:

> Should this support end-user customization such as activation hooks, swappable templates, or output paths? If no, it ships fixed and anyone who needs changes forks it.

Default no. Most skills do not need a customization surface, and a surface nobody uses is friction the reader has to skip past. Whatever is decided, log it in the memlog as a decision.

When the answer is no, emit no config.toml, add no config-loading step to activation, and use hardcoded paths throughout the skill. When the answer is yes, bake the universal defaults and offer the skill-specific points whose stages exist.

## File shape

An emitted config.toml opens with one line saying the values are plain defaults, then a single table:

```toml
# Edit values directly; they are plain defaults.

[workflow]
```

The user edits this file directly to change behavior. There are no override files and no merge rules; the values in the file are the values the skill uses. SKILL.md reads the values from the file — a hardcoded path written beside a declared value drifts the moment someone edits the file, so the customization scanner flags exactly that hardcoded-path-beside-declared-value case.

## Universal defaults

These four points appear in nearly every producing skill, so they are offered by default under `[workflow]`:

| Key | Type | Default | Purpose |
|---|---|---|---|
| `activation_steps_prepend` | array | `[]` | Steps to run before standard activation (pre-flight loads, compliance checks). |
| `activation_steps_append` | array | `[]` | Steps to run after the greeting, before the workflow begins. |
| `persistent_facts` | array | `[]` | Static facts loaded on activation and kept in mind for the whole run. |
| `on_complete` | scalar | `""` | Instruction executed when the workflow reaches its terminal stage. |

`persistent_facts` entries are each a literal sentence or a `file:`-prefixed path or glob whose contents load as facts. Ship it empty. Context that belongs to the whole repository belongs in `AGENTS.md`, which every skill already sees; `persistent_facts` is for context only this skill needs, so the user pays for it when the skill runs instead of carrying it as constant memory. Leave it to the user to populate — a `file:` glob that matches nothing resolves to nothing, so an unused entry is harmless but still misrepresents what the skill needs.

## Offered-when-relevant points

Beyond the universal four, offer a point only when the matching stage exists in the skill. Offering an output-path knob to a skill that produces no artifact is a no-op surface the reader has to skip.

| Point | Offer when | Shape |
|---|---|---|
| `<purpose>_template` | The skill loads a template the user might want to swap | Scalar file path, e.g. `brief_template = "assets/brief-template.md"` |
| `<purpose>_output_path` + `run_folder_pattern` | The skill produces artifacts to a writable destination | Paired scalars; the pattern names the per-run folder |
| `doc_standards` | A finalize stage applies standards to human-consumed docs | Array of plain-text directives or `file:` paths |
| `finalize_reviewers` | A review stage gates substantive output | Array of reviewer references |
| `external_sources` | A stage pulls in outside inputs | Array of source references |
| `external_handoffs` | A stage routes output onward | Array of handoff references |

The four arrays (`doc_standards`, `finalize_reviewers`, `external_sources`, `external_handoffs`) encode standards, not options. They are lists of directives the skill applies, not toggles that switch behavior on and off.

Entry convention for these arrays: plain text, or a `file:` reference. Paths inside the skill are bare paths from the skill root; paths outside point into the project working directory written out in plain language.

## Forbidden Mechanisms

config.toml is the sole config mechanism. The build flow never offers any of the following, and the customization scanner confirms none is present:

- Installer or install-time questions
- Boolean-toggle config that switches behavior on and off
- Any settings or options concept inside the built skill
- A resolver, merge step, or override-file layer — the values are plain defaults, edited in place

Confirming script dependencies at build is also legitimate and stays, because it is a build-time check rather than a customization surface.

## Example

A complete config.toml for an artifact-producing skill with a finalize stage:

```toml
# Edit values directly; they are plain defaults.

[workflow]

# --- Universal defaults ---
activation_steps_prepend = []
activation_steps_append = []
persistent_facts = []
on_complete = ""

# --- Skill-specific points (stages present: template, output, finalize) ---
brief_template = "assets/brief-template.md"
output_path = "briefs"
run_folder_pattern = "brief-{project_name}-{date}"

# Standards applied at finalize.
doc_standards = [
  "Follow the org style guide at docs/style-guide.md",
]
```

A skill that produces no artifact and has no finalize stage carries only the `[workflow]` block with the four universal defaults, and a skill that declined customization carries no config.toml at all.
