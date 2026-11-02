"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

import cloudinary from "@/lib/cloudinary";
import { getCurrentAdmin } from "@/lib/admin-auth";

type ProductData = {
  name: string;
  description: string;
  subcategory: string;
  brand: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  isFeatured: boolean;
};

/* =========================================================
   ADD PRODUCT
========================================================= */

export async function addProduct(data: ProductData) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await connectDB();

    // Check subcategory ID
    if (!mongoose.Types.ObjectId.isValid(data.subcategory)) {
      return {
        success: false,
        message: "Invalid subcategory.",
      };
    }

    // Make sure the selected subcategory actually exists
    const subcategory = await Category.findOne({
      _id: data.subcategory,
      parent: { $ne: null },
    }).lean();

    if (!subcategory) {
      return {
        success: false,
        message: "Selected subcategory does not exist.",
      };
    }

    // Create product WITHOUT category
    const product = await Product.create({
      name: data.name,
      description: data.description,
      brand: data.brand,

      // Only this is stored
      subcategory: new mongoose.Types.ObjectId(data.subcategory),

      price: data.price,
      stock: data.stock,
      sizes: data.sizes,
      colors: data.colors,
      isFeatured: data.isFeatured,

      images: [],
      videos: [],
    });

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product added successfully.",
      productId: product._id.toString(),
    };
  } catch (error: any) {
    console.error("=================================");
    console.error("ADD PRODUCT ERROR");
    console.error(error);
    console.error("=================================");

    return {
      success: false,
      message:
        error?.message || "Failed to add product.",
    };
  }
}

/* =========================================================
   GET ALL PRODUCTS
========================================================= */

export async function getProducts() {
  try {
    await connectDB();

    const products = await Product.aggregate([
      /*
        STEP 1:
        Find the subcategory.
      */

      {
        $lookup: {
          from: "categories",
          localField: "subcategory",
          foreignField: "_id",
          as: "subcategoryData",
        },
      },

      {
        $unwind: {
          path: "$subcategoryData",
          preserveNullAndEmptyArrays: false,
        },
      },

      /*
        STEP 2:
        The subcategory contains:

        parent: categoryId

        So now find the parent category.
      */

      {
        $lookup: {
          from: "categories",
          localField: "subcategoryData.parent",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },

      /*
        STEP 3:
        Return the structure expected by the UI.

        IMPORTANT:
        category here is CALCULATED.
        It is NOT stored in Product.
      */

      {
        $project: {
          _id: 1,

          name: 1,
          description: 1,
          brand: 1,

          price: 1,
          stock: 1,

          sizes: 1,
          colors: 1,

          images: 1,
          videos: 1,

          isFeatured: 1,

          rating: 1,
          numReviews: 1,

          createdAt: 1,
          updatedAt: 1,

          category: {
            _id: "$categoryData._id",
            name: "$categoryData.name",
            key: "$categoryData.key",
          },

          subcategory: {
            _id: "$subcategoryData._id",
            name: "$subcategoryData.name",
            key: "$subcategoryData.key",
            parent: "$subcategoryData.parent",
          },
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return JSON.parse(
      JSON.stringify(products),
    );
  } catch (error) {
    console.error("Get products error:", error);

    return [];
  }
}

/* =========================================================
   GET ONE PRODUCT
========================================================= */

export async function getProductById(id: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const products = await Product.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      // Get the subcategory
      {
        $lookup: {
          from: "categories",
          localField: "subcategory",
          foreignField: "_id",
          as: "subcategoryData",
        },
      },

      {
        $unwind: {
          path: "$subcategoryData",
          preserveNullAndEmptyArrays: false,
        },
      },

      // Get the parent/main category
      {
        $lookup: {
          from: "categories",
          localField: "subcategoryData.parent",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          brand: 1,
          price: 1,
          stock: 1,
          sizes: 1,
          colors: 1,
          images: 1,
          videos: 1,
          isFeatured: 1,
          rating: 1,
          numReviews: 1,
          createdAt: 1,
          updatedAt: 1,

          subcategory: {
            _id: "$subcategoryData._id",
            name: "$subcategoryData.name",
            key: "$subcategoryData.key",
          },

          category: {
            _id: "$categoryData._id",
            name: "$categoryData.name",
            key: "$categoryData.key",
          },
        },
      },
    ]);

    if (!products.length) {
      return null;
    }

    return JSON.parse(JSON.stringify(products[0]));
  } catch (error) {
    console.error("Get product by ID error:", error);
    return null;
  }
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  id: string,
  data: ProductData,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid product ID.",
      };
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        data.subcategory,
      )
    ) {
      return {
        success: false,
        message: "Invalid subcategory.",
      };
    }

    /*
      Verify that the subcategory exists.
    */

    const subcategory = await Category.findOne({
      _id: data.subcategory,
      parent: { $ne: null },
    }).lean();

    if (!subcategory) {
      return {
        success: false,
        message: "Subcategory not found.",
      };
    }

    /*
      Verify its parent category.
    */

    const parentCategory = await Category.findOne({
      _id: subcategory.parent,
      parent: null,
    }).lean();

    if (!parentCategory) {
      return {
        success: false,
        message: "Parent category not found.",
      };
    }

    /*
      IMPORTANT:
      We update ONLY subcategory.
      No category field.
    */

    const product =
      await Product.findByIdAndUpdate(
        id,
        {
          name: data.name,
          description: data.description,

          subcategory:
            new mongoose.Types.ObjectId(
              data.subcategory,
            ),

          brand: data.brand,
          price: data.price,
          stock: data.stock,

          sizes: data.sizes,
          colors: data.colors,

          isFeatured: data.isFeatured,
        },
        {
          new: true,
          runValidators: true,
        },
      );

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    revalidatePath(
      `/admin/products/edit/${id}`,
    );

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    console.error(
      "Update product error:",
      error,
    );

    return {
      success: false,
      message: "Failed to update product.",
    };
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function deleteProduct(
  id: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: "Invalid product ID.",
      };
    }

    const deletedProduct =
      await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product deleted successfully.",
    };
  } catch (error) {
    console.error(
      "Delete product error:",
      error,
    );

    return {
      success: false,
      message: "Failed to delete product.",
    };
  }
}

