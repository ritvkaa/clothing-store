import Link from "next/link";
import { notFound } from "next/navigation";

import { getProductById } from "@/app/actions/product";
import { isProductInWishlist } from "@/app/actions/wishlist";

import { AddToCartButton } from "./_components/AddToCartButton";
import WishlistButton from "./_components/WishlistButton";
import StoreName from "@/app/_components/StoreName";
import StorefrontImage from "@/app/_components/StorefrontImage";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Check MongoDB to see whether this product is already wishlisted
  const wishlisted = await isProductInWishlist(id);

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

      {/* PRODUCT */}
      <section className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10 lg:py-16">
        <Link
          href="/products"
          className="text-xs tracking-[0.15em] text-neutral-500 hover:text-black"
        >
          ← BACK TO PRODUCTS
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          {/* IMAGES */}
          <div>
            <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
              <StorefrontImage
                src={product.images?.[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {product.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map(
                  (image: string, index: number) => (
                    <div
                      key={index}
                      className="aspect-square overflow-hidden bg-neutral-100"
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-center">
            {/* BRAND */}
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {product.brand}
            </p>

            {/* NAME */}
            <h1 className="mt-4 text-4xl font-light tracking-wide">
              {product.name}
            </h1>

            {/* PRICE */}
            <p className="mt-5 text-xl">
              ₹{product.price}
            </p>

            {/* DESCRIPTION */}
            <div className="mt-8 border-t border-black/10 pt-8">
              <p className="text-sm leading-7 text-neutral-600">
                {product.description}
              </p>
            </div>

            {/* CATEGORY / STOCK */}
            <div className="mt-8 space-y-4 text-sm">
              {product.category && (
                <p>
                  <span className="text-neutral-500">
                    Category:
                  </span>{" "}
                  {product.category.name}
                </p>
              )}

              {product.subcategory && (
                <p>
                  <span className="text-neutral-500">
                    Collection:
                  </span>{" "}
                  {product.subcategory.name}
                </p>
              )}

              <p>
                <span className="text-neutral-500">
                  Stock:
                </span>{" "}
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Out of stock"}
              </p>
            </div>

            {/* ADD TO CART */}
            <AddToCartButton
              product={{
                _id: product._id,
                name: product.name,
                brand: product.brand,
                price: product.price,
                images: product.images,
                sizes: product.sizes,
                colors: product.colors,
                stock: product.stock,
              }}
            />

            {/* WISHLIST */}
            <div className="mt-8">
              <WishlistButton
                productId={product._id}
                initialWishlisted={wishlisted}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
