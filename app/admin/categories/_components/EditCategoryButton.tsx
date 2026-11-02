"use client";

import { useState } from "react";
import { SquarePen } from "lucide-react";
import { updateCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";

export function EditCategoryButton({
  id,
  currentName,
}: {
  id: string;
  currentName: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (!name.trim()) return;

    setLoading(true);

    await updateCategory(id, name);

    setLoading(false);
    setOpen(false);

    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-yellow-500 p-2 text-white hover:bg-yellow-600"
      >
        <SquarePen size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

            <h2 className="mb-5 text-xl font-bold text-slate-800">
              Edit Category
            </h2>

            <label className="mb-2 block text-slate-700">
              Category Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-6 w-full rounded-lg border p-3 text-black"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-lg border px-5 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-white"
              >
                {loading ? "Updating..." : "Update"}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}