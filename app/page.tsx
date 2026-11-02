import Link from "next/link";
import { getCategories } from "@/app/actions/category";
import { getProducts } from "@/app/actions/product";
import { getHomepage } from "@/app/actions/homepage";
import { getStoreSettings } from "@/lib/store-settings";
import StorefrontImage from "@/app/_components/StorefrontImage";

export default async function Page() {
  const [categories, products, homepage, storeSettings] = await Promise.all([
    getCategories(),
    getProducts(),
    getHomepage(),
    getStoreSettings(),
  ]);

  const featuredProducts = products
    .filter((product: any) => product.isFeatured)
    .slice(0, 4);

  const newArrivals = products.slice(0, 8);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="text-2xl font-bold tracking-[0.18em]">
            {storeSettings.storeName}
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] font-medium tracking-[0.08em] md:flex">
            {categories.slice(0, 5).map((category: any) => (
              <Link
                key={category._id}
                href={`/category/${category.key}`}
                className="transition-opacity hover:opacity-50"
              >
                {category.name.toUpperCase()}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5 text-[13px]">
            <Link href="/search" className="hidden sm:block hover:opacity-50">
              SEARCH
            </Link>

            <Link href="/profile" className="hidden sm:block hover:opacity-50">
              ACCOUNT
            </Link>

            <Link href="/cart" className="hover:opacity-50">
              CART
            </Link>

            <Link href="/wishlist" className="hidden sm:block hover:opacity-50">
              WISHLIST
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative h-[calc(100vh-80px)] min-h-[600px] overflow-hidden bg-neutral-100">
        <img
          src={homepage.heroImage?.trim() || "/images/storefront-hero.jpg"}
          alt={`${storeSettings.storeName} collection`}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex h-full items-end justify-center pb-20 text-center text-white">
          <div>
            <p className="mb-4 text-xs tracking-[0.35em]">{storeSettings.storeName}</p>

            <h1 className="text-5xl font-light tracking-[0.08em] sm:text-7xl lg:text-8xl">
              {homepage.heroTitle}
            </h1>

            <p className="mt-5 text-sm tracking-[0.18em]">
              {homepage.heroSubtitle}
            </p>

            <Link
              href="/products"
              className="mt-8 inline-block border border-white px-10 py-4 text-xs tracking-[0.2em] transition-colors hover:bg-white hover:text-black"
            >
              {homepage.heroButtonText}
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1500px] px-6 py-24 lg:px-10">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.3em] text-neutral-500">EXPLORE</p>

          <h2 className="mt-3 text-3xl font-light tracking-wide">
            SHOP BY CATEGORY
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px bg-black/10 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category: any) => {
            const categoryProduct = products.find(
              (product: any) => product.category?._id === category._id,
            );

            return (
              <Link
                key={category._id}
                href={`/category/${category.key}`}
                className="group relative flex min-h-[260px] items-center justify-center overflow-hidden px-6 text-center text-white"
              >
                <StorefrontImage
                  src={categoryProduct?.images?.[0]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/55" />
                <div className="relative z-10">
                  <h3 className="text-xl font-light tracking-[0.12em]">
                    {category.name.toUpperCase()}
                  </h3>

                  {category.subcategories?.length > 0 && (
                    <p className="mt-4 text-xs tracking-wider opacity-60">
                      {category.subcategories.length} COLLECTIONS
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      {featuredProducts.length > 0 && (
        <section className="border-y border-black/10 py-24">
          <div className="mx-auto max-w-[1500px] px-6 lg:px-10">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="text-xs tracking-[0.3em] text-neutral-500">
                  SELECTED FOR YOU
                </p>

                <h2 className="mt-3 text-3xl font-light tracking-wide">
                  FEATURED
                </h2>
              </div>

              <Link
                href="/products"
                className="hidden text-xs tracking-[0.15em] underline underline-offset-4 sm:block"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {featuredProducts.map((product: any) => (
                <Link
                  key={product._id}
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

                    <h3 className="mt-1 text-sm">{product.name}</h3>

                    <p className="mt-2 text-sm">₹{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-[1500px] px-6 py-24 lg:px-10">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.3em] text-neutral-500">JUST IN</p>

            <h2 className="mt-3 text-3xl font-light tracking-wide">
              NEW ARRIVALS
            </h2>
          </div>

          <Link
            href="/products"
            className="text-xs tracking-[0.15em] underline underline-offset-4"
          >
            VIEW ALL
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {newArrivals.map((product: any) => (
            <Link
              key={product._id}
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

                <h3 className="mt-1 text-sm">{product.name}</h3>

                <p className="mt-2 text-sm">₹{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SERVICE STRIP */}
      <section className="border-y border-black/10">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 divide-y divide-black/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="px-8 py-12 text-center">
            <h3 className="text-xs font-medium tracking-[0.2em]">QUALITY</h3>
            <p className="mt-3 text-sm text-neutral-500">
              Carefully selected styles
            </p>
          </div>

          <div className="px-8 py-12 text-center">
            <h3 className="text-xs font-medium tracking-[0.2em]">
              EASY DELIVERY
            </h3>
            <p className="mt-3 text-sm text-neutral-500">
              Fast and reliable delivery
            </p>
          </div>

          <div className="px-8 py-12 text-center">
            <h3 className="text-xs font-medium tracking-[0.2em]">
              SECURE PAYMENT
            </h3>
            <p className="mt-3 text-sm text-neutral-500">
              Safe and secure checkout
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-16 text-white lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-10 md:flex-row">
          <div>
            <h2 className="text-2xl font-bold tracking-[0.18em]">{storeSettings.storeName}</h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/50">
              {storeSettings.description}
            </p>

            {(storeSettings.supportEmail || storeSettings.supportPhone || storeSettings.address) && (
              <div className="mt-5 space-y-2 text-sm text-white/60">
                {storeSettings.supportEmail && (
                  <p><a href={`mailto:${storeSettings.supportEmail}`} className="hover:text-white">{storeSettings.supportEmail}</a></p>
                )}
                {storeSettings.supportPhone && (
                  <p><a href={`tel:${storeSettings.supportPhone}`} className="hover:text-white">{storeSettings.supportPhone}</a></p>
                )}
                {storeSettings.address && <p className="max-w-sm">{storeSettings.address}</p>}
              </div>
            )}
          </div>

          <div className="flex gap-12 text-xs tracking-[0.12em]">
            <div className="flex flex-col gap-4">
              <span className="text-white/40">SHOP</span>
              <Link href="/products">ALL PRODUCTS</Link>
              <Link href="/cart">CART</Link>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-white/40">ACCOUNT</span>
              <Link href="/login">LOGIN</Link>
              <Link href="/signup">SIGN UP</Link>
              <Link href="/profile">PROFILE</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-[1500px] border-t border-white/10 pt-6 text-xs text-white/30">
          © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
