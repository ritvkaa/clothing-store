import Link from "next/link";
import { Package, Plus, ArrowUpRight } from "lucide-react";
import { getProducts } from "@/app/actions/product";
import DeleteProductButton from "@/app/admin/products/_components/DeleteProductButton";

export default async function ProductsPage() {
  const products = await getProducts();

  const totalProducts = products.length;
  const inStock = products.filter((product: any) => product.stock >= 10).length;
  const lowStock = products.filter(
    (product: any) => product.stock > 0 && product.stock < 10,
  ).length;
  const outOfStock = products.filter(
    (product: any) => product.stock === 0,
  ).length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            ADMIN / PRODUCTS
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Manage your clothing inventory and product listings.
          </p>
        </div>

        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={17} strokeWidth={2} />
          Add Product
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Total Products
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-900">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            In Stock
          </p>

          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {inStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Low Stock
          </p>

          <p className="mt-3 text-2xl font-bold text-amber-600">
            {lowStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Out of Stock
          </p>

          <p className="mt-3 text-2xl font-bold text-red-600">
            {outOfStock}
          </p>
        </div>
      </div>

      {/* PRODUCTS */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* SECTION HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Store Products
            </p>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all products in your store.
            </p>
          </div>

          <span className="text-sm text-slate-400">
            {totalProducts} {totalProducts === 1 ? "product" : "products"}
          </span>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Product
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Category
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Price
                  </th>

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Stock
                  </th>

                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product: any) => (
                  <tr
                    key={product._id.toString()}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    {/* PRODUCT */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package
                                size={17}
                                className="text-slate-300"
                              />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {product.name}
                          </p>

                          {product.brand && (
                            <p className="mt-1 text-xs text-slate-400">
                              {product.brand}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {product.category?.name || "—"}
                      </p>

                      {product.subcategory?.name && (
                        <p className="mt-1 text-xs text-slate-400">
                          {product.subcategory.name}
                        </p>
                      )}
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            product.stock === 0
                              ? "bg-red-500"
                              : product.stock < 10
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {product.stock}
                        </span>

                        <span className="text-xs text-slate-400">
                          {product.stock === 0
                            ? "Out of stock"
                            : product.stock < 10
                              ? "Low"
                              : "Available"}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                        >
                          Manage
                          <ArrowUpRight size={13} />
                        </Link>

                        <Link
                          href={`/admin/products/edit/${product._id}`}
                          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Edit
                        </Link>

                        <DeleteProductButton product={product} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
              <Package size={25} className="text-slate-400" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              No products yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Add your first product to start building your store inventory.
            </p>

            <Link
              href="/admin/products/add"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Plus size={16} />
              Add Product
            </Link>
          </div>
        )}
      </section>

      {/* FOOTER INFO */}
      {products.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          Showing all {totalProducts} products in your inventory.
        </p>
      )}
    </div>
  );
}