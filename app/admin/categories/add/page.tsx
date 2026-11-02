import { redirect } from "next/navigation";

export default function AddCategoryPage() {
  // Category creation is handled from the category management screen.
  redirect("/admin/categories");
}
