"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

/** Stops toolbar clicks from stealing focus (and the text selection) from the editor */
export const keepFocus = (e: React.MouseEvent) => e.preventDefault();

/** Shared look for every ribbon button */
const buttonBase =
    "flex shrink-0 items-center justify-center rounded-md text-brand-900 transition-colors hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-35";
const smallSize = "size-8";
const largeSize =
    "h-16 min-w-16 flex-col gap-1.5 px-2.5 text-caption font-medium whitespace-nowrap";
const activeLook = "bg-brand-100 ring-1 ring-brand-200 hover:bg-brand-100";

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
            className={`${buttonBase} ${large ? largeSize : smallSize} ${active ? activeLook : ""}`}
        >
            <Icon className={large ? "size-6" : "size-[18px]"} strokeWidth={1.75} />
            {large && <span className="leading-none">{label}</span>}
        </button>
    );
}

/** A labelled block of buttons, like "Font" or "Paragraph" in Office */
export function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-brand-200 flex shrink-0 flex-col border-r px-3 last:border-r-0">
            <div className="flex flex-1 items-center gap-1">{children}</div>
            <div className="text-caption text-brand-muted pt-1.5 text-center whitespace-nowrap select-none">
                {label}
            </div>
        </div>
    );
}

/** A thin vertical line between buttons inside one group */
export function RibbonDivider() {
    return <span aria-hidden className="bg-brand-200 mx-1 h-5 w-px shrink-0" />;
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

    const size = large ? largeSize : arrowOnly ? "h-8 w-5" : "h-8 gap-1 px-2";

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
                className={`${buttonBase} ${size} ${open ? "bg-brand-100" : ""}`}
            >
                {trigger}
                {/* Large triggers draw their own arrow next to the label (see DropdownLabel) */}
                {!large && <ChevronDown className="size-3.5 shrink-0 opacity-60" />}
            </button>
            {open && (
                <div className="border-brand-200 absolute top-full left-0 z-30 mt-1.5 rounded-lg border bg-white p-3 shadow-lg">
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    );
}

/** Icon + "Label ▾" for a large Dropdown trigger */
export function DropdownLabel({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <>
            <Icon className="size-6" strokeWidth={1.75} />
            <span className="flex items-center gap-0.5 leading-none">
                {label}
                <ChevronDown className="size-3 opacity-60" />
            </span>
        </>
    );
}

type ColorSplitButtonProps = {
    label: string;
    /** The letter or icon drawn above the colour bar */
    icon: React.ReactNode;
    /** Last used colour: shown in the bar and applied on click */
    color: string;
    onApply: () => void;
    /** The colour panel that opens from the arrow */
    children: (close: () => void) => React.ReactNode;
};

/**
 * Office-style split button: the left part applies the last colour,
 * the arrow opens the palette. The bar under the icon shows that colour,
 * with a thin outline so light colours (yellow, white) stay visible.
 */
export function ColorSplitButton({ label, icon, color, onApply, children }: ColorSplitButtonProps) {
    return (
        <div className="flex items-center">
            <button
                type="button"
                title={label}
                aria-label={label}
                onMouseDown={keepFocus}
                onClick={onApply}
                className={`${buttonBase} ${smallSize} flex-col gap-[3px]`}
            >
                {icon}
                <span
                    aria-hidden
                    className="h-1 w-5 rounded-full ring-1 ring-black/20"
                    style={{ backgroundColor: color }}
                />
            </button>
            <Dropdown title={`Choose ${label.toLowerCase()}`} arrowOnly trigger={null}>
                {children}
            </Dropdown>
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
        <div className="w-[236px]">
            <button
                type="button"
                onMouseDown={keepFocus}
                onClick={onReset}
                className="border-brand-200 text-brand-900 hover:bg-brand-50 text-small mb-3 flex h-8 w-full items-center rounded-md border px-3 text-left"
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
                        className="size-5 rounded ring-1 ring-black/15 transition-transform ring-inset hover:scale-125"
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>
    );
}

export const inputClass =
    "h-9 w-full rounded-md border border-brand-200 bg-white px-3 text-small text-brand-900 outline-none placeholder:text-brand-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100";