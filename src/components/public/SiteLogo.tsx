import Link from "next/link";
import { LogoMark } from "./LogoMark";

/** Header / footer logo: the mark + "Blog" bold and "CMS" light. */
export function SiteLogo() {
  return (
    <Link href="/" aria-label="BlogCMS home" className="text-heading flex items-center gap-2">
      <LogoMark className="size-7 shrink-0" />
      <span className="tracking-tight">
        <span className="text-brand-900 font-extrabold">Blog</span>
        <span className="text-brand-400 font-normal">CMS</span>
      </span>
    </Link>
  );
}
