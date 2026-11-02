"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";
import { Pencil } from "lucide-react";
import { updateSubCategory } from "@/app/actions/category";

interface EditSubCategoryButtonProps {
  categoryId: string;
  subcategoryId: string;
  currentName: string;
}

export function EditSubCategoryButton({
  categoryId,
  subcategoryId,
  currentName,
}: EditSubCategoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (!name.trim()) return;

    setLoading(true);

    const result = await updateSubCategory(
      categoryId,
      subcategoryId,
      name.trim(),
    );

    setLoading(false);

    if (!result.success) {
      return;
    }

    setOpen(false);
  }

  return (
    <>
      {/* Edit Icon */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-emerald-200 bg-white p-1.5 text-emerald-600 shadow-sm transition hover:bg-emerald-50"
        title="Edit subcategory"
      >
        <Pencil size={16} />
      </button>

      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              Edit Subcategory
            </h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-black outline-none focus:border-indigo-500"
              placeholder="Subcategory name"
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setName(currentName);
                  setOpen(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading || !name.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
