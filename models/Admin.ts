
import mongoose, { Schema, models } from "mongoose";

const AdminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Admin =
  models.Admin ||
  mongoose.model("Admin", AdminSchema);

export default Admin;
