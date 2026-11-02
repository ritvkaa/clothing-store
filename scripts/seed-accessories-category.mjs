import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured in .env.local.");
}

try {
  await mongoose.connect(mongoUri);

  const categories = mongoose.connection.collection("categories");
  const existing = await categories.findOne({
    $or: [{ name: "Accessories" }, { key: "accessories" }],
  });

  if (existing) {
    if (existing.parent == null) {
      console.log("The top-level Accessories category already exists.");
    } else {
      await categories.updateOne(
        { _id: existing._id },
        { $set: { parent: null, updatedAt: new Date() } },
      );
      console.log("Moved the existing Accessories category to the top level.");
    }
  } else {
    const now = new Date();
    await categories.insertOne({
      name: "Accessories",
      key: "accessories",
      parent: null,
      createdAt: now,
      updatedAt: now,
    });
    console.log("Created the Accessories category.");
  }
} finally {
  await mongoose.disconnect();
}
