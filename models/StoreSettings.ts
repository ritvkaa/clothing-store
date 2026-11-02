import mongoose, { Schema, models } from "mongoose";

const StoreSettingsSchema = new Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      immutable: true,
    },
    storeName: {
      type: String,
      default: "CLOSET",
      trim: true,
    },
    description: {
      type: String,
      default: "Discover clothing and styles designed for your everyday look.",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    deliveryFee: {
      type: Number,
      default: 99,
      min: 0,
    },
    freeShippingThreshold: {
      type: Number,
      default: 2000,
      min: 0,
    },
  },
  { timestamps: true },
);

const StoreSettings =
  models.StoreSettings || mongoose.model("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
