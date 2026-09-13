# Shelf skill evals

Model-backed evals for the shelf's skills. Runnable specs follow vitest-evals
conventions with a **thin local harness** (`lib/harness.ts`) that shells out to
the `pi` CLI in a temp project dir. That harness is a stand-in: the real
behavioral harness is `packages/evals` in the pi monorepo
(github.com/earendil-works/pi — `describeEval` + `createPiCodingAgentHarness`),
which we can't import from outside the monorepo. Swap it in when importable;
the seam is two functions (`runPi`, `judge`).

## ⚠️ Cost warning

Every test here is **model-backed** — one or more `pi` invocations per case,
each a full agent run. Trigger evals are ~1 call per case (19 cases);
baseline evals are 2 calls per case plus grading. Nothing runs at install
time; nothing runs unless you invoke the runner explicitly. Pin a cheap model
with `PI_PROVIDER` / `PI_MODEL` (and export the matching `*_API_KEY`) first.

## Running

```sh
# one-time (zero-install: no devDependencies were added to package.json)
npm install -D vitest vitest-evals

PI_PROVIDER=zai PI_MODEL=glm-5.2 npx vitest-evals evals/trigger.eval.ts
PI_PROVIDER=... PI_MODEL=... npx vitest-evals evals/baseline.eval.ts   # .skip by default, see below
```

No package.json changes were made; deps stay out of the shipped shelf package.

## Mode → file mapping (skills/skill-evals four modes)

| Mode | Question | Here | Status |
|---|---|---|---|
| trigger | Do descriptions pick/avoid the right prompts? | `trigger.eval.ts` | runnable (costs 1 call/case) |
| baseline | Does a skill beat the bare model? | `baseline.eval.ts` | skeleton, `.skip` until provider/model + grader chosen |
| variant | Does a section earn its place? | — (no spec yet; add alongside baseline) | not scaffolded |
| quality | Does output meet a rubric? | rubrics live in `cases/`; grading via the skill-evals grader | grader not wired |

The full-featured runner for all four modes (clean-dir isolation, adapter seam,
transcript schema, description-optimization loop) is **skills/skill-evals**
itself (`scripts/run_evals.py`, `scripts/run_triggers.py`, adapter at
`assets/adapter-pi.json`). This directory is the lightweight shelf-side check
that runs without python and without the monorepo.

## Layout

```
evals/
  trigger.eval.ts    trigger evals, 8 high-traffic skills, 19 probe cases
  baseline.eval.ts   baseline skeleton (build-loop, 2 canned tasks, .skip)
  lib/harness.ts     thin local pi-CLI harness: runPi + judge (replaceable)
  lib/catalog.ts     reads real SKILL.md descriptions from ../skills (read-only)
  cases/             prompt fixtures as plain data, one file per skill family
  cases/fixtures/    files staged into case working dirs
```

## Important caveat on trigger evals

The shelf is **all-dark** (`disable-model-invocation: true`, product.md [A3]) —
skills never auto-fire. These trigger evals feed the catalog descriptions plus
a prompt to a model judge and ask which skill applies, so they measure
**description quality**, not skill loading. Measuring real firing requires a
bright synthetic skill and load-signal detection: that is exactly
skills/skill-evals trigger mode (`scripts/run_triggers.py` + adapter).

## Case authoring

Cases follow `skills/skill-evals/references/eval-format.md`: `input + rubric +
optional state_prefix + optional files`. Near-miss trigger pairs (shared
keywords, opposite verdicts — e.g. "review PR" vs "fix the review findings")
are the discrimination that matters; add them to `cases/*.ts`.
