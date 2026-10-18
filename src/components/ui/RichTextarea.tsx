import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { clsx } from "clsx";
import { Bold, Eye, EyeOff, Italic, List, Smile } from "lucide-react";
import { FormattedText } from "@/components/FormattedText";

/**
 * Textarea with a small formatting toolbar. Stores plain text with markers
 * (**bold**, *italic*, "- " bullets) that <FormattedText> renders.
 * Shortcuts: Ctrl/⌘+B, Ctrl/⌘+I. Enter inside a list continues it.
 */

const EMOJIS = [
  "🏠", "🏡", "🏢", "🏘️", "🏗️", "🔑", "📍", "📐",
  "🛏️", "🛁", "🚿", "🍳", "🛋️", "🚗", "🅿️", "🏊",
  "🌳", "🌴", "☀️", "🌙", "💡", "⚡", "💧", "❄️",
  "🔒", "🛡️", "📶", "🧹", "✨", "⭐", "✅", "💯",
  "💰", "🔥", "🎉", "👍", "📞", "💬", "👉", "📅",
];

type Selection = { start: number; end: number; text: string };
type Edit = { value: string; start: number; end: number };

/** How many "*" sit directly before (dir -1) or after (dir 1) a position, max 3. */
function stars(text: string, from: number, dir: 1 | -1) {
  let n = 0;
  while (n < 3 && text[dir === 1 ? from + n : from - 1 - n] === "*") n++;
  return n;
}

export function RichTextarea({
  value,
  onChange,
  rows = 8,
  maxLength,
  minLength,
  required,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e: MouseEvent) => {
      if (!emojiRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [emojiOpen]);

  /** Applies an edit to the current selection, then restores focus and selection. */
  const edit = (fn: (sel: Selection) => Edit) => {
    const el = ref.current;
    if (!el) return;
    const next = fn({ start: el.selectionStart, end: el.selectionEnd, text: el.value });
    if (maxLength && next.value.length > maxLength) return;
    onChange(next.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(next.start, next.end);
    });
  };

  const wrap = (marker: "**" | "*") =>
    edit(({ start, end, text }) => {
      const m = marker.length;
      const before = stars(text, start, -1);
      const after = stars(text, end, 1);
      // Pressing the button again removes the formatting.
      const wrapped = marker === "**" ? before >= 2 && after >= 2 : before % 2 === 1 && after % 2 === 1;
      if (wrapped) {
        return {
          value: text.slice(0, start - m) + text.slice(start, end) + text.slice(end + m),
          start: start - m,
          end: end - m,
        };
      }
      // Keep surrounding spaces outside the markers: "**word** " not "**word **".
      let s = start;
      let e = end;
      while (s < e && /\s/.test(text[s]!)) s++;
      while (e > s && /\s/.test(text[e - 1]!)) e--;
      const inner = text.slice(s, e) || (marker === "**" ? "bold text" : "italic text");
      return {
        value: text.slice(0, s) + marker + inner + marker + text.slice(e),
        start: s + m,
        end: s + m + inner.length,
      };
    });

  const toggleList = () =>
    edit(({ start, end, text }) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      let lineEnd = text.indexOf("\n", end);
      if (lineEnd === -1) lineEnd = text.length;
      const lines = text.slice(lineStart, lineEnd).split("\n");
      const allBullets = lines.every((l) => l.startsWith("- "));
      const next = lines
        .map((l) => (allBullets ? l.slice(2) : l.startsWith("- ") ? l : `- ${l}`))
        .join("\n");
      const value = text.slice(0, lineStart) + next + text.slice(lineEnd);
      return lines.length === 1
        ? { value, start: lineStart + next.length, end: lineStart + next.length }
        : { value, start: lineStart, end: lineStart + next.length };
    });

  const insert = (s: string) =>
    edit(({ start, end, text }) => ({
      value: text.slice(0, start) + s + text.slice(end),
      start: start + s.length,
      end: start + s.length,
    }));

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === "b" || k === "i") {
        e.preventDefault();
        wrap(k === "b" ? "**" : "*");
      }
      return;
    }
    if (e.key !== "Enter" || e.shiftKey) return;
    const el = e.currentTarget;
    if (el.selectionStart !== el.selectionEnd) return;
    const pos = el.selectionStart;
    const lineStart = el.value.lastIndexOf("\n", pos - 1) + 1;
    const line = el.value.slice(lineStart, pos);
    if (!line.startsWith("- ")) return;
    e.preventDefault();
    if (line === "- ") {
      // Enter on an empty bullet ends the list.
      edit(({ text }) => ({ value: text.slice(0, lineStart) + text.slice(pos), start: lineStart, end: lineStart }));
    } else {
      insert("\n- ");
    }
  };

  const tool =
    "inline-flex size-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <div>
      <div className="rounded-md border border-gray-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        <div className="flex items-center gap-0.5 border-b border-gray-200 px-1.5 py-1">
          <button type="button" className={tool} onClick={() => wrap("**")} title="Bold (Ctrl+B)" aria-label="Bold">
            <Bold className="size-4" />
          </button>
          <button type="button" className={tool} onClick={() => wrap("*")} title="Italic (Ctrl+I)" aria-label="Italic">
            <Italic className="size-4" />
          </button>
          <button type="button" className={tool} onClick={toggleList} title="Bullet list" aria-label="Bullet list">
            <List className="size-4" />
          </button>
          <div ref={emojiRef} className="relative">
            <button
              type="button"
              className={clsx(tool, emojiOpen && "bg-gray-100 text-gray-900")}
              onClick={() => setEmojiOpen((o) => !o)}
              title="Emoji"
              aria-label="Emoji"
              aria-expanded={emojiOpen}
            >
              <Smile className="size-4" />
            </button>
            {emojiOpen && (
              <div className="absolute top-full left-0 z-20 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <div className="grid grid-cols-8 gap-0.5">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="flex size-8 items-center justify-center rounded text-lg hover:bg-gray-100"
                      onClick={() => {
                        insert(emoji);
                        setEmojiOpen(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="mt-2 border-t border-gray-100 pt-2 text-xs text-gray-400">
                  More emoji: <kbd className="font-sans">Win</kbd> + <kbd className="font-sans">.</kbd> on Windows,{" "}
                  <kbd className="font-sans">Ctrl</kbd> + <kbd className="font-sans">⌘</kbd> +{" "}
                  <kbd className="font-sans">Space</kbd> on Mac
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            className={clsx(tool, "ml-auto w-auto gap-1.5 px-2 text-xs font-medium", preview && "bg-gray-100 text-gray-900")}
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
          >
            {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            Preview
          </button>
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={rows}
          maxLength={maxLength}
          minLength={minLength}
          required={required}
          placeholder={placeholder}
          className="block min-h-28 w-full resize-y rounded-b-md border-0 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div className="mt-1.5 flex justify-between gap-4 text-xs text-gray-400">
        <span>**bold** · *italic* · start a line with “- ” for a bullet</span>
        {maxLength && (
          <span className="shrink-0 tabular-nums">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {preview && (
        <div className="mt-3 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm">
          {value.trim() ? (
            <FormattedText text={value} />
          ) : (
            <p className="text-gray-400">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
