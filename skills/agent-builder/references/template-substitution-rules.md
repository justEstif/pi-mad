# Template Substitution Rules

The SKILL-template provides a minimal skeleton: frontmatter, overview, agent identity sections, memory, and the activation spine. The bootloader carries no standalone config-load step — `init-sanctum` bakes config into the sanctum, so wake.py loads it as part of the identity. Everything beyond the skeleton is crafted by the builder based on what was learned during discovery. Apply these rules deterministically via `python3 scripts/process-template.py <template> -o <dest> --var key=value... --true <condition>...` — one `--var` per token, one `--true` per conditional that holds. The script fails (exit 3) on any leftover `{if-...}` marker and reports remaining `{token}` placeholders as `tokens_remaining` for you to judge against the runtime-token set.

## Frontmatter

- `{agent-name}` → Agent functional name (kebab-case)
- `{skill-description}` → Two parts: [4-6 word summary]. [trigger phrases]
- `{displayName}` → Friendly display name
- `{skillName}` → Full skill name

## Conditionals

A `--true` condition keeps the block's content (markers stripped); anything else removes the whole block including markers.

- `{if-memory-agent}` / `{if-stateless-agent}` → memory and autonomous agents vs stateless
- `{if-evolvable}` → the owner can teach the agent new capabilities
- `{if-pulse}` → autonomous mode (PULSE enabled)
- `{if-customizable}` → the author opted in to the override surface

## Template Selection

- **Stateless agent:** `assets/SKILL-template.md` (full identity, no Three Laws/Sacred Truth)
- **Memory/autonomous agent:** `assets/SKILL-template-bootloader.md` (lean bootloader with Three Laws, Sacred Truth, Stay in Character, the Persistent Memory directive, and the four-step "Invoke & hold" activation spine)

The activation is a fixed four-step spine, not a set of renumbered paths: (1) Wake via `scripts/wake.py`; (2) Become yourself; (3) Bind the standing rules; (4) Execute the Proper Mode. The Mode in step 4 is what varies — Waking and First Breath are always present; only Pulse Mode is conditional, wrapped in `{if-pulse}` for autonomous agents. The step numbers never shift, so there is no gap to renumber; keep `{if-pulse}` strictly around the Pulse Mode bullet.

## config.toml Emission

When the author opted in during build, emit `config.toml` alongside SKILL.md from `assets/config-template.toml`: the override surface (activation steps, persistent facts) plus any lifted scalars, all as plain defaults the agent reads directly. When it does not hold, ship no config.toml and SKILL.md uses hardcoded paths. When `{if-customizable}` holds, also add the config-loading activation step to SKILL.md; the body reads lifted scalars from the file, never as restated literals.

## Beyond the Template

The builder determines the rest of the agent structure — capabilities, activation flow, sanctum templates, init script, First Breath, capability routing, external skills, scripts — based on the agent's requirements. The template intentionally does not prescribe these.

## Path References

Everything the builder emits follows the bare-path convention the lint gate enforces: skill-internal paths are written bare from the skill root (`references/first-breath.md`, `scripts/wake.py`, `scripts/init-sanctum.py`, `assets/PERSONA-template.md`), `./` appears only for a file in the same directory as the file referencing it, and project-scope paths are written in plain language anchored at the project working directory. This applies equally to SKILL.md, capability prompts, the sanctum templates the init script copies, and the emitted `scripts/wake.py` (from `assets/wake-template.py`, parameterized with the agent's `{skillName}`).
