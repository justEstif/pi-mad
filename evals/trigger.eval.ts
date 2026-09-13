/**
 * Trigger evals — description-quality probes for the shelf's high-traffic skills.
 *
 * ⚠️ WHAT THIS MEASURES (read before trusting a green run):
 * The shelf is all-dark (disable-model-invocation: true — product.md [A3]).
 * These evals therefore do NOT test skill loading. They feed the real catalog
 * descriptions + a prompt to a model judge and ask "which skill applies?".
 * A pass means the DESCRIPTION would make an agent pick the skill; a miss means
 * the description is failing to attract (false negative) or over-attracting
 * (false positive). Real firing measurement lives in skills/skill-evals trigger
 * mode (synthetic bright skill + load-signal detection via the adapter seam).
 *
 * Costs one model call per case. See evals/README.md before running.
 */
import { describeEval, it } from "vitest-evals";
import { judge } from "./lib/harness.js";
import { loadCatalog } from "./lib/catalog.js";
import { buildLoopTriggers } from "./cases/build-loop.js";
import { lensReviewTriggers } from "./cases/lens-review.js";
import { ideaForgeTriggers, sdlcLoopTriggers, specDistillerTriggers } from "./cases/planning.js";
import { storytellingCoachTriggers, diagramStudioTriggers } from "./cases/coaching.js";
import { skillEvalsTriggers } from "./cases/meta.js";

const cases = [
  ...buildLoopTriggers,
  ...lensReviewTriggers,
  ...ideaForgeTriggers,
  ...sdlcLoopTriggers,
  ...specDistillerTriggers,
  ...storytellingCoachTriggers,
  ...diagramStudioTriggers,
  ...skillEvalsTriggers,
];

const catalog = loadCatalog([...new Set(cases.map((c) => c.skillId))]);

describeEval("shelf-skill-triggers", () => {
  for (const c of cases) {
    it(`${c.shouldFire ? "fires" : "stays quiet"} on: "${c.prompt.slice(0, 60)}…" (${c.why})`, async ({ expect }) => {
      const picked = await judge(c.prompt, catalog);
      if (c.shouldFire) {
        expect(picked, `expected [${c.skillId}], judge picked ${picked ?? "NONE"}`).toBe(c.skillId);
      } else {
        const wrongPick = picked === c.skillId;
        expect(wrongPick, `expected the judge NOT to pick [${c.skillId}], but it did`).toBe(false);
      }
    });
  }
});
