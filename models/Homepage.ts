import mongoose, { Schema, models } from "mongoose";

const HomepageSchema = new Schema(
  {
    heroImage: {
      type: String,
      default: "",
    },
    heroTitle: {
      type: String,
      default: "NEW SEASON",
    },
    heroSubtitle: {
      type: String,
      default: "DEFINE YOUR STYLE",
    },
    heroButtonText: {
      type: String,
      default: "SHOP NOW",
    },
  },
  { timestamps: true },
);

const Homepage =
  models.Homepage || mongoose.model("Homepage", HomepageSchema);

export default Homepage;