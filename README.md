# pi-shelf

A personal, curated skill shelf for [pi](https://github.com/badlogic/pi-mono) — one repo, one resource type (**skills**; workflows are skills), all-dark by design. Most content derives from upstream methodology collections. See [product.md](product.md) for the full product brief; formerly named **pi-mad**.

## The design: all-dark

Every skill ships with `disable-model-invocation: true`. Nothing from the shelf ever auto-invokes or pollutes the system prompt — `/skills` still lists everything (that's how you trigger a skill), but a human names the skill to pull it. `pi update` restores shipped SKILL.md files, so the extension re-applies the flag at startup; the shelf defends its own darkness.

## Install

```bash
pi install git:github.com/justEstif/pi-shelf
```

Update: `pi update --extensions` (or `pi update --all`).

## Usage

- **Invoke a skill:** `/skill:name` (opt-in, per session, by name).
- **Browse & load:** `/shelf` — a command palette over the catalog: type to search (matches names and descriptions), ↑↓ to move, **enter loads the highlighted skill**, esc clears then closes.
- **Ask your agent:** the `pi_shelf_search` tool lets it answer "does the shelf have a skill for X?" from name + description only — it suggests, never loads.
- **Quiet suggestions:** when your message strongly matches shelf skills, the agent may offer them in one sentence ("want me to use the brainstorming-coach skill?") — or say nothing. It never loads anything unless you say yes.

## Catalog

[skills/](skills/) is the living catalog — each skill's name and description say what it's for. No tag taxonomy to maintain; search matches descriptions.

## License & attribution

MIT — see [LICENSE](LICENSE).
