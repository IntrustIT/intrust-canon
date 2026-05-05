# @intrust/canon

The shared UI/UX canon for every Intrust app. **Guidance-only** — consumers install this as a `devDependency`; the canon **does not** ship runtime code.

## What this is

This repo holds the rules every Intrust app follows for UI/UX consistency:

- `memory/` — the **authoritative canon docs** (`.md`). These are the contract.
- `components/`, `lib/`, `styles/` — **reference implementations** of the patterns the docs describe. Useful as concrete examples; **not imported at runtime**.
- `scripts/sync-docs.js` — postinstall hook that copies `memory/*.md` into the consumer's `docs/canon/` so devs and Claude Code can read them right out of the project tree.

## What this is NOT

- Not a UI component library. Consumer apps **keep their own copies** of components in their own repos. They can match the canon exactly or diverge intentionally — drift is managed by Claude (or any human dev) reading the canon docs and applying them.
- Not a runtime dependency. Adding `@intrust/canon` to `dependencies` (instead of `devDependencies`) is a signal that someone misunderstood the architecture.

## Why guidance-only

For a small portfolio of apps maintained by a small team + AI, a runtime shared package adds coupling and migration cost without paying off in safety. Each app owns its components and stays in canon-shape because the canon docs travel into every project's `docs/canon/` and Claude reads them before any UI work.

If the portfolio grows past 3-4 apps with active independent development, revisit upgrading to a real `@intrust/ui` runtime package.

## Consuming this in an Intrust app

In the consumer's `package.json`:

```json
{
  "devDependencies": {
    "@intrust/canon": "github:IntrustIT/intrust-canon#main"
  },
  "scripts": {
    "postinstall": "node node_modules/@intrust/canon/scripts/sync-docs.js"
  }
}
```

Add `docs/canon/` to `.gitignore` — it's always derived from the installed canon version.

After `npm install`:

- `docs/canon/<file>.md` appears in the consumer
- The consumer's `CLAUDE.md` should have a `## Canon` section pointing Claude at `docs/canon/`

Pin to a specific commit when you don't want canon changes leaking into a sensitive consumer build: `"github:IntrustIT/intrust-canon#a1b2c3d"`.

## Three tiers of canon (full picture)

This repo holds **tier 1**:

- **Tier 1 (here)** — universal product canon. Applies to any Intrust app.
- **Tier 2** — project-specific canon. Lives inside the project's repo (e.g. `intrust-os/docs/project-canon/`). Domain rules unique to one app — methodology, schema choices, integrations.
- **Tier 3** — personal Claude Code methodology. Lives in each developer's local Claude memory at `~/.claude/projects/...`. Never goes into a repo.

Future devs joining a project see tiers 1 + 2; they don't see anyone's tier 3.

## Workflow

1. Spot a pattern in a consumer worth canon-izing.
2. PR to this repo: edit `memory/<doc>.md` and (optionally) update the reference impl in `components/` or `lib/`.
3. Merge.
4. In each consumer, `npm install` to refresh `docs/canon/`.
5. If a consumer's local component drifts from the new canon, follow up in that consumer's repo.

## Layout

```
intrust-canon/
├── memory/        canon docs (.md) — THE contract
├── components/    reference React/TS implementations of canon primitives
├── lib/           reference helpers + hooks (formatDueDate, confirmDestructive, etc.)
├── styles/
│   ├── tokens.ts  brand color exports (#0069AA blue, #F58326 orange, etc.)
│   └── globals.css
└── scripts/
    └── sync-docs.js   postinstall hook (consumers auto-run this)
```
