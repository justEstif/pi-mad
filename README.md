# pi-mad

Curated, framework-free skills for [pi](https://github.com/badlogic/pi-mono) — the largest share derived from the BMAD Method ecosystem, plus delivery patterns from Anthropic's AI-native SDLC playbook and Vercel's product-design practice. Domain content is kept; framework machinery (`uv run` resolvers, `customize.toml` merge layers, `_bmad/` scaffolding, module manifests) is stripped and replaced with plain defaults in each skill's `config.toml`.

## Install

```bash
pi install git:github.com/justEstif/pi-mad
```

Update: `pi update --extensions` (or `pi update --all`).

## Choosing which skills load

**All pi-mad skills are OFF by default.** The bundled `/pi-mad` command opens a checkbox browser:

```text
/pi-mad              # browser: type to search (names AND tags), enter toggles + saves, esc closes
/pi-mad coach        # same browser, pre-filtered to the coach skills
```

There are no subcommands — the optional argument is just a search seed. **`a` enables everything shown by the current search, `A` disables it** (empty search = all 30). Enabling a skill adds `skills/<name>/**` to the package entry's `skills` allowlist in settings; disabling removes it; an empty list loads none. New skills from package updates stay OFF until you enable them. First run migrates older exclusion-filter setups automatically. Toggles apply on next pi start.

### Agent control

The package registers a `pi_mad_skills` tool, so you can also just ask your agent — "enable the review skills", "disable everything", "list pi-mad skills" — and it drives the same allowlist. Same rule: applies on next pi start.

### Manual-only skills

Four meta-tools ship with `disable-model-invocation: true` (agent-builder, workflow-builder, skill-evals, product-design-init): they are loaded and explicitly invocable (`/skill:name`), but the agent will never auto-run them, since they scaffold and modify files. Flip the flag in a skill's `SKILL.md` if you disagree — note `pi update` restores shipped flags.

Pi's native `pi config` TUI does the same across all packages (Tab switches global/project scope) if you prefer it.

## Skills (30)

Every skill carries `metadata.tags` in its frontmatter — first tag is the **kind** (`agent` = facilitated persona session, `workflow` = procedural play, `tool` = utility/generator), second is the **domain** (`planning`, `build`, `review`, `research`, `creative`, `meta`). Search by tag inside `/pi-mad` (e.g. `/pi-mad creative`).

### Delivery loop & design standards
| Skill | Origin | What it does |
|---|---|---|
| `sdlc-loop` | Anthropic AI-native SDLC playbook | Conductor for the idea→production artifact loop: each stage commits what the next reads (intent.md → SPEC.md → plan → diff → review findings → retro), dispatching to the pi-mad skills below, humans at the gates |
| `product-design-init` | Vercel product-design practice | One-shot generator that scaffolds a repo-local product-design skill: 5-mode request router (shape/implement/review/copy/harden), standards references, exemplars, coverage-gaps |

### Planning chain
| Skill | Origin | What it does |
|---|---|---|
| `idea-forge` | BMAD-METHOD `bmad-forge-idea` | Pressure-test a half-formed idea with rotating skeptic personas until you can act on it or drop it |
| `spec-distiller` | BMAD-METHOD `bmad-spec` | Distill any input into a short SPEC.md five-field kernel, with update/validate/story-break modes |
| `architecture-spine` | BMAD-METHOD `bmad-architecture` | Write a minimal architecture spine — only the invariants separately-built parts can't choose independently |
| `story-slicer` | BMAD-METHOD `bmad-create-epics-and-stories` | Break requirements into epics and user stories with Given/When/Then acceptance criteria |

### Build & evidence loop
| Skill | Origin | What it does |
|---|---|---|
| `build-loop` | BMAD-METHOD `bmad-build` | Turn a delegated feature or fix into working code: clarify → spec → plan → implement test-first → adversarial review |
| `change-walkthrough` | BMAD-METHOD `bmad-walkthrough` | Walk a human through reviewing a change: orientation, detail pass, how to test |
| `retrospective` | BMAD-METHOD `bmad-retrospective` | Evidence-based retro of completed work: sourced findings, action items, acceptance verdict |

### Review & research
| Skill | Origin | What it does |
|---|---|---|
| `lens-review` | BMAD-METHOD `bmad-review` | Multi-lens review (adversarial, edge-case, verification-gap, editorial structure/prose) with triaged JSON findings |
| `pressure-test` | BMAD-METHOD `bmad-advanced-elicitation` | Menu-driven refinement passes (socratic, pre-mortem, red team…) over recent output |
| `deep-recon` | BMAD-METHOD `bmad-deep-recon` | Decision-grade research three ways: draft a prompt, process a report into a cited digest, or fan out parallel web research |
| `market-research` | BMAD web-bundle | Structured market/industry/competitive research |
| `roundtable` | BMAD-METHOD `bmad-party-mode` | Multi-persona roundtable — debates, focus groups, red-team panels — or author a recurring cast |

### Meta
| Skill | Origin | What it does |
|---|---|---|
| `agent-builder` | bmad-builder | Build persistent persona agents (memory sanctum, wake behavior, capabilities) |
| `workflow-builder` | bmad-builder | Build and evaluate multi-step agent workflows |
| `skill-evals` | bmad-builder `bmad-eval-runner` | Evaluate a skill four ways (baseline, variant, quality, trigger) and optimize its description — includes a pi adapter |
| `repo-context` | BMAD-METHOD `bmad-project-context` | Author, refresh, and audit a repo's AGENTS.md; record observed agent mistakes as pitfalls |
| `diagram-studio` | bmad-builder excalidraw sample | Diagrams as Excalidraw: MCP canvas (mermaid import, arrow binding, export/share) or standalone files |

### Coaches (facilitated sessions)
| Skill | Origin | What it does |
|---|---|---|
| `brainstorming-coach` | BMAD web-bundle | Facilitated brainstorming protocol |
| `prd-coach` | BMAD web-bundle | PRD drafting with validation checklist |
| `prfaq-coach` | BMAD web-bundle | PR/FAQ narrative development |
| `product-brief-coach` | BMAD web-bundle | Product brief coaching |
| `ux-coach` | BMAD web-bundle | UX spine (DESIGN.md + EXPERIENCE.md) coaching + rubric |
| `ideation-coach` | bmad-cis | Coach-persona ideation sessions (full workshop methodology merged) |
| `problem-solving-coach` | bmad-cis | Coach-persona root-cause-to-solution sessions (full workshop methodology merged) |
| `design-thinking-coach` | bmad-cis | End-to-end facilitated design-thinking runs, EMPATHIZE → TEST (full workshop methodology merged) |
| `innovation-coach` | bmad-cis | Disruption analysis and business-model innovation sessions (full workshop methodology merged) |
| `storytelling-coach` | bmad-cis | Narrative crafting sessions across 25 story types (full workshop methodology merged) |
| `presentation-coach` | bmad-cis | Coach-persona presentation crafting |

## Porting recipe

See [PORTING.md](PORTING.md) — the exact strip-and-keep rules used for every skill here, and [AUDIT.md](AUDIT.md) for the full upstream inventory with port/skip verdicts. To add a skill from upstream BMAD: copy the dir, apply the recipe, run the validator named in it, PR.

## Deliberately not ported

Full reasoning in [AUDIT.md](AUDIT.md). In short:

- **Duplicates**: the five bmad-method skills (`bmad-prd`, `bmad-prfaq`, `bmad-product-brief`, `bmad-ux`, `bmad-brainstorming`) were the sources the ported web-bundle coaches were generated from; `bmad-code-review` is the same lineage as `lens-review`; `bmad-build-auto` is `bmad-build` unattended.
- **BMAD infrastructure**: `bmad` (installer/doctor), `bmad-customize`, `bmad-bmb-setup`, `bmad-module-builder`, `bmad-build`'s epic/sprint siblings (`bmad-sprint-planning`, `bmad-correct-course`, `bmad-qa-generate-e2e-tests`), and the five `bmad-agent-*` persona dispatchers (6-line personas + menus into other BMAD skills — no standalone payload).
- **Optional harvests** noted in AUDIT.md: brainstorming's 3-stance model, code-review's claims/deletion lenses (claims-check + deletion-check already shipped inside `build-loop`), bmad-ux's asset library.

## License & attribution

MIT — see [LICENSE](LICENSE). Content adapted from [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD), [bmad-cis](https://github.com/bmad-code-org/bmad-module-creative-intelligence-suite), and [bmad-builder](https://github.com/bmad-code-org/bmad-builder), MIT © BMad Code, LLC. This project is not affiliated with or endorsed by BMad Code; "BMad" marks belong to them (see their TRADEMARK.md) — this repo deliberately uses a different name.
