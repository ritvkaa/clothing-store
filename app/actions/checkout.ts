"use server";

import mongoose from "mongoose";
import Order from "@/models/Order";

import razorpay from "@/lib/razorpay";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { getStoreSettings } from "@/lib/store-settings";
import { getCustomerUserId } from "@/lib/customer-auth";

export async function getCheckoutData() {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false as const,
      requiresLogin: true as const,
      message: "Please login first",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      success: false as const,
      message: "Invalid user",
    };
  }

  await connectDB();

  const user = await User.findById(userId).lean();

  if (!user) {
    return {
      success: false as const,
      message: "User not found",
    };
  }

  const cart = await Cart.findOne({
    user: userId,
  })
    .populate("items.product")
    .lean();

  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      success: false as const,
      emptyCart: true as const,
      message: "Your cart is empty",
    };
  }

  let subtotal = 0;

  const items = [];

  for (const item of cart.items as any[]) {
    const product = item.product;

    if (!product) {
      return {
        success: false as const,
        message: "A product in your cart no longer exists",
      };
    }

    if (item.quantity > product.stock) {
      return {
        success: false as const,
        message: `${product.name} does not have enough stock`,
      };
    }

    subtotal += product.price * item.quantity;

    items.push({
      _id: item._id.toString(),
      productId: product._id.toString(),
      name: product.name,
      brand: product.brand || "",
      image: product.images?.[0] || "",
      price: product.price,
      quantity: item.quantity,
      size: item.size || "",
      color: item.color || "",
    });
  }

  const storeSettings = await getStoreSettings();
  const deliveryCharge =
    subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.deliveryFee;
  const totalAmount = subtotal + deliveryCharge;

  return {
    success: true as const,

    user: {
      name: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pincode: user.pincode || "",
    },

    items,

    summary: {
      subtotal,
      deliveryCharge,
      totalAmount,
      freeShippingThreshold: storeSettings.freeShippingThreshold,
    },
    storeName: storeSettings.storeName,
  };
}

export async function createRazorpayOrder(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      requiresLogin: true,
      message: "Please login first",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      success: false,
      message: "Invalid user",
    };
  }

  if (
    !data.name.trim() ||
    !data.email.trim() ||
    !data.phone.trim() ||
    !data.address.trim() ||
    !data.city.trim() ||
    !data.state.trim() ||
    !data.pincode.trim()
  ) {
    return {
      success: false,
      message: "Please fill in all delivery details",
    };
  }

  await connectDB();

  const cart = await Cart.findOne({
    user: userId,
  }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return {
      success: false,
      message: "Your cart is empty",
    };
  }

  let subtotal = 0;

  for (const item of cart.items as any[]) {
    const product = item.product;

    if (!product) {
      return {
        success: false,
        message: "A product in your cart no longer exists",
      };
    }

    if (product.stock < item.quantity) {
      return {
        success: false,
        message: `Only ${product.stock} ${product.name} available`,
      };
    }

    subtotal += product.price * item.quantity;
  }

  const storeSettings = await getStoreSettings();
  const deliveryCharge =
    subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.deliveryFee;
  const totalAmount = subtotal + deliveryCharge;

  /*
   * Razorpay expects the amount in the smallest
   * currency unit.
   *
   * ₹100 = 10000 paise
   */
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    receipt: `closet_${Date.now()}`,
  });

  const orderItems = (cart.items as any[]).map((item) => {
    const product = item.product;

    return {
      product: product._id,
      name: product.name,
      brand: product.brand || "",
      image: product.images?.[0] || "",
      price: product.price,
      quantity: item.quantity,
      size: item.size || "",
      color: item.color || "",
    };
  });

  /*
   * Create our own order BEFORE payment.
   *
   * It stays pending until Razorpay payment
   * is successfully verified.
   */
  const order = await Order.create({
    user: userId,

    items: orderItems,

    shippingAddress: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
    },

    subtotal,
    deliveryCharge,
    totalAmount,

    paymentMethod: "razorpay",
    paymentStatus: "pending",
    orderStatus: "placed",

    razorpayOrderId: razorpayOrder.id,
  });

  return {
    success: true,

    orderId: order._id.toString(),

    razorpayOrderId: razorpayOrder.id,

    amount: totalAmount,

    currency: "INR",

    keyId: process.env.RAZORPAY_KEY_ID,
  };
}

export async function verifyRazorpayPayment(data: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      requiresLogin: true,
      message: "Please login first",
    };
  }

  await connectDB();

  const order = await Order.findOne({
    _id: data.orderId,
    user: userId,
  });

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  if (order.razorpayOrderId !== data.razorpayOrderId) {
    return {
      success: false,
      message: "Invalid Razorpay order",
    };
  }

  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET!,
    )
    .update(
      `${data.razorpayOrderId}|${data.razorpayPaymentId}`,
    )
    .digest("hex");

  if (generatedSignature !== data.razorpaySignature) {
    order.paymentStatus = "failed";
    await order.save();

    return {
      success: false,
      message: "Payment verification failed",
    };
  }

  order.paymentStatus = "paid";
  order.orderStatus = "placed";
  order.razorpayPaymentId = data.razorpayPaymentId;
  order.razorpaySignature = data.razorpaySignature;

  await order.save();

  /*
   * Reduce stock only AFTER successful payment.
   */
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: {
        stock: -item.quantity,
      },
    });
  }

  /*
   * Clear cart after successful payment.
   */
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } },
  );

  return {
    success: true,
    message: "Payment successful",
    orderId: order._id.toString(),
  };
}

export async function placeCodOrder(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      requiresLogin: true,
      message: "Please login first",
    };
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      success: false,
      message: "Invalid user",
    };
  }

  // Basic validation
  if (
    !data.name.trim() ||
    !data.email.trim() ||
    !data.phone.trim() ||
    !data.address.trim() ||
    !data.city.trim() ||
    !data.state.trim() ||
    !data.pincode.trim()
  ) {
    return {
      success: false,
      message: "Please fill in all delivery details",
    };
  }

  await connectDB();

  const cart = await Cart.findOne({
    user: userId,
  }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return {
      success: false,
      message: "Your cart is empty",
    };
  }

  let subtotal = 0;

  const orderItems = [];

  // Re-check products and stock on the server
  for (const item of cart.items as any[]) {
    const product = item.product;

    if (!product) {
      return {
        success: false,
        message: "A product in your cart no longer exists",
      };
    }

    if (product.stock < item.quantity) {
      return {
        success: false,
        message: `Only ${product.stock} ${product.name} available`,
      };
    }

    subtotal += product.price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      brand: product.brand || "",
      image: product.images?.[0] || "",
      price: product.price,
      quantity: item.quantity,
      size: item.size || "",
      color: item.color || "",
    });
  }

  const storeSettings = await getStoreSettings();
  const deliveryCharge =
    subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.deliveryFee;
  const totalAmount = subtotal + deliveryCharge;

  // Create the order
  const order = await Order.create({
    user: userId,

    items: orderItems,

    shippingAddress: {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      pincode: data.pincode.trim(),
    },

    subtotal,
    deliveryCharge,
    totalAmount,

    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "placed",
  });

  // Reduce stock
  for (const item of cart.items as any[]) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: {
        stock: -item.quantity,
      },
    });
  }

  // Clear the user's cart
  cart.items = [];
  await cart.save();

  return {
    success: true,
    message: "Order placed successfully",
    orderId: order._id.toString(),
  };
}
