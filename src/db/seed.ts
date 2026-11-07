// Seeds the catalogue with the eight products the storefront shipped with.
// Idempotent: every write upserts on a unique key, so re-running is safe.
//
// Run with `npm run db:seed`. Uses relative imports because the `@/*` alias
// only resolves inside the Next build.

import { config } from "dotenv";

config({ path: ".env.local" });
config();

const unsplash = (photoId: string, width: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=${width}`;

type CategorySeed = { slug: string; name: string; parent?: string };

const categorySeed: CategorySeed[] = [
  // Departments first, so the children can reference them.
  { slug: "accessories", name: "Accessories" },
  { slug: "women", name: "Women" },
  { slug: "bags", name: "Bags", parent: "accessories" },
  {
    slug: "small-leather-goods",
    name: "Small leather goods",
    parent: "accessories",
  },
  { slug: "eyewear", name: "Eyewear", parent: "accessories" },
  { slug: "scarves", name: "Scarves", parent: "accessories" },
  { slug: "shoes", name: "Shoes", parent: "women" },
  { slug: "knitwear", name: "Knitwear", parent: "women" },
];

type ProductSeed = {
  slug: string;
  name: string;
  priceCents: number;
  category: string;
  description: string;
  details: string[];
  sizes?: string[];
  tag?: string;
  stockQuantity: number;
  images: { src: string; alt: string; width: number; height: number }[];
};

const productSeed: ProductSeed[] = [
  {
    slug: "woven-leather-tote",
    name: "Woven Leather Tote",
    priceCents: 165000,
    category: "bags",
    description:
      "An oversized tote hand-woven from vegetable-tanned calfskin, finished with a slim gold chain. Soft enough to fold into the hand, structured enough to stand on its own.",
    details: [
      "Hand-woven vegetable-tanned calfskin",
      "Unlined interior with a single slip pocket",
      "Detachable chain strap in light gold",
      "Height 28cm · Width 42cm · Depth 14cm",
      "Made in Italy",
    ],
    tag: "New",
    stockQuantity: 20,
    images: [
      {
        src: unsplash("1598532163257-ae3c6b2524b6", 1400),
        alt: "Brown woven leather tote bag with a slim gold chain",
        width: 1400,
        height: 1754,
      },
    ],
  },
  {
    slug: "top-handle-bag-cream",
    name: "Top-Handle Bag in Cream",
    priceCents: 220000,
    category: "bags",
    description:
      "A sculpted top-handle bag in grained cream leather, closed with a polished turn-lock. Carried by the handle or worn on the shoulder with the detachable strap.",
    details: [
      "Grained calfskin with light gold hardware",
      "Turn-lock closure, suede-lined interior",
      "Detachable and adjustable shoulder strap",
      "Height 22cm · Width 26cm · Depth 12cm",
      "Made in Italy",
    ],
    tag: "New",
    stockQuantity: 2,
    images: [
      {
        src: unsplash("1682745230951-8a5aa9a474a0", 1400),
        alt: "Cream leather top-handle bag with gold hardware",
        width: 1400,
        height: 2100,
      },
    ],
  },
  {
    slug: "browline-sunglasses",
    name: "Browline Sunglasses",
    priceCents: 42000,
    category: "eyewear",
    description:
      "A browline frame in black acetate with a fine metal rim and gradient lenses. Lightweight, with sprung temples that hold their shape.",
    details: [
      "Acetate frame with metal rim",
      "Gradient lenses, 100% UV protection",
      "Sprung temples with acetate tips",
      "Supplied with a leather case and cloth",
      "Made in Japan",
    ],
    tag: "New",
    stockQuantity: 20,
    images: [
      {
        src: unsplash("1584036553516-bf83210aa16c", 1400),
        alt: "Black browline sunglasses with gradient lenses",
        width: 1400,
        height: 2139,
      },
    ],
  },
  {
    slug: "hand-stitched-card-wallet",
    name: "Hand-Stitched Card Wallet",
    priceCents: 48000,
    category: "small-leather-goods",
    description:
      "A slim card wallet cut from a single panel of tan bridle leather and saddle-stitched by hand. It darkens and softens with use.",
    details: [
      "Vegetable-tanned bridle leather",
      "Saddle-stitched with waxed linen thread",
      "Four card slots and a central note pocket",
      "Height 8cm · Width 11cm",
      "Made in England",
    ],
    tag: "New",
    stockQuantity: 20,
    images: [
      {
        src: unsplash("1628483211662-9bcc692c46dc", 1400),
        alt: "Tan hand-stitched leather card wallet on a workbench",
        width: 1400,
        height: 2107,
      },
    ],
  },
  {
    slug: "woven-leather-pump",
    name: "Woven Leather Pump",
    priceCents: 89000,
    category: "shoes",
    description:
      "A pointed pump on a 55mm kitten heel, with a woven leather vamp that softens the line. Leather-lined and finished with a stacked heel.",
    details: [
      "Woven nappa leather upper",
      "55mm covered kitten heel",
      "Leather lining and sole",
      "True to size; we suggest taking your usual fit",
      "Made in Italy",
    ],
    sizes: ["36", "37", "38", "39", "40", "41"],
    stockQuantity: 20,
    images: [
      {
        src: unsplash("1618274158630-bc47a614b3a5", 1400),
        alt: "Pair of black woven leather pumps with a kitten heel",
        width: 1400,
        height: 933,
      },
      {
        src: unsplash("1618274158638-41d9f8d9279d", 1400),
        alt: "Black woven leather pumps photographed from the side",
        width: 1400,
        height: 933,
      },
    ],
  },
  {
    slug: "braided-leather-belt",
    name: "Braided Leather Belt",
    priceCents: 39000,
    category: "small-leather-goods",
    description:
      "A braided calfskin belt with a brushed buckle. The open weave lets the pin sit anywhere along the strap, so the fit is yours to set.",
    details: [
      "Braided calfskin with a brushed palladium buckle",
      "No punched holes; the pin sets anywhere in the weave",
      "Width 3.5cm",
      "Made in Spain",
    ],
    sizes: ["80", "85", "90", "95", "100"],
    stockQuantity: 3,
    images: [
      {
        src: unsplash("1711443982852-b3df5c563448", 1400),
        alt: "Braided brown leather belt with a brushed metal buckle",
        width: 1400,
        height: 1750,
      },
    ],
  },
  {
    slug: "printed-silk-scarf",
    name: "Printed Silk Scarf",
    priceCents: 38000,
    category: "scarves",
    description:
      "A square scarf in silk twill, printed with an archival floral and finished with hand-rolled edges. Worn at the neck, in the hair or knotted to a bag.",
    details: [
      "100% silk twill",
      "Hand-rolled and hand-stitched edges",
      "90cm × 90cm",
      "Dry clean only",
      "Made in Italy",
    ],
    stockQuantity: 0,
    images: [
      {
        src: unsplash("1689193502879-362660fad4a8", 1400),
        alt: "Model wearing a red printed silk scarf tied over her hair",
        width: 1400,
        height: 2100,
      },
    ],
  },
  {
    slug: "cashmere-crew-knit",
    name: "Cashmere Crew Knit",
    priceCents: 74000,
    category: "knitwear",
    description:
      "A relaxed crew-neck knitted from four-ply Mongolian cashmere, with ribbed edges and dropped shoulders. Dense enough to wear on its own.",
    details: [
      "100% four-ply Mongolian cashmere",
      "Ribbed crew neck, cuffs and hem",
      "Relaxed fit with dropped shoulders",
      "Dry clean, or hand wash cold and dry flat",
      "Made in Scotland",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockQuantity: 20,
    images: [
      {
        src: unsplash("1670905934075-0c3cb559e977", 1400),
        alt: "Folded cashmere knits stacked in neutral tones",
        width: 1400,
        height: 1433,
      },
    ],
  },
];

async function seed() {
  // Imported lazily so `config()` above has already populated DATABASE_URL —
  // `./index` throws at import time when it is missing.
  const { db } = await import("./index");
  const { categories, productImages, products } = await import("./schema");

  const categoryIds = new Map<string, number>();

  for (const category of categorySeed) {
    const parentId = category.parent
      ? categoryIds.get(category.parent)
      : null;

    if (category.parent && parentId === undefined) {
      throw new Error(
        `Category "${category.slug}" names an unknown parent "${category.parent}"`,
      );
    }

    const [row] = await db
      .insert(categories)
      .values({ slug: category.slug, name: category.name, parentId })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: category.name, parentId },
      })
      .returning({ id: categories.id });

    categoryIds.set(category.slug, row.id);
  }

  for (const product of productSeed) {
    const categoryId = categoryIds.get(product.category);
    if (categoryId === undefined) {
      throw new Error(
        `Product "${product.slug}" names an unknown category "${product.category}"`,
      );
    }

    const values = {
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      categoryId,
      description: product.description,
      details: product.details,
      sizes: product.sizes ?? null,
      tag: product.tag ?? null,
      stockQuantity: product.stockQuantity,
    };

    const [row] = await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({
        target: products.slug,
        set: { ...values, updatedAt: new Date() },
      })
      .returning({ id: products.id });

    for (const [position, image] of product.images.entries()) {
      await db
        .insert(productImages)
        .values({ productId: row.id, position, ...image })
        .onConflictDoUpdate({
          target: [productImages.productId, productImages.position],
          set: image,
        });
    }
  }

  console.log(
    `Seeded ${categorySeed.length} categories and ${productSeed.length} products.`,
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
