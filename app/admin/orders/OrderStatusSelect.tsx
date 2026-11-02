"use client";

import { useState } from "react";

import {
  cancelOrder,
  updateOrderStatus,
} from "@/app/actions/order";

type Status =
  | "placed"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export default function OrderStatusSelect({
  orderId,
  currentStatus,
  paymentMethod,
  paymentStatus,
}: {
  orderId: string;
  currentStatus: Status;
  paymentMethod?: "razorpay" | "cod";
  paymentStatus?: "pending" | "paid" | "failed";
}) {
  const [loading, setLoading] =
    useState(false);

  const handleUpdate = async (
    status:
      | "confirmed"
      | "shipped"
      | "out_for_delivery"
      | "delivered",
  ) => {
    setLoading(true);

    const result =
      await updateOrderStatus(
        orderId,
        status,
      );

    setLoading(false);

    if (!result.success) {
      alert(result.message);
    }
  };

  const handleCancel = async () => {
    const isRefund =
      paymentMethod === "razorpay" &&
      paymentStatus === "paid";

    const message = isRefund
      ? "Cancel this order and issue a full Razorpay refund?"
      : "Cancel this order?";

    if (!window.confirm(message)) {
      return;
    }

    setLoading(true);

    const result = await cancelOrder(
      orderId,
      "Cancelled by admin",
    );

    setLoading(false);

    if (!result.success) {
      alert(result.message);
    }
  };

  /* =========================
     CANCELLED
  ========================= */

  if (currentStatus === "cancelled") {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">
        Order Cancelled
      </div>
    );
  }

  /* =========================
     PLACED
  ========================= */

  if (currentStatus === "placed") {
    const isRefund =
      paymentMethod === "razorpay" &&
      paymentStatus === "paid";

    return (
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            handleUpdate("confirmed")
          }
          className="border border-black bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : "Confirm Order"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleCancel}
          className="border border-red-300 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : isRefund
              ? "Cancel & Issue Refund"
              : "Cancel Order"}
        </button>
      </div>
    );
  }

  /* =========================
     CONFIRMED
  ========================= */

  if (currentStatus === "confirmed") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          handleUpdate("shipped")
        }
        className="border border-black bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : "Ship Order"}
      </button>
    );
  }

  /* =========================
     SHIPPED
  ========================= */

  if (currentStatus === "shipped") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          handleUpdate(
            "out_for_delivery",
          )
        }
        className="border border-black bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : "Out for Delivery"}
      </button>
    );
  }

  /* =========================
     OUT FOR DELIVERY
  ========================= */

  if (
    currentStatus ===
    "out_for_delivery"
  ) {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() =>
          handleUpdate("delivered")
        }
        className="border border-black bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Processing..."
          : "Mark Delivered"}
      </button>
    );
  }

  /* =========================
     DELIVERED
  ========================= */

  return (
    <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
      Order Delivered
    </div>
  );
}