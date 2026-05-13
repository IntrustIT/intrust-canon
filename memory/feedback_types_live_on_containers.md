---
name: Types and classifications live on containers, not on atomic actions
description: Principle preventing classification creep. Categorical types (Stractical, etc.) belong on container entities that exist over time (issues, rocks, headlines). Atomic-action entities (todos, comments) inherit strategic weight through parent-link, not via re-classification.
type: feedback
---

# Types live on containers, not on atomic actions

## The principle

A categorical type — Stractical, Long-Term, etc. — is a claim about
*what an entity is over time*. It belongs on entities that exist as
**containers**: issues being navigated, rocks being executed, headlines
being celebrated. These are the things people *watch*, *discuss*,
*revisit*.

Atomic-action entities — todos, comments, file attachments — are
*single discrete actions*. They get done and they go away. Asking
"is this todo stractical?" doesn't have the same answer-shape as
asking "is this issue stractical?" because a todo doesn't have its
own strategic weight separate from what it's serving.

## How weight propagates

When a todo (or any atomic action) is in service of a container with
strategic weight, that weight propagates **downward through the
parent-link**, not by re-classifying the child. The contract-renewal
example:

- Stractical **issue**: "Contract renewal negotiation" — the
  container, classified.
- **Todos** in service of it: "call lawyer," "draft counter,"
  "schedule meeting." Not re-classified. They render with a blue
  parent-link breadcrumb (`Contract renewal negotiation ›`) above
  the title. The breadcrumb conveys the strategic context.

The child entity is the same shape it always is; what changes is
the visible relationship to its container.

## What this rules out

- Adding `isStractical: true` to the Todo model. Don't.
- Adding `type: "Stractical"` to Comment, FileAttachment, anything
  atomic. Don't.
- Asking on a create form "is this todo stractical?" The question
  has no meaning without the container.

## What this rules in

- **Parent-link inheritance signals.** When a child's parent carries
  a canonical type-glyph (⚡ for Stractical, etc.), the child's
  parent-link breadcrumb renders that glyph inline ahead of the
  parent title. See `reference_list_row_column_order.md` for the
  visual contract.
- **Group-by parent type.** When users want to cluster atomic
  actions by the type of their parent (all Stractical-anchored
  todos together, etc.), it's a Group-by option in the ⋮ view
  kebab — not a new column, not a new classification on the child.
- **Inheritance is the design pattern.** Strategic weight cascades
  via relationships. The taxonomy stays where it makes meaning.

## Cross-app applicability

This principle isn't OS-specific. In Playbook: a `Lesson` (content
item) is an atomic action inside a `Course` container; a `Course`
classification (Required, Optional) is a Course-level claim, not
a Lesson-level one. Same rule.

## See also

- `reference_list_row_column_order.md` — parent-link breadcrumb +
  type-glyph inheritance signal
- `reference_issue_type_spectrum.md` — Stractical lives on issues
- `reference_list_view_kebab.md` — Group-by parent-type lives here
