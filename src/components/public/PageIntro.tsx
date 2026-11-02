/** Big page title with a short line under it. */
export function PageIntro({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-brand-900 text-display">{title}</h1>
            {subtitle && <p className="text-brand-muted text-body">{subtitle}</p>}
        </div>
    );
}