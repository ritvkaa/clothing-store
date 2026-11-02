import Link from "next/link";
import { redirect } from "next/navigation";
import { getWishlist } from "@/app/actions/wishlist";
import WishlistRemoveButton from "./WishlistRemoveButton";
import StoreName from "@/app/_components/StoreName";
import StorefrontImage from "@/app/_components/StorefrontImage";

export default async function WishlistPage() {
  const wishlist = await getWishlist();

  if (!wishlist) redirect("/login?redirect=/wishlist");

  const products = wishlist.products || [];

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
            <Link href="/products">SHOP</Link>
            <Link href="/search">SEARCH</Link>
            <Link href="/profile">ACCOUNT</Link>
            <Link href="/cart">CART</Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-neutral-500">
              SAVED ITEMS
            </p>

            <h1 className="mt-3 text-3xl font-light tracking-wide">
              WISHLIST
            </h1>
          </div>

          <p className="text-xs text-neutral-500">
            {products.length}{" "}
            {products.length === 1 ? "ITEM" : "ITEMS"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-neutral-500">
              Your wishlist is empty.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block bg-black px-8 py-4 text-xs tracking-[0.18em] text-white"
            >
              EXPLORE PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <article key={product._id}>
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Link href={`/products/${product._id}`}>
                    <StorefrontImage
                      src={product.images?.[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"
                    />
                  </Link>

                  <WishlistRemoveButton
                    productId={product._id}
                  />
                </div>

                <Link href={`/products/${product._id}`}>
                  <p className="mt-4 text-xs uppercase tracking-[0.15em] text-neutral-500">
                    {product.brand}
                  </p>

                  <h2 className="mt-2 text-sm">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-sm">
                    ₹{product.price}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
