import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { getCheckoutData } from "@/app/actions/checkout";
import CheckoutForm from "@/app/checkout/CheckoutForm";

export default async function CheckoutPage() {
  const data = await getCheckoutData();

  if (data.requiresLogin) {
    redirect("/login?redirect=/checkout");
  }

  if (data.emptyCart) {
    redirect("/cart");
  }

  if (!data.success) {
    return (
      <main className="min-h-screen bg-white text-black">
        <header className="border-b border-black/10">
          <div className="mx-auto flex h-20 max-w-[1500px] items-center px-6 lg:px-10">
            <Link
              href="/"
              className="text-2xl font-bold tracking-[0.18em]"
            >
              CLOSET
            </Link>
          </div>
        </header>

        <section className="mx-auto flex max-w-[700px] px-6 py-24 lg:px-10">
          <div className="w-full border border-red-200 bg-red-50 px-6 py-8 text-center">
            <p className="text-sm text-red-700">
              {data.message}
            </p>

            <Link
              href="/cart"
              className="mt-7 inline-flex items-center justify-center gap-2 bg-black px-8 py-4 text-xs tracking-[0.18em] text-white transition hover:bg-gray-800"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              BACK TO CART
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[0.18em]"
          >
            CLOSET
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

            <Link href="/cart" className="hover:opacity-50">
              CART
            </Link>

            <Link
              href="/wishlist"
              className="hidden hover:opacity-50 sm:block"
            >
              WISHLIST
            </Link>
          </div>
        </div>
      </header>

      {/* CHECKOUT */}
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10 lg:py-16">
        {/* BACK */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs tracking-[0.15em] text-neutral-500 transition hover:text-black"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          BACK TO CART
        </Link>

        {/* PAGE HEADER */}
        <div className="mt-10 border-b border-black pb-8">
          <p className="text-xs tracking-[0.2em] text-gray-500">
            SHOPPING BAG
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight">
            CHECKOUT
          </h1>
        </div>

        {/* SECURE CHECKOUT NOTE */}
        <div className="mt-8 flex items-center gap-3 border border-black/10 px-5 py-4">
          <ShieldCheck size={17} strokeWidth={1.5} />

          <p className="text-xs tracking-[0.08em] text-gray-600">
            SECURE CHECKOUT
          </p>
        </div>

        {/* FORM */}
        <div className="mt-10">
          <CheckoutForm
            user={data.user}
            items={data.items}
            summary={data.summary}
          />
        </div>
      </section>
    </main>
  );
}