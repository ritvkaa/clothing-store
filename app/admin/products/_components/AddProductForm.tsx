"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "@/app/actions/product";

export function AddProductForm({
  categories,
  subcategories,
}: {
  categories: any[];
  subcategories: any[];
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState("");
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get subcategories belonging to the selected category
  const filteredSubcategories = subcategories.filter(
    (sub: any) => sub.parent?.toString() === category,
  );

  async function handleSubmit() {
    try {
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

      if (sizes.length === 0) {
        alert("Please select a size.");
        return;
      }

      setLoading(true);

      const result = await addProduct({
        name: name.trim(),
        description: description.trim(),
        subcategory,
        brand: brand.trim(),
        price: Number(price),
        stock: Number(stock),
        sizes,
        colors: colors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean),
        isFeatured: featured,
      });

      if (!result.success) {
        alert(result.message || "Failed to add product.");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Add product error:", error);
      alert("Something went wrong while adding the product.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Add Product</h1>

      <div className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="mb-2 block font-medium text-black">
            Product Name
          </label>

          <input
            className="w-full rounded-lg border p-3 text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block font-medium text-black">
            Description
          </label>

          <textarea
            rows={5}
            className="w-full rounded-lg border p-3 text-black"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the product description here..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 block font-medium text-black">Category</label>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);

              // Reset subcategory whenever category changes
              setSubcategory("");
            }}
            className="w-full rounded-lg border p-3 text-black"
          >
            <option value="">Select Category</option>

            {categories.map((cat: any) => (
              <option key={cat._id.toString()} value={cat._id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div>
          <label className="mb-2 block font-medium text-black">
            Subcategory
          </label>

          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={!category}
            className="w-full rounded-lg border border-gray-300 p-3 text-black disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">
              {!category
                ? "Select Category First"
                : filteredSubcategories.length === 0
                  ? "No Subcategories Available"
                  : "Select Subcategory"}
            </option>

            {filteredSubcategories.map((sub: any) => (
              <option key={sub._id.toString()} value={sub._id.toString()}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label className="mb-2 block font-medium text-black">Brand</label>

          <input
            className="w-full rounded-lg border p-3 text-black"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand"
          />
        </div>

        {/* Price */}
        <div>
          <label className="mb-2 block font-medium text-black">Price</label>

          <input
            type="number"
            min="0"
            className="w-full rounded-lg border p-3 text-black"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="mb-2 block font-medium text-black">Stock</label>

          <input
            type="number"
            min="0"
            className="w-full rounded-lg border p-3 text-black"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stock"
          />
        </div>

        {/* Size */}
        <div>
          <label className="mb-2 block font-medium text-black">Size</label>

          <select
            className="w-full rounded-lg border p-3 text-black"
            value={sizes[0] ?? ""}
            onChange={(e) => setSizes([e.target.value])}
          >
            <option value="">Select Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        {/* Colors */}
        <div>
          <label className="mb-2 block font-medium text-black">Colors</label>

          <input
            className="w-full rounded-lg border p-3 text-black"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="Black, White"
          />
        </div>

        {/* Featured */}
        <label className="flex items-center gap-3 text-black">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Featured Product
        </label>

        {/* Save */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}
