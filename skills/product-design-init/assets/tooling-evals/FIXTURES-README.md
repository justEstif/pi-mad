# Fixtures — before/after evals for copy and interface behavior

Placeholder for deterministic-ish evals of this repo's product-design guidance. Do not delete; build fixtures here once the team has accepted real decisions (an eval against unrecorded standards tests nothing).

> SCAFFOLD — describes the pattern; contains no fixtures yet. Adapted from a published product-design eval approach.

## The pattern

- An agent edits a `before` state; a judge scores the `after` state against a rubric.
- `fixtures.json` indexes fixtures; `rules-checklist.json` holds the per-fixture rubric (which accepted rules must hold in the `after` state).
- Each fixture lives in its own directory:

```
tooling/evals/
├── fixtures.json
├── rules-checklist.json
└── {fixture-name}/
    ├── before/          # the interface/copy the agent starts from
    └── after/           # the judge scores this against the rubric
```

## Rules for good fixtures

- **Source fixtures from shipped examples** documented in `exemplars/` and the references — not from imagination.
- **Keep holdouts:** some fixtures' expected edits must NOT appear anywhere in the skill, to test whether guidance generalizes rather than memorizes.
- **Run a control:** run fixtures without the skill loaded to measure whether the skill actually changed behavior. Retrieval (was the skill loaded?) and application (was the rule followed?) are different failures — test both.
- **Score rule correctness separately from similarity to the shipped result** — shipped code can contain a flaw the agent should improve instead of reproduce.
