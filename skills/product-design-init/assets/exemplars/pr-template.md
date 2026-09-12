# Exemplar: {pr-name}

Template for recording a **shipped decision worth repeating** from a merged PR — or a shipped mistake worth avoiding. Copy this file to `pr-{name}.md`; keep the original template in place.

> SCAFFOLD guidance — an exemplar is accepted only when it cites real, verifiable evidence. Shipped code proves what exists, not what is correct; record known flaws too, so agents improve on them instead of reproducing them.

## How to use

1. After a PR ships a product/interface decision others will face again, copy this file to `pr-{short-name}.md` (e.g. `pr-destructive-settings-modal.md`).
2. Fill every field; link the PR, review thread, and rendered evidence (screenshots/URLs).
3. If the decision should generalize, propose it as a rule in the owning reference — an exemplar documents one case; only an accepted rule guides agents.

## Record

```markdown
# {Decision name}

PR: {link}
Status: worth repeating | mixed — improve on this | mistake to avoid
Surface: {surface}

Decision: {what shipped, in one sentence}
Rationale: {why, in terms of the user's job — not taste}
Evidence: {links: PR, review comments, screenshots, rendered URLs}
Exceptions: {where this does NOT apply}

Bad example: {the rejected alternative and why it lost}
Good example: {what to copy, with file/line pointers}

Assumptions: {what is believed but unverified}
Open decisions: {what this leaves unresolved — also add to ../references/coverage-gaps.md if it will recur}
```
