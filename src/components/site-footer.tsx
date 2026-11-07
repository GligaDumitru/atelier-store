import Link from "next/link";
import { footerColumns } from "@/lib/home-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)] md:py-16">
        <div className="max-w-xs">
          <p
            className="font-display text-xl uppercase"
            style={{ letterSpacing: "0.32em" }}
          >
            Atelier
          </p>
          <p className="mt-4 text-xs text-muted">
            Considered leather goods and ready-to-wear, made to be kept.
          </p>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="heading-caps">{column.title}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-xs">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-nav">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>&copy; Atelier Store. All rights reserved.</p>
          <ul className="flex gap-6">
            <li>
              <Link href="/privacy" className="link-nav">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="link-nav">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
