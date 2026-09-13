import type { TriggerCase } from "./types.js";

// storytelling-coach / diagram-studio — the dotfiles-merged skills (A4 merge-first bets)
export const storytellingCoachTriggers: TriggerCase[] = [
  {
    skillId: "storytelling-coach",
    prompt: "My launch announcement falls flat — coach me on the opening hook and narrative arc.",
    shouldFire: true,
    why: "on-demand coaching on part of a narrative",
  },
  {
    skillId: "storytelling-coach",
    prompt: "Rewrite this error message to be friendlier.",
    shouldFire: false,
    why: "copy edit, not story craft",
  },
];

export const diagramStudioTriggers: TriggerCase[] = [
  {
    skillId: "diagram-studio",
    prompt: "Turn the auth flow into an Excalidraw sequence diagram I can put in the docs.",
    shouldFire: true,
    why: "explicit Excalidraw + sequence diagram request",
  },
  {
    skillId: "diagram-studio",
    prompt: "Explain how the auth flow works.",
    shouldFire: false,
    why: "explanation only — visualize nothing unless asked",
  },
];
