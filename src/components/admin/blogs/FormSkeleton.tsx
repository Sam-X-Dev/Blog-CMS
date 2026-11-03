/** Loading placeholder for the create / edit blog form. */
export function FormSkeleton() {
  return (
    <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <div className="h-12 rounded-lg bg-white" />
        <div className="h-20 rounded-lg bg-white" />
        <div className="h-[600px] rounded-xl bg-white" />
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-40 rounded-xl bg-white" />
        <div className="h-28 rounded-xl bg-white" />
        <div className="h-28 rounded-xl bg-white" />
      </div>
    </div>
  );
}
