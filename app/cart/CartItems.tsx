"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  removeFromCart,
  updateCartItem,
} from "@/app/actions/cart";

export default function CartItems({
  items,
}: {
  items: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const changeQuantity = async (
    itemId: string,
    quantity: number,
  ) => {
    setLoading(itemId);
    setMessage("");

    const result = await updateCartItem(itemId, quantity);

    setLoading(null);

    if (result.requiresLogin) {
      router.push("/login");
      return;
    }

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    router.refresh();
  };

  const removeItem = async (itemId: string) => {
    setLoading(itemId);
    setMessage("");

    const result = await removeFromCart(itemId);

    setLoading(null);

    if (result.requiresLogin) {
      router.push("/login");
      return;
    }

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-0">
      {/* ERROR / DISCLAIMER */}
      {message && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {message}
        </div>
      )}

      {items.map((item: any) => {
        const product = item.product;
        const itemTotal = product.price * item.quantity;

        return (
          <div
            key={item._id}
            className="border-b border-black/10 py-7 first:pt-0"
          >
            <div className="flex gap-5 sm:gap-7">
              {/* IMAGE */}
              <Link
                href={`/products/${product._id}`}
                className="h-44 w-32 shrink-0 overflow-hidden bg-neutral-100 sm:h-52 sm:w-40"
              >
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs tracking-[0.1em] text-neutral-400">
                    NO IMAGE
                  </div>
                )}
              </Link>

              {/* DETAILS */}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    {product.brand && (
                      <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                        {product.brand}
                      </p>
                    )}

                    <Link
                      href={`/products/${product._id}`}
                      className="mt-2 block text-base font-medium tracking-tight hover:opacity-60 sm:text-lg"
                    >
                      {product.name}
                    </Link>
                  </div>

                  {/* PRICE */}
                  <div className="text-left sm:text-right">
                    <p className="text-sm">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    {item.quantity > 1 && (
                      <p className="mt-1 text-xs text-neutral-500">
                        ₹{itemTotal.toLocaleString("en-IN")} total
                      </p>
                    )}
                  </div>
                </div>

                {/* VARIANTS */}
                <div className="mt-5 space-y-1 text-xs text-neutral-500">
                  {item.size && (
                    <p>
                      <span className="text-neutral-400">SIZE</span>{" "}
                      {item.size}
                    </p>
                  )}

                  {item.color && (
                    <p>
                      <span className="text-neutral-400">COLOR</span>{" "}
                      {item.color}
                    </p>
                  )}
                </div>

                {/* CONTROLS */}
                <div className="mt-auto flex flex-wrap items-center gap-6 pt-6">
                  {/* QUANTITY */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] tracking-[0.15em] text-neutral-500">
                      QTY
                    </span>

                    <div className="flex items-center border border-black/20">
                      <button
                        onClick={() =>
                          changeQuantity(
                            item._id,
                            item.quantity - 1,
                          )
                        }
                        disabled={loading === item._id}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center text-lg transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>

                      <span className="flex h-9 min-w-10 items-center justify-center border-x border-black/20 text-sm">
                        {loading === item._id ? "..." : item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          changeQuantity(
                            item._id,
                            item.quantity + 1,
                          )
                        }
                        disabled={loading === item._id}
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center text-lg transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() => removeItem(item._id)}
                    disabled={loading === item._id}
                    className="text-[10px] tracking-[0.15em] text-neutral-500 underline underline-offset-4 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading === item._id ? "REMOVING..." : "REMOVE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}