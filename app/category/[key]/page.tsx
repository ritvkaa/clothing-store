import Link from "next/link";
import { getCategories } from "@/app/actions/category";
import { getProducts } from "@/app/actions/product";
import StoreName from "@/app/_components/StoreName";
import StorefrontImage from "@/app/_components/StorefrontImage";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const category = categories.find(
    (item: any) => item.key === key,
  );

  if (!category) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-[1500px] px-6 py-24 text-center lg:px-10">
          <h1 className="text-3xl font-light">
            Category Not Found
          </h1>

          <Link
            href="/"
            className="mt-8 inline-block border border-black px-8 py-4 text-xs tracking-[0.15em] hover:bg-black hover:text-white"
          >
            BACK TO HOME
          </Link>
        </div>
      </main>
    );
  }

  /* FILTER PRODUCTS BY CATEGORY KEY */
  const categoryProducts = products.filter(
    (product: any) =>
      product.category?.key === category.key,
  );

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
            <Link
              href="/products"
              className="hover:opacity-50"
            >
              SHOP
            </Link>

            <Link
              href="/search"
              className="hover:opacity-50"
            >
              SEARCH
            </Link>

            <Link
              href="/profile"
              className="hover:opacity-50"
            >
              ACCOUNT
            </Link>

            <Link
              href="/cart"
              className="hover:opacity-50"
            >
              CART
            </Link>
          </div>
        </div>
      </header>

      {/* CATEGORY HEADER */}
      <section className="mx-auto max-w-[1500px] px-6 pb-12 pt-16 lg:px-10">
        <p className="text-xs tracking-[0.3em] text-neutral-500">
          <StoreName /> COLLECTION
        </p>

        <h1 className="mt-3 text-4xl font-light tracking-wide">
          {category.name.toUpperCase()}
        </h1>

        {category.subcategories?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {category.subcategories.map(
              (subcategory: any) => (
                <span
                  key={subcategory._id}
                  className="border border-black/20 px-4 py-2 text-xs tracking-wider"
                >
                  {subcategory.name}
                </span>
              ),
            )}
          </div>
        )}
      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-[1500px] px-6 pb-24 lg:px-10">
        {categoryProducts.length === 0 ? (
          <div className="border-t border-black/10 py-24 text-center">
            <p className="text-sm text-neutral-500">
              No products available in this category.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-block text-xs tracking-[0.15em] underline underline-offset-4"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {categoryProducts.map((product: any) => (
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
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] justify-between text-xs tracking-wider text-neutral-500">
          <Link href="/">
            <StoreName />
          </Link>

          <Link href="/products">
            ALL PRODUCTS
          </Link>
        </div>
      </footer>
    </main>
  );
}
