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

## Step 1: Orientation

Display: `[Orientation] → Walkthrough → Detail Pass → Testing`

### Find the change

The conversation context before this skill was triggered IS your starting point — not a blank slate. Check in this order — stop as soon as the change is identified:

1. **Explicit argument**
   Did the user pass a PR, commit SHA, branch, or spec file this message?
   - PR reference → resolve to branch/commit via `gh pr view`. If resolution fails, ask for a SHA or branch.
   - Spec file, commit, or branch → use directly.

2. **Recent conversation**
   Do the last few messages reveal what change the user wants reviewed? Look for spec paths, commit refs, branches, PRs, or descriptions of a change. Use the same routing as above.

3. **Current git state**
   Check current branch and HEAD. Confirm: "I see HEAD is `<short-sha>` on `<branch>` — is this the change you want to review?"

4. **Ask**
   If none of the above identified a change, ask:
   - What changed and why?
   - Which commit, branch, or PR should I look at?
   - Do you have a spec, bug report, or anything else that explains what this change is supposed to do?

   If after 3 exchanges you still can't identify a change, HALT.

Never ask extra questions beyond what the cascade prescribes. If a step above already identified the change, skip the remaining steps.

### Enrich

Once a change is identified from any source above, fill in the complementary artifact:

- If you have a spec — for example a build-loop spec under `specs/` — look for `baseline_commit` in its frontmatter to determine the diff baseline.
- If you have a commit or branch, look for a spec whose `baseline_commit` is an ancestor of that commit/branch (i.e., the spec describes work done on top of that baseline).
- If you found both a spec and a commit/branch, use both.

### Determine what you have

Set `change_type` to match how the user referred to the change — `PR`, `commit`, `branch`, or their own words (e.g. `auth refactor`). Default to `change` if ambiguous.

Set `review_mode` — pick the first match:

1. **`full-trail`** — Enrich found a spec with a `## Suggested Review Order` section. Intent source: spec's Intent section.
2. **`spec-only`** — Enrich found a spec but it has no Suggested Review Order. Intent source: spec's Intent section.
3. **`bare-commit`** — no spec found. Intent source: commit message. If the commit message is terse (under 10 words), scan the diff for the primary change pattern and draft a one-sentence intent. Flag it as `[inferred]` in the output so the user can correct it.

### Produce orientation

#### Intent Summary

- If intent comes from a spec's Intent section, display it verbatim regardless of length — it's already written to be concise.
- For other sources (commit messages, bug reports, user description): if ≤200 tokens, display verbatim. If longer, distill to ≤200 tokens. Link to the full source when one exists (e.g. a file path or URL).
- Format: `> **Intent:** {summary}`

#### Surface Area Stats

Best-effort stats derived from the diff. Try these baselines in order:

1. `baseline_commit` from the spec's frontmatter.
2. Branch merge-base against `main` (or the default branch).
3. `HEAD~1..HEAD` (latest commit only — tell the user).
4. If git is unavailable or all of the above fail, skip stats and note: "Could not compute stats."

Use `git diff --stat` and `git diff --numstat` for file-level counts, and scan the full diff content for the richer metrics.

Display as:

```
N files changed · M modules touched · ~L lines of logic · B boundary crossings · P new public interfaces
```

- **Files changed**: count from `git diff --stat`.
- **Modules touched**: distinct top-level directories with changes (from `--stat` file paths).
- **Lines of logic**: added/modified lines excluding blanks, imports, formatting. Scan diff content; `~` because approximate.
- **Boundary crossings**: changes spanning more than one top-level module. `0` if single module.
- **New public interfaces**: new exports, endpoints, public methods found in the diff. `0` if none.

Omit any metric you cannot compute rather than guessing.

### Present

```
[Orientation] → Walkthrough → Detail Pass → Testing

> **Intent:** {intent_summary}

{stats line}
```

### Fallback trail generation

If review mode is not `full-trail`, generate a review trail from the diff and codebase context. A generated trail is lower quality than an author-produced one, but far better than none. Then return here and continue to Step 2. If trail generation fails (e.g., git unavailable), the original review mode is preserved — Step 2 handles this with its non-trail path.

