import Link from "next/link";
import { notFound } from "next/navigation";

import { getUserOrderById } from "@/app/actions/order";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getUserOrderById(id);

  if (!order) {
    notFound();
  }

  const paymentMethod =
    order.paymentMethod === "razorpay"
      ? "RAZORPAY"
      : "CASH ON DELIVERY";

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
      <section className="w-full max-w-xl text-center">
        <p className="text-xs tracking-[0.25em] text-neutral-500">
          CLOSET
        </p>

        <h1 className="mt-6 text-4xl font-light tracking-wide">
          ORDER CONFIRMED
        </h1>

        <p className="mt-6 text-sm leading-7 text-neutral-600">
          Thank you for your order. Your order has been successfully
          placed and will be processed shortly.
        </p>

        <div className="mt-8 border border-black/10 p-6">
          <p className="text-xs tracking-[0.15em] text-neutral-500">
            ORDER ID
          </p>

          <p className="mt-3 break-all text-sm">
            {order._id}
          </p>

          <p className="mt-5 text-xs text-neutral-500">
            PAYMENT METHOD: {paymentMethod}
          </p>

          <p className="mt-3 text-xs text-neutral-500">
            PAYMENT STATUS: {order.paymentStatus.toUpperCase()}
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/products"
            className="bg-black px-8 py-4 text-xs tracking-[0.18em] text-white"
          >
            CONTINUE SHOPPING
          </Link>

          <Link
            href="/orders"
            className="border border-black px-8 py-4 text-xs tracking-[0.18em]"
          >
            MY ORDERS
          </Link>
        </div>
      </section>
    </main>
  );
}