# Product Judgment

Canonical reference for **material product decisions** in {{PRODUCT_NAME}}: changes to the user's task, defaults, scope, consequences, navigation, or reachable states.

> SCAFFOLD — empty by design. Record only team-accepted decisions, each with evidence. Never invent standards; route unresolved areas to `coverage-gaps.md`.

Load when: the change alters what the system does on the user's behalf, what is default vs opt-in, what scope or consequence an action has, or which workflow states exist.

Canonical owner: TODO(owner/team)

## What belongs here

<!-- Guidance: fill each bullet only with accepted decisions backed by evidence; delete the guidance as sections fill. -->

- What counts as a "material decision" in this product, with examples from real reviews.
- Default choices the product makes on the user's behalf — and the reasoning and exceptions for each.
- Product workflow states (trial, upgrade, suspension, deletion, …) with entry and exit rules.
- Consequence-communication rules: when the interface must say what an action will do before it happens.
- Decisions deliberately *not* taken, and why, so agents stop re-proposing them.

## Record format

Use one record per decision; only `accepted` records guide agents:

```
## rule/{stable-id}
Status: proposed | accepted | rejected
Scope:
Decision:
Why:
Evidence:
Exceptions:
Bad example:
Good example:
Open decisions:
```

## Coverage gaps

- TODO(areas where no product standard exists yet)