1. Get the full diff against the appropriate baseline (same rules as Surface Area Stats).
2. Read changed files in full — not just diff hunks. Surrounding code reveals intent that hunks alone miss. If total file content exceeds ~50k tokens, read only the files with the largest diff hunks in full and use hunks for the rest.
3. If a spec exists, use its Intent section to anchor concern identification.
4. Identify 2–5 concerns: cohesive design intents that each explain *why* behind a cluster of changes. Prefer functional groupings and architectural boundaries over file-level splits. A single-concern change is fine — don't invent groupings.
5. For each concern, select 1–4 `path:line` stops — locations where the concern is most visible. Prefer entry points, decision points, and boundary crossings over mechanical changes.
6. Lead with the entry point — the highest-leverage stop a reviewer should see first. Inside each concern, order stops so each builds on the previous. End with peripherals (tests, config, types).
7. Format each stop per the global code-reference rule:

```
**{Concern name}**

- {one-line framing, ≤15 words}
  `src/path/to/file.ts:42`
```

When there is only one concern, omit the bold label — just list the stops directly.

Output after the orientation:

```
I built a review trail for this {change_type} (no author-produced trail was found):

{generated trail}
```

The generated trail serves as the Suggested Review Order for subsequent steps. Set `review_mode` to `full-trail` — a trail now exists, so all downstream steps treat it as one.

If git is unavailable or the diff cannot be retrieved: "Could not generate trail — git unavailable."

---

## Step 2: Walkthrough

Display: `Orientation → [Walkthrough] → Detail Pass → Testing`

### Step rules

- Organize by **concern**, not by file. A concern is a cohesive design intent — e.g., "input validation," "state management," "API contract." One file may appear under multiple concerns; one concern may span multiple files.
- The walkthrough activates **design judgment**, not correctness checking. Frame each concern as "here's what this change does and why" — the human evaluates whether it's the right approach for the system.

### Build the walkthrough

#### Identify concerns

**With a Suggested Review Order** (`full-trail` mode — the normal path, including when Step 1 generated a trail):

1. Read the Suggested Review Order stops from the spec (or from the generated trail).
2. Resolve each stop to a file in the current repo. Output in `path:line` format per the standing rule.
3. Read the diff to understand what each stop actually does.
4. Group stops by concern. Stops that share a design intent belong together even if they're in different files. A stop may appear under multiple concerns if it serves multiple purposes.

**Without a Suggested Review Order** (fallback when trail generation failed, e.g., git unavailable):

1. Get the diff against the appropriate baseline (same rules as Step 1).
2. Identify concerns by reading the diff for cohesive design intents:
   - Functional groupings — what user-facing behavior does each cluster of changes support?
   - Architectural layers — does the change cross boundaries (API → service → data)?
   - Design decisions — where did the author choose between alternatives?
3. For each concern, identify the key code locations as `path:line` stops.

#### Order for comprehension

Sequence concerns top-down: start with the highest-level intent (the "what and why"), then drill into supporting implementation. Within each concern, order stops so each one builds on the previous. The reader should never encounter a reference to something they haven't seen yet.

If the change has a natural entry point (e.g., a new public API, a config change, a UI entry point), lead with it.

#### Write each concern

For each concern, produce:

1. **Heading** — a short phrase naming the design intent (not a file name, not a module name).
2. **Why** — 1–2 sentences: what problem this concern addresses, why this approach was chosen over alternatives. If the spec documents rejected alternatives, reference them here.
3. **Stops** — each stop on its own line: `path:line` followed by a brief phrase (not a sentence) describing what this location does for the concern. Keep framing under 15 words per stop.

Target 2–5 concerns for a typical change. A single-concern change is fine — don't invent groupings. A change with more than 7 concerns is a signal the scope may be too large, but present it anyway.

### Present

Output the full walkthrough as a single message with this structure:

```
Orientation → [Walkthrough] → Detail Pass → Testing
```

Then each concern group using this format:

```
### {Concern Heading}

{Why — 1–2 sentences}

- `path:line` — {brief framing}
- `path:line` — {brief framing}
- ...
```

End the message with:

