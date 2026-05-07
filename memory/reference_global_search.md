---
name: Global search canon
description: Tier-1 spec for the ⌘K-triggered global search bar present in every Intrust app's top shell. Covers trigger + placement, visual shape (search input + Include-archive switch + Mode bar with Exact / By meaning toggle), dropdown anatomy (active results, archived divider, dimmed archived rows), result-row contract per entity, keyboard map, debounce timings, the API contract, scope rule (ignores team scope), and the By-meaning AI mode wired through AIContextInspector. "By meaning" is the unified label across global search AND list-page Find inputs — same concept, same name everywhere.
type: reference
---

# Global search canon

Every Intrust app has the same `⌘K` global search in its top shell. Same trigger, same visual shape, same archive switch, same By-meaning AI mode, same result-row contract. Cross-app users move between OS and Playbook and never relearn search.

> **Mode-name canon (v0.3.2):** "By meaning" is the **unified label** for AI-expanded semantic search across every Intrust surface. List-page Find inputs (Band 2 of [`reference_list_standards.md`](reference_list_standards.md)) and global ⌘K search both use the same label. The visual treatment (sparkle ✨ + brand-orange + `<AIContextInspector>` wrap) IS the AI signal — the label stays user-intent-describing ("By meaning"), not implementation-describing ("Fuzzy / AI / Smart"). Same concept, same name, every surface.

Reference implementations: [`components/GlobalSearch.tsx`](../components/GlobalSearch.tsx) and [`components/Highlight.tsx`](../components/Highlight.tsx) — copy into your app per the @intrust/canon guidance-only model.

---

## 1. Trigger + placement

- **Keybinding:** `⌘K` (Mac) / `Ctrl+K` (Win/Linux). Focuses input, selects existing text, opens dropdown.
- **Escape:** closes dropdown, blurs input.
- **Click-outside:** closes dropdown.
- **Placement:** lives in the app shell top bar, **right of the team scope picker, left of the user avatar**. Container: `relative w-full max-w-lg flex items-center gap-3`.
- **Min query length:** 2 characters. Below that, no API call, no results.

---

## 2. Visual shape — input + archive toggle

```tsx
<div ref={containerRef} className="relative w-full max-w-lg flex items-center gap-3">
  {/* Search input */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    <input
      ref={inputRef}
      type="text"
      placeholder="Search Intrust OS…"   {/* each app substitutes its own name */}
      className="w-full pl-9 pr-14 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-[#0069AA]/20
                 focus:border-[#0069AA] focus:bg-white transition-colors"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400
                     font-mono select-none pointer-events-none hidden sm:block">
      ⌘K
    </span>
  </div>

  {/* Include archive toggle — always visible, right of input */}
  <div className="flex-shrink-0">
    <FilterToggle
      checked={includeArchived}
      onChange={setIncludeArchived}
      label="Include archive"
      tone="blue"
    />
  </div>
</div>
```

**Search icon:** Lucide `Search` (per [`reference_icon_library.md`](reference_icon_library.md)). Inline SVGs are off-canon — sweep when retrofitting.

**Placeholder text:** `"Search Intrust OS…"` for OS, `"Search Playbook…"` for Playbook, `"Search Compass…"` for Compass, etc. Always app-named, lowercase ellipsis (Unicode `…`, not three dots). Don't generic-ify ("Search…").

**⌘K hint:** monospace, gray-400, `text-[11px]`. Hidden below `sm` breakpoint.

**Focus ring:** brand-blue at 20% opacity. Background lifts from `bg-gray-50` to `bg-white` on focus.

---

## 3. Include-archive switch

Always visible to the right of the input. Default OFF.

