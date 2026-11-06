import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import Session from "@/models/Session";
import User from "@/models/User";

export async function getCustomerUserId() {
  const sessionId = (await cookies()).get("closet_customer_session")?.value;
  if (!sessionId) return null;

  await connectDB();
  const session = await Session.findOne({
    sessionId,
    accountType: "user",
    expiresAt: { $gt: new Date() },
  }).select("user");

  if (!session?.user) return null;

  const user = await User.findById(session.user).select("isActive");
  if (!user?.isActive) return null;

  return user._id.toString();
}
