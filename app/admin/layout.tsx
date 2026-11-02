import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <AdminLayoutClient adminName={admin.username} adminEmail={admin.email}>
      {children}
    </AdminLayoutClient>
  );
}
