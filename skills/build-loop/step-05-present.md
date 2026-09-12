# Step 5: Present

## RULES

- NEVER auto-push.

## INSTRUCTIONS

### Mark Spec Done

Change `{spec_file}` status to `done` in the frontmatter.

### Commit and Complete

If version control is available and the tree is dirty, create a local commit with a conventional message derived from the spec title.

If the `open_spec` default in `config.toml` is set, follow it.

### Display Summary

Display a very short completion summary — one or two sentences — including:

- What changed.
- The verification and review result, including whether anything was deferred.
- The commit hash, if one was created.

Do not list changed files, repeat details from the spec, or narrate the process unless the user asks.

Offer applicable next actions in one short line: when version control and a remote are available, create a pull request (and push first if needed); use `change-walkthrough` to review the change with fresh eyes; or make another change.

Workflow complete.

## On Complete

If the `on_complete` default in `config.toml` is set, follow it as the final terminal instruction before exiting; otherwise exit normally.
