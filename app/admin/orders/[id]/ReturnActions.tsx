"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  processReturnRefund,
  updateReturnStatus,
} from "@/app/actions/order";

type ActionType = "approved" | "rejected" | "refund" | null;

export default function ReturnActions({
  orderId,
  returnId,
  status,
  refundStatus,
  paymentMethod,
  paymentStatus,
}: {
  orderId: string;
  returnId: string;
  status: string;
  refundStatus: string;
  paymentMethod: string;
  paymentStatus: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<ActionType>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openConfirmation = (selectedAction: ActionType) => {
    setError("");
    setMessage("");
    setAction(selectedAction);
  };

  const closeConfirmation = () => {
    if (!loading) {
      setAction(null);
    }
  };

  const handleAction = async () => {
    if (!action) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      let result;

      if (action === "approved" || action === "rejected") {
        result = await updateReturnStatus(
          orderId,
          returnId,
          action
        );
      } else {
        result = await processReturnRefund(
          orderId,
          returnId
        );
      }

      if (!result.success) {
        setError(result.message);
        setAction(null);
        return;
      }

      setAction(null);

      if (action === "approved") {
        setMessage(
          "Return approved. Refund is now pending."
        );
      } else if (action === "rejected") {
        setMessage("Return request rejected.");
      } else {
        setMessage("Refund processed successfully.");
      }

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );

      setAction(null);
    } finally {
      setLoading(false);
    }
  };

  /*
   * RETURN REQUESTED
   */
  if (status === "requested") {
    return (
      <div className="mt-6">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => openConfirmation("approved")}
            disabled={loading}
            className="bg-black px-7 py-4 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            APPROVE RETURN
          </button>

          <button
            type="button"
            onClick={() => openConfirmation("rejected")}
            disabled={loading}
            className="border border-black bg-white px-7 py-4 text-xs font-semibold tracking-[0.18em] text-black transition hover:bg-slate-50 disabled:opacity-50"
          >
            REJECT RETURN
          </button>
        </div>

        {action && (
          <ConfirmationBox
            action={action}
            loading={loading}
            onCancel={closeConfirmation}
            onConfirm={handleAction}
          />
        )}

        {error && <ErrorBox message={error} />}
      </div>
    );
  }

  /*
   * RETURN APPROVED + REFUND PENDING
   */
  if (
    status === "approved" &&
    refundStatus === "pending"
  ) {
    if (
      paymentMethod !== "razorpay" ||
      paymentStatus !== "paid"
    ) {
      return (
        <div className="mt-6 border border-slate-300 bg-slate-50 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.15em] text-slate-700">
            RETURN APPROVED
          </p>

          <p className="mt-2 text-sm text-slate-600">
            No Razorpay refund is required for this order.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.15em] text-amber-800">
            REFUND PENDING
          </p>

          <p className="mt-2 text-sm text-amber-700">
            The return has been approved. Process the
            Razorpay refund to complete this return.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openConfirmation("refund")}
          disabled={loading}
          className="mt-4 bg-black px-7 py-4 text-xs font-semibold tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          PROCESS REFUND
        </button>

        {action && (
          <ConfirmationBox
            action={action}
            loading={loading}
            onCancel={closeConfirmation}
            onConfirm={handleAction}
          />
        )}

        {error && <ErrorBox message={error} />}
      </div>
    );
  }

  /*
   * REFUND PROCESSED
   */
  if (
    status === "approved" &&
    refundStatus === "processed"
  ) {
    return (
      <div className="mt-6 border border-emerald-300 bg-emerald-50 px-5 py-4">
        <p className="text-xs font-semibold tracking-[0.15em] text-emerald-800">
          REFUND PROCESSED
        </p>

        <p className="mt-2 text-sm text-emerald-700">
          The refund has been successfully processed.
        </p>
      </div>
    );
  }

  /*
   * REFUND FAILED
   */
  if (
    status === "approved" &&
    refundStatus === "failed"
  ) {
    return (
      <div className="mt-6">
        <div className="border border-red-300 bg-red-50 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.15em] text-red-800">
            REFUND FAILED
          </p>

          <p className="mt-2 text-sm text-red-700">
            The refund could not be processed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openConfirmation("refund")}
          disabled={loading}
          className="mt-4 border border-red-600 px-7 py-4 text-xs font-semibold tracking-[0.18em] text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          RETRY REFUND
        </button>

        {action && (
          <ConfirmationBox
            action={action}
            loading={loading}
            onCancel={closeConfirmation}
            onConfirm={handleAction}
          />
        )}

        {error && <ErrorBox message={error} />}
      </div>
    );
  }

  /*
   * RETURN REJECTED
   */
  if (status === "rejected") {
    return (
      <div className="mt-6 border border-red-300 bg-red-50 px-5 py-4">
        <p className="text-xs font-semibold tracking-[0.15em] text-red-800">
          RETURN REJECTED
        </p>

        <p className="mt-2 text-sm text-red-700">
          This return request has been rejected.
        </p>
      </div>
    );
  }

  return null;
}


/* ---------------------------------------------
   CONFIRMATION BOX
--------------------------------------------- */

function ConfirmationBox({
  action,
  loading,
  onCancel,
  onConfirm,
}: {
  action: ActionType;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  let title = "";
  let description = "";
  let confirmText = "";

  if (action === "approved") {
    title = "Approve this return?";
    description =
      "The return will be approved and the refund will move to pending status.";
    confirmText = "YES, APPROVE RETURN";
  }

  if (action === "rejected") {
    title = "Reject this return?";
    description =
      "The customer will not receive a refund for this return request.";
    confirmText = "YES, REJECT RETURN";
  }

  if (action === "refund") {
    title = "Process this refund?";
    description =
      "This will send the refund through Razorpay. This action should only be performed once the return is approved.";
    confirmText = "YES, PROCESS REFUND";
  }

  return (
    <div className="mt-5 border border-slate-300 bg-white p-5">
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-900">
        {title}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="bg-black px-5 py-3 text-xs font-semibold tracking-[0.15em] text-white disabled:opacity-50"
        >
          {loading ? "PROCESSING..." : confirmText}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="border border-slate-300 px-5 py-3 text-xs font-semibold tracking-[0.15em] text-slate-700 disabled:opacity-50"
        >
          GO BACK
        </button>
      </div>
    </div>
  );
}


/* ---------------------------------------------
   ERROR BOX
--------------------------------------------- */

function ErrorBox({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-5 border border-red-300 bg-red-50 px-5 py-4">
      <p className="text-xs font-semibold tracking-[0.15em] text-red-800">
        ACTION FAILED
      </p>

      <p className="mt-2 text-sm text-red-700">
        {message}
      </p>
    </div>
  );
}