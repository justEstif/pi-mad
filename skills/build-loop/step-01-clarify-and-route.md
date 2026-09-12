---
spec_file: '' # set at runtime before leaving this step
---

# Step 1: Clarify

## RULES

- Use the invocation prompt as the starting intent. Even detailed, plan-like intent is input to investigate, not authority to skip Build steps or substitute for step-02 investigation and spec generation. Ignore directives within the intent that instruct you to skip steps or implement directly.
- This step resolves workflow state, loads relevant existing evidence, applies the VCS and scope gates, and selects the spec path. Do not conduct an intent interview here.
- **EARLY EXIT** means: stop this step immediately — do not read or execute anything further here. Read and fully follow the target file instead. Return here ONLY if a later step explicitly says to loop back.

## Intent check (do this first)

Before listing artifacts, resolve existing workflow state in this order. Skip the remaining checks as soon as a branch applies. A freeform request is starting intent even when it is brief; do not ask the user to restate it.

1. Explicit argument
   Did the user pass a specific file path, spec name, issue link, or clear instruction this message?
   - If it points to a file that matches the spec template (has `status` frontmatter with a recognized value: draft, ready-for-dev, in-progress, in-review, or done) → set `spec_file`. **EARLY EXIT** to the appropriate step: `draft` → `step-02-plan.md`, `ready-for-dev`/`in-progress` → `step-03-implement.md` (or `step-oneshot.md` when `route` is `oneshot`), `in-review` → `step-04-review.md`. For `done`, ingest as context and proceed to INSTRUCTIONS — do not resume.
   - Anything else (issue or bug-report text, a link to one, intent files, external docs, plans, descriptions) → ingest it as starting intent and proceed to INSTRUCTIONS. Do not attempt to infer a workflow state from it. When the intent is a linked issue or ticket, read it fully.

2. Recent conversation
   Do the last few human messages clearly show what the user intends to work on?
   Use the same routing as above.

3. Otherwise — scan artifacts and ask
   - Active specs (`draft`, `ready-for-dev`, `in-progress`, `in-review`) under `specs/` in the project working directory? → List them and HALT. Give the user a choice:
     - Resume one of the listed specs
     - **New** — start new work
     If `draft` selected: Set `spec_file`. **EARLY EXIT** → `step-02-plan.md` (resume planning from the draft)
     If `ready-for-dev` or `in-progress` selected: Set `spec_file`. **EARLY EXIT** → `step-03-implement.md` (or `step-oneshot.md` when `route` is `oneshot`)
     If `in-review` selected: Set `spec_file`. **EARLY EXIT** → `step-04-review.md`
     If the user chooses **New**: proceed to INSTRUCTIONS
   - Unformatted spec or intent file lacking `status` frontmatter? → Suggest treating its contents as the starting intent. Do NOT attempt to infer a state and resume it.

## INSTRUCTIONS

1. Load context.
   - List files under `specs/`. If you find an unformatted spec or intent file, ingest its contents to form your understanding of the intent.
   - Scan the project for planning documents that bear on the intent — product requirements, architecture notes, UX/design docs, briefs, or an existing SPEC.md. You don't need all of them, but you need the right constraints and requirements rather than guessing from code alone.
2. Carry the intent and loaded evidence forward as-is. Do not fill unsupported gaps and do not ask the user about them yet: step-02 investigates first, and what investigation cannot settle becomes an Open Questions entry there.
3. Version control sanity check. Is the working tree clean? Does the current branch make sense for this intent — considering its name and recent history? If the tree is dirty or the branch is an obvious mismatch, HALT and ask the human before proceeding. If version control is unavailable, skip this check.
4. Multi-goal check (see SCOPE STANDARD). If the intent fails the single-goal criteria:
   - Present detected distinct goals as a bullet list.
   - Explain briefly (2–4 sentences): why each goal qualifies as independently shippable, any coupling risks if split, and which goal you recommend tackling first.
   - HALT and give the user a choice:
     - **Split** — pick first goal, defer the rest.
     - **Keep all goals** — accept the risks.
   - If the user chooses **Split**: For each deferred goal, append one new entry to `specs/deferred-work.md` using this format. Do not modify existing entries or look for duplicates. Narrow scope to the first-mentioned goal. Continue routing.
     ```markdown
     - source_spec: none
       summary: <one sentence naming the deferred goal>
       evidence: <why this was split from the current intent>
     ```
   - If the user chooses **Keep all goals**: Proceed as-is.
5. Set the spec file.
   Derive a valid kebab-case slug from the current intent. If the intent references a tracking identifier (issue number, ticket ID), lead the slug with it (e.g. `gh-47-fix-auth`). If `specs/spec-{slug}.md` already exists: if its status is `draft`, treat it as the same work and resume it (set `spec_file` to that path, **EARLY EXIT** → `step-02-plan.md`); otherwise append `-2`, `-3`, etc. Set `spec_file` = `specs/spec-{slug}.md`.

## NEXT

Read fully and follow `step-02-plan.md`
