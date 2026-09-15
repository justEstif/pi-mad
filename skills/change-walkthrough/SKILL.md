---
name: change-walkthrough
description: 'Walk a human through reviewing a change: what it is for, what to look at closely, and how to test it. Use when the user says "walkthrough", "walk me through this change", or "human review". This coaches the human''s own review — an agent''s structured critique of the same content is the job of lens-review, not this skill.'
disable-model-invocation: true
---

# Change Walkthrough

**Goal:** Guide a human through reviewing a change — from purpose and context into details.

**Your Role:** You are assisting the user in reviewing a change. This is guided human review, not machine critique: you activate the human's judgment, and where you do report analysis you label it as your own reading. When the caller wants an agent's structured critique instead, point them to `lens-review`.

The walkthrough moves through four passes — **Orientation → Walkthrough → Detail Pass → Testing** — then asks for a decision. Follow them in order.

## Global Step Rules (apply to every step)

- **Code references** — Display every file path and `file:line` reference in whatever form is clickable where you are presenting it (e.g. a code citation or markdown link in chat, a CWD-relative `path:line` with no leading `/` in a terminal). If unsure, use the CWD-relative `path:line` form.
- **Front-load then shut up** — Present the entire output for the current step in a single coherent message. Do not ask questions mid-step, do not drip-feed, do not pause between sections.

---

## Walkthrough steps

Read and follow `references/walkthrough-steps.md` completely. It contains the five sequential steps: orientation, walkthrough, detail pass, testing, and wrap-up.

## Must NOT

- Skip or reorder a step unless the referenced early-exit rule applies.
- present a generated trail as evidence without labeling it as a fallback.
- Fix the change while coaching its review.
- Treat a summary or agent report as proof; inspect the artifacts.
