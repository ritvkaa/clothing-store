import { Fragment } from "react";
import {
  Folder,
  Shapes,
  CornerDownRight,
} from "lucide-react";

import { getCategories } from "@/app/actions/category";
import { AddCategoryButton } from "./AddCategoryButton";
import { CategoryActions } from "./CategoryActions";
import { AddSubCategoryButton } from "./AddSubCategoryButton";
import { EditSubCategoryButton } from "./EditSubCategoryButton";
import { DeleteSubCategoryButton } from "./DeleteSubCategoryButton";

export async function CategoryManagement() {
  const categories = await getCategories();

  const totalCategories = categories.length;

  const totalSubcategories = categories.reduce(
    (count: number, category: any) =>
      count + (category.subcategories?.length || 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
            ADMIN / CATEGORIES
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Category Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organize your store categories and subcategories.
          </p>
        </div>

        <div className="text-xs font-medium tracking-[0.12em] text-slate-400">
          {totalCategories} CATEGORIES
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
              CATEGORIES
            </p>

            <Folder
              size={18}
              strokeWidth={1.7}
              className="text-slate-400"
            />
          </div>

          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalCategories}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Main store categories
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">
              SUBCATEGORIES
            </p>

            <Shapes
              size={18}
              strokeWidth={1.7}
              className="text-slate-400"
            />
          </div>

          <p className="mt-4 text-3xl font-semibold text-slate-900">
            {totalSubcategories}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Product classification groups
          </p>
        </div>
      </div>

      {/* CATEGORY LIST */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* SECTION HEADER */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Store Categories
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Manage categories and their subcategories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AddSubCategoryButton
              categories={categories.map((category: any) => ({
                _id: category._id.toString(),
                name: category.name,
              }))}
            />

            <AddCategoryButton />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                  CATEGORY
                </th>

                <th className="w-64 px-6 py-4 text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                  KEY
                </th>

                <th className="w-48 px-6 py-4 text-right text-[10px] font-semibold tracking-[0.15em] text-slate-500">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {categories.map((category: any) => (
                <Fragment key={category._id.toString()}>
                  {/* MAIN CATEGORY */}
                  <tr className="border-b border-slate-100 bg-white transition hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <Folder
                            size={17}
                            strokeWidth={1.7}
                            className="text-slate-700"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {category.name}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                              {category.subcategories?.length || 0}
                            </span>
                          </div>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Main category
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                        {category.key}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <CategoryActions
                        id={category._id.toString()}
                        name={category.name}
                      />
                    </td>
                  </tr>

                  {/* SUBCATEGORIES */}
                  {category.subcategories?.map(
                    (subcategory: any) => (
                      <tr
                        key={`${category._id}-${subcategory._id}`}
                        className="border-b border-slate-100 bg-slate-50/50 transition hover:bg-slate-100/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="ml-6 flex items-center">
                              <CornerDownRight
                                size={17}
                                strokeWidth={1.5}
                                className="text-slate-300"
                              />
                            </div>

                            <div className="ml-3 flex items-center gap-3">
                              <Shapes
                                size={16}
                                strokeWidth={1.7}
                                className="text-slate-500"
                              />

                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {subcategory.name}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Subcategory
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-md bg-white px-2.5 py-1 font-mono text-xs text-slate-500 shadow-sm ring-1 ring-slate-200">
                            {subcategory.key}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <EditSubCategoryButton
                              categoryId={category._id.toString()}
                              subcategoryId={subcategory._id.toString()}
                              currentName={subcategory.name}
                            />

                            <DeleteSubCategoryButton
                              categoryId={category._id.toString()}
                              subcategoryId={subcategory._id.toString()}
                              subcategoryName={subcategory.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {categories.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Folder
              size={28}
              strokeWidth={1.5}
              className="mx-auto text-slate-300"
            />

            <p className="mt-4 text-sm font-medium text-slate-700">
              No categories yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Create your first category to start organizing products.
            </p>
          </div>
        )}

        {/* FOOTER */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-400">
            {totalCategories} categories · {totalSubcategories} subcategories
          </p>
        </div>
      </section>
    </div>
  );
}