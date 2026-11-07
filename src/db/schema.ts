import { relations } from "drizzle-orm";
import {
  type AnyPgColumn,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Catalogue taxonomy. A row with `parentId === null` is a department
 * ("Accessories", "Women"); its children are the fine-grained categories
 * products hang off ("Bags", "Shoes"). One table keeps the tree open-ended.
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  /** Minor units, so 165000 is $1,650. Avoids float money. */
  priceCents: integer("price_cents").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  description: text("description").notNull(),
  /** Ordered bullet list shown under "Details". */
  details: text("details").array().notNull().default([]),
  /** `null` means the product has no size axis at all. */
  sizes: text("sizes").array(),
  /** Short merchandising label, e.g. "New". */
  tag: text("tag"),
  /** Single source of truth for stock; the three-state status is derived. */
  stockQuantity: integer("stock_quantity").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    src: text("src").notNull(),
    alt: text("alt").notNull(),
    /** Intrinsic pixel size, so pages can reserve the right space. */
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    /** `0` is the listing thumbnail; the rest are extra angles. */
    position: integer("position").notNull().default(0),
  },
  (table) => [unique().on(table.productId, table.position)],
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
