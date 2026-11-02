"use client";

import { useState } from "react";
import { addCategory } from "@/app/actions/category";
import { useRouter } from "next/navigation";

export function AddCategoryButton() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;

    setLoading(true);

    const result = await addCategory(name);

    setLoading(false);

    if (result.success) {
      setName("");
      setOpen(false);
      router.refresh();
    } else {
      alert(result.message);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
      >
        + New Category
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-slate-800">
              Add Category
            </h2>

            <label className="mb-2 block font-medium text-slate-700">
              Category Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="mb-6 w-full rounded-lg border border-gray-300 p-3 text-black outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-5 py-2 text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-white"
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
