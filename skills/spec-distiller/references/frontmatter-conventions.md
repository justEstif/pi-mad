# Frontmatter Conventions

- `companions:` array of `.md` files downstream MUST read alongside SPEC.md to have the full contract. Paths may point inside the spec folder (spec-authored companions like `glossary.md`) or outside it (adopted companions like `../planning-artifacts/ux-designs/ux-foo-bar-2026-05-23/DESIGN.md`). The split between spec-authored and adopted is implicit by path; downstream treats both the same.
- `sources:` array of paths to files that were **fully absorbed** into the SPEC, with no remaining downstream value (e.g., a PRD whose every load-bearing claim is now in the kernel). Listed for audit and for re-reading on update. Downstream does NOT read these. Files that downstream still needs to read belong in `companions:`, not here.
- **Do not list** the memlog, README files, organizational artifacts, or any operational record of how upstream flows produced their artifacts. Those are not source content; they are process metadata that downstream consumers don't need.
