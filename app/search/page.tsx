import Link from "next/link";
import { getProducts } from "@/app/actions/product";

export default async function SearchPage() {
  const products = await getProducts();

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

            <Link href="/profile" className="hover:opacity-50">
              ACCOUNT
            </Link>

            <Link href="/cart" className="hover:opacity-50">
              CART
            </Link>
          </div>
        </div>
      </header>

      {/* SEARCH */}
      <section className="mx-auto max-w-[900px] px-6 py-20">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          CLOSET
        </p>

        <h1 className="mt-3 text-4xl font-light tracking-wide">
          SEARCH
        </h1>

        <form
          action="/search"
          method="GET"
          className="mt-10 flex border-b border-black"
        >
          <input
            type="text"
            name="q"
            placeholder="Search products..."
            className="flex-1 bg-transparent py-4 text-lg outline-none placeholder:text-neutral-400"
          />

          <button
            type="submit"
            className="px-4 text-xs tracking-[0.15em] hover:opacity-50"
          >
            SEARCH
          </button>
        </form>
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1500px] px-6 pb-24 lg:px-10">
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

                <h2 className="mt-1 text-sm">
                  {product.name}
                </h2>

                <p className="mt-2 text-sm">
                  ₹{product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}