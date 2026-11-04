"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };

type Props = {
  options: SelectOption[];
  /** Controlled value. Leave out and use defaultValue for a plain form field. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Sends the value with the surrounding <form> (hidden input). */
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
  /** Classes for the closed box (height, padding, border colour...). */
  className?: string;
};

const MENU_GAP = 6;
const MENU_MAX = 288; // px, about 7 rows

/**
 * Dropdown in the website's colours. The browser's own <select> list can't be styled
 * (it shows the system blue), so this draws its own list. Works with mouse, touch and
 * keyboard (arrows, Home/End, Enter, Esc, and typing a letter jumps to it).
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled = false,
  invalid = false,
  "aria-label": ariaLabel,
  className = "",
}: Props) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value ?? "");
  const current = controlled ? value : inner;
  const selectedIndex = options.findIndex((o) => o.value === current);
  const selected = options[selectedIndex] ?? options[0];

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxH: number;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();

  const place = useCallback(() => {
    const b = buttonRef.current?.getBoundingClientRect();
    if (!b) return;
    const below = window.innerHeight - b.bottom - MENU_GAP - 8;
    const above = b.top - MENU_GAP - 8;
    const wanted = Math.min(MENU_MAX, options.length * 40 + 12);
    const up = below < wanted && above > below;
    setPos({
      left: b.left,
      width: b.width,
      top: up ? undefined : b.bottom + MENU_GAP,
      bottom: up ? window.innerHeight - b.top + MENU_GAP : undefined,
      maxH: Math.max(120, Math.min(MENU_MAX, up ? above : below)),
    });
  }, [options.length]);

  const openMenu = () => {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    place();
    setOpen(true);
  };

  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    // Update the hidden input right away, so a form submitted from onChange sends the new value
    if (!controlled) flushSync(() => setInner(option.value));
    close();
    if (option.value !== current) onChange?.(option.value);
  };

  // Keep the list next to the box while the page scrolls or resizes
  useLayoutEffect(() => {
    if (!open) return;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  // Click outside closes
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted row in view
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const jumpToLetter = (key: string) => {
    const now = Date.now();
    typed.current.text = now - typed.current.at > 600 ? key : typed.current.text + key;
    typed.current.at = now;
    const text = typed.current.text.toLowerCase();
    const start = open ? active : selectedIndex;
    const order = [...options.keys()].map((i) => (i + start + 1) % options.length);
    const hit = order.find((i) => options[i].label.toLowerCase().startsWith(text));
    if (hit === undefined) return;
    if (open) setActive(hit);
    else choose(hit);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault();
        if (!open) return openMenu();
        setActive((a) => (e.key === "ArrowDown" ? Math.min(last, a + 1) : Math.max(0, a - 1)));
        return;
      case "Home":
      case "End":
        if (!open) return;
        e.preventDefault();
        setActive(e.key === "Home" ? 0 : last);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else openMenu();
        return;
      case "Escape":
        if (open) {
          e.preventDefault();
          close();
        }
        return;
      case "Tab":
        if (open) close(false);
        return;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) jumpToLetter(e.key);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={`text-brand-900 ${/\btext-(caption|small|body)\b/.test(className) ? "" : "text-small"} flex w-full items-center justify-between gap-2 rounded-lg border bg-white text-left transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          invalid
            ? "border-red-500 focus-visible:ring-red-200"
            : "border-brand-400 focus-visible:ring-brand-400/40"
        } ${open ? "ring-brand-400/40 ring-2" : ""} ${className}`}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          aria-hidden
          className={`text-brand-400 size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {name && <input type="hidden" name={name} value={current} />}

      {open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top,
              bottom: pos.bottom,
              minWidth: pos.width,
              maxHeight: pos.maxH,
            }}
            className="border-brand-200 z-[60] overflow-y-auto overscroll-contain rounded-xl border bg-white p-1.5 shadow-lg shadow-black/10"
          >
            {options.map((o, i) => {
              const isSelected = o.value === current;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`text-small flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 pl-2 whitespace-nowrap select-none ${
                    i === active ? "bg-brand-100/70" : ""
                  } ${isSelected ? "text-brand-600 font-semibold" : "text-brand-900"}`}
                >
                  <Check
                    aria-hidden
                    className={`size-4 shrink-0 ${isSelected ? "" : "invisible"}`}
                  />
                  {o.label}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </>
  );
}
