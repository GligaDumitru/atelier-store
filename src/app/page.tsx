import Image from "next/image";
import Link from "next/link";
import { ProductTile } from "@/components/product-tile";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProductsBySlugs } from "@/lib/catalogue";
import {
  bestsellerSlugs,
  campaign,
  collections,
  edit,
  hero,
  newArrivalSlugs,
  services,
} from "@/lib/home-content";

export default async function Home() {
  const [newArrivals, bestsellers] = await Promise.all([
    getProductsBySlugs(newArrivalSlugs),
    getProductsBySlugs(bestsellerSlugs),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="hero" aria-labelledby="hero-title">
          <Image
            src={hero.image}
            alt={hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="hero__content">
            <p className="eyebrow uppercase">{hero.eyebrow}</p>
            <h1 id="hero-title" className="display font-display">
              {hero.title}
            </h1>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Link href="/women" className="btn btn-inverse">
                Shop women
              </Link>
              <Link href="/men" className="btn btn-outline-inverse">
                Shop men
              </Link>
            </div>
          </div>
        </section>

        <section className="section container" aria-labelledby="collections-title">
          <h2 id="collections-title" className="heading-caps">
            Featured collections
          </h2>
          <ul className="mt-6 grid gap-px bg-line md:grid-cols-3">
            {collections.map((collection) => (
              <li key={collection.href} className="bg-paper">
                <Link href={collection.href} className="group block">
                  <div className="relative aspect-4/5 overflow-hidden bg-surface">
                    <Image
                      src={collection.image}
                      alt={collection.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-1 py-4">
                    <span className="eyebrow uppercase text-muted">
                      {collection.eyebrow}
                    </span>
                    <span className="text-lg font-light group-hover:underline">
                      {collection.title}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="section container" aria-labelledby="new-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="new-title" className="heading-caps">
              New arrivals
            </h2>
            <Link href="/new" className="link text-xs">
              View all
            </Link>
          </div>
          <ul className="product-grid mt-6">
            {newArrivals.map((product) => (
              <ProductTile key={product.slug} product={product} />
            ))}
          </ul>
        </section>

        <section className="bg-surface" aria-labelledby="edit-title">
          <div className="container grid items-stretch md:grid-cols-2">
            <div className="relative aspect-4/5 md:aspect-auto md:min-h-[32rem]">
              <Image
                src={edit.image}
                alt={edit.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col items-start justify-center gap-4 py-12 md:py-16 md:pl-12 lg:pl-20">
              <p className="eyebrow uppercase text-muted">{edit.eyebrow}</p>
              <h2 id="edit-title" className="display font-display">
                {edit.title}
              </h2>
              <p className="max-w-md text-sm text-muted">{edit.body}</p>
              <Link href={edit.href} className="btn btn-secondary mt-2">
                {edit.cta}
              </Link>
            </div>
          </div>
        </section>

        <section className="section container" aria-labelledby="bestsellers-title">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="bestsellers-title" className="heading-caps">
              Bestsellers
            </h2>
            <Link href="/accessories" className="link text-xs">
              View all
            </Link>
          </div>
          <ul className="product-grid mt-6">
            {bestsellers.map((product) => (
              <ProductTile key={product.slug} product={product} />
            ))}
          </ul>
        </section>

        <section
          className="relative min-h-[70svh] overflow-hidden bg-ink on-dark"
          aria-labelledby="campaign-title"
        >
          <Image
            src={campaign.image}
            alt={campaign.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-scrim" />
          <div className="relative container flex min-h-[70svh] flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="eyebrow uppercase">{campaign.eyebrow}</p>
            <h2 id="campaign-title" className="display font-display">
              {campaign.title}
            </h2>
            <Link href={campaign.href} className="btn btn-inverse mt-2">
              {campaign.cta}
            </Link>
          </div>
        </section>

        <section className="section container" aria-labelledby="services-title">
          <h2 id="services-title" className="sr-only">
            Client services
          </h2>
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <li key={service.title} className="rule-strong pt-4">
                <h3 className="heading-caps">{service.title}</h3>
                <p className="mt-2 text-xs text-muted">{service.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
