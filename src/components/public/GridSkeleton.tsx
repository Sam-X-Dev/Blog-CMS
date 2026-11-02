/** Placeholder cards shown while a list of blogs loads. */
export function GridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid animate-pulse gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="flex flex-col gap-3">
                    <div className="bg-brand-50 aspect-[16/10] rounded-xl" />
                    <div className="bg-brand-50 h-4 w-24 rounded" />
                    <div className="bg-brand-50 h-6 w-full rounded" />
                    <div className="bg-brand-50 h-4 w-2/3 rounded" />
                </div>
            ))}
        </div>
    );
}