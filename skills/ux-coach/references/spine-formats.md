# Spine Formats

## Appendix A: DESIGN.md spine

Per the [Google Labs design.md spec](https://github.com/google-labs-code/design.md). YAML frontmatter + markdown body in canonical order.

**Frontmatter tokens:**

| Key | Type | Notes |
|---|---|---|
| `name` | string | Required. Brand or system name. |
| `description` | string | One-line statement of what this system is. |
| `colors` | flat object | Kebab-case keys; hex values (`'#FBF9F4'`). |
| `typography` | nested object | Each value: any subset of `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`. |
| `rounded` | object | `sm`, `md`, `lg`, `xl`, `full` (conventionally `9999px`), `DEFAULT`. |
| `spacing` | object | Scale levels (`'1'`, `'2'`...) or named (`gutter`, `margin-mobile`). |
| `components` | object | Component-name to object of tokens mapped to values or `{path.to.token}` references. |

**Body sections** (omittable; order-locked when present):

1. **Brand & Style**: aesthetic posture in prose; the editorial voice.
2. **Colors**: per-color story (where used, what it is *not* used for).
3. **Typography**: roles, ramp, rules.
4. **Layout & Spacing**: scale narrative, grid, margins, gutters, breakpoints.
5. **Elevation & Depth**: shadow language, tonal layering.
6. **Shapes**: corner radii and the aesthetic logic.
7. **Components**: per-component visual specs (anatomy, color usage, sizing, state appearance).
8. **Do's and Don'ts**: hard visual rules.

**Cross-reference syntax:** `{colors.primary}`, `{typography.body.fontSize}`, `{rounded.md}`, `{spacing.4}`.

**Light/dark mode:** either separate kebab-case tokens (`surface-base` / `surface-base-dark`) or separate DESIGN.md sections per mode. Pick the form that reads cleaner.

**Platform conventions:** when inheriting from native platforms (iOS UIKit, Android Compose, Apple HIG), use a `note` field instead of literal values: `{ note: 'iOS Title 1 · Android Headline Small' }`.

**UI-system inheritance:** when inheriting from shadcn / MUI / Tailwind / internal design system, reference the system's tokens by name rather than restating values. DESIGN.md specifies only the deltas.

## Appendix B: EXPERIENCE.md spine

**Always present:**

- **Foundation**: form-factor, UI system (when present), reference to DESIGN.md for visual identity, spines-win-on-conflict statement.
- **Information Architecture**: surface map; Mermaid `mindmap` recommended.
- **Voice and Tone**: microcopy rules. Brand voice itself lives in DESIGN.md.Brand & Style.
- **Component Patterns**: behavioral specs. Visual specs live in DESIGN.md.Components. One row per component.
- **State Patterns**: empty, cold-load, focus, error, offline, permission-denied; whichever apply.
- **Interaction Primitives**: gestures, transitions, motion rules.
- **Accessibility Floor**: behavioral accessibility (focus order, keyboard nav, screen reader announcements). Visual contrast lives in DESIGN.md.
- **Key Flows**: named-protagonist journeys with numbered steps and a climax beat. Mermaid `journey` per flow.

**When triggered:**

- **Inspiration & Anti-patterns**: when the user has referenced products or named rejects.
- **Responsive & Platform**: when multi-surface or named breakpoints.

Invent sections for product-specific concerns surfaced in the concern scan (offline, internationalization, regulated language, motion-sensitive, notifications, content density). Earn their place.
