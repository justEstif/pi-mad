# Rules

Index of stable-ID rules across the product-design skill, with their enforcement status.

> SCAFFOLD — empty by design. Never invent rules here; this file indexes rules accepted in the other references. Unstandardized areas live in `coverage-gaps.md`.

Load when: checking whether a mechanically checkable rule exists, deciding where a new accepted rule belongs, or wiring a lint/CI check.

Canonical owner: TODO(owner/team)

## What belongs here

<!-- Guidance: one line per accepted rule, pointing at its detailed record. Keep IDs stable forever; deprecate instead of reusing. Update the Enforcement column when a rule becomes a lint/CI check (see tooling/evals/FIXTURES-README.md for the eval pattern). -->

| Rule ID | One-line rule | Detailed record | Enforcement |
| ------- | ------------- | --------------- | ----------- |
| TODO    | TODO          | TODO            | agent guidance \| lint \| eval |

## Choosing enforcement

- Code can identify the failure without rendering, without false positives, and with a concrete fix → propose a lint rule.
- Needs product or codebase context → keep as agent guidance in the owning reference.
- Establishes a new standard or product policy → human decision first, then record.
- Either way, add an example or eval that can catch regressions.
