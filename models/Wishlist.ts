import mongoose, { Schema, models } from "mongoose";

const WishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Wishlist =
  models.Wishlist ||
  mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;