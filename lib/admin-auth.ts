import "server-only";

import { cookies } from "next/headers";
import Session from "@/models/Session";
import Admin from "@/models/Admin";
import { connectDB } from "@/lib/mongodb";

const ADMIN_SESSION_COOKIE = "closet_admin_session";

export async function getCurrentAdmin() {
  const sessionId = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  await connectDB();

  const session = await Session.findOne({
    sessionId,
    accountType: "admin",
    expiresAt: { $gt: new Date() },
  });

  if (!session?.admin) return null;

  const admin = await Admin.findById(session.admin);
  if (!admin || !admin.isActive) return null;

  session.lastSeenAt = new Date();
  await session.save();

  admin.lastSeenAt = new Date();
  await admin.save();

  return admin;
}

export async function hasAdminAccess() {
  return Boolean(await getCurrentAdmin());
}
