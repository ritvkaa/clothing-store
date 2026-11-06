"use client";

import { addToCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddToCartButton({
  product,
}: {
  product: {
    _id: string;
    name: string;
    brand: string;
    price: number;
    images: string[];
    sizes: string[];
    colors: string[];
    stock: number;
  };
}) {
  const router = useRouter();

  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [color, setColor] = useState(product.colors?.[0] || "");
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setMessage("");
    setIsAdding(true);

    try {
      const item = {
        productId: product._id,
        quantity: 1,
        size,
        color,
      };
      const result = await addToCart(item);

      if (result.requiresLogin) {
        sessionStorage.setItem("closet-pending-cart-item", JSON.stringify(item));
        router.push("/login?redirect=%2Fcart");
        return;
      }

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      router.push("/cart");
    } catch {
      setMessage("Unable to add this product. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="mt-10 w-full bg-neutral-300 py-4 text-xs tracking-[0.18em] text-neutral-500"
      >
        OUT OF STOCK
      </button>
    );
  }

  return (
    <div className="mt-10">
      {product.sizes?.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-xs tracking-[0.15em]">
            SIZE
          </p>

          <div className="flex flex-wrap gap-2">
            {product.sizes.map((item) => (
              <button
                key={item}
                onClick={() => setSize(item)}
                className={`border px-5 py-3 text-xs ${
                  size === item
                    ? "border-black bg-black text-white"
                    : "border-black/20"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors?.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-xs tracking-[0.15em]">
            COLOR
          </p>

          <div className="flex flex-wrap gap-2">
            {product.colors.map((item) => (
              <button
                key={item}
                onClick={() => setColor(item)}
                className={`border px-5 py-3 text-xs ${
                  color === item
                    ? "border-black bg-black text-white"
                    : "border-black/20"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && (
        <p className="mb-4 text-sm text-red-500">
          {message}
        </p>
      )}

      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full bg-black py-4 text-xs tracking-[0.2em] text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60"
      >
        {isAdding ? "ADDING..." : "ADD TO CART"}
      </button>
    </div>
  );
}
