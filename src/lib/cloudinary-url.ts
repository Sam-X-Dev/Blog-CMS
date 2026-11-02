// Faster images: Cloudinary can resize, compress and pick the best format (WebP/AVIF)
// on the fly when we add a few words to the link. Other image links are left as they are.
// Safe to use in both server and client components.

const UPLOAD_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/** Cloudinary link -> same image, at most `width` px wide, compressed, best format. */
export function cldUrl(url: string, width: number) {
  const match = UPLOAD_URL.exec(url);
  if (!match || match[2].startsWith("f_auto")) return url;
  return `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}`;
}

/** srcset so phones download a small copy and big screens a sharp one. undefined for other links. */
export function cldSrcSet(url: string, widths = [400, 800, 1200, 1600]) {
  if (!UPLOAD_URL.test(url)) return undefined;
  return widths.map((w) => `${cldUrl(url, w)} ${w}w`).join(", ");
}

/** For blog content HTML: optimise every Cloudinary <img> and load images lazily. */
export function optimizeContentImages(html: string, width = 1600) {
  return html.replace(/<img\b([^>]*)>/g, (_tag, attrs: string) => {
    let next = attrs.replace(/\bsrc="([^"]+)"/, (_m, src: string) => `src="${cldUrl(src, width)}"`);
    if (!/\bloading=/.test(next)) next += ' loading="lazy"';
    if (!/\bdecoding=/.test(next)) next += ' decoding="async"';
    return `<img${next}>`;
  });
}
