import Link from "next/link";
import { getProducts } from "@/app/actions/product";

import { House } from "lucide-react";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="relative border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            aria-label="Go to home"
            title="Home"
            className="inline-flex h-10 w-10 items-center justify-center transition hover:bg-black hover:text-white"
          >
            <House size={18} strokeWidth={1.5} />
          </Link>

          <Link href="/" className="text-2xl font-bold tracking-[0.18em]">
            CLOSET
          </Link>

          <div className="flex items-center gap-6 text-xs tracking-[0.15em]">
            <Link href="/search" className="hover:opacity-50">
              SEARCH
            </Link>

            <Link href="/profile" className="hover:opacity-50">
              ACCOUNT
            </Link>

            <Link href="/cart" className="hover:opacity-50">
              CART
            </Link>
          </div>
        </div>
      </header>
      
      {/* TITLE */}
      <section className="mx-auto max-w-[1500px] px-6 pb-12 pt-16 lg:px-10">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          CLOSET COLLECTION
        </p>

        <h1 className="mt-3 text-4xl font-light tracking-wide">ALL PRODUCTS</h1>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1500px] px-6 pb-24 lg:px-10">
        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-neutral-500">No products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <Link
                key={product._id}
                href={`/products/${product._id}`}
                className="group"
              >
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs tracking-widest text-neutral-400">
                      NO IMAGE
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                    {product.brand}
                  </p>

                  <h2 className="mt-1 text-sm">{product.name}</h2>

                  <p className="mt-2 text-sm">₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] justify-between text-xs tracking-wider text-neutral-500">
          <Link href="/">CLOSET</Link>

        </div>
      </footer>
    </main>
  );
}
