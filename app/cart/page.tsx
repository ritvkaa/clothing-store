import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { getCart } from "@/app/actions/cart";
import { getUser } from "@/app/actions/profile";
import CartItems from "./CartItems";
import { getStoreSettings } from "@/lib/store-settings";

export default async function CartPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?redirect=/cart");
  }

  const [cart, storeSettings] = await Promise.all([getCart(), getStoreSettings()]);
  const items = cart?.items || [];

  const subtotal = items.reduce(
    (total: number, item: any) =>
      total + item.product.price * item.quantity,
    0,
  );

  const delivery =
    subtotal >= storeSettings.freeShippingThreshold || subtotal === 0
      ? 0
      : storeSettings.deliveryFee;

  const total = subtotal + delivery;

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[0.18em]"
          >
            {storeSettings.storeName}
          </Link>

          <div className="flex items-center gap-6 text-xs tracking-[0.15em]">
            <Link href="/products" className="hover:opacity-50">
              SHOP
            </Link>

            <Link href="/search" className="hover:opacity-50">
              SEARCH
            </Link>

            <Link href="/profile" className="hover:opacity-50">
              ACCOUNT
            </Link>

            <Link href="/wishlist" className="hidden hover:opacity-50 sm:block">
              WISHLIST
            </Link>
          </div>
        </div>
      </header>

      {/* CART */}
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10 lg:py-16">
        {/* PAGE HEADER */}
        <div className="border-b border-black pb-8">
          <p className="text-xs tracking-[0.2em] text-gray-500">
            SHOPPING BAG
          </p>

          <div className="mt-3 flex items-end justify-between gap-6">
            <h1 className="text-4xl font-light tracking-tight">
              YOUR CART
            </h1>

            {items.length > 0 && (
              <p className="hidden text-xs tracking-[0.12em] text-gray-500 sm:block">
                {items.length}{" "}
                {items.length === 1 ? "ITEM" : "ITEMS"}
              </p>
            )}
          </div>
        </div>

        {/* EMPTY CART */}
        {items.length === 0 ? (
          <div className="border border-black/10 px-6 py-24 text-center">
            <ShoppingBag
              size={30}
              strokeWidth={1}
              className="mx-auto"
            />

            <p className="mt-6 text-sm text-gray-500">
              Your cart is empty.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-3 bg-black px-8 py-4 text-xs tracking-[0.18em] text-white transition hover:bg-gray-800"
            >
              CONTINUE SHOPPING
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
            {/* ITEMS */}
            <section>
              <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-5">
                <h2 className="text-sm font-medium tracking-[0.15em]">
                  CART ITEMS
                </h2>

                <span className="text-xs tracking-[0.1em] text-gray-500">
                  {items.length}{" "}
                  {items.length === 1 ? "ITEM" : "ITEMS"}
                </span>
              </div>

              <CartItems items={items} />
            </section>

            {/* SUMMARY */}
            <aside className="h-fit lg:sticky lg:top-8">
              <div className="border-t border-black pt-6">
                <h2 className="text-sm font-medium tracking-[0.15em]">
                  ORDER SUMMARY
                </h2>

                <div className="mt-8 space-y-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>

                    <span>
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery</span>

                    <span>
                      {delivery === 0
                        ? "FREE"
                        : `₹${delivery.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  {delivery > 0 && (
                    <p className="border-t border-black/10 pt-4 text-xs leading-5 text-gray-500">
                      Free delivery on orders above ₹{storeSettings.freeShippingThreshold.toLocaleString("en-IN")}.
                    </p>
                  )}

                  <div className="flex justify-between border-t border-black/10 pt-5 text-base font-medium">
                    <span>TOTAL</span>

                    <span>
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-8 flex w-full items-center justify-center gap-3 bg-black py-5 text-xs tracking-[0.2em] text-white transition hover:bg-gray-800"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Link>

                <Link
                  href="/products"
                  className="mt-4 flex w-full items-center justify-center border border-black py-5 text-xs tracking-[0.2em] transition hover:bg-black hover:text-white"
                >
                  CONTINUE SHOPPING
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
