"use client";

import { Fragment } from "react";

/** Regex factory — must be per-call because /g has stateful lastIndex. */
function urlRegex() {
  return /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
}

export interface LinkSegment {
  type: "text" | "link";
  value: string;
}

/** Split raw text into text / link segments. Useful for nested renderers. */
export function linkifySegments(text: string): LinkSegment[] {
  const re = urlRegex();
  const segs: LinkSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ type: "text", value: text.slice(last, m.index) });
    segs.push({ type: "link", value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ type: "text", value: text.slice(last) });
  return segs;
}

function LinkChip({ href }: { href: string }) {
  const label = href.length > 80 ? href.slice(0, 60) + "…" + href.slice(-15) : href;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-[#0069AA] hover:underline break-all"
    >
      {label}
    </a>
  );
}

/** Inline renderer — emits spans/anchors, no block wrapper. Use inside existing <p> etc. */
export function AutoLinkedInline({ text }: { text: string }) {
  const segs = linkifySegments(text);
  return (
    <>
      {segs.map((s, i) =>
        s.type === "link" ? <LinkChip key={i} href={s.value} /> : <Fragment key={i}>{s.value}</Fragment>
      )}
    </>
  );
}

/**
 * Renders text with URLs automatically converted to clickable links.
 * Preserves whitespace (pre-wrap). Defaults to <p>; pass `as="span"` or `as="div"` to change.
 */
export default function AutoLinkedText({
  text,
  className,
  as = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  const Wrapper = as as any;
  return (
    <Wrapper className={className || "text-sm text-gray-700 whitespace-pre-wrap"}>
      <AutoLinkedInline text={text} />
    </Wrapper>
  );
}
