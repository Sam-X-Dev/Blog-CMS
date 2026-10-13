"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

/** Stops toolbar clicks from stealing focus (and the text selection) from the editor */
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

type RibbonButtonProps = {
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    active?: boolean;
    disabled?: boolean;
    /** Big button with the label under the icon (like "Paste" in Word) */
    large?: boolean;
    onClick: () => void;
};

export function RibbonButton({
    icon: Icon,
    label,
    shortcut,
    active,
    disabled,
    large,
    onClick,
}: RibbonButtonProps) {
    return (
        <button
            type="button"
            title={shortcut ? `${label} (${shortcut})` : label}
            aria-label={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={keepFocus}
            onClick={onClick}
            className={`flex items-center justify-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 disabled:pointer-events-none disabled:opacity-35 dark:text-zinc-300 dark:hover:bg-zinc-700 ${large ? "h-[58px] min-w-14 flex-col gap-1 px-2 text-[11px]" : "size-7"
                } ${active ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800" : ""}`}
        >
            <Icon className={large ? "size-6" : "size-4"} strokeWidth={1.75} />
            {large && <span className="leading-none">{label}</span>}
        </button>
    );
}

/** A labelled block of buttons, like "Font" or "Paragraph" in Office */
export function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex shrink-0 flex-col justify-between border-r border-zinc-200 px-2 last:border-r-0 dark:border-zinc-700">
            <div className="flex flex-1 items-center">{children}</div>
            <div className="pt-1 text-center text-[10px] text-zinc-500 select-none">{label}</div>
        </div>
    );
}

type DropdownProps = {
    /** What the trigger shows (an icon, a colour bar…) */
    trigger: React.ReactNode;
    title: string;
    disabled?: boolean;
    /** Narrow arrow-only trigger, used next to a main button (Office "split button") */
    arrowOnly?: boolean;
    /** Big trigger with the label under the icon (Insert tab) */
    large?: boolean;
    children: (close: () => void) => React.ReactNode;
};

/** A small popup panel under a ribbon button. Closes on outside click or Escape. */
export function Dropdown({ trigger, title, disabled, arrowOnly, large, children }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                title={title}
                aria-label={title}
                aria-expanded={open}
                disabled={disabled}
                onMouseDown={keepFocus}
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center justify-center rounded text-zinc-700 hover:bg-zinc-200 disabled:pointer-events-none disabled:opacity-35 dark:text-zinc-300 dark:hover:bg-zinc-700 ${large
                        ? "h-[58px] min-w-14 flex-col gap-1 px-2 text-[11px]"
                        : `h-7 gap-0.5 ${arrowOnly ? "w-3.5" : "px-1"}`
                    } ${open ? "bg-zinc-200 dark:bg-zinc-700" : ""}`}
            >
                {trigger}
                <ChevronDown className="size-3 shrink-0 opacity-60" />
            </button>
            {open && (
                <div className="absolute top-full left-0 z-30 mt-1 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    );
}

type ColorGridProps = {
    colors: string[];
    resetLabel: string;
    onPick: (color: string) => void;
    onReset: () => void;
};

/** Office-style colour palette */
export function ColorGrid({ colors, resetLabel, onPick, onReset }: ColorGridProps) {
    return (
        <div className="w-[232px]">
            <button
                type="button"
                onMouseDown={keepFocus}
                onClick={onReset}
                className="mb-2 w-full rounded border border-zinc-200 px-2 py-1 text-left text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
                {resetLabel}
            </button>
            <div className="grid grid-cols-10 gap-1">
                {colors.map((c) => (
                    <button
                        key={c}
                        type="button"
                        title={c}
                        aria-label={c}
                        onMouseDown={keepFocus}
                        onClick={() => onPick(c)}
                        className="size-5 rounded-sm border border-zinc-300 transition-transform hover:scale-125 dark:border-zinc-600"
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>
    );
}

export const selectClass =
    "h-7 rounded border border-zinc-300 bg-white px-1.5 text-xs text-zinc-800 outline-none hover:border-zinc-400 focus:border-indigo-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200";

export const inputClass =
    "h-8 w-full rounded border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100";