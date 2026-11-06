import { redirect } from "next/navigation";
import { getUser } from "@/app/actions/profile";
import { Login } from "../_components/Login";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { redirect: requestedPath } = await searchParams;
  const returnPath =
    typeof requestedPath === "string" &&
    requestedPath.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.includes("\\")
      ? requestedPath
      : "/";

  if (await getUser()) {
    redirect(returnPath);
  }

  return <Login />;
}
