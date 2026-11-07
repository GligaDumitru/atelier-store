import Link from "next/link";
import { BagIcon, SearchIcon, UserIcon } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { navLinks } from "@/lib/home-content";

const iconLink =
  "inline-flex size-10 items-center justify-center transition-colors hover:text-muted";

export function SiteHeader() {
  return (
    <>
      <div className="flex h-promo items-center justify-center bg-ink px-gutter text-center text-xs text-paper">
        Complimentary shipping on orders over $200
      </div>
      <header className="sticky top-0 z-40 border-b bg-paper">
        <div className="container grid h-header grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <MobileNav links={navLinks} />
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-6 xl:gap-8">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-nav text-xs font-medium whitespace-nowrap uppercase"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link
            href="/"
            aria-label="Atelier Store, home"
            className="font-display text-xl uppercase md:text-2xl"
            style={{ letterSpacing: "0.32em", paddingLeft: "0.32em" }}
          >
            Atelier
          </Link>

          <div className="flex items-center justify-end">
            <Link href="/search" aria-label="Search" className={iconLink}>
              <SearchIcon />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className={`${iconLink} hidden sm:inline-flex`}
            >
              <UserIcon />
            </Link>
            <Link href="/cart" aria-label="Shopping bag" className={`${iconLink} -mr-2`}>
              <BagIcon />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
