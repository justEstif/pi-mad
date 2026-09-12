# Interface Quality

Canonical reference for hierarchy, layout, component choice, and interaction-quality decisions in {{PRODUCT_NAME}}.

> SCAFFOLD — empty by design. Record only team-accepted decisions, each with evidence. Never invent standards; route unresolved areas to `coverage-gaps.md`.

Load when: building or reviewing pages and components; choosing between components; judging hierarchy, spacing, alignment, or responsive behavior.

Canonical owner: TODO(owner/team)

## What belongs here

<!-- Guidance: fill each bullet only with accepted decisions backed by evidence; delete the guidance as sections fill. -->

- Component-choice standards: when to use which shared component (and what to use when none fits), referencing the design system at {{STANDARDS_HOME}}.
- Hierarchy rules: how primary vs secondary actions, headings, and content density are decided.
- Spacing/alignment/grid rules the team actually enforces, with the tokens or utilities to use.
- Responsive breakpoints and behavior decisions per {{SURFACES_LIST}}.
- Motion/transition rules, if any — including "no decorative motion" decisions.
- Known-accepted deviations from the design system, so agents don't "fix" them back.

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

- TODO(areas where no interface-quality standard exists yet)
