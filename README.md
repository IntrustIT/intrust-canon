# @intrust/canon

The shared UI/UX canon for every Intrust app. Components, hooks, helpers, design tokens, and the canon docs that govern them.

This is the **single source of truth** for how Intrust apps look, feel, and behave. Edit here, propagate to every consumer.

## What's in here

```
components/   React/TypeScript components — every canonical primitive.
              UserAvatar, SlideOverPanel, FilterToggle, SearchablePicker, etc.
lib/          Hooks + helpers. format-due-date, confirmDestructive,
              priority-colors, use-column-resize, etc.
styles/       Brand tokens + globals.css.
memory/       The canon docs themselves (.md). Synced into each consumer's
              docs/canon/ via the postinstall script.
scripts/      sync-docs.js — copies memory/*.md into consumer's docs/canon/.
```

## Consuming this in an Intrust app

In the consumer's `package.json`:

```json
{
  "dependencies": {
    "@intrust/canon": "github:intrust-it/intrust-canon#main"
  },
  "scripts": {
    "postinstall": "node node_modules/@intrust/canon/scripts/sync-docs.js"
  }
}
```

After `npm install`:

- Components import via `@intrust/canon/components/UserAvatar` (etc.)
- Hooks import via `@intrust/canon/lib/use-column-resize` (etc.)
- Brand tokens via `@intrust/canon/styles/tokens`
- The canon docs appear at `docs/canon/<file>.md` in the consumer (gitignored — always re-derived from the installed canon version)

Pin to a specific commit for stability: `"github:intrust-it/intrust-canon#a1b2c3d"`.

## How it relates to the three tiers of canon

This repo holds **tier 1** — universal product canon that every Intrust app should follow.

- **Tier 1 (here)** — universal UI/UX (this repo)
- **Tier 2** — project-specific canon (lives in each app's repo, e.g. `intrust-os/docs/project-canon/`)
- **Tier 3** — personal Claude Code methodology (lives in each developer's local Claude memory, never in any repo)

If you're tempted to add a domain-specific rule here (e.g. anything about scorecards, GGOB, meetings, EOS), it belongs in tier 2, not here.

## Workflow

1. Notice a pattern that's worth canon-izing in the consumer app.
2. Open a PR in this repo with the new component / helper / `.md` doc.
3. Merge.
4. In each consumer, `npm install` — the new canon flows in.

## Why no flat barrel

`index.js` is a stub on purpose. Consumers import from sub-paths so tree-shaking stays tight. Don't add a barrel that imports every component.
