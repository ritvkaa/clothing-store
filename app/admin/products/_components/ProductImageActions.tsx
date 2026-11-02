"use client";

import { useState } from "react";
import {
  Trash2,
  Star,
} from "lucide-react";
import {
  deleteProductImage,
  setDefaultProductImage,
} from "@/app/actions/product";

interface ProductImageActionsProps {
  productId: string;
  imageUrl: string;
  isDefault: boolean;
}

export default function ProductImageActions({
  productId,
  imageUrl,
  isDefault,
}: ProductImageActionsProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const result = await deleteProductImage(
        productId,
        imageUrl,
      );

      if (!result.success) {
        alert(result.message);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Delete image error:", error);
      alert("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMakeDefault() {
    if (isDefault) {
      return;
    }

    setLoading(true);

    try {
      const result = await setDefaultProductImage(
        productId,
        imageUrl,
      );

      if (!result.success) {
        alert(result.message);
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Set default image error:", error);
      alert("Failed to set default image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 border-t border-slate-200 p-3">
      {/* Make Default */}
      <button
        type="button"
        onClick={handleMakeDefault}
        disabled={loading || isDefault}
        title={
          isDefault
            ? "This is the default image"
            : "Make this the default image"
        }
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isDefault
            ? "cursor-default bg-slate-100 text-slate-400"
            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
        } disabled:opacity-50`}
      >
        <Star
          size={16}
          fill={isDefault ? "currentColor" : "none"}
        />

        {isDefault ? "Default" : "Make Default"}
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        title="Delete image"
        className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}