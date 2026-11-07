"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalogue";

/**
 * Size picker + add button. There is no cart yet, so adding only produces a
 * local confirmation; wire this to a server action once the cart exists.
 */
export function AddToBag({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock.status === "out-of-stock";
  const needsSize = Boolean(product.sizes?.length) && size === null;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <div className="flex flex-col gap-6">
      {product.sizes && (
        <fieldset disabled={soldOut} className="flex flex-col gap-3">
          <legend className="heading-caps mb-3">Size</legend>
          <div role="radiogroup" aria-label="Size" className="flex flex-wrap gap-2">
            {product.sizes.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={size === value}
                onClick={() => {
                  setSize(value);
                  setAdded(false);
                }}
                className="option min-h-control min-w-14 cursor-pointer px-4 text-sm transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={soldOut || needsSize}
          onClick={() => setAdded(true)}
        >
          {soldOut ? "Out of stock" : needsSize ? "Select a size" : "Add to bag"}
        </button>
        <p aria-live="polite" className="min-h-4 text-xs text-muted">
          {added ? `Added to bag${size ? ` · Size ${size}` : ""}` : ""}
        </p>
      </div>
    </div>
  );
}
