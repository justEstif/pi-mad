# Creating a Party

A guided authoring flow that turns an idea — a themed cast, a one-off persona, or a pile of raw profile data — into custom party members and groups, written to `parties.toml` in the project working directory (or wherever the user names). The output is a plain file; no other machinery involved.

## What you're producing

A `parties.toml` with:

- `[[party_members]]` — one per persona: `code`, `name`, `icon`, `title`, `persona`, optional `capabilities`, optional `model`.
- `[[party_groups]]` — when the personas form a named room: `id`, `name`, an optional freeform `scene`, and optional `members` (codes). Leave `members` off for an open-cast room whose `scene` names a pool the model casts from on the fly.
- `default_party` — set only if the user wants this group to load by default.

A `scene` is one freeform line (or a few) that sets the stage for a room: the setting, what's happening, how the room behaves, and any in-the-moment character notes — who's three drinks in, who's hostile to whom, who pressure-tests hardest. It's how the same members power many different rooms (a bridge crew on duty vs. the same crew off-duty in the lounge vs. a hostile buyer panel). Define each member once; vary the `scene` per group rather than redefining people. There's no fixed vocabulary — write it plainly and the model plays it.

The `persona` field is the whole game. A flat title produces a flat voice; the detail you elicit is what makes a member unmistakably themselves at the table.

For example:

```toml
[[party_members]]
code = "sec-hawk"
name = "Vex"
icon = "🔒"
title = "Security Engineer"
persona = "Threat-models everything. Hunts injection, broken authz, leaked secrets, SSRF, supply-chain risk. Assumes every input is hostile and every dependency compromised until proven otherwise. Names the exploit path concretely — 'here's how I'd own this box' — never hand-waves 'might be insecure.'"
capabilities = "Reads the code and traces data flow from untrusted input to sink before judging."

[[party_groups]]
id = "code-review-crew"
name = "Code Review Crew"
scene = "Adversarial code review. Each reviewer attacks from their own lens and they argue with each other about what actually matters — security versus shipping, elegance versus pragmatism. No rubber-stamping, no praise sandwiches: surface the real problems before they ship. Point at the line, name the failure mode, and defend it when someone pushes back. Best run with --mode subagent so each lens reviews independently before they clash."
members = ["sec-hawk", "adversary", "edge-hunter", "craftsman", "shipper"]
```

## Find the shape

Open by understanding what they're building. Common shapes — stay open, anything that yields distinct voices is fair game:

- **A cast** — a themed ensemble ("the Star Trek TOS bridge crew", "a board of famous investors"). Several members plus a group that holds them.
- **One-offs** — a persona or two added to the collective, no group needed.
- **Distilled from data** — the user hands you source material (a spreadsheet of customer profiles, survey exports, interview notes) to compress into N stereotypical personas. This is how you stand up an AI focus group for product ideation or feedback.
- **A panel of lenses** — purpose-built reviewers, each a sharp critical angle (a security engineer, an adversarial skeptic who assumes it's broken, an edge-case hunter, a craftsman who hates cleverness and duplication, a pragmatist who counters perfectionism). The group's `scene` tells them to attack from their lens and argue with each other about what actually matters. A great adversarial-review or red-team room.
- **Open-cast** — no fixed roster at all. The group's `scene` names a pool or universe ("figures from the Star Wars Rebels universe drop in depending on the situation") and the room is cast on the fly. Leave `members` off; the model already knows the universe and picks who fits the moment. Anchor a face or two by listing them if some should always be present.

Ask which they're after if it isn't obvious, then proceed.

**Persisting a cast already in play.** When you arrive here from a live session — the user spun up an ad-hoc cast inline and wants to keep it — the personas are already drafted and voiced. Don't re-interrogate: capture them as they've been playing, give the group an `id` and name, ask the default question, and go straight to the write.

## Editing an existing party

When the user wants to change a party that already exists (retune a member's persona, add someone to a group, swap the default), read the current `parties.toml` first so you change rather than clobber. Show the member or group being touched, capture only the delta with the user, and write back a sparse change — an edit replaces the `party_members`/`party_groups` entry whose `code`/`id` matches and appends the rest, so an edit is just the changed entry, never a full rewrite.

## Keeping new faces from a session

At the end of a party run with a saved cast, the room offers to keep the faces that showed up but aren't in its roster — characters cast from an open-cast scene, or members the user added on the fly. They're already drafted and voiced, so don't re-interrogate: capture each as they played (`code`, `name`, `icon`, a one-line `title`, and a `persona` drawn from how they came across), then add them as `party_members`. For a fixed-roster group, also list their codes in the group's `members` so they return as regulars. For an open-cast room, leave `members` empty — listing any member turns the room into a fixed roster and kills its on-the-fly casting; the saved personas now live in the collective, so the scene still names them and they can return without locking the room down.

## Distill from source data (when provided)

When the user points you at data — a file path, a pasted table, exported profiles — read it and compress it into the requested number of representative personas. Cluster by what actually differentiates behavior (goals, budget, pains, adoption posture), not surface demographics alone. Each cluster becomes one persona with a real name and face. Name your reasoning: tell the user which segments you found and which traits drove the split, so they can correct the cut before you flesh the personas out. If they didn't say how many, propose a number from the spread in the data and let them adjust.

For a focus-group panel, independent answers matter more than banter, so offer `--mode subagent` for the runs — otherwise one mind voices every customer and they bleed together.

## Flesh out each persona

Draft, don't interrogate. Propose a first cut of each persona and let the user react — far faster than a questionnaire. Push each one until it has a voice you could pick out blind. The dimensions that earn their place:

- **Identity** — name, a one-line title, an emoji that fits.
- **Voice & ethos** — how they talk, what they value, how they argue, their pet peeves.
- **Agenda** — what they're really after in any conversation; what they push for.
- **Quirks** — the specific, human details (a catchphrase, a bias, a blind spot).
- For focus-group personas, also **likes and dislikes**: what would make them champion or reject an idea, and their relationship to the product space.
- **Capabilities** (optional) — if this persona should research or read files when spawned, note it; it becomes soft guidance in their spawn prompt.

Keep pushing for specificity. "Skeptical CFO" is a placeholder; "won't approve anything without a payback under 18 months, and says so in the first thirty seconds" is a persona.

## Close it out

- Ask straight: **anything else about this party to specify** before you write it — a house dynamic, a missing voice, a member who should lead.
- Ask whether **this group should be the default party going forward**. Yes → set `default_party` to the group's id. One-offs with no group can't be a default; skip the ask.

## Write the file

**First, check for code collisions.** A custom member whose `code` matches an existing member in `parties.toml` silently *overrides* it. Before composing, read the current file and check each new member's `code` against what's there. On a collision, surface it ("`analyst` would override the existing Analyst — intended, or pick a different code?") and let the user confirm or rename. One check, not a gate.

Compose the entries and write them to `parties.toml` (create it if missing; merge into it if it exists — never clobber unrelated entries). Default to the project working directory; offer a different path when the cast isn't project-specific. Show the exact TOML, wait for an explicit yes, write, and confirm what landed.

After it lands, tell the user how to use it: `--party <id>` to summon the group, or that it's now the default if they set one.