```
---

Take your time — click through the stops, read the diff, trace the logic. While you are reviewing, you can:
- "run pressure-test on the error handling"
- "have a multi-persona roundtable debate whether this schema migration is safe"
- or just ask anything

When you're ready, say **next** and I'll surface the highest-risk spots.
```

### Early exit

If at any point the human signals they want to make a decision about this {change_type} (e.g., "let's ship it", "this needs a rethink", "I'm done reviewing", or anything suggesting they're ready to decide), confirm their intent:

- If they want to **approve and ship** → go to Step 5: Wrap-Up.
- If they want to **reject and rework** → go to Step 5: Wrap-Up.
- If you misread them → acknowledge and continue the current step.

### Next

Default: go to Step 3: Detail Pass.

---

## Step 3: Detail Pass

Display: `Orientation → Walkthrough → [Detail Pass] → Testing`

### Step rules

- The detail pass surfaces what the human should **think about**, not what the code got wrong. Machine hardening already handled correctness. This activates risk awareness.
- You detect risk category by pattern. The human judges significance. Do not assign severity scores or numeric rankings — ordering by blast radius (below) is sequencing for readability, not a severity judgment.
- If no high-risk spots exist, say so explicitly. Do not invent findings.

### Identify risk spots

Scan the diff for changes touching risk-sensitive patterns. Look for 2–5 spots where a mistake would have the highest blast radius — not the most complex code, but the code where being wrong costs the most.

Risk categories to detect:

- `[auth]` — authentication, authorization, session, token, permission, access control
- `[public API]` — new/changed endpoints, exports, public methods, interface contracts
- `[schema]` — database migrations, schema changes, data model modifications, serialization
- `[billing]` — payment, pricing, subscription, metering, usage tracking
- `[infra]` — deployment, CI/CD, environment variables, config files, infrastructure
- `[security]` — input validation, sanitization, crypto, secrets, CORS, CSP
- `[config]` — feature flags, environment-dependent behavior, defaults
- `[other]` — anything risk-sensitive that doesn't fit the above (e.g., concurrency, data privacy, backwards compatibility). Use a descriptive tag.

Sequence spots so the highest blast radius comes first (how much breaks if this is wrong), not by diff order or file order. If more than 5 spots qualify, show the top 5 and note: "N additional spots omitted — ask if you want the full list."

If the change has no spots matching these patterns, state: "No high-risk spots found in this change — the diff speaks for itself." Do not force findings.

### Surface machine hardening findings

Check whether the spec has a `## Spec Change Log` section with entries — a build-loop spec accumulates them during its adversarial review loops.

- **If entries exist:** Read them. Surface findings that are instructive for the human reviewer — not bugs that were already fixed, but decisions the review loop flagged that the human should be aware of. Format: brief summary of what was flagged and what was decided.
- **If no entries or no spec:** Skip this section entirely. Do not mention it.

### Present

Output as a single message:

```
Orientation → Walkthrough → [Detail Pass] → Testing
```

#### Risk Spots

For each spot, one line:

```
- `path:line` — [tag] reason-phrase
```

Example:

```
- `src/auth/middleware.ts:42` — [auth] New token validation bypasses rate limiter
- `migrations/003_add_index.sql:7` — [schema] Index on high-write table, check lock behavior
- `api/routes/billing.ts:118` — [billing] Metering calculation changed, verify idempotency
```

#### Machine Hardening (only if findings exist)

```
### Machine Hardening

- Finding summary — what was flagged, what was decided
- ...
```

#### Closing menu

End the message with:

```
---

You've seen the design and the risk landscape. From here:
- **"dig into [area]"** — I'll deep-dive that specific area with correctness focus
- **"next"** — I'll suggest how to observe the behavior
```

### Early exit

If at any point the human signals they want to make a decision about this {change_type}, confirm their intent:

- If they want to **approve and ship** → go to Step 5: Wrap-Up.
- If they want to **reject and rework** → go to Step 5: Wrap-Up.
- If you misread them → acknowledge and continue the current step.

### Targeted re-review

When the human says "dig into [area]" (e.g., "dig into the auth changes", "dig into the schema migration"):

1. If the specified area does not map to any code in the diff, say so: "I don't see [area] in this change — did you mean something else?" Return to the closing menu.
2. Identify all code locations in the diff relevant to the specified area.
3. Read each location in full context (not just the diff hunk — read surrounding code).
4. Shift to **correctness mode**: trace edge cases, check boundary conditions, verify error handling, look for off-by-one errors, race conditions, resource leaks.
5. Present findings as a compact list — each finding is `path:line` + what you found + why it matters.
6. If nothing concerning is found, say so: "Looked closely at [area] — nothing concerning. The implementation is solid."
7. After presenting, show only the closing menu (not the full risk spots list again).

The human can trigger multiple targeted re-reviews. Each time, present new findings and the closing menu only.

### Next

Go to Step 4: Testing.

---

## Step 4: Testing

Display: `Orientation → Walkthrough → Detail Pass → [Testing]`

### Step rules

- This is **experiential**, not analytical. The detail pass asked "did you think about X?" — this says "you could see X with your own eyes."
- Do not prescribe. The human decides whether observing the behavior is worth their time. Frame suggestions as options, not obligations.
- Do not duplicate CI, test suites, or automated checks. Assume those exist and work. This is about manual observation — the kind of confidence-building no automated test provides.
- If the change has no user-visible behavior, say so explicitly. Do not invent observations.

### Identify observable behavior

Scan the diff and spec for changes that produce behavior a human could directly observe. Categories to look for:

- **UI changes** — new screens, modified layouts, changed interactions, error states
- **CLI/terminal output** — new commands, changed output, new flags or options
- **API responses** — new endpoints, changed payloads, different status codes
- **State changes** — database records, file system artifacts, config effects
- **Error paths** — bad input, missing dependencies, edge conditions

For each observable behavior, determine:

1. **What to do** — the specific action (command to run, button to click, request to send)
2. **What to expect** — the observable result that confirms the change works
3. **Why bother** — one phrase connecting this observation to the change's intent (omit if obvious from context)

Target 2–5 suggestions for a typical change. If more than 5 qualify, prioritize by how much confidence the observation provides relative to effort. A change with zero observable behavior is fine — do not pad with trivial observations.

### Present

Output as a single message:

```
Orientation → Walkthrough → Detail Pass → [Testing]
```

Then the testing suggestions using this format:

```
### How to See It Working

**{Brief description}**
Do: {specific action}
Expect: {observable result}

**{Brief description}**
Do: {specific action}
Expect: {observable result}
```

Include code blocks for commands or requests where helpful.

If the change has no observable behavior, replace the suggestions with:

```
### How to See It Working

This change is internal — no user-visible behavior to observe. The diff and tests tell the full story.
```

#### Closing

End the message with:

```
---

You've seen the change and how to verify it. When you're ready to make a call, just say so.
```

### Next

When the human signals they're ready to make a decision about this {change_type}, go to Step 5: Wrap-Up.

---

## Step 5: Wrap-Up

Display: `Orientation → Walkthrough → Detail Pass → Testing → [Wrap-Up]`

### Prompt for decision

```
---

Review complete. What's the call on this {change_type}?
- **Approve** — ship it (I can help with interactive patching first if needed)
- **Rework** — back to the drawing board (revert, revise the spec, try a different approach)
- **Discuss** — something's still on your mind
```

HALT — do not proceed until the user makes their choice.

### Act on decision

- **Approve**: Acknowledge briefly. If the human wants to patch something before shipping, help apply the fix interactively. If reviewing a PR, offer to approve via `gh pr review --approve` — but confirm with the human before executing, since this is a visible action on a shared resource.
- **Rework**: Ask what went wrong — was it the approach, the spec, or the implementation? Help the human decide on next steps (revert commit, open an issue, revise the spec, etc.). Help draft specific, actionable feedback tied to `path:line` locations if the change is a PR from someone else. If the change came out of a `build-loop` run, offer to feed the rework back through its spec-change process.
- **Discuss**: Open conversation — answer questions, explore concerns, dig into any aspect. After discussion, return to the decision prompt above.

> Adapted from BMAD-METHOD, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
