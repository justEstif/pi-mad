# Refresh and Deepen

Lifecycle intents on an existing run folder.

## Refresh

Read `research.md` and `.memlog.md` — never re-research from scratch. Build the refresh set mechanically: take the claims (`claim`, `class`, `pub_date`) from the ledger, map the pack's freshness bars to months per class, and compute each claim's re-check date (publication month plus its class's window) — the stale flags are the candidate set. Confirm it in one exchange, re-verify just those claims, and deliver a **delta report** (confirmed / changed / overturned, new sources) appended to `research.md` with the frontmatter `updated` bumped. Claims outside the set keep their status. An overturned load-bearing claim triggers an explicit warning naming the downstream artifacts that consumed it.

## Deepen

Drill into one dimension or add a new one without touching the rest: mini plan gate, acquire → verify for that slice only (or a drafted follow-up prompt when the user's tool is better placed), merge into `research.md`, update only the synthesis sections the new material affects — a deepening that changes no conclusion says so.
