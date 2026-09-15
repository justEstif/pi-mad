# Story Breakdown

## Story Breakdown (optional)

Requires `SPEC.md` on disk — run the normal Operation first if it doesn't exist yet. Offer it at most once per run when the input reads as multiple independently shippable slices; a decline ends the offer for this run, not forever. Also run it on direct request ("break this into stories") whenever `SPEC.md` exists. When a spec update runs and `stories.yaml` exists, check the story descriptions against the updated spec; if any no longer matches, say so and offer to re-run Story Breakdown. The update itself never rewrites `stories.yaml`.

Either way, walk the capabilities and constraints with the user and propose a story per independently reviewable slice — this is a conversation, not a silent render. For each story, ask the user for `spec_checkpoint`, `done_checkpoint`, and any `invoke_dev_with` note rather than defaulting them silently; capturing that human judgment is what the fields are for. If the conversation surfaces load-bearing detail beyond dispatch notes (a constraint, a design decision), route it into SPEC.md or a companion — `invoke_dev_with` carries dispatch notes only (Spec Law rule 7 still applies).

This is the lightweight in-spec slice. When the user wants a full facilitated breakdown — epics organized by user value, Given/When/Then acceptance criteria per story — that is `story-slicer`, which can take this spec as its requirements input.

The output is `stories.yaml`, a sibling of `SPEC.md` inside the spec folder, discovered by that fixed name — same convention as `SPEC.md` and `.memlog.md`. Never list it in `companions:` and never point a frontmatter key at it: companions carry the what-to-build contract every consumer reads; `stories.yaml` is input for whichever tool dispatches the stories.

Field definitions, the validity rules, and a worked example live in `assets/stories-schema.md`. Before writing or re-writing the file, check every entry against those rules; fix violations rather than presenting a file that fails them. Record the check's verdict to `.memlog.md` as an `[event]` entry, the same discipline as Self-Validate.

Derive `stories.yaml` from `.memlog.md` exactly like any other spec-authored artifact: log each proposed story (`[decision]`) as the user agrees to it, then render. On a later run against the same spec folder, re-derive the same way, handling ids per the schema's update semantics.
