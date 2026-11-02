"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions/product";

export default function ManageProduct({
  product,
}: {
  product: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name}"?`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const result = await deleteProduct(product._id);

      if (!result.success) {
        alert(result.message);
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Something went wrong while deleting the product.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}