# Porting recipe: upstream BMAD skill → pi-mad skill

Every port follows this exactly. Read the source SKILL.md fully before writing anything.

## 1. Naming
- Target dir: `/tmp/pi-mad/skills/<new-name>/` (mapping given in your task).
- Frontmatter `name` = `<new-name>`. Never keep `bmad` in names.
- description: keep the original WHAT/WHEN, reworded to ≤500 chars, quoted YAML
  string (no `>` scalars, no unquoted colons). Remove invocation quirks like
  "Use when the user asks to talk to Carson" → "Use when the user wants
  facilitated ideation". No `Keywords:` lists, no "for ANY" triggers.

## 2. Strip (delete from body)
- "On Activation" / "Resolve customization" steps: `uv run`,
  `resolve_customization.py`, customize.toml merge rules, forwarded/pre-resolved
  customization, legacy forwarder output contracts.
- All `{workflow.<name>}` references → inline the shipped default from the
  source's `customize.toml` (`[workflow]` table), or copy `customize.toml` to
  the target as `config.toml` (keep only the `[workflow]` table + a one-line
  header comment "Edit values directly; they are plain defaults") and say:
  "Defaults live in `config.toml` next to this file; edit values directly."
- `module-manifest.toml` — never copy.
- References to `_bmad/`, `{project-root}` (→ "the project working directory"),
  party-mode hooks, `skill:<name> ... directive` forwarding syntax.

## 3. Keep
- Core instruction content, phases, menus, HALT points, personas (fictional
  character names are fine), examples.
- `references/`, `assets/` as-is UNLESS a file carries machinery markers
  (`uv run`, `_bmad/`, `customize.toml`, `{workflow.`) — fix those lines the
  same way (inline the default, or point at `config.toml`).
- `scripts/` only if imports are stdlib-only (verify imports; drop BMad-specific
  scripts).
- `{skill-root}` (agentskills-standard) → reword to "this skill's directory".

## 4. Attribution
Last line of every SKILL.md:
`> Adapted from <source repo name>, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.`

## 5. Tag it
Every skill carries `metadata.tags` (space-separated string, first tag = kind):
`agent` (facilitated persona session) · `workflow` (procedural play) · `tool` (utility/generator),
plus a domain tag (`planning`, `build`, `review`, `research`, `creative`, `meta`).
Example: `metadata:\n  tags: "workflow review"`

## 6. Validate
`/home/estifanos/.agents/skills/skill-creator/scripts/validate-skill <dir>`
must exit PASS or WARN-only (fix all FAILs: frontmatter format, missing
referenced files, etc.).

## 7. Report back
A table: source → target → what was stripped → anything dropped entirely →
validator result.
