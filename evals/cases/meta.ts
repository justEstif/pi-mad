import type { TriggerCase } from "./types.js";

// skill-evals — the meta-skill; must fire on eval language and stay quiet on ordinary testing
export const skillEvalsTriggers: TriggerCase[] = [
  {
    skillId: "skill-evals",
    prompt: "Does the storytelling-coach skill actually beat the bare model? Benchmark it for me.",
    shouldFire: true,
    why: "explicit skill evaluation request",
  },
  {
    skillId: "skill-evals",
    prompt: "Run the unit tests and lint the repo.",
    shouldFire: false,
    why: "ordinary CI testing, nothing to do with skill evals",
  },
  {
    skillId: "skill-evals",
    prompt: "The build-loop description keeps firing on typo fixes — check whether its trigger is mis-tuned.",
    shouldFire: true,
    why: "trigger validation / description quality work",
  },
];
