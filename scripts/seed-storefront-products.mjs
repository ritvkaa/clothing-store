import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is not configured in .env.local.");
}

const image = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;

const productsToSeed = [
  {
    category: "women",
    subcategory: "dresses",
    name: "Women's Everyday Midi Dress",
    description: "A lightweight midi dress for everyday wear and relaxed occasions.",
    brand: "Closet Studio",
    price: 1499,
    stock: 14,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Sage", "Black"],
    photoId: "photo-1503342217505-b0a15ec3261c",
    isFeatured: true,
  },
  {
    category: "women",
    subcategory: "tops",
    name: "Women's Classic Cotton Top",
    description: "A soft cotton top with a clean shape that pairs easily with denim or skirts.",
    brand: "Closet Studio",
    price: 799,
    stock: 18,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["White", "Olive"],
    photoId: "photo-1529139574466-a303027c1d8b",
  },
  {
    category: "women",
    subcategory: "blouses",
    name: "Women's Textured Button Blouse",
    description: "A versatile button-front blouse with a subtle textured finish.",
    brand: "Closet Studio",
    price: 1099,
    stock: 10,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory", "Blue"],
    photoId: "photo-1515886657613-9f3515b0c78f",
  },
  {
    category: "women",
    subcategory: "skirts",
    name: "Women's A-Line Midi Skirt",
    description: "An easy-to-style A-line skirt with a comfortable mid-length cut.",
    brand: "Closet Studio",
    price: 1299,
    stock: 12,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Sand"],
    photoId: "photo-1490481651871-ab68de25d43d",
  },
  {
    category: "women",
    subcategory: "leggings",
    name: "Women's Stretch Fit Leggings",
    description: "Stretchy everyday leggings designed for comfortable movement.",
    brand: "Closet Studio",
    price: 699,
    stock: 20,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    photoId: "photo-1483985988355-763728e1935b",
  },
  {
    category: "men",
    subcategory: "casuals",
    name: "Men's Relaxed Weekend Shirt",
    description: "A relaxed-fit shirt for casual days, layered or worn on its own.",
    brand: "Closet Studio",
    price: 1299,
    stock: 13,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Stone"],
    photoId: "photo-1523398002811-999ca8dec234",
    isFeatured: true,
  },
  {
    category: "men",
    subcategory: "formals",
    name: "Men's Tailored Formal Shirt",
    description: "A crisp formal shirt for workdays and special occasions.",
    brand: "Closet Studio",
    price: 1499,
    stock: 11,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Blue"],
    photoId: "photo-1618354691373-d851c5c3a990",
  },
  {
    category: "men",
    subcategory: "jeans",
    name: "Men's Straight Fit Denim",
    description: "Classic straight-fit denim with an easy everyday feel.",
    brand: "Closet Studio",
    price: 1799,
    stock: 9,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Indigo", "Black"],
    photoId: "photo-1551028719-00167b16eac5",
  },
  {
    category: "men",
    subcategory: "shirts",
    name: "Men's Oxford Cotton Shirt",
    description: "A breathable cotton shirt with a timeless button-down collar.",
    brand: "Closet Studio",
    price: 1399,
    stock: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue"],
    photoId: "photo-1598033129183-c4f50c736f10",
  },
  {
    category: "men",
    subcategory: "t-shirts",
    name: "Men's Essential Crewneck Tee",
    description: "A soft crewneck tee made for daily wear and easy layering.",
    brand: "Closet Studio",
    price: 699,
    stock: 22,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Green"],
    photoId: "photo-1576566588028-4147f3842f27",
  },
  {
    category: "kids",
    subcategory: "dress",
    name: "Kids' Cotton Party Dress",
    description: "A comfortable cotton dress for family gatherings and celebrations.",
    brand: "Closet Studio Kids",
    price: 999,
    stock: 8,
    sizes: ["XS", "S", "M"],
    colors: ["Pink", "Blue"],
    photoId: "photo-1503919005314-30d93d07d823",
    isFeatured: true,
  },
  {
    category: "kids",
    subcategory: "shorts",
    name: "Kids' Everyday Cotton Shorts",
    description: "Lightweight shorts with an easy fit for play and everyday outings.",
    brand: "Closet Studio Kids",
    price: 499,
    stock: 16,
    sizes: ["XS", "S", "M"],
    colors: ["Blue", "Khaki"],
    photoId: "photo-1516627145497-ae6968895b74",
  },
  {
    category: "kids",
    subcategory: "schoolwear",
    name: "Kids' Schoolwear Polo",
    description: "A soft polo shirt for school days and after-school activities.",
    brand: "Closet Studio Kids",
    price: 599,
    stock: 15,
    sizes: ["XS", "S", "M"],
    colors: ["White", "Navy"],
    photoId: "photo-1622290291468-a28f7a7dc6a8",
  },
  {
    category: "kids",
    subcategory: "sets",
    name: "Kids' Cotton Co-ord Set",
    description: "A matching top and bottom set made for comfortable all-day wear.",
    brand: "Closet Studio Kids",
    price: 899,
    stock: 10,
    sizes: ["XS", "S", "M"],
    colors: ["Yellow", "Green"],
    photoId: "photo-1519238263530-99bdd11df2ea",
  },
  {
    category: "kids",
    subcategory: "outerwear",
    name: "Kids' Lightweight Jacket",
    description: "A light layer for cool mornings and breezy evenings.",
    brand: "Closet Studio Kids",
    price: 1399,
    stock: 7,
    sizes: ["XS", "S", "M"],
    colors: ["Red", "Navy"],
    photoId: "photo-1503454537195-1dcabb73ffb9",
  },
  {
    category: "accessories",
    subcategory: "bags",
    name: "Everyday Shoulder Bag",
    description: "A practical shoulder bag with room for everyday essentials.",
    brand: "Closet Studio Accessories",
    price: 1499,
    stock: 8,
    sizes: [],
    colors: ["Tan", "Black"],
    photoId: "photo-1548036328-c9fa89d128fa",
    isFeatured: true,
  },
  {
    category: "accessories",
    subcategory: "belts",
    name: "Classic Buckle Belt",
    description: "A versatile belt with a classic buckle and adjustable fit.",
    brand: "Closet Studio Accessories",
    price: 799,
    stock: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Brown", "Black"],
    photoId: "photo-1553062407-98eeb64c6a62",
  },
  {
    category: "accessories",
    subcategory: "jewelry",
    name: "Gold Tone Pendant Necklace",
    description: "A simple pendant necklace that works well on its own or layered.",
    brand: "Closet Studio Accessories",
    price: 999,
    stock: 14,
    sizes: [],
    colors: ["Gold"],
    photoId: "photo-1535632066927-ab7c9ab60908",
  },
  {
    category: "accessories",
    subcategory: "hats",
    name: "Cotton Baseball Cap",
    description: "A lightweight cotton cap with an adjustable back strap.",
    brand: "Closet Studio Accessories",
    price: 499,
    stock: 17,
    sizes: [],
    colors: ["Black", "Olive"],
    photoId: "photo-1584917865442-de89df76afd3",
  },
  {
    category: "accessories",
    subcategory: "scarves",
    name: "Printed Lightweight Scarf",
    description: "A soft, lightweight scarf with a versatile printed finish.",
    brand: "Closet Studio Accessories",
    price: 699,
    stock: 13,
    sizes: [],
    colors: ["Multi"],
    photoId: "photo-1599643478518-a784e5dc4c8f",
  },
];

