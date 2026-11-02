import Link from "next/link";
import { getProducts } from "@/app/actions/product";
import { getWishlistedProductIds } from "@/app/actions/wishlist";
import StoreName from "@/app/_components/StoreName";
import StorefrontImage from "@/app/_components/StorefrontImage";
import ProductWishlistButton from "@/app/_components/ProductWishlistButton";

export default async function SearchPage() {
  const [products, wishlistedProductIds] = await Promise.all([
    getProducts(),
    getWishlistedProductIds(),
  ]);
  const wishlistedProducts = new Set(wishlistedProductIds);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[0.18em]"
          >
            <StoreName />
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
          <StoreName />
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
            <div key={product._id} className="group relative">
            <Link
              href={`/products/${product._id}`}
              className="group"
            >
              <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                <StorefrontImage
                  src={product.images?.[0]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
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
            <ProductWishlistButton
              key={`${product._id}-${wishlistedProducts.has(product._id)}`}
              productId={product._id}
              initialWishlisted={wishlistedProducts.has(product._id)}
            />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
