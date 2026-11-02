import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    // ONLY subcategory is stored.
    // Category is obtained through subcategory.parent
    subcategory: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL"],
      },
    ],

    colors: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    videos: [
      {
        type: String,
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Product =
  models.Product || mongoose.model("Product", ProductSchema);

export default Product;