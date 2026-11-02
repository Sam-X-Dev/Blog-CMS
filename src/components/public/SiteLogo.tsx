import Link from "next/link";

export function SiteLogo() {
  return (
    <Link href="/" className="text-brand-900 text-heading font-bold">
      Blog<span className="text-brand-400">CMS</span>
    </Link>
  );
}