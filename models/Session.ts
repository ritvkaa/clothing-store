
import mongoose, { Schema, models } from "mongoose";

const SessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    accountType: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Session =
  models.Session || mongoose.model("Session", SessionSchema);

export default Session;
