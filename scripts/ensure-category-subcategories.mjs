import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured in .env.local.");
}

const plannedSubcategories = {
  women: ["Tops", "Blouses", "Skirts", "Leggings"],
  men: ["Shirts", "T-Shirts"],
  kids: ["Schoolwear", "Sets", "Outerwear"],
  accessories: ["Bags", "Belts", "Jewelry", "Hats", "Scarves"],
};

const toKey = (name) => name.trim().toLowerCase().replace(/\s+/g, "_");

try {
  await mongoose.connect(mongoUri);

  const categories = mongoose.connection.collection("categories");
  const topLevelCategories = await categories
    .find({ parent: null })
    .toArray();
  const now = new Date();

  for (const [parentKey, names] of Object.entries(plannedSubcategories)) {
    const parentCategory = topLevelCategories.find(
      (category) => category.key === parentKey,
    );

    if (!parentCategory) {
      throw new Error(`Top-level category "${parentKey}" was not found.`);
    }

    const existing = await categories
      .find({ parent: parentCategory._id })
      .toArray();
    const existingKeys = new Set(existing.map((category) => category.key));
    const missing = names
      .filter((name) => !existingKeys.has(toKey(name)))
      .slice(0, Math.max(0, 5 - existing.length));

    if (existing.length + missing.length < 4) {
      throw new Error(
        `Not enough unique planned subcategories to bring "${parentCategory.name}" to four.`,
      );
    }

    if (missing.length) {
      await categories.insertMany(
        missing.map((name) => ({
          name,
          key: toKey(name),
          parent: parentCategory._id,
          createdAt: now,
          updatedAt: now,
        })),
      );
    }

    const count = existing.length + missing.length;
    if (count < 4 || count > 5) {
      throw new Error(
        `"${parentCategory.name}" has ${count} subcategories; expected 4–5.`,
      );
    }

    console.log(`${parentCategory.name}: ${count} subcategories.`);
  }
} finally {
  await mongoose.disconnect();
}
