# pi-mad — forged idea

**Outcome: HARDENED** (idea-forge session)

## What pi-mad is
A personal curated skill shelf for pi — one resource type: **skills** (workflows are skills). Not a distributed product; not a framework. The repo is the home for curated skills so they don't live in dotfiles.

## Locked decisions
1. **No agents directory.** agent-builder writes to pi's own agents dir on demand; the repo ships none. "Skills + agents + workflows" collapsed to "skills."
2. **Uniform all-dark.** `disable-model-invocation: true` on every skill. Opt-in by naming the skill (`/skill:name` or asking the agent). No settings `skills` filter, no per-project hot-set, no allowlist.
3. **Discovery = `pi_mad_search` tool.** Agent can answer "does pi-mad have a skill for X?" (name + description, no loading, suggests without invoking). This is the necessary custom piece.
4. **Keep the `/pi-mad` browser** as a pleasant view over skills; it no longer manages a settings filter (that manager tool, `pi_mad_skills`, is killed).
5. **Extension enforces the dark flags** — `pi update` restores shipped SKILL.md, so the extension repairs `disable-model-invocation` at startup.
6. **Tags killed.** Search (browser + tool) matches description text instead. Remove `metadata.tags` from all skills.
7. **README shrunk**: identity + install + pointer to `skills/`. Catalog table deleted (drift surface).
8. **Knap (knap.md) = generator-skills only.** `npx knap render`/`batch` (+ `knap validate` pre-render gate) allowed inside agent-builder / workflow-builder / product-design-init. Never a dependency of skill loading or the extension; shelf SKILL.md files are never templated (agentskills.io conformance).
9. **Native first**: custom code only where pi has no native answer (search tool, flag enforcement, browser UX).

## Killed, with reasons
- **Default-off allowlist / migration layer** (`migrateOnce`, `legacyExcludes`, marker files) — double curation; commit-time curation suffices. Dead code now.
- **`pi_mad_skills` enable/disable manager + settings-filter writing** — no filter to manage under all-dark.
- **Per-project hot-set via settings filter** — pi can't override `disable-model-invocation` per project; restart tax; rejected in favor of uniform all-dark.
- **Tags as search index** — maintenance surface; descriptions search better.
- **Distribution framing** (catalog README, PR-inviting porting recipe front-and-center) — audience is me; README now says so.

## Surviving weak points
- `pi update` restores shipped flags → extension must re-enforce on startup.
- `disable-model-invocation` is a pi extension field (not agentskills.io spec); ignored silently elsewhere — acceptable.
- All-dark means no per-project memory of which skills are hot; opt-in is per session, by name.

## Build work handed off (→ build-loop)
- Flag all 30 skills `disable-model-invocation: true`; remove `metadata.tags`.
- Rewrite extension: `pi-mad.ts` (entry) + `catalog.ts` (frontmatter, search, flag enforcer) + `browser.ts`; delete migration layer and the `pi_mad_skills` tool; add `pi_mad_search`.
- Shrink README; drop default-off/allowlist framing.
- Remove all `@agent` notes from `extensions/pi-mad.ts`.

## Structure
```
pi-mad/
  extensions/   pi-mad.ts · catalog.ts · browser.ts
  skills/       30 skills, all-dark, tagless
  README.md (shrunk) · PORTING.md · AUDIT.md · LICENSE
```
