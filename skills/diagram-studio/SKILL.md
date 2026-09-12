---
name: "diagram-studio"
description: "Design and produce diagrams — flowcharts, architecture, sequence, mind maps — as Excalidraw, through the connected Excalidraw MCP canvas or standalone .excalidraw files. Use when the user asks to create a diagram, draw a flowchart, visualize an architecture or process, turn a spec or spine into a visual, or asks for an Excalidraw file."
---

# Diagram Studio

Produce professional diagrams as Excalidraw through conversational design or autonomous generation. Act as a visual design consultant: help the user figure out what kind of diagram actually fits their need, then produce a polished, ready-to-open result. Excalidraw files are JSON with a well-defined element schema (rectangles, ellipses, diamonds, arrows, lines, text, frames).

## Two execution paths

Resolve the target before designing anything:

- **MCP path (primary)** — an Excalidraw MCP server is connected. Work on a live canvas and save when done.
- **File path (fallback)** — no MCP. Generate standalone `.excalidraw` files with the bundled scripts.

Never mix paths in one diagram.

## MCP path

Call `excalidraw_read_diagram_guide` **before** creating anything — it carries the color palette, sizing rules, layout patterns, and anti-patterns for professional results.

| Step | Tool | Notes |
|---|---|---|
| Build the diagram | `excalidraw_batch_create_elements` | Assign custom `id` to shapes; bind arrows with `startElementId`/`endElementId` so Excalidraw auto-routes them to shape edges |
| Standard flowchart/sequence with existing Mermaid | `excalidraw_create_from_mermaid` | Fastest path when the user already has Mermaid or the structure is conventional |
| Iterate | `excalidraw_update_element`, `excalidraw_delete_element`, `excalidraw_query_elements` | Query by type/filter/bbox to find element ids |
| Save | `excalidraw_export_scene` | Writes `.excalidraw` (or `.excalidraw.md` for Obsidian) |
| Share | `excalidraw_export_to_excalidraw_url` | Encrypted upload; returns a view link |

## File path (no MCP)

```bash
python3 scripts/generate_excalidraw.py <spec.json> -o diagram.excalidraw   # spec JSON -> auto-laid-out .excalidraw
python3 scripts/validate_excalidraw.py diagram.excalidraw                  # structural validation
```

The spec JSON schema and layout options are documented in `references/excalidraw-schema.md`.

## Modes

Resolve from the request, not the user's expertise:

1. **Guided (default)** — the user has a rough idea, not a spec. Load `references/guided-design.md` and facilitate: what is being communicated, to whom, which type fits, what the key nodes and flows are. Then generate.
2. **Autonomous** — the user supplies a complete description or spec. Load `references/diagram-generation.md` and generate directly; report the result and offer one adjustment pass.
3. **Quick** — "just make it". Infer everything with sensible defaults, generate, offer one adjustment pass.

Which diagram type fits which need: `references/diagram-types.md` (flowchart, architecture, sequence, mind map, state, ER, and when each is wrong). Generation mechanics and layout rules: `references/diagram-generation.md`. Element-level schema details: `references/excalidraw-schema.md`.

## Workflow

1. Resolve mode and execution path.
2. Select diagram type (load `references/diagram-types.md` if the fit isn't obvious).
3. Draft the structure as a node/edge list — content before coordinates.
4. Execute via the resolved path. On the MCP path, load the diagram guide first; on the file path, run the validator before presenting.
5. Present: saved file path or canvas state. Offer iteration — add, reroute, restyle, or restructure.

## NEVER

- **NEVER claim a diagram looks right without verifying the rendered result**
  **Instead:** query the canvas elements (`excalidraw_query_elements`) or validate the file (`validate_excalidraw.py`), and say what was checked.
  **Why:** coordinates and arrow bindings fail silently; unverified output is often overlapping soup.

- **NEVER hand-place every coordinate freehand**
  **Instead:** use arrow `startElementId`/`endElementId` binding on the MCP path, or the auto-layout generator on the file path.
  **Why:** manually computed positions drift and overlap; binding and auto-layout keep structure consistent while you iterate.

- **NEVER switch execution paths mid-diagram**
  **Instead:** pick MCP or file path at the start and finish there.
  **Why:** element ids and canvas state don't transfer; mixing loses work.

## Pairs with

- `architecture-spine` — turn a settled architecture spine into a diagram of the boundaries and invariants.
- `product-design-init` — wireframe and flow sketches during the design-standards work.

> Adapted from bmad-builder's bmad-excalidraw sample, MIT © BMad Code, LLC. Not affiliated with BMad Code.
