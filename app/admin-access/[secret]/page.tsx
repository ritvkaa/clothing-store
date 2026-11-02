import { timingSafeEqual } from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { Login } from "@/app/_components/Login";
import { hasAdminAccess } from "@/lib/admin-auth";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ secret: string }>;
}) {
  const { secret } = await params;
  const expectedSecret = process.env.ADMIN_LOGIN_SECRET;

  if (
    !expectedSecret ||
    !/^[A-Za-z0-9_-]{32,128}$/.test(secret) ||
    secret.length !== expectedSecret.length ||
    !timingSafeEqual(Buffer.from(secret), Buffer.from(expectedSecret))
  ) {
    notFound();
  }

  if (await hasAdminAccess()) {
    redirect("/admin");
  }

  return <Login accountType="admin" />;
}
