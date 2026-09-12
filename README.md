# pi-mad

Curated, framework-free skills for [pi](https://github.com/badlogic/pi-mono) derived from the BMAD Method ecosystem. The domain content (review lenses, elicitation methods, coaching protocols, agent/workflow builders) is kept; the BMAD framework machinery (`uv run` resolvers, `customize.toml` merge layers, `_bmad/` scaffolding, module manifests) is stripped and replaced with plain defaults in each skill's `config.toml`.

## Install

```bash
pi install git:github.com/justEstif/pi-mad
```

Update: `pi update --extensions` (or `pi update --all`).

## Toggling skills

This package bundles its own toggle UI — an extension, no extra install step:

```text
/pi-mad                  # interactive browser: enter toggles, saved immediately
/pi-mad list             # show enabled/disabled state
/pi-mad off <skill...>   # e.g. /pi-mad off prd-coach prfaq-coach
/pi-mad on <skill...>    # re-enable
/pi-mad reset            # enable everything
```

State is written as exclusion filters in the package's settings entry (`{ skills: ["!prd-coach"] }`), so it composes with `pi update` and hand edits. Toggles apply on next pi start.

Pi's native `pi config` TUI does the same across all packages (Tab switches global/project scope) if you prefer it.

## Skills

| Skill | Origin | What it does |
|---|---|---|
| `lens-review` | BMAD-METHOD `bmad-review` | Multi-lens review (adversarial, edge-case, verification-gap, editorial structure/prose) with triaged JSON findings |
| `pressure-test` | BMAD-METHOD `bmad-advanced-elicitation` | Menu-driven refinement passes (socratic, pre-mortem, red team…) over recent output |
| `agent-builder` | bmad-builder | Build persistent persona agents (memory sanctum, wake behavior, capabilities) |
| `workflow-builder` | bmad-builder | Build and evaluate multi-step agent workflows |
| `brainstorming-coach` | BMAD web-bundle | Facilitated brainstorming protocol |
| `prd-coach` | BMAD web-bundle | PRD drafting with validation checklist |
| `prfaq-coach` | BMAD web-bundle | PR/FAQ narrative development |
| `product-brief-coach` | BMAD web-bundle | Product brief coaching |
| `ux-coach` | BMAD web-bundle | UX spine (DESIGN.md + EXPERIENCE.md) coaching + rubric |
| `market-research` | BMAD web-bundle | Structured market/industry research |
| `ideation-coach` | bmad-cis | Coach-persona ideation sessions |
| `problem-solving-coach` | bmad-cis | Coach-persona systematic problem-solving |
| `design-thinking-coach` | bmad-cis | Coach-persona design-thinking sessions |
| `innovation-coach` | bmad-cis | Coach-persona innovation strategy |
| `storytelling-coach` | bmad-cis | Coach-persona storytelling development |
| `presentation-coach` | bmad-cis | Coach-persona presentation crafting |

## Porting recipe

See [PORTING.md](PORTING.md) — the exact strip-and-keep rules used for every skill here. To add a skill from upstream BMAD: copy the dir, apply the recipe, run the validator named in it, PR.

## Not ported (yet)

- CIS workshop suites (`bmad-cis-design-thinking`, `-innovation-strategy`, `-problem-solving`, `-storytelling` — the 4-file deep versions behind the coach personas)
- BMAD main-method pipeline skills (prd/spec/epics as multi-file workflows — the web-bundle coach variants cover the common cases)

## License & attribution

MIT — see [LICENSE](LICENSE). Content adapted from [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD), [bmad-cis](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite), and [bmad-builder](https://github.com/bmad-code-org/bmad-builder), MIT © BMad Code, LLC. This project is not affiliated with or endorsed by BMad Code; "BMad" marks belong to them (see their TRADEMARK.md) — this repo deliberately uses a different name.