try {
  await mongoose.connect(mongoUri);

  const categories = mongoose.connection.collection("categories");
  const products = mongoose.connection.collection("products");
  const topLevelCategories = await categories.find({ parent: null }).toArray();
  const now = new Date();
  let inserted = 0;
  let skipped = 0;

  for (const spec of productsToSeed) {
    const parent = topLevelCategories.find((category) => category.key === spec.category);
    if (!parent) {
      throw new Error(`Top-level category "${spec.category}" was not found.`);
    }

    const subcategory = await categories.findOne({
      parent: parent._id,
      key: spec.subcategory,
    });
    if (!subcategory) {
      throw new Error(
        `Subcategory "${spec.subcategory}" was not found under "${parent.name}".`,
      );
    }

    const existing = await products.findOne({ name: spec.name });
    if (existing) {
      skipped += 1;
      continue;
    }

    const { category: _categoryKey, subcategory: _subcategoryKey, photoId, ...product } = spec;
    await products.insertOne({
      ...product,
      subcategory: subcategory._id,
      images: [image(photoId)],
      videos: [],
      rating: 0,
      numReviews: 0,
      createdAt: now,
      updatedAt: now,
    });
    inserted += 1;
  }

  console.log(`Added ${inserted} products; skipped ${skipped} existing products.`);
} finally {
  await mongoose.disconnect();
}
