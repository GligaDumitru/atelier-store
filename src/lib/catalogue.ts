// Product catalogue, backed by Postgres via Drizzle.
//
// The types below are the contract the UI renders against; the DB row shapes
// are mapped onto them in `toProduct` so pages and components stay unaware of
// the schema. Every exported query is cached with `use cache` because
// `cacheComponents` is on — an uncached await here would make the whole
// subtree dynamic on every request.

import { eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export type Stock = {
  status: StockStatus;
  /** Units left. Only meaningful for "low-stock". */
  remaining?: number;
};

export type Department = { label: string; href: string };

export type Category = {
  /** Fine-grained label, e.g. "Bags". */
  label: string;
  /** Top-level department the category hangs off, used for breadcrumbs. */
  department: Department;
};

export type ProductImage = {
  src: string;
  alt: string;
  /** Intrinsic pixel size, so pages can reserve the right space. */
  width: number;
  height: number;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: Category;
  /** First image is the listing thumbnail; the rest are extra angles. */
  images: ProductImage[];
  description: string;
  details: string[];
  sizes?: string[];
  tag?: string;
  stock: Stock;
};

/** At or below this many units a product reads as low stock. */
const LOW_STOCK_AT = 5;

export const toStock = (quantity: number): Stock => {
  if (quantity <= 0) return { status: "out-of-stock" };
  if (quantity <= LOW_STOCK_AT)
    return { status: "low-stock", remaining: quantity };
  return { status: "in-stock" };
};

type CategoryRow = {
  slug: string;
  name: string;
  parent: { slug: string; name: string } | null;
};

type ProductRow = {
  slug: string;
  name: string;
  priceCents: number;
  description: string;
  details: string[];
  sizes: string[] | null;
  tag: string | null;
  stockQuantity: number;
  category: CategoryRow;
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
    position: number;
  }[];
};

function toProduct(row: ProductRow): Product {
  // A leaf category always has a department above it; fall back to the
  // category itself so a mis-seeded tree degrades instead of crashing.
  const department = row.category.parent ?? row.category;

  return {
    slug: row.slug,
    name: row.name,
    price: row.priceCents / 100,
    category: {
      label: row.category.name,
      department: { label: department.name, href: `/${department.slug}` },
    },
    images: row.images
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(({ src, alt, width, height }) => ({ src, alt, width, height })),
    description: row.description,
    details: row.details,
    ...(row.sizes?.length ? { sizes: row.sizes } : {}),
    ...(row.tag ? { tag: row.tag } : {}),
    stock: toStock(row.stockQuantity),
  };
}

/** Columns and joins every product read needs. */
const productSelection = {
  columns: {
    slug: true,
    name: true,
    priceCents: true,
    description: true,
    details: true,
    sizes: true,
    tag: true,
    stockQuantity: true,
  },
  with: {
    category: {
      columns: { slug: true, name: true },
      with: { parent: { columns: { slug: true, name: true } } },
    },
    images: {
      columns: {
        src: true,
        alt: true,
        width: true,
        height: true,
        position: true,
      },
    },
  },
} as const;

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product:${slug}`);

  const row = await db.query.products.findFirst({
    ...productSelection,
    where: eq(products.slug, slug),
  });

  return row ? toProduct(row) : undefined;
}

/** Products for the given slugs, returned in the order asked for. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", ...slugs.map((slug) => `product:${slug}`));

  if (slugs.length === 0) return [];

  const rows = await db.query.products.findMany({
    ...productSelection,
    where: inArray(products.slug, slugs),
  });

  // `IN (...)` gives no ordering guarantee, so restore the curated order.
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((row): row is (typeof rows)[number] => row !== undefined)
    .map(toProduct);
}

/**
 * Other products sharing a department, falling back to filling the row.
 * Takes plain strings rather than a `Product` because `use cache` serializes
 * its arguments into the cache key.
 */
export async function getRelatedProducts(
  slug: string,
  departmentHref: string,
  limit = 4,
): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products", `product:${slug}`);

  const parents = alias(categories, "parents");
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(parents, eq(categories.parentId, parents.id))
    .where(ne(products.slug, slug))
    .orderBy(
      sql`(coalesce('/' || ${parents.slug}, '') = ${departmentHref}) desc`,
      products.id,
    )
    .limit(limit);

  return getProductsBySlugs(rows.map((row) => row.slug));
}

/** Every slug, for `generateStaticParams`. */
export async function getAllProductSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .orderBy(products.id);

  return rows.map((row) => row.slug);
}

export const stockLabel = ({ status, remaining }: Stock) => {
  switch (status) {
    case "in-stock":
      return "In stock";
    case "low-stock":
      return remaining
        ? `Low stock — only ${remaining} left`
        : "Low stock";
    case "out-of-stock":
      return "Out of stock";
  }
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
