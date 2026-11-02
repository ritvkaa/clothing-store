import { notFound } from "next/navigation";
import { getProductById } from "@/app/actions/product";
import ManageProduct from "./ManageProduct";

export default async function ManageProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ManageProduct product={product} />;
}