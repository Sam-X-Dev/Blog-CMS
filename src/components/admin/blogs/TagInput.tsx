"use client";

import { useState } from "react";
import { X } from "lucide-react";

const MAX_TAGS = 10;

/** Type a tag and press Enter or comma. Backspace on an empty box removes the last tag. */
export function TagInput({
  value,
  onChange,
  suggestions,
  error,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  error?: string;
}) {
  const [text, setText] = useState("");

  function add(raw: string) {
    const name = raw.trim().replace(/^#/, "").slice(0, 40);
    if (!name) return;
    const exists = value.some((t) => t.toLowerCase() === name.toLowerCase());
    if (!exists && value.length < MAX_TAGS) onChange([...value, name]);
    setText("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`focus-within:ring-brand-400 flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 focus-within:ring-2 ${
          error ? "border-red-500" : "border-brand-400"
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-brand-100 text-brand-900 text-caption inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="hover:bg-brand-200 rounded-full p-0.5"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          list="tag-suggestions"
          value={text}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(",")) add(v.slice(0, -1));
            else setText(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => add(text)}
          disabled={value.length >= MAX_TAGS}
          placeholder={
            value.length >= MAX_TAGS
              ? "10 tags max"
              : value.length
                ? "Add another..."
                : "e.g. React, Next.js"
          }
          aria-label="Add a tag"
          className="text-brand-900 placeholder:text-brand-muted text-small min-w-28 flex-1 bg-transparent px-1 py-1 outline-none"
        />
        <datalist id="tag-suggestions">
          {suggestions
            .filter((s) => !value.some((t) => t.toLowerCase() === s.toLowerCase()))
            .map((s) => (
              <option key={s} value={s} />
            ))}
        </datalist>
      </div>
      {error ? (
        <p className="text-caption text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <p className="text-caption text-brand-muted">
          Press Enter or comma after each tag. Up to 10.
        </p>
      )}
    </div>
  );
}
