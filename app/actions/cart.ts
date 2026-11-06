"use server";

import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import Session from "@/models/Session";
import User from "@/models/User";

async function getUserId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("closet_customer_session")?.value;
  if (!sessionId) return null;

  await connectDB();
  const session = await Session.findOne({
    sessionId,
    accountType: "user",
    expiresAt: { $gt: new Date() },
  }).select("user");

  if (!session?.user) return null;

  const user = await User.findById(session.user).select("isActive");
  if (!user?.isActive) return null;

  return user._id.toString();
}

export async function addToCart(data: {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
}) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  await connectDB();

  const product = await Product.findById(data.productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  if (product.stock <= 0) {
    return {
      success: false,
      message: "Product is out of stock",
    };
  }

  const quantity = data.quantity || 1;

  if (quantity > product.stock) {
    return {
      success: false,
      message: "Not enough stock available",
    };
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: product._id,
          quantity,
          size: data.size || "",
          color: data.color || "",
        },
      ],
    });

    return {
      success: true,
      message: "Added to cart",
    };
  }

  const existingItem = cart.items.find(
    (item: any) =>
      item.product.toString() === product._id.toString() &&
      item.size === (data.size || "") &&
      item.color === (data.color || ""),
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      return {
        success: false,
        message: "Not enough stock available",
      };
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      size: data.size || "",
      color: data.color || "",
    });
  }

  await cart.save();

  return {
    success: true,
    message: "Added to cart",
  };
}

export async function getCart() {
  const userId = await getUserId();

  if (!userId) {
    return null;
  }

  await connectDB();

  const cart = await Cart.findOne({ user: userId })
    .populate("items.product")
    .lean();

  if (!cart) {
    return {
      items: [],
    };
  }

  return JSON.parse(JSON.stringify(cart));
}

export async function updateCartItem(itemId: string, quantity: number) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  await connectDB();

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return {
      success: false,
      message: "Cart not found",
    };
  }

  const item = cart.items.id(itemId);

  if (!item) {
    return {
      success: false,
      message: "Cart item not found",
    };
  }

  const product = await Product.findById(item.product);

  if (!product) {
    item.deleteOne();
    await cart.save();

    return {
      success: false,
      message: "Product no longer exists",
    };
  }

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    if (quantity > product.stock) {
      return {
        success: false,
        message: `Only ${product.stock} available`,
      };
    }

    item.quantity = quantity;
  }

  await cart.save();

  return {
    success: true,
    message: "Cart updated",
  };
}

export async function removeFromCart(itemId: string) {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  await connectDB();

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return {
      success: false,
      message: "Cart not found",
    };
  }

  const item = cart.items.id(itemId);

  if (!item) {
    return {
      success: false,
      message: "Cart item not found",
    };
  }

  item.deleteOne();

  await cart.save();

  return {
    success: true,
    message: "Item removed",
  };
}
export async function clearCart() {
  const userId = await getUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  await connectDB();

  await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

  return {
    success: true,
    message: "Cart cleared",
  };
}
