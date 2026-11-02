/** Grey shapes shown for a moment while the homepage loads blogs. */
export function HomeSkeleton() {
    return (
        <div className="flex animate-pulse flex-col gap-14" aria-label="Loading blogs">
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-10">
                <div className="bg-brand-50 aspect-[16/10] rounded-2xl" />
                <div className="flex flex-col gap-4">
                    <div className="bg-brand-50 h-6 w-40 rounded-full" />
                    <div className="bg-brand-50 h-10 w-full rounded" />
                    <div className="bg-brand-50 h-10 w-2/3 rounded" />
                    <div className="bg-brand-50 h-5 w-full rounded" />
                    <div className="bg-brand-50 h-11 w-32 rounded-lg" />
                </div>
            </div>

            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="bg-brand-50 aspect-[16/10] rounded-xl" />
                        <div className="bg-brand-50 h-4 w-24 rounded" />
                        <div className="bg-brand-50 h-6 w-full rounded" />
                        <div className="bg-brand-50 h-4 w-2/3 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}