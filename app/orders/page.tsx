import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";

import { getUser } from "@/app/actions/profile";
import { getUserOrders } from "@/app/actions/order";

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function OrdersPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const orders = await getUserOrders();

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

      {/* CONTENT */}
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10">
        {/* PAGE HEADER */}
        <div className="mb-12 border-b border-black pb-8">
          <p className="text-xs tracking-[0.2em] text-gray-500">
            ACCOUNT
          </p>

          <div className="mt-3 flex items-end justify-between gap-6">
            <h1 className="text-4xl font-light tracking-tight">
              MY ORDERS
            </h1>

            {orders.length > 0 && (
              <p className="hidden text-xs tracking-[0.12em] text-gray-500 sm:block">
                {orders.length} {orders.length === 1 ? "ORDER" : "ORDERS"}
              </p>
            )}
          </div>
        </div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div className="border border-black/10 px-6 py-20 text-center">
            <Package
              size={28}
              strokeWidth={1}
              className="mx-auto"
            />

            <p className="mt-6 text-sm text-gray-500">
              You have no orders yet.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-3 bg-black px-8 py-4 text-xs tracking-[0.18em] text-white transition hover:bg-gray-800"
            >
              START SHOPPING
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          /* ORDERS */
          <div className="space-y-6">
            {orders.map((order: any) => {
              const isRefunded = order.refundProcessed === true;

              const isPartialRefund =
                isRefunded &&
                Number(order.refundAmount) < Number(order.totalAmount);

              const displayStatus = isRefunded
                ? isPartialRefund
                  ? "Partially Refunded"
                  : "Refunded"
                : formatStatus(order.orderStatus);

              return (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="group block border border-black/10 transition hover:border-black"
                >
                  {/* ORDER TOP */}
                  <div className="flex flex-col justify-between gap-6 border-b border-black/10 px-6 py-6 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs tracking-[0.15em] text-gray-500">
                        ORDER
                      </p>

                      <p className="mt-2 font-mono text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs tracking-[0.12em] text-gray-500 transition group-hover:text-black">
                      VIEW ORDER
                      <ArrowRight
                        size={14}
                        strokeWidth={1.5}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>

                  {/* ORDER DETAILS */}
                  <div className="grid gap-8 px-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
                    {/* DATE */}
                    <div>
                      <p className="text-xs tracking-[0.15em] text-gray-500">
                        DATE
                      </p>

                      <p className="mt-2 text-sm">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    {/* ITEMS */}
                    <div>
                      <p className="text-xs tracking-[0.15em] text-gray-500">
                        ITEMS
                      </p>

                      <p className="mt-2 text-sm">
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1 ? "ITEM" : "ITEMS"}
                      </p>
                    </div>

                    {/* TOTAL */}
                    <div>
                      <p className="text-xs tracking-[0.15em] text-gray-500">
                        TOTAL
                      </p>

                      <p className="mt-2 text-sm">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </p>

                      {isPartialRefund && (
                        <p className="mt-1 text-xs text-gray-500">
                          ₹
                          {order.refundAmount.toLocaleString(
                            "en-IN",
                          )} refunded
                        </p>
                      )}
                    </div>

                    {/* STATUS */}
                    <div>
                      <p className="text-xs tracking-[0.15em] text-gray-500">
                        STATUS
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isRefunded
                              ? "bg-black"
                              : order.orderStatus === "delivered"
                                ? "bg-black"
                                : "border border-black bg-white"
                          }`}
                        />

                        <p className="text-sm capitalize">
                          {displayStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* REFUND INFORMATION */}
                  {isRefunded && (
                    <div className="border-t border-black/10 px-6 py-5">
                      <div
                        className={`flex flex-col justify-between gap-3 sm:flex-row sm:items-center ${
                          isPartialRefund
                            ? "bg-gray-50"
                            : "bg-black text-white"
                        } px-4 py-4`}
                      >
                        <div>
                          <p
                            className={`text-xs font-medium tracking-[0.15em] ${
                              isPartialRefund
                                ? "text-black"
                                : "text-white"
                            }`}
                          >
                            {isPartialRefund
                              ? "PARTIAL REFUND"
                              : "REFUND PROCESSED"}
                          </p>

                          <p
                            className={`mt-2 text-sm ${
                              isPartialRefund
                                ? "text-gray-700"
                                : "text-gray-200"
                            }`}
                          >
                            ₹
                            {order.refundAmount.toLocaleString(
                              "en-IN",
                            )}{" "}
                            refunded
                          </p>
                        </div>

                        {isPartialRefund && (
                          <p className="text-xs text-gray-500">
                            Remaining order value: ₹
                            {(
                              order.totalAmount -
                              order.refundAmount
                            ).toLocaleString("en-IN")}
                          </p>
                        )}

                        {order.refundProcessedAt && (
                          <p
                            className={`text-xs ${
                              isPartialRefund
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {formatDate(order.refundProcessedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}