- **Component:** [`<FilterToggle/>`](reference_filter_toggle_convention.md) — the canonical iOS-switch shape for every binary in the app.
- **Class:** A (additive — "Include X" per [`reference_filter_toggle_convention.md`](reference_filter_toggle_convention.md)). Off = exclude archived; on = include them.
- **Label:** `"Include archive"`. Singular. Matches the verb form of every Class A toggle.
- **Tone:** `blue` (uses brand-blue `#0069AA` for the on state — search is an action surface, not AI).
- **Behavior:** flipping the switch while a query is present **re-runs search immediately** (no debounce) so the user sees results shift instantly. Turning OFF while archived results are showing collapses them; the active section stays.

When `includeArchived` is OFF, the API is called with `includeArchived=false` (server filters). When ON, archived rows return AND render dimmed under an "Archived" divider in the dropdown (see §5).

---

## 4. Dropdown — open / close rules

- **Opens on:** focus, ⌘K, query input.
- **Renders results when:** `open === true` AND `query.length >= 2`.
- **Closes on:** Escape, click-outside, navigating to a result.
- **Container:** `absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[200] overflow-hidden`. The `z-[200]` is load-bearing — search dropdown sits above modal scrims, slide-overs, and any other floating UI.

The dropdown has two horizontal regions: the **mode bar** (top, fixed) and the **results body** (scrollable, max `h-[480px]`).

---

## 5. Mode bar — Exact / By meaning

Lives at the top of the dropdown. Two toggles in a tiny pill group + the variants readout when By meaning is active.

```tsx
<div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-600">
  <span className="text-gray-500">Mode:</span>
  <div className="flex gap-1 bg-white border border-gray-200 rounded-md p-0.5">
    <button
      onClick={() => setSmartSearch(false)}
      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
        !smartSearch ? "bg-[#0069AA] text-white" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      Exact
    </button>
    <AIContextInspector
      feature="search"
      description="By meaning: Rickety expands your query with related terms and synonyms before searching (e.g. 'shipping' also matches 'delivery', 'freight'). Uses the same text index as Exact — just adds more candidate phrases. Temperature 0 for the expansion step."
    >
      <button
        onClick={() => setSmartSearch(true)}
        className={`px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1 ${
          smartSearch ? "bg-[#F58326] text-white" : "text-[#F58326] hover:bg-[#F58326]/10"
        }`}
      >
        <span>✨</span>
        By meaning
      </button>
    </AIContextInspector>
  </div>
  {smartSearch && variants.length > 1 && !loading && (
    <span className="text-[10px] text-gray-400 italic ml-auto truncate">
      Also matched: {variants.slice(1).join(", ")}
    </span>
  )}
</div>
```

Rules:
- **Exact mode = brand-blue** when active. By meaning = brand-orange when active. Action zone vs AI zone (per [`reference_color_palette.md`](reference_color_palette.md)).
- **By meaning button MUST wrap in [`<AIContextInspector feature="search">`](reference_ai_context_inspector.md)** — right-click reveals what context the synonym-expansion step uses + lets the user toggle sources.
- **Variants readout:** when By meaning is on AND the AI added synonyms beyond the literal query, render the extras inline ("Also matched: shipping, freight"). `text-[10px] text-gray-400 italic ml-auto`.
- **Label is locked at "By meaning."** Do not localize to "Fuzzy", "Smart", "AI Search", etc. The unified mode-name canon is established in §intro.
- **Switching modes re-runs search immediately** if a query is present.

---

## 6. Result body — active + archived

Two stacked sections: active results (top) + archived results (bottom, dimmed, separated by a divider).

```tsx
const active = results.filter((r) => !r.archived);
const archived = results.filter((r) => r.archived);

// Active block
{active.map((result, i) => <ResultRow result={result} isActive={i === activeIdx} ... />)}

// Archived divider (only when archived results exist)
<div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border-t border-gray-100">
  <div className="h-px flex-1 bg-gray-200" />
  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider flex-shrink-0">
    Archived
  </span>
  <div className="h-px flex-1 bg-gray-200" />
</div>

// Archived block — same row component, `dimmed` prop sets opacity-55
{archived.map((result, i) => (
  <ResultRow result={result} isActive={active.length + i === activeIdx} dimmed ... />
))}
```

