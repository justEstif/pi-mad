/**
 * Baseline evals — build-loop staged vs bare model on two canned tasks.
 *
 * SKIPPED BY DEFAULT: baseline runs are the most expensive mode (every case runs
 * twice, model-backed) and need a chosen provider/model via PI_PROVIDER/PI_MODEL.
 * Remove `.skip` once those are pinned, then run:
 *   npx vitest-evals evals/baseline.eval.ts
 */
import { describeEval, it } from "vitest-evals";
import { runPi, stageSkill } from "./lib/harness.js";
import { buildLoopBaseline } from "./cases/build-loop.js";

const SKILL_UNDER_TEST = "build-loop";
// Resolved relative to this file so the eval works from any cwd.
const SKILL_DIR = new URL(`../skills/${SKILL_UNDER_TEST}`, import.meta.url).pathname;

describeEval("build-loop-baseline", () => {
  for (const c of buildLoopBaseline) {
    it.skip(`${c.id}: skill beats bare model`, async ({ expect }) => {
      const prompt = c.statePrefix ? `${c.statePrefix}\n\n${c.input}` : c.input;

      // Config A: skill staged into the temp project's .pi/skills/
      const withSkill = runPi(prompt, { setupProject: (dir) => stageSkill(dir, SKILL_DIR) });
      // Config B: bare model, identical invocation, nothing staged
      const bare = runPi(prompt);

      try {
        expect(withSkill.ok, `skill run failed: ${withSkill.stderr.slice(-300)}`).toBe(true);
        expect(bare.ok, `bare run failed: ${bare.stderr.slice(-300)}`).toBe(true);

        // Rubric grading is model-backed and follows references/grader.md:
        // strict, no partial credit, evidence required. Until the grader from
        // skills/skill-evals is wired in, this assert is a placeholder that
        // fails loudly rather than passing for a trivial reason.
        throw new Error(
          "baseline grading not wired: connect the skills/skill-evals grader (references/grader.md) " +
          "to score each config's output against the case rubric before enabling this eval.",
        );
      } finally {
        // Artifacts (cwd + session) intentionally survive under /tmp for inspection.
      }
    });
  }
});
