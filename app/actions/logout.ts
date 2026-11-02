
"use server";

import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import { cookies } from "next/headers";

const SESSION_COOKIES = {
  user: "closet_customer_session",
  admin: "closet_admin_session",
} as const;

export async function logoutAction(accountType: "user" | "admin") {
  if (accountType !== "user" && accountType !== "admin") {
    return { success: false };
  }

  const cookieStore = await cookies();
  const cookieName = SESSION_COOKIES[accountType];
  const sessionId = cookieStore.get(cookieName)?.value;

  if (sessionId) {
    await connectDB();
    await Session.deleteOne({ sessionId, accountType });
  }

  cookieStore.delete(cookieName);

  return { success: true };
}
