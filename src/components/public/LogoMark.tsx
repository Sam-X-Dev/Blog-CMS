/**
 * The BlogCMS mark ("Soft Pages"): two pages, draft and published, locked together.
 * Colours come from the theme, so it switches with dark mode by itself.
 */
export const MARK_PATHS = {
  back: "M18 4H27A5 5 0 0 1 32 9V27A5 5 0 0 1 27 32H9A5 5 0 0 1 4 27V18A14 14 0 0 1 18 4Z",
  front: "M21 16H39A5 5 0 0 1 44 21V30A14 14 0 0 1 30 44H21A5 5 0 0 1 16 39V21A5 5 0 0 1 21 16Z",
  overlap: "M21 16H32V27A5 5 0 0 1 27 32H16V21A5 5 0 0 1 21 16Z",
};

export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path d={MARK_PATHS.back} className="fill-brand-400" />
      <path d={MARK_PATHS.front} className="fill-brand-600" />
      <path d={MARK_PATHS.overlap} className="fill-brand-100" />
    </svg>
  );
}
