import "server-only";

import { connectDB } from "@/lib/mongodb";
import StoreSettings from "@/models/StoreSettings";

export const DEFAULT_STORE_SETTINGS = {
  storeName: "CLOSET",
  description: "Discover clothing and styles designed for your everyday look.",
  supportEmail: "",
  supportPhone: "",
  address: "",
  deliveryFee: 99,
  freeShippingThreshold: 2000,
};

export async function getStoreSettings() {
  await connectDB();

  let settings = await StoreSettings.findOne({ key: "default" }).lean();
  if (!settings) {
    try {
      await StoreSettings.create({ key: "default", ...DEFAULT_STORE_SETTINGS });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
    settings = await StoreSettings.findOne({ key: "default" }).lean();
  }

  if (!settings) {
    throw new Error("Store settings could not be loaded.");
  }

  return {
    storeName: settings.storeName || DEFAULT_STORE_SETTINGS.storeName,
    description: settings.description || DEFAULT_STORE_SETTINGS.description,
    supportEmail: settings.supportEmail || "",
    supportPhone: settings.supportPhone || "",
    address: settings.address || "",
    deliveryFee: Number(settings.deliveryFee ?? DEFAULT_STORE_SETTINGS.deliveryFee),
    freeShippingThreshold: Number(
      settings.freeShippingThreshold ?? DEFAULT_STORE_SETTINGS.freeShippingThreshold,
    ),
  };
}