**Loading:** `<div className="px-4 py-3 text-sm text-gray-400">{smartSearch ? "✨ Thinking…" : "Searching…"}</div>`. The internal state variable `smartSearch` is implementation; the user-facing label remains "By meaning."

**No results:** `<div className="px-4 py-3 text-sm text-gray-400">No results for "{query}"</div>`. Use Unicode curly quotes `&ldquo;` `&rdquo;`.

---

## 7. Result row contract

Each row is a button with: type badge (left) + title + match-in-X label + snippet + meta line (right of badge).

```tsx
interface SearchResult {
  type: SearchResultType;            // entity-type key, see app's TYPE map
  id: string;
  title: string;
  snippet: string;                   // ~one-line summary; rendered with line-clamp-3
  hitField: string | null;           // "title" | "description" | "tags" | etc. — null if title-hit
  href: string;                      // route to navigate to on click/Enter
  archived: boolean;                 // server-set; controls active vs archived bucket
  meta?: { owner?: string | null; team?: string | null; status?: string | null };
}
```

```tsx
<button
  className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-colors
              border-b border-gray-50 last:border-0
              ${isActive ? "bg-[#E8F4FC]" : "hover:bg-gray-50"}
              ${dimmed ? "opacity-55" : ""}`}
  onClick={onClick}
>
  {/* Type badge — entity-color-keyed, 10px uppercase */}
  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5
                    ${TYPE_COLORS[result.type]}`}>
    {TYPE_LABELS[result.type]}
  </span>

  <div className="flex-1 min-w-0">
    {/* Title row — title + "match in X" hint when hit was outside title */}
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium text-gray-800 truncate flex-1 min-w-0">
        <Highlight text={result.title} queries={queries} />
      </div>
      {result.hitField && result.hitField !== "title" && (
        <span className="text-[10px] text-gray-400 italic flex-shrink-0">
          match in {result.hitField}
        </span>
      )}
    </div>

    {/* Snippet — 3-line clamp */}
    {result.snippet && (
      <div className="text-xs text-gray-500 mt-0.5 line-clamp-3">
        <Highlight text={result.snippet} queries={queries} />
      </div>
    )}

    {/* Meta — owner · team */}
    {(result.meta?.owner || result.meta?.team) && (
      <div className="flex items-center gap-1.5 mt-0.5">
        {result.meta.owner && <span className="text-[10px] text-gray-400">{result.meta.owner}</span>}
        {result.meta.owner && result.meta.team && <span className="text-[10px] text-gray-300">·</span>}
        {result.meta.team && <span className="text-[10px] text-gray-400">{result.meta.team}</span>}
      </div>
    )}
  </div>
</button>
```

**Type badge colors** are app-specific. Each app maintains its own `TYPE_COLORS` map. Use the entity's stripe hue family at 100/700 (light bg, dark text). Examples from OS:

```ts
const TYPE_COLORS: Record<SearchResultType, string> = {
  rock:     "bg-blue-100 text-blue-700",
  issue:    "bg-red-100 text-red-700",
  todo:     "bg-green-100 text-green-700",
  headline: "bg-yellow-100 text-yellow-700",
  meeting:  "bg-blue-100 text-blue-700",
  metric:   "bg-gray-100 text-gray-600",
};
```

**Active row highlight:** `bg-[#E8F4FC]` (very light brand-blue tint). Hover state on inactive rows: `hover:bg-gray-50`.

**Highlight rendering:** ALWAYS use [`<Highlight/>`](../components/Highlight.tsx) — never roll your own. Yellow mark, case-insensitive, regex alternation. Used in both global search AND the in-meeting Find inputs so hits read consistently across the app.

---

## 8. Keyboard map

| Key | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Focus input, select existing text, open dropdown |
| `↑` / `↓` | Move active row up / down (clamped) |
| `Enter` | Navigate to active row's `href` (closes dropdown, clears query) |
| `Escape` | Close dropdown, blur input |

Active-row index resets to `-1` on every query change so arrow-down lands on the first result.

