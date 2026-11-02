import { SiteFooter } from "@/components/public/SiteFooter";
import { SiteHeader } from "@/components/public/SiteHeader";

/** Header + footer for every reader-facing page in the (public) folder. Admin pages don't get it. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-brand-900 flex flex-1 flex-col bg-white">
      <a
        href="#main"
        className="bg-brand-600 sr-only z-50 rounded px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
