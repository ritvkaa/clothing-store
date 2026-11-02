"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { createKey } from "@/lib/createKey";
import Category from "@/models/Category";
import { getCurrentAdmin } from "@/lib/admin-auth";

/* =========================================================
   GET ALL CATEGORIES WITH THEIR SUBCATEGORIES
   ========================================================= */

export async function getCategories() {
  await connectDB();

  const categories = await Category.aggregate([
    // Only top-level categories
    {
      $match: {
        parent: null,
      },
    },

    // Find all documents whose parent is this category
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "parent",
        as: "subcategories",
      },
    },

    // Sort categories alphabetically
    {
      $sort: {
        name: 1,
      },
    },
  ]);

  // Convert ObjectIds to strings before passing to Client Components
  return categories.map((category: any) => ({
    _id: category._id.toString(),

    name: category.name,

    key: category.key,

    parent: category.parent
      ? category.parent.toString()
      : null,

    subcategories: (category.subcategories || []).map(
      (subcategory: any) => ({
        _id: subcategory._id.toString(),

        name: subcategory.name,

        key: subcategory.key,

        parent: subcategory.parent
          ? subcategory.parent.toString()
          : null,
      }),
    ),
  }));
}


/* =========================================================
   ADD CATEGORY
   ========================================================= */

export async function addCategory(name: string) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Category name is required",
    };
  }

  const key = createKey(trimmedName);

  // Only check duplicate top-level categories
  const exists = await Category.findOne({
    parent: null,
    $or: [
      { name: trimmedName },
      { key },
    ],
  });

  if (exists) {
    return {
      success: false,
      message: "Category already exists",
    };
  }

  await Category.create({
    name: trimmedName,
    key,
    parent: null,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
  };
}


/* =========================================================
   UPDATE CATEGORY
   ========================================================= */

export async function updateCategory(
  id: string,
  name: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  const trimmedName = name.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Category name is required",
    };
  }

  const key = createKey(trimmedName);

  // Check duplicate only among top-level categories
  const exists = await Category.findOne({
    parent: null,

    _id: {
      $ne: id,
    },

    $or: [
      { name: trimmedName },
      { key },
    ],
  });

  if (exists) {
    return {
      success: false,
      message: "Category already exists",
    };
  }

  const updated = await Category.findOneAndUpdate(
    {
      _id: id,
      parent: null,
    },
    {
      name: trimmedName,
      key,
    },
    {
      new: true,
    },
  );

  if (!updated) {
    return {
      success: false,
      message: "Category not found",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
  };
}


/* =========================================================
   DELETE CATEGORY
   ========================================================= */

export async function deleteCategory(id: string) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  // Delete the top-level category
  const deleted = await Category.findOneAndDelete({
    _id: id,
    parent: null,
  });

  if (!deleted) {
    return {
      success: false,
      message: "Category not found",
    };
  }

  // Delete all subcategories belonging to it
  await Category.deleteMany({
    parent: id,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
  };
}


/* =========================================================
   ADD SUBCATEGORY
   ========================================================= */

export async function addSubCategory(
  categoryId: string,
  subcategory: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  const name = subcategory.trim();

  if (!name) {
    return {
      success: false,
      message: "Subcategory name is required",
    };
  }

  // Make sure the selected parent is a real top-level category
  const parentCategory = await Category.findOne({
    _id: categoryId,
    parent: null,
  });

  if (!parentCategory) {
    return {
      success: false,
      message: "Parent category not found",
    };
  }

  const key = createKey(name);

  // IMPORTANT:
  // Same subcategory name/key is allowed under DIFFERENT categories.
  const exists = await Category.findOne({
    parent: categoryId,
    $or: [
      { name },
      { key },
    ],
  });

  if (exists) {
    return {
      success: false,
      message: "This subcategory already exists in this category",
    };
  }

  await Category.create({
    name,
    key,
    parent: parentCategory._id,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
  };
}


/* =========================================================
   UPDATE SUBCATEGORY
   ========================================================= */

export async function updateSubCategory(
  categoryId: string,
  subcategoryId: string,
  newName: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  const trimmedName = newName.trim();

  if (!trimmedName) {
    return {
      success: false,
      message: "Subcategory name is required",
    };
  }

  const newKey = createKey(trimmedName);

  // Check duplicates only under the SAME parent
  const exists = await Category.findOne({
    parent: categoryId,

    _id: {
      $ne: subcategoryId,
    },

    $or: [
      { name: trimmedName },
      { key: newKey },
    ],
  });

  if (exists) {
    return {
      success: false,
      message: "This subcategory already exists in this category",
    };
  }

  const updated = await Category.findOneAndUpdate(
    {
      _id: subcategoryId,
      parent: categoryId,
    },
    {
      name: trimmedName,
      key: newKey,
    },
    {
      new: true,
    },
  );

  if (!updated) {
    return {
      success: false,
      message: "Subcategory not found",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
  };
}


/* =========================================================
   DELETE SUBCATEGORY
   ========================================================= */

export async function deleteSubCategory(
  categoryId: string,
  subcategoryId: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  const deleted = await Category.findOneAndDelete({
    _id: subcategoryId,
    parent: categoryId,
  });

  if (!deleted) {
    return {
      success: false,
      message: "Subcategory not found",
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");

  return {
    success: true,
  };
}
