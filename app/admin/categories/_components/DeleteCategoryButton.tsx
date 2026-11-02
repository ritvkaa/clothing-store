"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";

export function DeleteCategoryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    await deleteCategory(id);

    setLoading(false);
    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-red-600 p-2 text-white hover:bg-red-700"
      >
        <Trash2 size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

            <h2 className="mb-3 text-xl font-bold text-slate-800">
              Delete Category
            </h2>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete
              <span className="font-semibold"> "{name}"</span>?
            </p>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border px-5 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-5 py-2 text-white"
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