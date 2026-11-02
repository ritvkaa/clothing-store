import { AddProductForm } from "@/app/admin/products/_components/AddProductForm";
import { getCategories } from "@/app/actions/category";

export default async function AddProductPage() {
  const categories = await getCategories();

  const allSubcategories = categories.flatMap((category: any) =>
    (category.subcategories || []).map((subcategory: any) => ({
      _id: subcategory._id.toString(),
      name: subcategory.name,
      key: subcategory.key,
      parent: subcategory.parent?.toString(),
    })),
  );

  return (
    <AddProductForm
      categories={categories}
      subcategories={allSubcategories}
    />
  );
}