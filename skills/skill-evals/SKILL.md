---
name: skill-evals
description: "Evaluate a skill four ways — baseline versus bare model, section-stripping variant comparison, rubric quality grading, and trigger firing — then optimize its description or drive bounded self-improvement from the results. Use when the user wants to evaluate a skill, run evals, benchmark a skill, validate triggers, optimize a description, or grade skill outputs."
metadata:
  tags: "tool meta"
disable-model-invocation: true
---

# Skill Eval Runner

You run a skill's evals and report what they say. The user wants signal, not theatre, so cite specific findings, surface evals that pass for trivial reasons, and never widen a tolerance to make a run look like it succeeded.

The runner is platform-agnostic. Everything runtime-specific (how a skill is invoked, where its auth comes from, what its transcript looks like) lives behind the adapter seam described in `references/platform-adapter.md`. No model name is hardcoded anywhere in this skill.

## The four modes

Each mode answers a different question about a skill. Pick the one that matches what the user is asking, or run several.

| Mode | Question it answers | Script / reference |
|---|---|---|
| baseline | Does the skill beat the bare model on the same input? | `references/eval-format.md`, `scripts/run_evals.py` |
| variant | Does a section earn its place, or does a stripped version do as well? | `references/eval-format.md`, `scripts/run_evals.py` |
| quality | Does the output meet the named rubric? | `references/grader.md`, `references/eval-format.md` |
| trigger | Does the description fire on the right queries and stay quiet on the rest? | `references/platform-adapter.md`, `scripts/run_triggers.py` |

Baseline runs every case twice — once with the skill staged into the clean working directory and once with nothing staged — so the bare model is measured as the long-term floor under identical conditions (under pi this is the same `pi` invocation with no skill staged). Variant runs the full skill against a stripped smallest-version of itself to settle whether a section is doing real work. Quality grades one config's output against a rubric with the read-only grader. Trigger measures real firing through the adapter and can optimize the description across rounds; the optimization loop lives in `references/description-optimization.md`.

A case is `input + rubric + optional state_prefix + optional fixture files`. The `state_prefix` is a bracketed prime prepended to the input that places the skill mid-workflow in a single shot, so one input can exercise any turn without a multi-turn simulator. The full case format and the strong-versus-weak expectation taxonomy are in `references/eval-format.md`.

## Args

- Positional: a path to the skill being evaluated (directory containing `SKILL.md`).
- `--evals <path>`: explicit path to the cases file. If omitted, discover.
- `--mode baseline|variant|quality|trigger`: which mode to run. May be repeated.
- `--variant-path <path>`: for variant mode, the stripped or prior-version skill to compare against.
- `--project-root <path>`: root of the project the skill belongs to. Default: walk up from the skill path looking for `.git/`.
- `--output-dir <path>`: where run folders are written. Default: `~/skill-evals/` unless the user says otherwise.
- `--runs <n>`: repeats per case for the variance benchmark. Default: 1 for a single check, higher when the user wants a stable mean.
- `--headless` / `-H`: non-interactive; emit final JSON only.

These map directly onto the script CLIs below; anything not listed there (case subsets, timeouts, workers) is in the script docstrings.

## Setup

1. If `--headless` was passed, skip every confirmation below, pick the safest defaults, and proceed.

2. Resume check: if the output dir already holds an unfinished run folder for this skill (`run.json` present, no `execution-summary.json`), read `run.json` and the per-case `timing.json` files to rebuild state, confirm with the user unless headless, then continue that run append-only. As decisions and direction changes land, append them to that run folder's `run-log.md`.

3. Locate the skill and verify `<skill-path>/SKILL.md` exists. Halt with a clear error if it does not.

4. Resolve the adapter config per the discovery rules in `references/platform-adapter.md` (explicit `--adapter`, `SKILL_EVALS_ADAPTER`, `adapter.json` beside the cases file). When nothing is configured and the current runtime is pi, use this skill's directory's `assets/adapter-pi.json`; a Claude Code example ships beside it as `assets/adapter-claude-code.json`. The pi adapter pins a provider and model — edit those in the adapter file to evaluate against a different model.

5. Discover the cases file. Look at `--evals` first, then `<skill-path>/evals/`, then `<skill-path>/../../evals/<skill-name>/`, then `<project-root>/evals/<skill-name>/`, then anywhere under `<project-root>/evals/`. Take the first match. If nothing is found, halt and say so; the runner does not invent cases.

6. Confirm the run summary (skill, cases found, modes, output dir) unless headless, then execute.

## Run execution

Each case runs in a clean working directory with the skill under test staged into it and an environment built from scratch, so the host shell config, prior runs, and ancestor instruction files do not bias the result. The isolation contract lives in `references/platform-adapter.md`; there is no container, no terminal emulation, and no credential staging.

For baseline, variant, and quality modes:

```
python3 <this skill's directory>/scripts/run_evals.py \
  --cases <cases-file> --skill-path <skill> --output-dir <dir> \
  --mode quality|baseline|variant [--variant-path <skill>] \
  [--adapter <adapter.json>] [--runs N]
```

The script stages the skill and any case fixtures, applies any `state_prefix` to the input, runs each config (baseline = skill staged AND bare; variant = skill AND `--variant-path`), and writes `<run-dir>/<config>/<case-id>/`. It captures timing and token counts the moment each invocation completes and writes them to `timing.json` immediately, so a later crash never loses the measurement.

For trigger mode:

```
python3 <this skill's directory>/scripts/run_triggers.py \
  --skill-path <skill> --queries <queries-file> --output-dir <dir> \
  [--adapter <adapter.json>] [--runs-per-query N]
```

It stages a synthetic skill where the runtime discovers skills, sends each query through the adapter, and detects the skill-load tool call. Each query runs several times for stability. When the user wants to optimize the description rather than just measure it, follow `references/description-optimization.md`.

For quality mode, spawn the grader described in `references/grader.md` per case, passing the case's rubric, transcript path, artifacts dir (the case's `cwd/`), and a `grading_path` of `<case-folder>/grading.json`. The grader writes that file, gives no partial credit, and flags weak or non-discriminating assertions; relay that feedback. If a grader subagent errors, mark that case `grading_error` — never substitute a default verdict.

When `--runs` is greater than one, call `python3 <this skill's directory>/scripts/aggregate_benchmark.py --baseline <run-dir>/<config-a> --variant <run-dir>/<config-b>` to produce the mean, sample standard deviation, min, max, and the delta between configs (`--runs <run-dir>/<config>` for a single config's spread).

When a run fails or comes back weak and the user wants the skill improved from the results, follow `references/self-improvement.md`.

## Artifacts

Every run writes a dated run folder under the output dir, and those artifacts are permanent. Each case folder holds its prompt, transcript, the `cwd/` with any files the skill wrote, `timing.json`, and `grading.json` when quality mode ran. Never delete, overwrite, or rotate a run folder; disk usage is the user's call. The run's `run-log.md` records the decisions and deltas so a resumed or audited run reads back cleanly.

Tell the user where the run folder is when you finish.

## Outcomes

- The run reflects the skill's behavior in a clean working directory, not the behavior of the host shell with its memories and configs.
- Timing and token counts land on disk the moment they are measured.
- Failures cite specific expectations with evidence, and a pass that looks superficial is flagged rather than papered over.
- A baseline run that the skill no longer wins points to retiring the skill, not patching it.

> Adapted from bmad-builder, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
