"use server";

import { revalidatePath } from "next/cache";

import mongoose from "mongoose";
import Razorpay from "razorpay";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getCustomerUserId } from "@/lib/customer-auth";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

/* =========================
   ADMIN AUTH
========================= */

/* =========================
   GET ONE ORDER
========================= */

export async function getOrderById(orderId: string) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return null;
  }

  await connectDB();

  const order = await Order.findById(orderId)
    .populate("user", "username email")
    .lean();

  if (!order) {
    return null;
  }

  return JSON.parse(JSON.stringify(order));
}

/* =========================
   GET ALL ORDERS
========================= */

export async function getAllOrders() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("Unauthorized: Admin user not found");
  }

  await connectDB();

  const orders = await Order.find()
    .populate("user", "username email")
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(orders));
}

/* =========================
   UPDATE ORDER STATUS
========================= */

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return {
      success: false,
      message: "Invalid order",
    };
  }

  if (!ORDER_STATUSES.includes(status)) {
    return {
      success: false,
      message: "Invalid order status",
    };
  }

  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  if (order.orderStatus === "cancelled") {
    return {
      success: false,
      message: "Cancelled orders cannot be updated",
    };
  }

  /* PLACED → CONFIRMED */

  if (status === "confirmed") {
    if (order.orderStatus !== "placed") {
      return {
        success: false,
        message: "Only placed orders can be confirmed",
      };
    }
  }

  /* CONFIRMED → SHIPPED */

  if (status === "shipped") {
    if (order.orderStatus !== "confirmed") {
      return {
        success: false,
        message: "Order must be confirmed first",
      };
    }
  }

  /* SHIPPED → OUT FOR DELIVERY */

  if (status === "out_for_delivery") {
    if (order.orderStatus !== "shipped") {
      return {
        success: false,
        message: "Order must be shipped first",
      };
    }
  }

  /* OUT FOR DELIVERY → DELIVERED */

  if (status === "delivered") {
    if (order.orderStatus !== "out_for_delivery") {
      return {
        success: false,
        message: "Order must be out for delivery first",
      };
    }
  }

  /* CANCEL IS SEPARATE */

  if (status === "cancelled") {
    return {
      success: false,
      message: "Use the Cancel Order action instead",
    };
  }

  order.orderStatus = status;

  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return {
    success: true,
    message: "Order status updated",
  };
}

/* =========================
   CANCEL ORDER
   PLACED ONLY
========================= */

export async function cancelOrder(orderId: string, reason: string = "") {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return {
      success: false,
      message: "Invalid order",
    };
  }

  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  /* ONLY PLACED ORDERS */

  if (order.orderStatus !== "placed") {
    return {
      success: false,
      message: "Only placed orders can be cancelled",
    };
  }

  /* =========================
     RAZORPAY + PAID
     CANCEL + REFUND
  ========================= */

  if (order.paymentMethod === "razorpay" && order.paymentStatus === "paid") {
    if (!order.razorpayPaymentId) {
      return {
        success: false,
        message: "Razorpay payment ID is missing",
      };
    }

    try {
      const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.totalAmount * 100),
      });

      order.orderStatus = "cancelled";

      order.cancellationReason = reason.trim();

      order.cancelledAt = new Date();

      order.cancellationRefundStatus = "processed";

      order.cancellationRefundAmount = order.totalAmount;

      order.cancellationRazorpayRefundId = refund.id;

      await order.save();

      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath(`/orders/${orderId}`);
      revalidatePath("/orders");

      return {
        success: true,
        message: "Order cancelled and refund processed successfully",
      };
    } catch (error) {
      console.error("CANCELLATION REFUND ERROR:", error);

      order.cancellationRefundStatus = "failed";

      await order.save();

      revalidatePath(`/admin/orders/${orderId}`);

      return {
        success: false,
        message: "Refund failed. Order was not cancelled.",
      };
    }
  }

  /* =========================
     COD / UNPAID
     CANCEL WITHOUT REFUND
  ========================= */

  order.orderStatus = "cancelled";

  order.cancellationReason = reason.trim();

  order.cancelledAt = new Date();

  order.cancellationRefundStatus = "not_required";

  order.cancellationRefundAmount = 0;

  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return {
    success: true,
    message: "Order cancelled successfully",
  };
}

/* =========================
   USER ORDER
========================= */

export async function getUserOrderById(orderId: string) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return null;
  }

  await connectDB();

  const order = await Order.findOne({
    _id: new mongoose.Types.ObjectId(orderId),
    user: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!order) {
    return null;
  }

  return JSON.parse(JSON.stringify(order));
}

/* =========================
   USER ORDERS
========================= */

