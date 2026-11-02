"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";
import Session from "@/models/Session";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

const CUSTOMER_SESSION_COOKIE = "closet_customer_session";
const ADMIN_SESSION_COOKIE = "closet_admin_session";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function loginAction(
  data: { email: string; password: string },
  accountType: "user" | "admin",
) {
  try {
    await connectDB();

    const email = data.email.trim().toLowerCase();

    let account = accountType === "admin"
      ? await Admin.findOne({ email })
      : await User.findOne({
        email,
        $or: [{ role: "user" }, { role: { $exists: false } }],
      });
    let legacyAdmin = false;

    if (accountType === "admin" && !account) {
      account = await User.findOne({ email, role: "admin" });
      legacyAdmin = Boolean(account);
    }

    if (!account) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    if (!account.isActive) {
      return {
        success: false,
        message: "Your account has been disabled.",
      };
    }

    const valid = await bcrypt.compare(data.password, account.password);

    if (!valid) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    if (legacyAdmin) {
      const usernameConflict = await Admin.findOne({
        username: account.username,
      });

      if (usernameConflict) {
        return {
          success: false,
          message:
            "This administrator account needs manual migration. Contact another administrator.",
        };
      }

      account = await Admin.create({
        username: account.username,
        email: account.email,
        password: account.password,
        isActive: account.isActive,
        lastSeenAt: null,
      });
    }

    const cookieStore = await cookies();
    const cookieName = accountType === "admin" ? ADMIN_SESSION_COOKIE : CUSTOMER_SESSION_COOKIE;
    const sessionId = randomUUID();
    const previousSessionId = cookieStore.get(cookieName)?.value;

    if (previousSessionId) {
      await Session.deleteOne({ sessionId: previousSessionId });
    }

    await Session.create({
      sessionId,
      user: accountType === "user" ? account._id : null,
      admin: accountType === "admin" ? account._id : null,
      accountType,
      lastSeenAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    account.lastSeenAt = new Date();
    await account.save();

    cookieStore.set(cookieName, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return {
      success: true,
      message: "Login successful.",
      role: accountType,
    };
  } catch (error) {
    console.error("[LOGIN] Failed:", error);

    return {
      success: false,
      message: "Login failed. Check the server terminal.",
    };
  }
}
