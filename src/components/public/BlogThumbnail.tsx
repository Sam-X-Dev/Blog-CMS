import { cldSrcSet, cldUrl } from "@/lib/cloudinary-url";

type BlogThumbnailProps = {
  src: string | null;
  title: string;
  className?: string;
  /** true for the first big image on the page so it loads right away */
  eager?: boolean;
  /** How wide the image shows on screen, so the browser downloads the right size */
  sizes?: string;
};

/**
 * Blog cover image, or a soft brand block with the first letter when there is none.
 * Cloudinary images are resized and compressed automatically (phones get a small copy).
 */
export function BlogThumbnail({
  src,
  title,
  className = "",
  eager = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: BlogThumbnailProps) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={`bg-brand-100 text-brand-400 flex items-center justify-center text-5xl font-bold ${className}`}
      >
        {title.charAt(0).toUpperCase()}
      </div>
    );
  }

  const srcSet = cldSrcSet(src);

  return (
    // Plain <img> so any image link works; Cloudinary links get resized copies via srcSet
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cldUrl(src, 1200)}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt=""
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={`bg-brand-100 object-cover ${className}`}
    />
  );
}
