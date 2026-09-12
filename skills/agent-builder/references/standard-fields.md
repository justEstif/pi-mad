# Standard Agent Fields

## Frontmatter Fields

Only these fields go in the YAML frontmatter block:

| Field         | Description                                       | Example                                         |
| ------------- | ------------------------------------------------- | ----------------------------------------------- |
| `name`        | Full skill name (kebab-case, same as folder name) | `agent-tech-writer` |
| `description` | [What it does]. [Use when user says 'X' or 'Y'.]  | See Description Format below                    |

## Content Fields

These are used within the SKILL.md body — never in frontmatter:

| Field         | Description                              | Example                              |
| ------------- | ---------------------------------------- | ------------------------------------ |
| `displayName` | Friendly name (title heading, greetings) | `Paige`, `Lila`, `Floyd`             |
| `title`       | Role title                               | `Tech Writer`, `Holodeck Operator`   |
| `icon`        | Single emoji                             | `🔥`, `🌟`                           |
| `role`        | Functional role                          | `Technical Documentation Specialist` |
| `memory`      | Memory folder (optional)                 | `{skillName}/`                       |

### Memory Agent Fields (bootloader SKILL.md only)

These fields appear in memory agent SKILL.md files, which use a lean bootloader structure instead of the full stateless layout:

| Field              | Description                                              | Example                                                            |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------ |
| `identity-seed`    | 2-3 sentence personality DNA (expands in PERSONA.md)     | "Equal parts provocateur and collaborator..."                      |
| `species-mission`  | Domain-specific purpose statement                        | "Unlock your owner's creative potential..."                        |
| `agent-type`       | One of: `stateless`, `memory`, `autonomous`              | `memory`                                                           |
| `onboarding-style` | First Breath style: `calibration` or `configuration`     | `calibration`                                                      |
| `sanctum-location` | Path to sanctum folder, under the project working directory | `memory/{skillName}/`                                              |

### Sanctum Template Seed Fields (CREED, BOND, PERSONA templates)

These are content blocks the builder fills when emitting the sanctum templates. They are NOT template variables for init-script substitution — they are baked into the agent's template files as real content.

| Field                       | Destination Template    | Description                                                  |
| --------------------------- | ----------------------- | ------------------------------------------------------------ |
| `core-values`               | CREED-template.md       | 3-5 domain-specific operational values (bulleted list)       |
| `standing-orders`           | CREED-template.md       | Domain-adapted standing orders (always active, never complete) |
| `philosophy`                | CREED-template.md       | Agent's approach to its domain (principles, not steps)       |
| `boundaries`                | CREED-template.md       | Behavioral guardrails                                        |
| `anti-patterns-behavioral`  | CREED-template.md       | How NOT to interact (with concrete bad examples)             |
| `bond-domain-sections`      | BOND-template.md        | Domain-specific discovery sections for the owner             |
| `communication-style-seed`  | PERSONA-template.md     | Initial personality expression seed                          |
| `vibe-prompt`               | PERSONA-template.md     | Prompt for vibe discovery during First Breath                |

## Customization Surface (`config.toml`)

An agent ships a `config.toml` alongside SKILL.md only when the author opted in during build; the default is no config file and hardcoded paths. The values are plain defaults the agent reads directly at activation — no resolver, no override files, no merge step.

### Override surface (emitted only when opted in)

| Field                      | Type          | Purpose                                                        |
| -------------------------- | ------------- | -------------------------------------------------------------- |
| `activation_steps_prepend` | array[string] | Steps run before standard activation.                          |
| `activation_steps_append`  | array[string] | Steps run after greet, before user input.                      |
| `persistent_facts`         | array[string] | Facts (literal sentences or `file:`-prefixed paths/globs).     |

### Agent-specific scalars (lifted during Configurability Discovery)

Named by purpose and suffix.

| Naming pattern          | Use for                                       | Example                                          |
| ----------------------- | --------------------------------------------- | ------------------------------------------------ |
| `<purpose>_template`    | File paths for templates the agent loads      | `style_guide_template = "resources/style.md"`    |
| `<purpose>_output_path` | Writable destinations                         | `report_output_path = "reports"`                 |
| `on_<event>`            | Prompt or command executed at a hook point    | `on_session_close = ""`                          |

**Path resolution within scalar values:**

- Bare paths (e.g. `resources/style.md`) resolve from the skill root.
- Paths outside the skill resolve from the project working directory — use those for org-owned resources.

### How SKILL.md references the configured values

SKILL.md reads the values from `config.toml` at activation and never restates them as literals:

```markdown
Load the style guide from the `style_guide_template` path in `config.toml`.
```

The archetype defaults for when to emit the override surface at all live in `references/agent-quality-principles.md`.

## Overview Section Format

The Overview is the first section after the title — it primes the AI for everything that follows. Cover what the agent does, how it works (role, approach, modes), and the outcome it delivers, written as the agent's own destination rather than a description of the system.

## SKILL.md Description Format

```
{description of what the agent does}. Use when the user asks to talk to {displayName}, requests the {title}, or {when to use}.
```

## Path Rules

### Same-Folder References

Use `./` only when referencing a file in the same directory as the file containing the reference:

- From `references/build-process.md` → `./some-guide.md` (both in references/)
- From `scripts/scan.py` → `./utils.py` (both in scripts/)

### Cross-Directory References

Use bare paths relative to the skill root — no `./` prefix:

- `references/memory-system.md`
- `scripts/calculate-metrics.py`
- `assets/template.md`

These work from any file in the skill because they're always resolved from the skill root. **Never use `./` for cross-directory paths** — writing `./` before `scripts/foo.py` in a file that lives in `references/` is misleading because `scripts/` is not next to that file.

### Memory Files

The sanctum lives at `memory/{skillName}/` under the project working directory (created on first wake by init-sanctum.py).

The memory `index.md` is the single entry point to the agent's memory system — it tells the agent what else to load (boundaries, logs, references, etc.). Load it once on activation; don't duplicate load instructions for individual memory files.

### Project-Scope Paths

Write project-scope paths in plain language anchored at the project working directory ("the project's `docs/report.md"`).
