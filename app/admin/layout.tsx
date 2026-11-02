import { redirect } from "next/navigation";
import { hasAdminAccess } from "@/lib/admin-auth";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasAdminAccess())) {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
