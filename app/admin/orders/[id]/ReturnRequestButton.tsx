"use client";

import { useState } from "react";
import { requestReturn } from "@/app/actions/return";

const reasons = [
  "Wrong size",
  "Wrong product received",
  "Product damaged",
  "Product defective",
  "Product does not match description",
  "Other",
];

export default function ReturnRequestButton({
  orderId,
  productId,
  maxQuantity,
}: {
  orderId: string;
  productId: string;
  maxQuantity: number;
}) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!reason) {
      setMessage("Please select a reason.");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await requestReturn(
      orderId,
      productId,
      quantity,
      reason,
    );

    setLoading(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setMessage(result.message);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-black px-5 py-3 text-xs tracking-[0.15em] transition hover:bg-black hover:text-white"
      >
        REQUEST RETURN
      </button>
    );
  }

  return (
    <div className="mt-4 border border-black/10 p-5">
      <p className="text-xs font-medium tracking-[0.15em]">
        REQUEST RETURN
      </p>

      <div className="mt-4">
        <label className="text-xs text-neutral-500">
          QUANTITY
        </label>

        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-2 block border border-black/20 bg-white px-3 py-2 text-sm outline-none"
        >
          {Array.from({ length: maxQuantity }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="text-xs text-neutral-500">
          REASON
        </label>

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2 block w-full border border-black/20 bg-white px-3 py-3 text-sm outline-none"
        >
          <option value="">Select a reason</option>

          {reasons.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className="mt-4 text-xs text-neutral-600">
          {message}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black px-5 py-3 text-xs tracking-[0.15em] text-white disabled:opacity-50"
        >
          {loading ? "SUBMITTING..." : "SUBMIT REQUEST"}
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={loading}
          className="border border-black px-5 py-3 text-xs tracking-[0.15em]"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}