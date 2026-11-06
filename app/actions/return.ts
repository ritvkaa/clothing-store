"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { getCustomerUserId } from "@/lib/customer-auth";

export async function requestReturn(
  orderId: string,
  productId: string,
  quantity: number,
  reason: string,
) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login to request a return",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return {
      success: false,
      message: "Invalid order",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return {
      success: false,
      message: "Invalid product",
    };
  }

  if (!reason.trim()) {
    return {
      success: false,
      message: "Please select a return reason",
    };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return {
      success: false,
      message: "Invalid quantity",
    };
  }

  await connectDB();

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  if (order.orderStatus !== "delivered") {
    return {
      success: false,
      message: "Returns can only be requested for delivered orders",
    };
  }

  const orderItem = order.items.find(
    (item: any) => item.product.toString() === productId,
  );

  if (!orderItem) {
    return {
      success: false,
      message: "Product was not part of this order",
    };
  }

  if (quantity > orderItem.quantity) {
    return {
      success: false,
      message: "Return quantity cannot exceed purchased quantity",
    };
  }

  // Older orders may not have a returns array yet.
  if (!order.returns) {
    order.returns = [];
  }

  const existingReturn = order.returns.find(
    (item: any) =>
      item.product.toString() === productId &&
      item.status !== "rejected",
  );

  if (existingReturn) {
    return {
      success: false,
      message: "A return request already exists for this product",
    };
  }

  order.returns.push({
    product: orderItem.product,
    quantity,
    size: orderItem.size,
    color: orderItem.color,
    reason: reason.trim(),
    status: "requested",
    refundStatus: "not_required",
    refundAmount: 0,
    razorpayRefundId: "",
    adminResponse: "",
    requestedAt: new Date(),
    approvedAt: null,
    refundedAt: null,
  });

  await order.save();

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return {
    success: true,
    message: "Return request submitted successfully",
  };
}
