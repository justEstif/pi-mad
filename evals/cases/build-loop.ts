import type { TriggerCase, BaselineCase } from "./types.js";

// build-loop — delegated implementation work (not mechanical edits, not VC ops)
export const buildLoopTriggers: TriggerCase[] = [
  {
    skillId: "build-loop",
    prompt: "Here's the issue: login page crashes on Safari when the auth token expires. Take it from idea to reviewed code.",
    shouldFire: true,
    why: "delegated bug fix with review expectation — the skill's core case",
  },
  {
    skillId: "build-loop",
    prompt: "Fix the typo 'recieve' in README.md",
    shouldFire: false,
    why: "explicitly excluded: mechanical typo edit",
  },
  {
    skillId: "build-loop",
    prompt: "git commit and push what's staged, then tag v1.2.0",
    shouldFire: false,
    why: "excluded: version-control ops that only record existing work",
  },
];

export const buildLoopBaseline: BaselineCase[] = [
  {
    id: "build-loop-1",
    input:
      "In this repo, add a tiny CLI script scripts/quote.ts that prints a random quote from a hardcoded array of 5 quotes. Tests welcome.",
    rubric: [
      "scripts/quote.ts exists and running it prints exactly one line that matches a string present in the file's array",
      "the file contains an array literal with at least 5 entries",
      "a test or runnable verification step is mentioned in the final message, not just the code dropped silently",
    ],
  },
  {
    id: "build-loop-2",
    input:
      "The function formatDate(d) in src/dates.ts returns '2026-1-5' for January 5 — fix the zero-padding and add a regression note.",
    files: ["evals/cases/fixtures/dates.ts"],
    rubric: [
      "src/dates.ts pads month and day to two digits",
      "a regression note or test exists covering the single-digit month case",
      "the fix does not change any unrelated function",
    ],
  },
];
