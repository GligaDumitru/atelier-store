import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/catalogue";

export function ProductTile({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  // Images come from the database, so a product can arrive with none.
  const [thumbnail] = product.images;

  return (
    <li className={className}>
      <Link href={`/products/${product.slug}`} className="product-tile group">
        <div className="product-tile__media">
          {thumbnail && (
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
            />
          )}
          {product.stock.status === "out-of-stock" && (
            <span className="absolute top-0 left-0 bg-paper px-2 py-1 text-micro font-medium uppercase">
              Out of stock
            </span>
          )}
        </div>
        <div className="product-tile__body">
          {product.tag && <span className="eyebrow uppercase">{product.tag}</span>}
          <span className="product-tile__name">{product.name}</span>
          <span className="product-tile__price">{formatPrice(product.price)}</span>
        </div>
      </Link>
    </li>
  );
}
