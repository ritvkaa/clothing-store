
"use server";

import Session from "@/models/Session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
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
   UPDATE ADMIN — ADMIN ONLY
------------------------------------------------- */

export async function updateAdmin(
  adminId: string,
  data: {
    username: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  },
) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return { success: false, message: "Unauthorized." };
  }

  if (!/^[a-f\d]{24}$/i.test(adminId)) {
    return { success: false, message: "Admin account not found." };
  }

  if (
    !data ||
    typeof data.username !== "string" ||
    typeof data.email !== "string" ||
    (data.currentPassword !== undefined && typeof data.currentPassword !== "string") ||
    (data.newPassword !== undefined && typeof data.newPassword !== "string") ||
    (data.confirmNewPassword !== undefined && typeof data.confirmNewPassword !== "string")
  ) {
    return { success: false, message: "Invalid administrator details." };
  }

  const username = data.username.trim();
  const email = data.email.trim().toLowerCase();
  const currentPassword = data.currentPassword ?? "";
  const newPassword = data.newPassword ?? "";
  const confirmNewPassword = data.confirmNewPassword ?? "";
  const changingPassword = Boolean(
    currentPassword || newPassword || confirmNewPassword,
  );

  if (!username || !email) {
    return { success: false, message: "Username and email are required." };
  }
  if (username.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid username and email address." };
  }
  if (changingPassword) {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return {
        success: false,
        message: "Enter your current password, a new password, and confirm it.",
      };
    }
    if (!(await bcrypt.compare(currentPassword, currentAdmin.password))) {
      return { success: false, message: "Your current password is incorrect." };
    }
    if (newPassword.length < 6) {
      return {
        success: false,
        message: "New password must contain at least 6 characters.",
      };
    }
    if (newPassword !== confirmNewPassword) {
      return { success: false, message: "New passwords do not match." };
    }
  }

  const targetAdmin = await Admin.findById(adminId);
  if (!targetAdmin) {
    return { success: false, message: "Admin account not found." };
  }

  const [adminConflict, customerConflict] = await Promise.all([
    Admin.findOne({
      _id: { $ne: targetAdmin._id },
      $or: [{ username }, { email }],
    }),
    User.findOne({
      role: { $ne: "admin" },
      $or: [{ username }, { email }],
    }),
  ]);

  if (adminConflict || customerConflict) {
    return {
      success: false,
      message: "That username or email is already used by another account.",
    };
  }

  targetAdmin.username = username;
  targetAdmin.email = email;
  if (changingPassword) {
    targetAdmin.password = await bcrypt.hash(newPassword, 10);
  }
  await targetAdmin.save();

  if (changingPassword) {
    const sessionId = (await cookies()).get("closet_admin_session")?.value;
    const sessionQuery = {
      admin: targetAdmin._id,
      accountType: "admin" as const,
    };
    if (
      targetAdmin._id.toString() === currentAdmin._id.toString() &&
      sessionId
    ) {
      await Session.deleteMany({ ...sessionQuery, sessionId: { $ne: sessionId } });
    } else {
      await Session.deleteMany(sessionQuery);
    }
  }

  revalidatePath("/admin/admins");
  const editingSelf =
    targetAdmin._id.toString() === currentAdmin._id.toString();
  return {
    success: true,
    message: changingPassword
      ? editingSelf
        ? "Admin details and password updated. Other sessions were signed out."
        : "Admin details and password updated. They must sign in again."
      : "Admin details updated.",
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
