# Platform adapter

Everything runtime-specific in the eval-runner lives here, behind one seam. The rest of the skill, the scripts, the case format, the grader, and the modes are written against this seam and stay platform-agnostic. No model name is hardcoded anywhere; a model is just a value the adapter forwards if a runtime needs one, never a list this skill maintains.

## The adapter config file

An adapter is a JSON file the scripts read. A working pi adapter ships at `assets/adapter-pi.json` (a Claude Code example ships beside it as `assets/adapter-claude-code.json`). The pi adapter's invocation embeds a small transcript bridge program — why, and what it maps, is in the pi notes below the key table:

```json
{
  "name": "pi",
  "invocation": ["python3", "-c", "<transcript bridge — full program in the file>", "{prompt}"],
  "auth_env": "ZAI_API_KEY",
  "transcript": { "format": "stdout-jsonl" },
  "skill_dir": ".pi/skills",
  "load_signal": { "skill_tool": null, "read_tool": "read" },
  "env_passthrough": []
}
```

| Key | Required | Meaning |
|---|---|---|
| `invocation` | yes | argv template for one non-interactive run. `{prompt}` (alias `{query}`) is replaced with the composed input, `{cwd}` with the case's clean working directory. |
| `auth_env` | no | name of the one env var the runtime reads for its credential. Forwarded from the host **only when set non-empty** — forwarding an empty string overrides the runtime's own credential fallback and breaks auth. Edit `auth_env` together with the provider named in the invocation (the pi adapter pairs `ZAI_API_KEY` with `--provider zai`; `ANTHROPIC_API_KEY` pairs with `--provider anthropic`, `GEMINI_API_KEY` with `--provider google`). |
| `transcript` | no | `{"format": "stdout-jsonl"}` (default; stdout captured as the JSONL transcript) or `{"format": "file", "path": "transcript.jsonl"}` (runtime writes a file in the cwd). |
| `skill_dir` | no | directory under the cwd where the runtime discovers skills. Default `.pi/skills`. Used to stage the skill under test and trigger mode's synthetic skill. |
| `load_signal` | trigger mode | which tool calls count as a skill load: `{"skill_tool": "Skill", "read_tool": "Read"}` (the defaults). See trigger detection below. |
| `env_passthrough` | no | extra host env var names to forward into the run, for runtimes that need more than the auth var. Empty unless a runtime forces it. |

### The pi adapter, key by key

- **invocation** runs `python3 -c <bridge> {prompt}`: the bridge spawns `pi --provider <p> --model <m> --mode json --no-session --no-extensions --no-context-files --offline -a -p -- <prompt>` and re-emits its event stream in the transcript schema below. The bridge exists because pi's JSON stream differs from that schema: pi emits `message_end` events whose message content carries `toolCall` blocks with an `arguments` object, and usage keyed `input`/`output`. The bridge maps `toolCall` → `tool_use` (with `arguments` as `input`), aliases pi's `path` argument to `file_path` so trigger detection and read-only grader checks see the schema's key, sums per-step usage, emits one `assistant` event per step, and closes with a `result` event carrying the totals — then propagates pi's exit code and stderr tail. This is the runtime's own accounting branch, living behind the seam as required. The provider and model are pinned here on purpose: a clean-room run has a fresh empty `HOME`, so pi's saved default provider and model do not exist and auth must come from `auth_env` alone. Edit both in the adapter file to evaluate a different model.
- **skill_dir** is `.pi/skills` under the case cwd — pi discovers project skills from `.pi/skills/` in the working directory and its ancestors. The bridge passes `-a` (trust project-local files for this run) because project skills sit behind pi's project trust, which non-interactive modes cannot prompt for.
- **load_signal** sets `skill_tool` to null and `read_tool` to `read`: pi has no skill-invocation tool, so a load happens when the model reads the staged `SKILL.md`, which the bridge surfaces as a `tool_use` of `read` whose `input.file_path` names the synthetic skill.

### Discovery

`run_evals.py` and `run_triggers.py` locate the adapter in this order:

1. `--adapter <path>` on the command line.
2. `SKILL_EVALS_ADAPTER` env var pointing at a config file.
3. `adapter.json` or `.skill-evals-adapter.json` beside the cases/queries file.

Nothing found means the run degrades to staging-only (cases prepared, results recorded as skipped). When the current runtime is pi and no project adapter exists, pass `--adapter <this skill's directory>/assets/adapter-pi.json`.

## Invocation and isolation

The runner fills the invocation template with the input (any `state_prefix` already prepended) and the clean working directory, runs the command from that directory, and waits for completion. Before invoking, it stages into the cwd: the skill under test at `<cwd>/<skill_dir>/<skill-name>/`, and any case fixtures.

The subprocess environment is built from scratch, never inherited, so host shell config, memories, and tokens cannot bias the result. It contains exactly: `PATH`, a fresh empty `HOME` at `<case>/.home`, `CLAUDE_CONFIG_DIR` inside that HOME, the `auth_env` var when set non-empty on the host, and any `env_passthrough` keys present on the host. There is no container, no terminal emulation, and no credential file staging.

For a baseline run the runner issues the same command twice from the same input: once with the skill staged in the working directory and once with nothing staged, so the bare-model floor is measured under identical conditions. For a variant run it stages the full skill in one config and the `--variant-path` skill in the other.

## Transcript schema

The transcript tells `run_evals.py` where timing and token counts live and tells the grader how to read tool calls and the final message. The scripts read line-delimited JSON events: `assistant` events carry `message.content[]` items (a `tool_use` item has `name` and `input`; usage blocks carry token counts), and a `result` event's usage block is authoritative for totals. A runtime whose events differ needs its own accounting branch — that branch belongs here, behind the seam, not in a mode or the grader.

## Trigger detection: "did the skill load"

Trigger mode does not measure output; it measures whether the description caused the skill to fire. `run_triggers.py` stages a synthetic skill (unique name) in `skill_dir`, sends each query through the invocation command, and scans the transcript for a load. Each query runs several times because firing is probabilistic; the trigger rate is the fraction of runs that loaded the skill.

Only `tool_use` events count as a load: a `skill_tool` call whose input names the synthetic skill, or a `read_tool` call whose `file_path` falls inside the synthetic skill's directory (its SKILL.md). Whole-transcript substring matching is rejected outright, because the runtime's init event lists every discovered skill by name — a substring match would report 100% trigger rate no matter what the description says.

## Adding a runtime

Write an adapter file declaring the keys above; add `skill_dir` and `load_signal` if you want trigger mode. Add no model list and no provider branch anywhere else; if a value beyond these is needed, it belongs in the adapter, not in a script or a prompt.
