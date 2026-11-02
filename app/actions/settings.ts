"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Session from "@/models/Session";
import StoreSettings from "@/models/StoreSettings";
import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getStoreSettings } from "@/lib/store-settings";

export async function getAdminSettings() {
  const admin = await getCurrentAdmin();
  if (!admin) return null;

  const store = await getStoreSettings();
  return {
    store,
    admin: {
      username: admin.username,
      email: admin.email,
    },
  };
}

export async function saveStoreSettings(data: {
  storeName: string;
  description: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  deliveryFee: string | number;
  freeShippingThreshold: string | number;
}) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  const storeName = data.storeName.trim();
  const description = data.description.trim();
  const supportEmail = data.supportEmail.trim().toLowerCase();
  const supportPhone = data.supportPhone.trim();
  const address = data.address.trim();
  const deliveryFee = Number(data.deliveryFee);
  const freeShippingThreshold = Number(data.freeShippingThreshold);

  if (!storeName) {
    return { success: false, message: "Store name is required." };
  }
  if (
    storeName.length > 80 ||
    description.length > 300 ||
    address.length > 300 ||
    supportPhone.length > 30
  ) {
    return { success: false, message: "One or more store details are too long." };
  }
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    return { success: false, message: "Enter a valid support email address." };
  }
  if (
    !Number.isFinite(deliveryFee) ||
    deliveryFee < 0 ||
    !Number.isInteger(deliveryFee) ||
    !Number.isFinite(freeShippingThreshold) ||
    freeShippingThreshold < 0 ||
    !Number.isInteger(freeShippingThreshold)
  ) {
    return { success: false, message: "Shipping amounts must be whole rupees and zero or greater." };
  }

  await connectDB();
  await StoreSettings.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        storeName,
        description,
        supportEmail,
        supportPhone,
        address,
        deliveryFee,
        freeShippingThreshold,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/admin/settings");

  return { success: true, message: "Store settings saved." };
}

export async function saveAdminProfile(data: {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) return { success: false, message: "Unauthorized." };

  const username = data.username.trim();
  const email = data.email.trim().toLowerCase();
  const changingPassword = Boolean(data.currentPassword || data.newPassword || data.confirmNewPassword);

  if (!username || !email) {
    return { success: false, message: "Name and email are required." };
  }
  if (username.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid name and email address." };
  }

  await connectDB();

  const [adminConflict, customerConflict] = await Promise.all([
    Admin.findOne({
      _id: { $ne: admin._id },
      $or: [{ username }, { email }],
    }),
    User.findOne({
      role: { $ne: "admin" },
      $or: [{ username }, { email }],
    }),
  ]);
  if (adminConflict || customerConflict) {
    return {
      success: false,
      message: "That name or email is already used by another account.",
    };
  }

  if (changingPassword) {
    if (!data.currentPassword || !data.newPassword || !data.confirmNewPassword) {
      return {
        success: false,
        message: "Fill in all password fields to change your password.",
      };
    }
    if (!(await bcrypt.compare(data.currentPassword, admin.password))) {
      return { success: false, message: "Current password is incorrect." };
    }
    if (data.newPassword.length < 8) {
      return {
        success: false,
        message: "New password must contain at least 8 characters.",
      };
    }
    if (data.newPassword !== data.confirmNewPassword) {
      return { success: false, message: "New passwords do not match." };
    }
    admin.password = await bcrypt.hash(data.newPassword, 10);
  }

  admin.username = username;
  admin.email = email;
  await admin.save();

  if (changingPassword) {
    const sessionId = (await cookies()).get("closet_admin_session")?.value;
    if (sessionId) {
      await Session.deleteMany({
        admin: admin._id,
        accountType: "admin",
        sessionId: { $ne: sessionId },
      });
    }
  }

  revalidatePath("/admin/settings");
  return {
    success: true,
    message: changingPassword
      ? "Profile and password updated. Other admin sessions were signed out."
      : "Admin profile updated.",
  };
}
