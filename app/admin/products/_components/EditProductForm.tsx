"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/product";

export function EditProductForm({
  product,
  categories,
  subcategories,
}: {
  product: any;
  categories: any[];
  subcategories: any[];
}) {
  const router = useRouter();

  /* =========================
     BASIC PRODUCT FIELDS
  ========================= */

  const [name, setName] = useState(product.name || "");
  const [description, setDescription] = useState(
    product.description || "",
  );
  const [brand, setBrand] = useState(product.brand || "");
  const [price, setPrice] = useState(
    product.price?.toString() || "",
  );
  const [stock, setStock] = useState(
    product.stock?.toString() || "",
  );

  const [sizes, setSizes] = useState<string[]>(
    product.sizes || [],
  );

  const [colors, setColors] = useState(
    product.colors?.join(", ") || "",
  );

  const [featured, setFeatured] = useState(
    product.isFeatured || false,
  );

  const [loading, setLoading] = useState(false);

  /* =========================
     SUBCATEGORY ID
  ========================= */

  const initialSubcategoryId =
    product.subcategory?._id?.toString() ||
    product.subcategory?.toString() ||
    "";

  /*
   * Find the subcategory from the complete subcategory list.
   *
   * This gives us:
   *
   * subcategory.parent
   *        ↓
   * category ID
   */
  const initialSubcategory = subcategories.find(
    (sub: any) =>
      String(sub._id) === String(initialSubcategoryId),
  );

  /*
   * Category is NOT stored in Product.
   *
   * It is derived from:
   *
   * Product.subcategory
   *        ↓
   * Category.parent
   */
  const initialCategoryId =
    initialSubcategory?.parent?.toString() ||
    product.subcategory?.parent?.toString() ||
    "";

  const [category, setCategory] = useState(
    initialCategoryId,
  );

  const [subcategory, setSubcategory] = useState(
    initialSubcategoryId,
  );

  /* =========================
     FILTER SUBCATEGORIES
  ========================= */

  const filteredSubcategories = subcategories.filter(
    (sub: any) =>
      String(sub.parent) === String(category),
  );

  /* =========================
     SUBMIT
  ========================= */

  async function handleSubmit() {
    if (!name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a description.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!subcategory) {
      alert("Please select a subcategory.");
      return;
    }

    if (!brand.trim()) {
      alert("Please enter a brand.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      alert("Please enter valid stock.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * We DO NOT send category anymore.
       *
       * Product stores only:
       *
       * subcategory
       */
      const result = await updateProduct(product._id, {
        name: name.trim(),
        description: description.trim(),

        subcategory,

        brand: brand.trim(),
        price: Number(price),
        stock: Number(stock),
        sizes,

        colors: colors
          .split(",")
          .map((color: string) => color.trim())
          .filter(Boolean),

        isFeatured: featured,
      });

      if (!result.success) {
        alert(result.message || "Failed to update product.");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Update product error:", error);

      alert(
        "Something went wrong while updating the product.",
      );

      setLoading(false);
    }
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">
        Edit Product
      </h1>

      <div className="space-y-5">

        {/* =========================
            PRODUCT NAME
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Product Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border p-3 text-black"
          />
        </div>

        {/* =========================
            DESCRIPTION
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="w-full rounded-lg border p-3 text-black"
          />
        </div>

        {/* =========================
            CATEGORY
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => {
              const newCategory = e.target.value;

              setCategory(newCategory);

              /*
               * Changing category means the old
               * subcategory is no longer valid.
               */
              setSubcategory("");
            }}
            className="w-full rounded-lg border p-3 text-black"
          >
            <option value="">
              Select Category
            </option>

            {categories.map((cat: any) => (
              <option
                key={cat._id.toString()}
                value={cat._id.toString()}
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* =========================
            SUBCATEGORY
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Subcategory
          </label>

          <select
            value={subcategory}
            onChange={(e) =>
              setSubcategory(e.target.value)
            }
            disabled={!category}
            className="w-full rounded-lg border p-3 text-black disabled:bg-gray-100"
          >
            <option value="">
              {!category
                ? "Select Category First"
                : filteredSubcategories.length === 0
                  ? "No Subcategories Available"
                  : "Select Subcategory"}
            </option>

            {filteredSubcategories.map(
              (sub: any) => (
                <option
                  key={sub._id.toString()}
                  value={sub._id.toString()}
                >
                  {sub.name}
                </option>
              ),
            )}
          </select>
        </div>

        {/* =========================
            BRAND
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Brand
          </label>

          <input
            value={brand}
            onChange={(e) =>
              setBrand(e.target.value)
            }
            className="w-full rounded-lg border p-3 text-black"
          />
        </div>

        {/* =========================
            PRICE
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            className="w-full rounded-lg border p-3 text-black"
          />
        </div>

        {/* =========================
            STOCK
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Stock
          </label>

          <input
            type="number"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
            className="w-full rounded-lg border p-3 text-black"
          />
        </div>

        {/* =========================
            SIZE
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Size
          </label>

          <select
            value={sizes[0] || ""}
            onChange={(e) =>
              setSizes(
                e.target.value
                  ? [e.target.value]
                  : [],
              )
            }
            className="w-full rounded-lg border p-3 text-black"
          >
            <option value="">
              Select Size
            </option>

            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        {/* =========================
            COLORS
        ========================= */}

        <div>
          <label className="mb-2 block font-medium text-black">
            Colors
          </label>

          <input
            value={colors}
            onChange={(e) =>
              setColors(e.target.value)
            }
            placeholder="Black, White"
            className="w-full rounded-lg border p-3 text-black"
          />
        </div>

        {/* =========================
            FEATURED
        ========================= */}

        <label className="flex items-center gap-3 text-black">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) =>
              setFeatured(e.target.checked)
            }
          />

          Featured Product
        </label>

        {/* =========================
            SAVE
        ========================= */}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Updating..."
            : "Update Product"}
        </button>
      </div>
    </div>
  );
}