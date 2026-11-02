import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { House, ArrowLeft, Package } from "lucide-react";

import { getUser } from "@/app/actions/profile";
import { getUserOrderById } from "@/app/actions/order";
import ReturnRequestButton from "../../admin/orders/[id]/ReturnRequestButton";
import StoreName from "@/app/_components/StoreName";

const trackingSteps = [
  {
    key: "placed",
    label: "Order Placed",
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },
  {
    key: "shipped",
    label: "Shipped",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
  {
    key: "return_requested",
    label: "Return Requested",
  },
  {
    key: "refunded",
    label: "Refunded",
  },
];

const statusOrder = [
  "placed",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "return_requested",
  "refunded",
];

function getStatusIndex(status: string) {
  return statusOrder.indexOf(status);
}

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

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getUser();

  if (!user) {
    redirect(`/login?redirect=/orders/${id}`);
  }

  const order = await getUserOrderById(id);

  if (!order) {
    notFound();
  }

  const hasReturnRequest = order.returns?.some(
    (returnItem: any) =>
      returnItem.status === "requested" ||
      returnItem.status === "approved" ||
      returnItem.status === "received",
  );

  const currentStatusIndex = order.refundProcessed
    ? getStatusIndex("refunded")
    : hasReturnRequest
      ? getStatusIndex("return_requested")
      : getStatusIndex(order.orderStatus);

  const isPartialRefund =
    order.refundProcessed && order.refundAmount < order.totalAmount;

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="text-2xl font-bold tracking-[0.18em]">
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

            <Link href="/wishlist" className="hidden hover:opacity-50 sm:block">
              WISHLIST
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10">
        {/* BACK */}
        <Link
          href="/orders"
          className="mb-10 inline-flex items-center gap-2 text-xs tracking-[0.15em] text-gray-600 hover:text-black"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          MY ORDERS
        </Link>

        {/* ORDER HEADER */}
        <div className="flex flex-col justify-between gap-6 border-b border-black pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.2em] text-gray-500">
              ORDER DETAILS
            </p>

            <h1 className="mt-3 font-mono text-2xl tracking-tight">
              #{order._id.toUpperCase()}
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs tracking-[0.15em] text-gray-500">
              ORDER STATUS
            </p>

            <p className="mt-2 text-sm">
              {order.refundProcessed
                ? isPartialRefund
                  ? "Partially Refunded"
                  : "Refunded"
                : formatStatus(order.orderStatus)}
            </p>
          </div>
        </div>

        {/* TRACKING */}
        <section className="mt-12 border border-black/10 p-8">
          <div className="mb-10 flex items-center gap-3">
            <Package size={19} strokeWidth={1.5} />

            <h2 className="text-sm font-medium tracking-[0.15em]">
              ORDER TRACKING
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-0 right-0 top-3 hidden h-px bg-gray-200 md:block" />

            <div className="grid gap-8 md:grid-cols-7">
              {trackingSteps.map((step, index) => {
                const completed =
                  currentStatusIndex >= index && currentStatusIndex !== -1;

                return (
                  <div
                    key={step.key}
                    className="relative flex items-center gap-4 md:block md:text-center"
                  >
                    <div
                      className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        index === currentStatusIndex
                          ? "h-8 w-8 bg-black ring-4 ring-black/10"
                          : index < currentStatusIndex
                            ? "border-2 border-black bg-black"
                            : "border-2 border-gray-300 bg-white"
                      }`}
                    >
                      {index === currentStatusIndex ? (
                        <svg
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M5 10.5l3 3 7-7" />
                        </svg>
                      ) : index < currentStatusIndex ? (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </div>

                    <div className="md:mt-4">
                      <p
                        className={`text-xs tracking-[0.08em] ${
                          index === currentStatusIndex
                            ? "font-bold text-black"
                            : completed
                              ? "font-normal text-black"
                              : "font-normal text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="mt-12">
          <h2 className="mb-6 text-sm font-medium tracking-[0.15em]">
            ORDERED ITEMS
          </h2>

          <div className="border-t border-black/10">
            {order.items.map((item: any) => {
              const returnRequest = order.returns?.find(
                (returnItem: any) =>
                  returnItem.product?.toString() === item.product?.toString(),
              );

              return (
                <div
                  key={item.product}
                  className="border-b border-black/10 py-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>

                      <p className="mt-2 text-sm">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        Quantity: {item.quantity}
                      </p>

                      {item.size && (
                        <p className="mt-1 text-xs text-gray-500">
                          Size: {item.size}
                        </p>
                      )}

                      {item.color && (
                        <p className="mt-1 text-xs text-gray-500">
                          Color: {item.color}
                        </p>
                      )}
                    </div>

                    {/* RETURN */}
                    {order.orderStatus === "delivered" && !returnRequest && (
                      <div>
                        <ReturnRequestButton
                          orderId={order._id}
                          productId={item.product}
                          maxQuantity={item.quantity}
                        />
                      </div>
                    )}
                  </div>

                  {/* RETURN / REFUND STATUS */}
                  {order.refundProcessed ? (
                    <div className="mt-5 border-t border-black/10 pt-5">
                      <div className="border border-black bg-black px-5 py-5 text-white">
                        <p className="text-xs font-medium tracking-[0.15em]">
                          {isPartialRefund
                            ? "PARTIAL REFUND PROCESSED"
                            : "REFUND PROCESSED"}
                        </p>

                        <p className="mt-3 text-sm">
                          ₹
                          {order.refundAmount.toLocaleString("en-IN")} has been
                          refunded successfully.
                        </p>

                        {isPartialRefund && (
                          <p className="mt-2 text-xs text-gray-300">
                            Remaining order value: ₹
                            {(
                              order.totalAmount - order.refundAmount
                            ).toLocaleString("en-IN")}
                          </p>
                        )}

                        {order.refundProcessedAt && (
                          <p className="mt-2 text-xs text-gray-300">
                            Processed on{" "}
                            {new Date(
                              order.refundProcessedAt,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    returnRequest && (
                      <div className="mt-5 border-t border-black/10 pt-4">
                        <p className="text-xs tracking-[0.12em] text-gray-500">
                          RETURN STATUS
                        </p>

                        <p className="mt-2 text-sm capitalize">
                          {formatStatus(returnRequest.status)}
                        </p>

                        {returnRequest.reason && (
                          <p className="mt-2 text-xs text-gray-500">
                            Reason: {returnRequest.reason}
                          </p>
                        )}

                        {returnRequest.refundStatus !== "not_required" && (
                          <p className="mt-2 text-xs text-gray-500">
                            Refund: {formatStatus(returnRequest.refundStatus)}
                          </p>
                        )}

                        {returnRequest.refundStatus === "processed" &&
                          returnRequest.refundAmount > 0 && (
                            <p className="mt-2 text-sm font-medium">
                              Refund Amount: ₹
                              {returnRequest.refundAmount.toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          )}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* LOWER INFORMATION */}
        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {/* SHIPPING */}
          <section>
            <h2 className="mb-6 text-sm font-medium tracking-[0.15em]">
              SHIPPING ADDRESS
            </h2>

            <div className="border-t border-black/10 pt-6 text-sm leading-7">
              <p className="font-medium">{order.shippingAddress.name}</p>

              <p className="text-gray-600">{order.shippingAddress.address}</p>

              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>

              <p className="text-gray-600">
                {order.shippingAddress.pincode}
              </p>

              <div className="mt-5 border-t border-black/10 pt-5 text-xs leading-6 text-gray-500">
                <p>{order.shippingAddress.email}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </div>
          </section>

          {/* PAYMENT */}
          <section>
            <h2 className="mb-6 text-sm font-medium tracking-[0.15em]">
              PAYMENT
            </h2>

            <div className="border-t border-black/10 pt-6">
              <div className="flex justify-between border-b border-black/10 py-4">
                <span className="text-xs tracking-[0.1em] text-gray-500">
                  METHOD
                </span>

                <span className="text-sm capitalize">
                  {order.paymentMethod === "razorpay"
                    ? "Razorpay"
                    : "Cash on Delivery"}
                </span>
              </div>

              <div className="flex justify-between border-b border-black/10 py-4">
                <span className="text-xs tracking-[0.1em] text-gray-500">
                  PAYMENT STATUS
                </span>

                <span className="text-sm">
                  {order.paymentStatus === "refunded"
                    ? isPartialRefund
                      ? "Partially Refunded"
                      : "Refunded"
                    : formatStatus(order.paymentStatus)}
                </span>
              </div>

              {order.paymentMethod === "razorpay" &&
                order.razorpayPaymentId && (
                  <div className="flex justify-between gap-6 py-4">
                    <span className="text-xs tracking-[0.1em] text-gray-500">
                      PAYMENT ID
                    </span>

                    <span className="max-w-[60%] break-all text-right font-mono text-xs">
                      {order.razorpayPaymentId}
                    </span>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* ORDER SUMMARY */}
        <section className="ml-auto mt-12 w-full border-t border-black pt-8 lg:w-[420px]">
          <h2 className="mb-6 text-sm font-medium tracking-[0.15em]">
            ORDER SUMMARY
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>

              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>

              <span>
                {order.deliveryCharge === 0
                  ? "FREE"
                  : `₹${order.deliveryCharge.toLocaleString("en-IN")}`}
              </span>
            </div>

            <div className="flex justify-between border-t border-black/10 pt-5 text-base font-medium">
              <span>TOTAL</span>

              <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="mt-16 flex flex-col justify-center gap-4 border-t border-black/10 pt-10 sm:flex-row">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center border border-black px-8 py-4 text-xs tracking-[0.18em] transition hover:bg-black hover:text-white"
          >
            MY ORDERS
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-black px-8 py-4 text-xs tracking-[0.18em] text-white transition hover:bg-gray-800"
          >
            CONTINUE SHOPPING
          </Link>

          <Link
            href="/"
            aria-label="Home"
            title="Home"
            className="inline-flex items-center justify-center border border-black px-5 py-4 transition hover:bg-black hover:text-white"
          >
            <House size={17} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </main>
  );
}
