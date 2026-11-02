import { getProductById } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import { EditProductForm } from "../../_components/EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, allCategories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    return (
      <div className="p-8 text-slate-900">
        Product not found.
      </div>
    );
  }

  const categories = allCategories
    .filter((item: any) => item.parent == null)
    .map((item: any) => ({
      _id: item._id.toString(),
      name: item.name,
      key: item.key,
    }));

  const subcategories = allCategories.flatMap((category: any) =>
    (category.subcategories || []).map((subcategory: any) => ({
      _id: subcategory._id.toString(),
      name: subcategory.name,
      key: subcategory.key,
      parent: subcategory.parent?.toString(),
    })),
  );

  return (
    <EditProductForm
      product={product}
      categories={categories}
      subcategories={subcategories}
    />
  );
}