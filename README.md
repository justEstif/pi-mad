# pi-shelf

A personal, curated skill shelf for [pi](https://github.com/badlogic/pi-mono) — one repo, one resource type (**skills**; workflows are skills), all-dark by design. Most content derives from the BMAD Method ecosystem, plus delivery patterns from Anthropic's AI-native SDLC playbook and Vercel's product-design practice. See [product.md](product.md) for the full product brief; formerly named **pi-mad**.

## The design: all-dark

Every skill ships with `disable-model-invocation: true`. Nothing from the shelf ever auto-invokes or pollutes the system prompt — `/skills` still lists everything (that's how you trigger a skill), but a human names the skill to pull it. `pi update` restores shipped SKILL.md files, so the extension re-applies the flag at startup; the shelf defends its own darkness.

## Install

```bash
pi install git:github.com/justEstif/pi-shelf
```

Update: `pi update --extensions` (or `pi update --all`).

## Usage

- **Invoke a skill:** `/skill:name` (opt-in, per session, by name).
- **Browse:** `/shelf` — search + toggle UI over the catalog, matching description text (no tag system).
- **Ask your agent:** the `pi_shelf_search` tool lets it answer "does the shelf have a skill for X?" from name + description only — it suggests, never loads.
- **Behavior gates (optional):** the bundled gate library (`extensions/lib/gates.ts`) can block a bash-command pattern and queue a skill load (e.g. "you're about to `git push`; the git-workflow skill is mandatory first"). Per-machine gate registrations live in machine config, not this repo.

## Catalog

[skills/](skills/) is the living catalog — each skill's name and description say what it's for. No tag taxonomy to maintain; search matches descriptions. For the porting recipe used to bring skills in (and what machinery gets stripped), see [PORTING.md](PORTING.md); for the full upstream inventory with port/skip verdicts, see [AUDIT.md](AUDIT.md).

## License & attribution

MIT — see [LICENSE](LICENSE). Content adapted from [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD), [bmad-cis](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite), and [bmad-builder](https://github.com/bmad-code-org/bmad-builder), MIT © BMad Code, LLC. This project is not affiliated with or endorsed by BMad Code; "BMad" marks belong to them (see their TRADEMARK.md) — this repo (renamed pi-mad → pi-shelf) deliberately uses a different name.