/* =========================
   ADD PRODUCT IMAGE
========================= */

export async function addProductImage(
  productId: string,
  imageUrl: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return {
        success: false,
        message: "Invalid product ID.",
      };
    }

    if (!imageUrl) {
      return {
        success: false,
        message: "Image URL is required.",
      };
    }

    const product = await Product.findById(productId);

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    product.images.push(imageUrl);

    await product.save();

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Image added successfully.",
    };
  } catch (error) {
    console.error("Add product image error:", error);

    return {
      success: false,
      message: "Failed to add image.",
    };
  }
}


/* =========================
   DELETE PRODUCT IMAGE
========================= */

export async function deleteProductImage(
  productId: string,
  imageUrl: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return {
        success: false,
        message: "Invalid product ID.",
      };
    }

    const product = await Product.findById(productId);

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    // Remove image URL from MongoDB
    product.images = product.images.filter(
      (image: string) => image !== imageUrl,
    );

    await product.save();

    // Extract Cloudinary public ID from URL
    try {
      const uploadIndex = imageUrl.indexOf("/upload/");

      if (uploadIndex !== -1) {
        let publicId = imageUrl.substring(uploadIndex + 8);

        // Remove version, e.g. v123456789/
        publicId = publicId.replace(/^v\d+\//, "");

        // Remove extension
        publicId = publicId.replace(/\.[^/.]+$/, "");

        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudinaryError) {
      console.error(
        "Cloudinary delete error:",
        cloudinaryError,
      );
    }

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Image deleted successfully.",
    };
  } catch (error) {
    console.error("Delete product image error:", error);

    return {
      success: false,
      message: "Failed to delete image.",
    };
  }
}

/* =========================
   SET DEFAULT PRODUCT IMAGE
========================= */
export async function setDefaultProductImage(
  productId: string,
  imageUrl: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return {
        success: false,
        message: "Invalid product ID.",
      };
    }

    const product = await Product.findById(productId);

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    const images = product.images || [];

    if (!images.includes(imageUrl)) {
      return {
        success: false,
        message: "Image not found.",
      };
    }

    // Move selected image to the first position
    const updatedImages = [
      imageUrl,
      ...images.filter(
        (image: string) => image !== imageUrl,
      ),
    ];

    product.images = updatedImages;

    await product.save();

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Image set as default successfully.",
    };
  } catch (error) {
    console.error("Set default image error:", error);

    return {
      success: false,
      message: "Failed to set default image.",
    };
  }
}