---

## 9. Debounce + re-run rules

- **Exact mode debounce:** 250ms after last keystroke.
- **By-meaning mode debounce:** 500ms (slower because the AI expansion step adds latency anyway).
- **Toggle re-run:** flipping `smartSearch` or `includeArchived` while a query is present re-runs immediately, no debounce.
- **Below 2 chars:** no API call. Results clear.

---

## 10. API contract

```
GET /api/search?q=<string>&smart=<true|false>&includeArchived=<true|false>
```

Auth: required. 401 if not signed in.

Query params:
- `q` (required) — search term, min 2 chars.
- `smart` (optional, default `false`) — when `true`, the server expands the query with synonyms via the AI client before running the text search.
- `includeArchived` (optional, default `true`) — when `false`, server filters out archived rows. **Match the client default** (`includeArchived = false` by default in the UI, so the URL always includes `includeArchived=false` until the user flips the switch).

Response:
```ts
{
  results: SearchResult[];   // see §7
  variants: string[];        // [originalQuery, ...synonyms]; length 1 when not in By-meaning mode
}
```

Server-side rules (codified):
- **Ignores team scope entirely.** Search always returns everything the user has access to. Team scope is a "what list do I default to" setting, not a global restriction. (Established Ricky 2026-04-25; see [`reference_list_standards.md`](reference_list_standards.md) "Global ⌘K search.")
- **`excludePrivate` when impersonating.** Server suppresses results from private surfaces when the calling user is impersonating another user.
- **Archived rows always come back when `includeArchived=true`** — never silently capped. Client splits active vs archived after fetch.

Reference: [`app/api/search/route.ts`](app/api/search/route.ts) (OS) for the endpoint shape; the server-side `searchOS()` lives in `lib/search.ts`.

---

## 11. Wiring checklist for a new app

1. Copy [`components/GlobalSearch.tsx`](../components/GlobalSearch.tsx) and [`components/Highlight.tsx`](../components/Highlight.tsx) from canon.
2. Mount `<GlobalSearch/>` in your app's top shell, right of the team picker, left of the user avatar.
3. Update the input `placeholder` to your app's name (`"Search Playbook…"`).
4. Define your app's `SearchResultType` union, `TYPE_LABELS`, and `TYPE_COLORS` maps. Pull colors from your entity stripe hues at the 100/700 step.
5. Implement `GET /api/search` matching §10. Server returns `{ results, variants }` per the contract.
6. Implement the server-side `search<App>()` function: text search across your entities, returns `SearchResult[]`. Honor `includeArchived` and `smart`.
7. For By-meaning mode: pipe `query` through your AI client at `feature="search"` to get synonym variants, then run the same text search across the union of variants. Set `variants` in the response to `[query, ...synonyms]`.
8. Confirm `<AIContextInspector feature="search">` is wired so users can see + toggle what context the synonym-expansion step uses (per [`reference_ai_context_inspector.md`](reference_ai_context_inspector.md)).
9. Verify keyboard map works (⌘K, arrows, Enter, Escape).
10. Verify the include-archive toggle re-runs search immediately when flipped while a query is present.

---

## Why this is canon

Search is the single most-used cross-app surface — every user reaches for ⌘K constantly. If OS and Playbook diverge on placement, keybinding, archive toggle, mode bar, result-row shape, or scope rule, every cross-app user pays a small tax every time. The visual shape is locked here so all apps inherit one mental model.

Pair with:
- [`reference_filter_toggle_convention.md`](reference_filter_toggle_convention.md) — the iOS-switch shape used by Include-archive.
- [`reference_ai_context_inspector.md`](reference_ai_context_inspector.md) — the inspector that wraps the By meaning button.
- [`reference_color_palette.md`](reference_color_palette.md) — brand-blue (Exact) vs brand-orange (Fuzzy) zone separation.
- [`reference_icon_library.md`](reference_icon_library.md) — Lucide `Search` for the input glyph; ⌘ Unicode for the keybind hint.
