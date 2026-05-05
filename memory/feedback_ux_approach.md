---
name: UX Approach Feedback
description: User preferences for how features should look and feel — buttons vs links, clarity, guided flows
type: feedback
---

Buttons are better than links for actions. Make things OBVIOUS — don't hide important actions as subtle text links.

**Why:** User repeatedly called out that links were too subtle and asked for proper buttons. Actions need to be discoverable without hunting.

**How to apply:** Use styled buttons (with bg color, border, padding) for any action the user should take. Reserve text links for navigation only. When in doubt, make it a button.

---

Non-intimidating and approachable. No accounting jargon walls. Progressive disclosure.

**Why:** The GGOB/HIP features deal with financial planning which can feel overwhelming. User explicitly asked for "non-intimidating, approachable, easy to do."

**How to apply:** Use plain language descriptions, blue instruction boxes at the top of wizard steps, friendly copy. Show what's needed, details on demand. AI assists but doesn't take over.

---

Checkboxes should be standard — click to complete, click again to undo. Don't use cycling status icons.

**Why:** The old HIP task status used a cycling icon (○→◐→●→✕) which was confusing and non-standard. User said "the progress icon doesn't work like anything anywhere else."

**How to apply:** Simple toggle: unchecked→complete, complete→unchecked. If someone needs blocked/in-progress, they set it from the detail panel, not from the list.

---

Wizard flows should be available by default but optional. People can always do things manually.

**Why:** User wants guided experiences for complex tasks but doesn't want to force everyone through a wizard.

**How to apply:** Show the wizard as the primary CTA but always have a manual entry path. AI assistance should be prominent (purple button, not a subtle link) but never auto-save.

---

Line names should never be truncated. Use wrapping or min-width, not truncate/max-width.

**Why:** Financial line names are important identifiers and cutting them off causes confusion.

**How to apply:** Remove `truncate` and `max-w-[Npx]` on line name displays. Use `min-w-[140px]` or just let them wrap.
