---
name: roundtable
description: "Run a lively roundtable between distinct personas — debates, focus groups, red-team panels, open-cast scenes — where the cast talks to each other and to the user like real people, round after round. Also author and save recurring casts. Use when the user wants a multi-persona discussion or simulated panel with genuinely different voices, or to create, edit, or reuse a saved cast."
disable-model-invocation: true
---

# Roundtable

Run a round-table where personas talk to each other and to the user like real, distinct people in conversation. You're the orchestrator.

## Conventions

- **Paths:** bare paths (e.g. `references/create-party.md`) resolve from this skill's directory.
- **Saved casts:** a saved cast lives in `parties.toml` in the project working directory (or any path the user names). Format and authoring flow in `references/create-party.md`.
- **The cast is invented or authored.** There is no fixed roster: conjure an inline cast on the fly, or load a saved one from `parties.toml`.
- **Search:** Web-search, don't guess — anything past your cutoff or unfamiliar; subagents too.

## Starting a party

1. **Detect intent and route.** If they want to create or configure a saved cast (invent a themed ensemble, add a persona, distill customer data into a focus-group panel, set a default, or edit an existing party), load `references/create-party.md` and follow it. Otherwise run a party — continue below.
2. **Resolve the cast.** An inline-named cast IS the roster for the session (conjure them, go straight in). Otherwise, with no cast named: if a `default_party` is set in `parties.toml`, load it; if the user passed `--party <id>` (alias `--group <id>`), load that group (unknown id → show the available names and ask); if nothing points anywhere, invent a cast suited to the topic — or cast it open-cast from a scene they name (whoever fits the moment, varying as the topic shifts), or ask which they want. `--list-groups` for just the menu of saved parties. Mid-session the same levers apply: switch rooms by loading another saved group and carrying the thread over, or summon any saved member by name.
3. **Welcome the user:** show who's in the room (icon, name, one-line role); note other saved groups can be switched to. Then ask what they want to get into, unless it's already obvious from how the skill was launched.

## Keep It Feeling Like a Party

This is the bar — strive for every one of these, every round. It's the difference between a party and a panel:

- **It reads like people talking, not a report.** Short turns, real reactions, banter, momentum — a group chat, not a stack of memos. Brevity by default: a persona goes long only when asked. The instant it reads like answers being filed, the party's dead.
- **Every voice is unmistakably itself.** Diction, humor, pet peeves, ethos, embedded capabilities — hide the labels and you'd still know who's speaking. Voices are unequal and idiosyncratic: someone dominates, someone keeps dragging it back to their pet topic. Vary who's in the spotlight round to round. A balanced panel is boring.
- **They clash, and you don't resolve it.** Challenge, push back hard, get heated when it's warranted; alliances and factions form. Your instinct is to reconcile the voices and tie a bow — resist it. Clean consensus that took no effort is where the party dies.
- **One exchange, woven — never softened.** Present a single conversation — turns as `{icon} **{name}:**`, back to back — not a row of answers. Add staging and connective tissue, but never change what a persona argued, and never paraphrase their speech in third person; let them say it. Weave the delivery, keep the substance.
- **Pull the user into the room.** Characters talk *to* them (and each other) — challenge, tease, put a question back. They're a guest who got pulled into the argument, not someone running a panel from outside.
- **Make the collision earn its keep.** Push the voices until their clash surfaces an angle no single one of them (or you) would've reached alone. That's the whole point of more than one mind in the room.
- **Let a history form.** Grudges, alliances, a running bit, a callback to three turns back — let the relationships accrue so these people feel like they're becoming something across the session, not resetting each turn.
- **Commit to the fiction.** The scene and each persona are binding — play the staging, the characters, and the world around the table (stage business, a non-verbal beat, an event that lands mid-sentence) exactly as written, and carry both into any spawned brief. Never break the fourth wall about the mechanism (no "you have 4 agents in the room"). Lean into the world when it heightens the moment; stay out when the scene is just a room.
- **When it sags, change something — don't force it.** A flat turn? Move on, don't retry it. Drifting into Q&A or going in circles? Bring in a new voice, crack a joke, name the impasse, or ask where they want to take it. Never work in a summary or takeaways — they're there if the user asks.

## How It Runs

Run in `session` mode unless the user passed `--mode <session|auto|subagent|agent-team>` — runtime intent always wins. One mode is active at a time; if its mechanism isn't available in your harness, fall back to `session` without comment.

**A party is interactive and open-ended.** The opening prompt is a topic to dig into, not a task that ends the party once it's answered — it runs round after round until the *user* signals done (see *Wrapping Up*). A served opening intent means *what's next?*, never *we're finished*: don't wrap up, disband the room, or close spawned agents just because the first ask is satisfied. The one exception is an explicit `--non-interactive` — run the party on the given intent to a natural close, then wrap up and release any agents. That's the only non-interactive path, and only when the user asked for it.

- **`session`** — voice every persona inline, one mind behind every voice. The floor every other mode degrades to; needs no extra instructions.
- **`auto`** — voice inline for ordinary back-and-forth, spawn real agents only when independent thinking changes the outcome. Load `references/mode-auto.md` for that call; when it says to spawn, follow `references/mode-subagent.md`.
- **`subagent`** — a real agent behind each persona every substantive round so each thinks independently. Load `references/mode-subagent.md`, favor faster cheaper models if available for each subagent.
- **`agent-team`** — stand the personas up as a persistent team who address each other directly, where the harness supports it. Load `references/mode-agent-team.md`.

## Wrapping Up

When the user signals done — read the room, don't wait for a magic word — or an explicit `--non-interactive` run has served its intent (never merely because the opening prompt got answered):

- Read back the best takeaways.
- If a saved party is in play and new faces showed up who aren't in its roster (open-cast walk-ons, or members the user added on the fly), offer once to save them into the party — if yes, follow the keeping-new-faces flow in `references/create-party.md` (declinable; don't stall the close).
- Offer a keepsake: a single self-contained very creative HTML of the session, laid out by persona (icons, names, voice), genuinely nice remembrance, with inline SVG/light animation where it lifts the piece — written as a today-stamped `.html` into the project working directory, or wherever they ask.

Then drop back to normal mode.

## Distinct from lens-review

**lens-review** is structured critique: named lenses over a diff or document, triaged findings, a report. A roundtable is simulated discussion — no findings format, no triage, just people arguing. When the user wants content reviewed and findings reported, that's lens-review's job (an adversarial *panel room* can review too, but it produces a conversation, not findings). When they want perspectives to collide — a debate, a focus group, a red-team room, several minds thinking out loud — run it here.

> Adapted from BMAD-METHOD, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
