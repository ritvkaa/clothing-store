import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrderById } from "@/app/actions/order";

import OrderStatusSelect from "../OrderStatusSelect";
import ReturnActions from "./ReturnActions";
import { getOrderDisplayStatus } from "../orderDisplayStatus";

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* =========================
          HEADER
      ========================= */}

      <div>
        <Link
          href="/admin/orders"
          className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900"
        >
          ← Back to Orders
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              ORDER DETAILS
            </p>

            <p className="mt-2 font-mono text-sm text-slate-900">
              #{order._id.slice(-8).toUpperCase()}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

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
        </div>
      </div>

      {/* =========================
          STATUS / PAYMENT
      ========================= */}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Order Status
          </p>

          <p className="mt-3 text-lg font-medium text-slate-900">
            {formatStatus(order.orderStatus)}
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Payment
          </p>

          <p className="mt-3 text-lg font-medium text-slate-900">
            {order.paymentMethod === "razorpay"
              ? "Razorpay"
              : "Cash on Delivery"}
          </p>

          <p
            className={`mt-1 text-sm ${
              order.paymentStatus === "paid"
                ? "text-green-600"
                : order.paymentStatus === "failed"
                  ? "text-red-600"
                  : "text-amber-600"
            }`}
          >
            {formatStatus(order.paymentStatus)}
          </p>
        </div>
      </div>

      {/* =========================
          CUSTOMER + SHIPPING
      ========================= */}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
              Customer
            </h2>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Name
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {order.shippingAddress?.name}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {order.shippingAddress?.email}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-slate-900">
                {order.shippingAddress?.phone}
              </p>
            </div>

            {order.user && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  Username
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {order.user.username}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
              Shipping Address
            </h2>
          </div>

          <div className="p-6">
            <p className="text-sm leading-7 text-slate-700">
              {order.shippingAddress?.address}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
              <br />
              Pincode: {order.shippingAddress?.pincode}
            </p>
          </div>
        </section>
      </div>

      {/* =========================
          ORDERED ITEMS
      ========================= */}

      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
            Ordered Items
          </h2>
        </div>

        <div>
          {order.items.map((item: any, index: number) => (
            <div
              key={`${item.product}-${index}`}
              className="flex gap-5 border-b border-slate-100 px-6 py-6 last:border-b-0"
            >
              <div className="h-28 w-24 shrink-0 overflow-hidden bg-slate-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                    NO IMAGE
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                  {item.brand}
                </p>

                <h3 className="mt-2 text-sm font-medium text-slate-900">
                  {item.name}
                </h3>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                  <span>Quantity: {item.quantity}</span>

                  {item.size && <span>Size: {item.size}</span>}

                  {item.color && <span>Color: {item.color}</span>}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  ₹{item.price * item.quantity}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================
          ORDER SUMMARY
      ========================= */}

      <div className="flex justify-end">
        <section className="w-full border border-slate-200 bg-white md:w-[420px]">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
              Order Summary
            </h2>
          </div>

          <div className="space-y-4 p-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>

              <span className="text-slate-900">₹{order.subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Delivery</span>

              <span className="text-slate-900">
                {order.deliveryCharge === 0
                  ? "FREE"
                  : `₹${order.deliveryCharge}`}
              </span>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </section>
      </div>

      {/* =========================
          RAZORPAY DETAILS
      ========================= */}

      {order.paymentMethod === "razorpay" && (
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
              Razorpay Details
            </h2>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Razorpay Order ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-slate-700">
                {order.razorpayOrderId || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Payment ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-slate-700">
                {order.razorpayPaymentId || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Signature
              </p>

              <p className="mt-2 break-all font-mono text-xs text-slate-700">
                {order.razorpaySignature || "Not available"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =========================
          RETURN REQUESTS
      ========================= */}

      {order.returns?.length > 0 && (
        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-900">
              Return Requests
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {order.returns.map((returnRequest: any) => {
              const orderItem = order.items.find(
                (item: any) =>
                  item.product?.toString() ===
                  returnRequest.product?.toString(),
              );

              return (
                <div key={returnRequest._id} className="space-y-5 p-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Product
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {orderItem?.name || "Product"}
                    </p>

                    {orderItem?.brand && (
                      <p className="mt-1 text-xs text-slate-500">
                        {orderItem.brand}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Quantity
                      </p>
                      <p className="mt-1 text-sm text-slate-900">
                        {returnRequest.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Size
                      </p>
                      <p className="mt-1 text-sm text-slate-900">
                        {returnRequest.size || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Color
                      </p>
                      <p className="mt-1 text-sm text-slate-900">
                        {returnRequest.color || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Status
                      </p>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          returnRequest.status === "approved"
                            ? "text-green-600"
                            : returnRequest.status === "rejected"
                              ? "text-red-600"
                              : "text-amber-600"
                        }`}
                      >
                        {returnRequest.status}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Return Reason
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      {returnRequest.reason}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Refund
                    </p>

                    <p className="mt-1 text-sm text-slate-700">
                      Status:{" "}
                      <span className="font-medium capitalize">
                        {returnRequest.refundStatus?.replace("_", " ") ||
                          "Not required"}
                      </span>
                    </p>

                    {returnRequest.refundAmount > 0 && (
                      <p className="mt-1 text-sm text-slate-700">
                        Amount: ₹{returnRequest.refundAmount}
                      </p>
                    )}
                  </div>

                  {returnRequest.adminResponse && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Admin Response
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {returnRequest.adminResponse}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-5">
                    <ReturnActions
                      orderId={order._id}
                      returnId={returnRequest._id}
                      status={returnRequest.status}
                      refundStatus={returnRequest.refundStatus}
                      paymentMethod={order.paymentMethod}
                      paymentStatus={order.paymentStatus}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
