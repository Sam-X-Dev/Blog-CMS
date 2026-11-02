import { Suspense } from "react";
import Form from "next/form";
import { Search } from "lucide-react";
import { NavLinkList, NavLinks } from "./NavLinks";
import { SiteLogo } from "./SiteLogo";

export function SiteHeader() {
    return (
        <header className="border-brand-200 sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6">
                <SiteLogo />

                {/* Suspense: on pages like /blog/[slug] the URL is only known when someone visits */}
                <Suspense fallback={<NavLinkList />}>
                    <NavLinks />
                </Suspense>

                {/* Search sends you to /blogs?q=your+words */}
                <Form
                    action="/blogs"
                    role="search"
                    className="border-brand-400 focus-within:ring-brand-400 flex h-10 w-full items-center gap-2 rounded-lg border bg-white px-3 focus-within:ring-2 sm:ml-auto sm:w-64"
                >
                    <Search className="text-brand-400 size-4 shrink-0" aria-hidden />
                    <label htmlFor="site-search" className="sr-only">
                        Search blogs
                    </label>
                    <input
                        id="site-search"
                        name="q"
                        type="search"
                        placeholder="Search blogs..."
                        className="text-brand-900 placeholder:text-brand-muted text-small w-full bg-transparent outline-none"
                    />
                </Form>
            </div>
        </header>
    );
}