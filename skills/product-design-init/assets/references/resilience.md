# Resilience

Canonical reference for non-happy-path behavior in {{PRODUCT_NAME}}: every reachable state beyond populated success.

> SCAFFOLD — empty by design. Record only team-accepted decisions, each with evidence. Never invent standards; route unresolved areas to `coverage-gaps.md`.

Load when: implementing or reviewing loading, empty, sparse, validation, error, permission, disabled, optimistic, stale, destructive, or responsive states.

Canonical owner: TODO(owner/team)

## What belongs here

<!-- Guidance: fill each bullet only with accepted decisions backed by evidence; delete the guidance as sections fill. -->

- State-by-state rules for {{SURFACES_LIST}}: what loading, empty, and error states must show and do.
- Error-message contract: what the user learns, what they can do next, where retry lives (copy wording itself lives in `copy.md`).
- Destructive-action rules: proportionality, confirmation vs undo, what must be recoverable.
- Staleness and concurrency rules: what happens when server data changes under the user.
- Offline, timeout, and partial-failure behavior, if the product defines it.
- Permission states: what authorized-out and degraded-access surfaces must communicate.

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

- TODO(areas where no resilience standard exists yet)
