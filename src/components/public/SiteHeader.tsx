import { Suspense } from "react";
import { HeaderSearch, HeaderSearchShell } from "./HeaderSearch";
import { MenuButtonPlaceholder, MobileMenu } from "./MobileMenu";
import { NavLinkList, NavLinks } from "./NavLinks";
import { SiteLogo } from "./SiteLogo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

/**
 * From 768px up: logo, links, search, dark mode button, log in / account menu.
 * Below 768px: logo, dark mode button, account button and a hamburger that opens the links + search.
 */
export function SiteHeader() {
  return (
    <header className="border-brand-200 sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-x-6 px-4 py-3 sm:px-6 lg:gap-x-8">
        <SiteLogo />

        {/* Suspense: on pages like /blog/[slug] the URL is only known when someone visits */}
        <div className="hidden md:block">
          <Suspense fallback={<NavLinkList />}>
            <NavLinks />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Suspense
            fallback={
              <HeaderSearchShell id="site-search" className="hidden md:flex md:w-48 lg:w-64" />
            }
          >
            <HeaderSearch id="site-search" className="hidden md:flex md:w-48 lg:w-64" />
          </Suspense>
          <ThemeToggle />
          {/* Suspense: the menu reads the current URL (for "back here after login") */}
          <Suspense fallback={<div className="size-10 shrink-0" aria-hidden />}>
            <UserMenu />
          </Suspense>
          <Suspense fallback={<MenuButtonPlaceholder />}>
            <MobileMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
