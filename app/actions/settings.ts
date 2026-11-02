"use server";

import { revalidatePath } from "next/cache";
import StoreSettings from "@/models/StoreSettings";
import { connectDB } from "@/lib/mongodb";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { getStoreSettings } from "@/lib/store-settings";

export async function getAdminSettings() {
  if (!(await getCurrentAdmin())) return null;

  return getStoreSettings();
}

export async function saveStoreSettings(data: {
  storeName: string;
  description: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
}) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  const storeName = data.storeName.trim();
  const description = data.description.trim();
  const supportEmail = data.supportEmail.trim().toLowerCase();
  const supportPhone = data.supportPhone.trim();
  const address = data.address.trim();
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
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/");
  revalidatePath("/admin/settings");

  return { success: true, message: "Store details saved." };
}
