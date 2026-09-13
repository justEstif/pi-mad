/**
 * Thin local eval harness for the pi shelf.
 *
 * TEMPORARY BY DESIGN. This shells out to the `pi` CLI in a temp project dir.
 * The real harness (packages/evals in the pi monorepo, earendil-works/pi) adapts
 * an AgentSession directly and cannot be imported here. When that package is
 * consumable outside the monorepo, delete this file and rewire the evals to it.
 * The seam (runAgent / judge) is deliberately tiny to make that swap cheap.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export interface RunOptions {
  /** Extra env merged over the harness base (e.g. PI_PROVIDER, PI_MODEL, API keys). */
  env?: Record<string, string>;
  /** Timeout in ms. Default 5 min — model-backed runs are slow. */
  timeoutMs?: number;
}

export interface RunResult {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  /** The temporary project dir the run executed in. Caller decides lifetime. */
  cwd: string;
  /** Absolute path of the pi session file if one was written. */
  sessionPath: string | null;
}

/**
 * Spawn `pi` non-interactively in a fresh temp dir.
 *
 * Flags chosen to keep the run hermetic and cheap:
 *   -p              print mode (process prompt, exit)  — the non-interactive mode
 *   --no-session    ephemeral, but we point --session-dir at the case dir so a
 *                   transcript is still captured for later inspection
 *   --no-extensions --no-context-files --offline   nothing from the host biases the run
 *   -a              trust the temp project dir (required for project-local discovery)
 *
 * Provider/model come from env passthrough (PI_PROVIDER / PI_MODEL) so nothing
 * is hardcoded — mirroring the adapter seam in skills/skill-evals.
 */
export function runPi(
  prompt: string,
  opts: RunOptions & { setupProject?: (dir: string) => void } = {},
): RunResult {
  const cwd = mkdtempSync(join(tmpdir(), "pi-shelf-eval-"));
  const sessionDir = join(cwd, ".sessions");
  mkdirSync(sessionDir, { recursive: true });
  opts.setupProject?.(cwd);

  const env: Record<string, string> = {
    PATH: process.env.PATH ?? "",
    HOME: cwd + "/.home", // fresh HOME: no saved provider/model/memories leak in
    TERM: "dumb",
    ...pickAuth(),
    ...(opts.env ?? {}),
  };
  mkdirSync(env.HOME, { recursive: true });

  const argv = [
    "pi",
    ...(env.PI_PROVIDER ? ["--provider", env.PI_PROVIDER] : []),
    ...(env.PI_MODEL ? ["--model", env.PI_MODEL] : []),
    "--mode", "text",
    "--no-extensions",
    "--no-context-files",
    "--offline",
    "--session-dir", sessionDir,
    "--no-session",
    "-a",
    "-p",
    "--",
    prompt,
  ];

  if (!commandAvailable("pi")) {
    rmSync(cwd, { recursive: true, force: true });
    throw new Error(
      "`pi` is not on PATH. The local harness shells out to the pi CLI; install pi or replace this harness with the monorepo evals package (see evals/lib/harness.ts header).",
    );
  }

  const proc = spawnSync(argv[0], argv.slice(1), {
    cwd,
    env,
    encoding: "utf8",
    timeout: opts.timeoutMs ?? 5 * 60_000,
    maxBuffer: 16 * 1024 * 1024,
  });

  const sessionPath = firstFile(sessionDir);
  return {
    ok: proc.status === 0 && !proc.error,
    exitCode: proc.status ?? -1,
    stdout: proc.stdout ?? "",
    stderr: (proc.stderr ?? "") || (proc.error ? String(proc.error) : ""),
    cwd,
    sessionPath,
  };
}

export interface JudgeChoice {
  id: string;
  /** The catalog description shown to the judge, verbatim from SKILL.md frontmatter. */
  description: string;
}

/**
 * Ask the model, via the same runner, which skill (if any) applies to a prompt.
 *
 * ⚠️ DESCRIPTION-QUALITY PROBE, NOT A LOAD TEST. The shelf is all-dark
 * (disable-model-invocation: true — product.md A3), so skills never fire
 * automatically. This judges whether a description WOULD make an agent pick
 * the skill if loading were enabled — i.e. it measures description quality.
 * Real firing measurement must go through skills/skill-evals trigger mode,
 * which stages a synthetic (bright) skill and watches for the load signal.
 */
export async function judge(
  prompt: string,
  choices: JudgeChoice[],
  opts: RunOptions = {},
): Promise<string | null> {
  const catalog = choices
    .map((c) => `[${c.id}] ${c.description}`)
    .join("\n\n");
  const judgePrompt = [
    "You are deciding which skill, if any, an agent should load before answering a user request.",
    "Here is the skill catalog (id + description):",
    "",
    catalog,
    "",
    `User request: "${prompt}"`,
    "",
    "Reply with ONLY the bracketed id of the single best-matching skill (e.g. [build-loop]),",
    "or NONE if no skill clearly applies. No other text.",
  ].join("\n");

  const res = runPi(judgePrompt, { ...opts, env: { ...opts.env } });
  if (!res.ok) {
    throw new Error(`judge run failed (exit ${res.exitCode}): ${res.stderr.slice(-500)}`);
  }
  const m = res.stdout.trim().match(/\[([a-z0-9-]+)\]/i);
  if (m) {
    const hit = choices.find((c) => c.id === m[1].toLowerCase());
    if (hit) return hit.id;
  }
  if (/^none\b/i.test(res.stdout.trim())) return null;
  // Unparseable output counts as no pick; caller treats as a miss.
  return null;
}

/** A temp project factory for baseline runs: stage a skill into .pi/skills/<name>/. */
export function stageSkill(projectDir: string, skillDir: string): string {
  const dest = join(projectDir, ".pi", "skills", basename(skillDir));
  cpSyncRecursive(resolve(skillDir), dest);
  return dest;
}

// ---- internals ------------------------------------------------------------

function commandAvailable(cmd: string): boolean {
  const r = spawnSync("sh", ["-lc", `command -v ${cmd}`], { encoding: "utf8" });
  return r.status === 0;
}

function firstFile(dir: string): string | null {
  try {
    const fs = require("node:fs") as typeof import("node:fs");
    const f = fs.readdirSync(dir)[0];
    return f ? join(dir, f) : null;
  } catch {
    return null;
  }
}

function pickAuth(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ["ZAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "OPENAI_API_KEY"]) {
    const v = process.env[k];
    if (v) out[k] = v; // forward only when non-empty (empty overrides fallback)
  }
  return out;
}

function cpSyncRecursive(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  const fs = require("node:fs") as typeof import("node:fs");
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dest, entry.name);
    if (entry.isDirectory()) cpSyncRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

function basename(p: string): string {
  return p.split("/").filter(Boolean).pop() ?? p;
}

// Quiet unused-import lint for writeFileSync (kept for setupProject users).
void writeFileSync; void existsSync;
