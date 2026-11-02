"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteSubCategory } from "@/app/actions/category";

interface DeleteSubCategoryButtonProps {
  categoryId: string;
  subcategoryId: string;
  subcategoryName: string;
}

export function DeleteSubCategoryButton({
  categoryId,
  subcategoryId,
  subcategoryName,
}: DeleteSubCategoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    await deleteSubCategory(categoryId, subcategoryId);

    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-200 bg-white p-1.5 text-red-500 shadow-sm transition hover:bg-red-50"
        title="Delete subcategory"
      >
        <Trash2 size={16} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Delete Subcategory
            </h2>

            <p className="text-slate-600">
              Are you sure you want to delete{" "}
              <strong>"{subcategoryName}"</strong>?
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border px-4 py-2 text-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
