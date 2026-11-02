
"use server";

import Session from "@/models/Session";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";
import { cookies } from "next/headers";
import { getCurrentAdmin } from "@/lib/admin-auth";

const CUSTOMER_SESSION_COOKIE = "closet_customer_session";

const ADMIN_ONLINE_WINDOW_MS = 2 * 60 * 1000;

/* -------------------------------------------------
   CURRENT CUSTOMER
------------------------------------------------- */

export async function getUser() {
  const sessionId = (await cookies()).get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  await connectDB();

  const session = await Session.findOne({
    sessionId,
    accountType: "user",
    expiresAt: { $gt: new Date() },
  });

  if (!session?.user) return null;

  const user = await User.findById(session.user);

  if (!user || !user.isActive) return null;

  session.lastSeenAt = new Date();
  await session.save();

  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: "user",
    isActive: user.isActive,
  };
}


/* -------------------------------------------------
   ADMIN AUTHORIZATION — SERVER ONLY
------------------------------------------------- */

/* -------------------------------------------------
   CUSTOMERS
------------------------------------------------- */

export async function getCustomers() {
  if (!(await getCurrentAdmin())) return [];

  const customers = await User.find({ role: "user" })
    .select("username email phone isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(customers));
}

/* -------------------------------------------------
   ADMINS
------------------------------------------------- */

export async function getAdmins() {
  if (!(await getCurrentAdmin())) return [];

  const admins = await Admin.find({})
    .select("username email isActive createdAt lastSeenAt")
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(admins));
}

/* -------------------------------------------------
   ALL ACCOUNTS — ADMIN ONLY
------------------------------------------------- */

export async function getAllUsers() {
  if (!(await getCurrentAdmin())) return [];

  const [customers, admins] = await Promise.all([
    User.find({ role: "user" })
      .select("username email phone createdAt isActive")
      .lean(),
    Admin.find({})
      .select("username email createdAt isActive")
      .lean(),
  ]);

  return JSON.parse(
    JSON.stringify([
      ...customers.map((u) => ({ ...u, accountType: "user" })),
      ...admins.map((a) => ({ ...a, accountType: "admin" })),
    ]),
  );
}

/* -------------------------------------------------
   ADMIN ONLINE STATUS
------------------------------------------------- */

export async function isAdminOnline(
  adminId: string,
) {
  if (!(await getCurrentAdmin())) return false;

  const targetAdmin = await Admin.findById(adminId).select("lastSeenAt");

  if (!targetAdmin?.lastSeenAt) return false;

  return (
    Date.now() - new Date(targetAdmin.lastSeenAt).getTime() <=
    ADMIN_ONLINE_WINDOW_MS
  );
}

/* -------------------------------------------------
   CREATE ADMIN — ADMIN ONLY
------------------------------------------------- */

export async function createAdmin(
  data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  },
) {
  if (!(await getCurrentAdmin())) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const username = data.username.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;

  if (!username || !email || !password) {
    return {
      success: false,
      message: "Username, email and password are required.",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must contain at least 6 characters.",
    };
  }

  const existing = await Promise.all([
    User.findOne({ $or: [{ username }, { email }] }),
    Admin.findOne({ $or: [{ username }, { email }] }),
  ]);

  if (existing.some(Boolean)) {
    return {
      success: false,
      message: "An account with this username or email already exists.",
    };
  }

  const newAdmin = await Admin.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    isActive: true,
    lastSeenAt: null,
  });

  return {
    success: true,
    message: "Admin account created successfully.",
    admin: {
      id: newAdmin._id.toString(),
      username: newAdmin.username,
      email: newAdmin.email,
    },
  };
}

/* -------------------------------------------------
   REMOVE ADMIN — ADMIN ONLY
------------------------------------------------- */

export async function removeAdmin(adminId: string) {
  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const targetAdmin = await Admin.findById(adminId);

  if (!targetAdmin) {
    return { success: false, message: "Admin account not found." };
  }

  if (targetAdmin._id.toString() === currentAdmin._id.toString()) {
    return {
      success: false,
      message: "You cannot remove your own admin account.",
    };
  }

  const online =
    targetAdmin.lastSeenAt &&
    Date.now() - new Date(targetAdmin.lastSeenAt).getTime() <=
      ADMIN_ONLINE_WINDOW_MS;

  if (online) {
    return {
      success: false,
      message: "This admin is currently online and cannot be removed.",
    };
  }

  await Session.deleteMany({ admin: targetAdmin._id });
  await Admin.findByIdAndDelete(adminId);

  return {
    success: true,
    message: "Admin account removed successfully.",
  };
}

/* -------------------------------------------------
   ENABLE / DISABLE CUSTOMER
------------------------------------------------- */

export async function setCustomerStatus(
  customerId: string,
  isActive: boolean,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  const customer = await User.findOne({
    _id: customerId,
    role: "user",
  });

  if (!customer) {
    return { success: false, message: "Customer not found." };
  }

  customer.isActive = isActive;
  await customer.save();

  if (!isActive) {
    await Session.deleteMany({ user: customer._id });
  }

  return {
    success: true,
    message: isActive
      ? "Customer account activated."
      : "Customer account disabled.",
  };
}

/* -------------------------------------------------
   DELETE CUSTOMER
------------------------------------------------- */

export async function deleteCustomer(
  customerId: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  const customer = await User.findOne({
    _id: customerId,
    role: "user",
  });

  if (!customer) {
    return { success: false, message: "Customer not found." };
  }

  await Session.deleteMany({ user: customer._id });
  await User.findByIdAndDelete(customerId);

  return {
    success: true,
    message: "Customer account removed successfully.",
  };
}
