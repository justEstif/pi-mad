# Copy

Canonical reference for user-facing language in {{PRODUCT_NAME}}: product copy, accessible names, action labels, and error text.

> SCAFFOLD — empty by design. Record only team-accepted decisions, each with evidence. Never invent standards; route unresolved areas to `coverage-gaps.md`.

Load when: writing or editing any string a user can see or hear, including aria-labels and button text.

Canonical owner: TODO(owner/team)

Voice notes (from the team): {{VOICE_NOTES}}

## What belongs here

<!-- Guidance: fill each bullet only with accepted decisions backed by evidence; delete the guidance as sections fill. -->

- Voice and tone rules, grounded in {{VOICE_NOTES}} — tone by context (marketing vs errors vs empty states) is fair game; vague adjectives are not.
- Sentence mechanics: capitalization, punctuation, sentence case vs title case, contraction policy.
- Error-message shape: what each error must contain (object, cause, next step) in what order.
- Action-label rules: how buttons and links are phrased; which verbs are banned (e.g. bare "Confirm" on destructive actions — decide, don't assume).
- Accessible-name rules for icon buttons and controls.
- Localization notes and words that must never be translated.

Canonical nouns and verbs live in `glossary.md`; point to it rather than duplicating.

## Record format

Use one record per decision; only `accepted` records guide agents:

```
## rule/copy-{stable-id}
Status: proposed | accepted | rejected
Scope:
Rule:
Why:
Exceptions:
Source:
Bad:
Good:
```

## Coverage gaps

- TODO(areas where no copy standard exists yet)
