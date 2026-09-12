# Patterns

Canonical interaction patterns for {{PRODUCT_NAME}}, organized the way reviewers already discuss them: forms, modals, navigation, tables, settings, and cross-surface behavior.

> SCAFFOLD — empty by design. Record only patterns the team has accepted, with evidence. Never invent standards; route unresolved areas to `coverage-gaps.md`.

Load when: implementing or reviewing a known interaction shape (a form, a modal, navigation, a data table, a settings page) on any of {{SURFACES_LIST}}.

Canonical owner: TODO(owner/team)

## What belongs here

<!-- Guidance: one section per pattern; a pattern is accepted only with evidence and an owner. Record known flaws in shipped examples too, so agents improve rather than reproduce them. -->

- Forms: labels, help text, validation timing, submit/disable behavior, progressive disclosure.
- Modals: when a modal is justified vs inline disclosure, focus management, dismiss semantics, nested-modal bans.
- Navigation: primary vs secondary navigation, breadcrumbs, active states, deep-link and return-path rules.
- Tables: column choice, sorting, empty/loading rows, row actions, bulk selection.
- Settings: defaults vs advanced, immediate-apply vs save, scope of a setting's effect.
- Per-surface sections: one per surface in {{SURFACES_LIST}}, linking to the patterns that surface repeats.

## Record format

```
## {Surface or pattern name}

Load when:
Canonical owner:

## rule/{stable-id}
Scope:
Rule:
Why:
Exceptions:
Source:

## Examples
Bad:
Good:
```

## Coverage gaps

- TODO(patterns agents keep deciding without a recorded standard)
