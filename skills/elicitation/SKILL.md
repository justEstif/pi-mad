---
name: elicitation
description: 'Refinement checkpoint: offers a short menu of elicitation methods — Socratic questioning, first principles, pre-mortem, red team, and more — runs the chosen ones against the most recent output, and hands back the improved version. Use when the user asks for deeper critique of recent work or names a known elicitation method.'
---

# Elicitation

You are a shared refinement checkpoint: other skills invoke you at natural pauses to pressure the piece of work they just produced, and users call you directly on anything recent. The target is the most recent output in the conversation — a section, plan, draft, or decision — unless the caller or user points at something else. You offer a short menu of elicitation methods, run the chosen ones against the target, and hand back the improved version so the invoking flow resumes exactly where it paused. Work in the surrounding session's communication language.

## Conventions

- Bare paths (e.g. `assets/methods.csv`) resolve from this skill's directory. The method catalog ships at `assets/methods.csv` here.

## Serving the Catalog

`scripts/pick_methods.py` serves the method catalog (num, category, method_name, description, output_pattern) so it never enters context whole — the one exception is listing the full catalog, when the user asked for all of it. Invoke as:

```bash
python3 <this skill's directory>/scripts/pick_methods.py --file <this skill's directory>/assets/methods.csv <command>
```

- `categories` — category names + counts, the cheap map.
- `list --category <cat> [--category <cat>]` — the index for chosen categories; `--all` dumps the whole catalog, only when listing all.
- `show <name-or-num> [...]` — full rows by name or num.
- `random -n 5 --spread [--exclude <name>]...` — a category-diverse random draw.

**First menu:** run `categories`, pick the 2–4 categories that fit the target (risk before a launch, technical for code, collaboration when stakeholders compete, creative when the content is flat), `list` them, and hand-pick five methods that attack the target from different angles. **Reshuffle:** `random -n 5 --spread`, excluding everything already offered.

## The Menu

HALT and give the user a choice:

- The five offered methods, listed by name. The user may pick one or several.
- **Reshuffle** — replace the list with five new options.
- **List all** — show the full catalog with descriptions.
- **Proceed** — no further elicitation.

This menu is the interface other skills and their users rely on — keep its options and behavior stable.

- If the user picks methods: run them (several: in sequence), then offer the menu again.
- If the user chooses **Reshuffle**: reshuffle as above and offer the menu again.
- If the user chooses **List all**: show the full catalog (`list --all`) as a compact table; a pick by name or number runs like a method choice.
- If the user chooses **Proceed**: done. The current enhanced version is final for this content: hand it back to the invoking skill as the replacement for what it had, and signal completion so it continues. If anything shown was never accepted, confirm what should carry over before returning.
- Any other reply is direction: apply it to the target and offer the menu again.

## Running a Method

Use the method's description as its intent and its output_pattern as a flexible flow guide; scale depth to the target — a paragraph gets a light pass, an architecture decision gets the full treatment. Each application works on the current enhanced version, so refinements compound. Show what the method revealed and the changes it proposes, then HALT and give the user a choice:

- **Apply** — accept the proposed changes.
- **Reject** — drop the proposal entirely.
- Or give different direction.

Never change the work unless the user accepts the proposal. If they reject it, drop the proposal entirely. Any other reply is instruction to follow. When a method casts personas (round tables, panels, debates), invent named viewpoints suited to the content.

> Adapted from BMAD-METHOD, MIT © BMad Code, LLC. Not affiliated with or endorsed by BMad Code.
