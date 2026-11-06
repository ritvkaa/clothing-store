"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { getCustomerUserId } from "@/lib/customer-auth";

export async function addToWishlist(productId: string) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return {
      success: false,
      message: "Invalid product",
    };
  }

  await connectDB();

  const product = await Product.findById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [product._id],
    });
  } else {
    const alreadyExists = wishlist.products.some(
      (id: mongoose.Types.ObjectId) =>
        id.toString() === productId,
    );

    if (alreadyExists) {
      return {
        success: true,
        message: "Already in wishlist",
        isWishlisted: true,
      };
    }

    wishlist.products.push(product._id);
    await wishlist.save();
  }

  revalidatePath("/wishlist");
  revalidatePath(`/products/${productId}`);

  return {
    success: true,
    message: "Added to wishlist",
    isWishlisted: true,
  };
}

export async function removeFromWishlist(productId: string) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  await connectDB();

  const wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    return {
      success: false,
      message: "Wishlist not found",
    };
  }

  wishlist.products = wishlist.products.filter(
    (id: mongoose.Types.ObjectId) =>
      id.toString() !== productId,
  );

  await wishlist.save();

  revalidatePath("/wishlist");
  revalidatePath(`/products/${productId}`);

  return {
    success: true,
    message: "Removed from wishlist",
    isWishlisted: false,
  };
}

export async function toggleWishlist(productId: string) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return {
      success: false,
      message: "Please login first",
      requiresLogin: true,
    };
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return {
      success: false,
      message: "Invalid product",
    };
  }

  await connectDB();

  const product = await Product.findById(productId);

  if (!product) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  let wishlist = await Wishlist.findOne({
    user: userId,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [product._id],
    });

    revalidatePath("/wishlist");

    return {
      success: true,
      message: "Added to wishlist",
      isWishlisted: true,
    };
  }

  const exists = wishlist.products.some(
    (id: mongoose.Types.ObjectId) =>
      id.toString() === productId,
  );

  if (exists) {
    wishlist.products = wishlist.products.filter(
      (id: mongoose.Types.ObjectId) =>
        id.toString() !== productId,
    );

    await wishlist.save();

    revalidatePath("/wishlist");

    return {
      success: true,
      message: "Removed from wishlist",
      isWishlisted: false,
    };
  }

  wishlist.products.push(product._id);

  await wishlist.save();

  revalidatePath("/wishlist");

  return {
    success: true,
    message: "Added to wishlist",
    isWishlisted: true,
  };
}

export async function getWishlist() {
  const userId = await getCustomerUserId();

  if (!userId) {
    return null;
  }

  await connectDB();

  const wishlist = await Wishlist.findOne({
    user: userId,
  })
    .populate("products")
    .lean();

  if (!wishlist) {
    return {
      products: [],
    };
  }

  return JSON.parse(JSON.stringify(wishlist));
}

export async function getWishlistedProductIds() {
  const userId = await getCustomerUserId();
  if (!userId) return [];

  const wishlist = await Wishlist.findOne({ user: userId })
    .select("products")
    .lean();

  return (wishlist?.products || []).map((productId: mongoose.Types.ObjectId) =>
    productId.toString(),
  );
}

export async function isProductInWishlist(
  productId: string,
) {
  const userId = await getCustomerUserId();

  if (!userId) {
    return false;
  }

  await connectDB();

  const wishlist = await Wishlist.findOne({
    user: userId,
    products: productId,
  });

  return !!wishlist;
}
