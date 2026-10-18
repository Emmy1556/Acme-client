import type { ReactNode } from "react";
import { clsx } from "clsx";

/**
 * Renders the small formatting set the description editor produces:
 *   **bold**   *italic*   ***both***   lines starting with "- " → bullet list
 * Everything is rendered as React text — no HTML is ever injected, so a description
 * can't smuggle scripts or markup into the page.
 */

// The character next to each marker must not be a space, so "5 * 3 * 2" stays plain text.
const INLINE = /\*\*\*(?!\s)([^*\n]+?)(?<!\s)\*\*\*|\*\*(?!\s)([^*\n]+?)(?<!\s)\*\*|\*(?!\s)([^*\n]+?)(?<!\s)\*/g;
const BULLET = /^\s*[-•]\s+(.*)$/;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={key++} className="font-semibold text-gray-800"><em>{m[1]}</em></strong>);
    else if (m[2]) out.push(<strong key={key++} className="font-semibold text-gray-800">{m[2]}</strong>);
    else out.push(<em key={key++}>{m[3]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block = { type: "p" | "ul"; lines: string[] };

function toBlocks(text: string) {
  const blocks: Block[] = [];
  let current = null as Block | null;
  for (const raw of text.split(/\r?\n/)) {
    const bullet = BULLET.exec(raw);
    const type = bullet ? "ul" : raw.trim() ? "p" : null;
    if (!type) {
      current = null; // blank line ends the paragraph / list
      continue;
    }
    if (current?.type !== type) {
      current = { type, lines: [] };
      blocks.push(current);
    }
    current.lines.push(bullet ? bullet[1]! : raw.trimEnd());
  }
  return blocks;
}

export function FormattedText({ text, className }: { text: string; className?: string }) {
  return (
    <div className={clsx("space-y-3 leading-relaxed text-gray-600", className)}>
      {toBlocks(text).map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-brand-600">
            {b.lines.map((l, j) => (
              <li key={j}>{inline(l)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {b.lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l)}
              </span>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
