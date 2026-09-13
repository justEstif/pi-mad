import type { TriggerCase } from "./types.js";

// lens-review — explicitly requested review of content (not acting on feedback)
export const lensReviewTriggers: TriggerCase[] = [
  {
    skillId: "lens-review",
    prompt: "Review PR #42 before we merge — run your lenses over the diff and triage what you find.",
    shouldFire: true,
    why: "explicit review request over a diff",
  },
  {
    skillId: "lens-review",
    prompt: "Now fix the three issues you found in that last review of utils.py.",
    shouldFire: false,
    why: "acting on earlier feedback is a change, not a review",
  },
  {
    skillId: "lens-review",
    prompt: "Refactor the auth module for readability",
    shouldFire: false,
    why: "no review requested at all — must stay quiet",
  },
];
