import Link from "next/link";

import { getAllOrders } from "@/app/actions/order";
import OrderStatusSelect from "./OrderStatusSelect";
import { getOrderDisplayStatus } from "./orderDisplayStatus";

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function OrdersPage() {
  const orders = await getAllOrders();

  const confirmedCount = orders.filter(
    (order: any) => order.orderStatus === "confirmed",
  ).length;

  const shippedCount = orders.filter(
    (order: any) =>
      order.orderStatus === "shipped" ||
      order.orderStatus === "out_for_delivery",
  ).length;

  const deliveredCount = orders.filter(
    (order: any) => order.orderStatus === "delivered",
  ).length;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Orders
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage customer orders, payments, delivery status, and returns.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Confirmed
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {confirmedCount}
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Shipped
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {shippedCount}
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Delivered
          </p>

          <p className="mt-3 text-3xl font-semibold text-slate-900">
            {deliveredCount}
          </p>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
                All Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {orders.length} total order
                {orders.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-slate-500">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Order
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Date
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Total
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Payment
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order: any) => (
                  <tr
                    key={order._id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    {/* ORDER */}
                    <td className="px-6 py-5">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="font-mono text-xs text-slate-900 underline-offset-4 hover:underline"
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>

                      {order.returns?.length > 0 && (
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-amber-600">
                          Return Requested
                        </p>
                      )}
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-900">
                        {order.shippingAddress?.name ||
                          order.user?.username ||
                          "Customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {order.shippingAddress?.email ||
                          order.user?.email ||
                          "—"}
                      </p>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-700">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>

                    {/* TOTAL */}
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-900">
                        ₹{order.totalAmount}
                      </p>
                    </td>

                    {/* PAYMENT */}
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-700">
                        {order.paymentMethod === "razorpay"
                          ? "Razorpay"
                          : "Cash on Delivery"}
                      </p>

                      <p
                        className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          order.paymentStatus === "paid"
                            ? "text-green-600"
                            : order.paymentStatus === "failed"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                      >
                        {formatStatus(order.paymentStatus)}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      {(() => {
                        const displayStatus = getOrderDisplayStatus(order);

                        if (displayStatus.type === "return") {
                          return (
                            <div className="border border-amber-300 bg-amber-50 px-6 py-4 text-center">
                              <span className="text-xs font-semibold tracking-[0.15em] text-amber-800">
                                {displayStatus.label}
                              </span>
                            </div>
                          );
                        }

                        if (displayStatus.type === "refund") {
                          return (
                            <div className="border border-emerald-300 bg-emerald-50 px-6 py-4 text-center">
                              <span className="text-xs font-semibold tracking-[0.15em] text-emerald-800">
                                {displayStatus.label}
                              </span>
                            </div>
                          );
                        }

                        if (displayStatus.type === "error") {
                          return (
                            <div className="border border-red-300 bg-red-50 px-6 py-4 text-center">
                              <span className="text-xs font-semibold tracking-[0.15em] text-red-800">
                                {displayStatus.label}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <OrderStatusSelect
                            orderId={order._id}
                            currentStatus={order.orderStatus}
                            paymentMethod={order.paymentMethod}
                            paymentStatus={order.paymentStatus}
                          />
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