export async function getUserOrders() {
  const userId = await getCustomerUserId();

  if (!userId) {
    return [];
  }

  await connectDB();

  const orders = await Order.find({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(orders));
}
/* =========================
   PROCESS RETURN REFUND
========================= */
export async function processReturnRefund(orderId: string, returnId: string) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(returnId)
  ) {
    return {
      success: false,
      message: "Invalid order or return request",
    };
  }

  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  /*
   * =====================================================
   * PERMANENT REFUND CHECK
   * =====================================================
   *
   * Once refundProcessed is true, this order has already
   * been successfully refunded.
   *
   * Even if the return record is deleted or modified,
   * we NEVER call Razorpay again.
   */

  if (order.refundProcessed === true) {
    return {
      success: true,
      message: "This order has already been refunded.",
    };
  }

  /*
   * =====================================================
   * PAYMENT METHOD
   * =====================================================
   */

  if (order.paymentMethod !== "razorpay") {
    return {
      success: false,
      message: "This order was not paid through Razorpay",
    };
  }

  /*
   * =====================================================
   * PAYMENT STATUS
   * =====================================================
   */

  if (order.paymentStatus !== "paid") {
    return {
      success: false,
      message: "Order payment has not been completed",
    };
  }

  /*
   * =====================================================
   * RAZORPAY PAYMENT ID
   * =====================================================
   */

  if (!order.razorpayPaymentId) {
    return {
      success: false,
      message: "Razorpay payment ID is missing",
    };
  }

  /*
   * =====================================================
   * FIND RETURN REQUEST
   * =====================================================
   */

  const returnRequest = ((order.returns || []) as any[]).find(
    (item: any) => item._id?.toString() === returnId,
  );

  if (!returnRequest) {
    return {
      success: false,
      message: "Return request not found",
    };
  }

  /*
   * =====================================================
   * RETURN MUST BE APPROVED
   * =====================================================
   */

  if (returnRequest.status !== "approved") {
    return {
      success: false,
      message: "Return must be approved before refunding",
    };
  }

  /*
   * =====================================================
   * REFUND STATUS
   *
   * Allow retry when status is "failed".
   * Do not allow another refund after "processed".
   * =====================================================
   */

  if (
    returnRequest.refundStatus !== "pending" &&
    returnRequest.refundStatus !== "failed"
  ) {
    return {
      success: false,
      message: "This refund has already been processed.",
    };
  }

  /*
   * =====================================================
   * REFUND AMOUNT
   * =====================================================
   */

  const refundAmount = Number(returnRequest.refundAmount);

  if (!refundAmount || refundAmount <= 0) {
    return {
      success: false,
      message: "Invalid refund amount",
    };
  }

  /*
   * =====================================================
   * RAZORPAY REFUND
   * =====================================================
   */

  try {
  // Get the actual Razorpay payment information first.
  const payment = await razorpay.payments.fetch(
    order.razorpayPaymentId,
  );

  const paymentAmount = Number(payment.amount || 0);
  const alreadyRefunded = Number(
    payment.amount_refunded || 0,
  );

  const remainingRefundable =
    paymentAmount - alreadyRefunded;

  const requestedRefund =
    Math.round(
      Number(returnRequest.refundAmount) * 100,
    );

  console.log("========== REFUND DEBUG ==========");
  console.log("Payment ID:", payment.id);
  console.log(
    "Razorpay payment amount:",
    paymentAmount / 100,
  );
  console.log(
    "Already refunded:",
    alreadyRefunded / 100,
  );
  console.log(
    "Remaining refundable:",
    remainingRefundable / 100,
  );
  console.log(
    "Requested refund:",
    requestedRefund / 100,
  );
  console.log(
    "Payment status:",
    payment.status,
  );
  console.log("===================================");

  // Prevent Razorpay from receiving an impossible refund request.
  if (requestedRefund > remainingRefundable) {
    returnRequest.refundStatus = "failed";
    await order.save();

    return {
      success: false,
      message:
        `Only ₹${(remainingRefundable / 100).toFixed(2)} remains ` +
        `refundable from this Razorpay payment. ` +
        `₹${(requestedRefund / 100).toFixed(2)} was requested.`,
    };
  }

  const refund =
    await razorpay.payments.refund(
      order.razorpayPaymentId,
      {
        amount: requestedRefund,
      },
    );

  const refundDate = new Date();

  // Return-level record
  returnRequest.refundStatus = "processed";
  returnRequest.razorpayRefundId = refund.id;
  returnRequest.refundedAt = refundDate;

  // Permanent order-level record
  order.refundProcessed = true;
  order.refundProcessedAt = refundDate;
  order.refundAmount =
    Number(returnRequest.refundAmount);
  order.razorpayRefundId = refund.id;

  // IMPORTANT:
  // Only use this if your Order schema allows "refunded".
  order.paymentStatus = "refunded";

  await order.save();

  revalidatePath(
    `/admin/orders/${orderId}`,
  );
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return {
    success: true,
    message: "Refund processed successfully",
  };

} catch (error: any) {
  console.error("REFUND ERROR:", error);

  returnRequest.refundStatus = "failed";

  await order.save();

  revalidatePath(
    `/admin/orders/${orderId}`,
  );
  revalidatePath("/admin/orders");

  return {
    success: false,
    message:
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Refund failed. Please try again.",
  };
}

}

export async function updateReturnStatus(
  orderId: string,
  returnId: string,
  status: "approved" | "rejected",
  adminResponse: string = "",
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(orderId) ||
    !mongoose.Types.ObjectId.isValid(returnId)
  ) {
    return {
      success: false,
      message: "Invalid order or return request",
    };
  }

  await connectDB();

  const order = await Order.findById(orderId);

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  const returnRequest = (order.returns as any[]).find(
    (item: any) => item._id?.toString() === returnId,
  );

  if (!returnRequest) {
    return {
      success: false,
      message: "Return request not found",
    };
  }

  if (returnRequest.status !== "requested") {
    return {
      success: false,
      message: "This return request has already been processed",
    };
  }

  returnRequest.status = status;

  returnRequest.adminResponse = adminResponse.trim();

  if (status === "approved") {
    returnRequest.refundStatus = "pending";

    returnRequest.approvedAt = new Date();

    const orderItem = (order.items as any[]).find(
      (item: any) =>
        item.product?.toString() === returnRequest.product?.toString(),
    );

    if (orderItem) {
      returnRequest.refundAmount =
        Number(orderItem.price) * Number(returnRequest.quantity);
    }
  }

  if (status === "rejected") {
    returnRequest.refundStatus = "not_required";
  }

  await order.save();

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return {
    success: true,
    message:
      status === "approved"
        ? "Return approved. Refund is now pending."
        : "Return request rejected.",
  };
}
