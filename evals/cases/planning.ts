import type { TriggerCase } from "./types.js";

// idea-forge / sdlc-loop / spec-distiller — adjacent planning skills, the hard discrimination set
export const ideaForgeTriggers: TriggerCase[] = [
  {
    skillId: "idea-forge",
    prompt: "I keep circling this idea for a local-first notes app — can we stress-test it before I commit a weekend to it?",
    shouldFire: true,
    why: "pressure-test a half-formed idea",
  },
  {
    skillId: "idea-forge",
    prompt: "Write the spec for the notes app sync engine.",
    shouldFire: false,
    why: "spec writing, not idea pressure-testing — belongs to spec-distiller",
  },
];

export const sdlcLoopTriggers: TriggerCase[] = [
  {
    skillId: "sdlc-loop",
    prompt: "Take ticket PROJ-17 end to end — plan through deploy, with me accepting each gate.",
    shouldFire: true,
    why: "whole delivery chain orchestrated from a ticket",
  },
  {
    skillId: "sdlc-loop",
    prompt: "Distill these meeting notes into SPEC.md.",
    shouldFire: false,
    why: "one artifact, not the chain — spec-distiller's job",
  },
];

export const specDistillerTriggers: TriggerCase[] = [
  {
    skillId: "spec-distiller",
    prompt: "Here's a rambling PRD draft — distill it into a short spec with clear non-goals.",
    shouldFire: true,
    why: "distill input into a spec",
  },
  {
    skillId: "spec-distiller",
    prompt: "Review my spec draft and tell me what's weak.",
    shouldFire: false,
    why: "review of a document — lens-review territory",
  },
];
