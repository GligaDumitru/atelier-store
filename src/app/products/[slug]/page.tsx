import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToBag } from "@/components/add-to-bag";
import { ProductTile } from "@/components/product-tile";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  formatPrice,
  getAllProductSlugs,
  getProduct,
  getRelatedProducts,
  stockLabel,
  type Stock,
} from "@/lib/catalogue";

type Params = PageProps<"/products/[slug]">["params"];

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — Atelier Store`,
    description: product.description,
  };
}

function StockBadge({ stock }: { stock: Stock }) {
  const soldOut = stock.status === "out-of-stock";
  return (
    <p className="flex items-center gap-2 text-xs">
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${soldOut ? "bg-muted" : "bg-ink"}`}
      />
      <span className={soldOut ? "text-muted" : undefined}>
        {stockLabel(stock)}
      </span>
    </p>
  );
}

/** Shown while the URL-specific render streams in. Mirrors the real layout. */
function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="container pt-4 pb-12 lg:pb-16">
      <div className="h-4 w-56 bg-surface" />
      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div className="aspect-4/5 bg-surface" />
        <div className="flex flex-col gap-4">
          <div className="h-3 w-20 bg-surface" />
          <div className="h-10 w-3/4 bg-surface" />
          <div className="h-5 w-24 bg-surface" />
          <div className="h-16 w-full bg-surface" />
          <div className="h-control w-full bg-surface" />
        </div>
      </div>
    </div>
  );
}

async function ProductDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const { department } = product.category;
  const related = await getRelatedProducts(product.slug, department.href);

  return (
    <>
      <nav aria-label="Breadcrumb" className="container py-4">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <li>
            <Link href="/" className="link-nav">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={department.href} className="link-nav">
              {department.label}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="container grid items-start gap-8 pb-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pb-16">
        <div className="flex flex-col gap-px">
          {product.images.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority={index === 0}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="h-auto w-full bg-surface"
            />
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]">
          <div className="flex flex-col gap-3">
            <p className="eyebrow uppercase text-muted">
              {product.category.label}
            </p>
            <h1 className="display font-display">{product.name}</h1>
            <p className="text-lg">{formatPrice(product.price)}</p>
            <StockBadge stock={product.stock} />
          </div>

          <p className="max-w-prose text-sm text-muted">{product.description}</p>

          <AddToBag product={product} />

          <div className="rule-strong pt-4">
            <h2 className="heading-caps">Details</h2>
            <ul className="mt-3 flex flex-col gap-2 text-xs text-muted">
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>

          <div className="rule pt-4">
            <h2 className="heading-caps">Shipping &amp; returns</h2>
            <p className="mt-3 max-w-prose text-xs text-muted">
              Complimentary shipping on orders over $200. Return any unworn
              piece within 30 days, free of charge.
            </p>
          </div>
        </div>
      </div>

      <section className="section container" aria-labelledby="related-title">
        <h2 id="related-title" className="heading-caps">
          You may also like
        </h2>
        <ul className="product-grid mt-6">
          {related.map((item) => (
            <ProductTile key={item.slug} product={item} />
          ))}
        </ul>
      </section>
    </>
  );
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  // `params` is awaited inside the boundary so the shell stays URL-independent
  // and can be served instantly (Partial Prefetching is enabled).
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductDetail params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
