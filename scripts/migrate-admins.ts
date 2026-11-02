
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
});

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: false,
});

async function migrateAdmins() {
  let mongoose: typeof import("mongoose") | undefined;

  try {
    mongoose = await import("mongoose");

    const { connectDB } = await import("../lib/mongodb");
    const Admin = (await import("../models/Admin")).default;

    const connection = await connectDB();

    const legacyAdmins = await connection.connection
      .collection("users")
      .find({ role: "admin" })
      .toArray();

    if (legacyAdmins.length === 0) {
      console.log("No legacy admin records found.");
      return;
    }

    for (const legacy of legacyAdmins) {
      if (!legacy.username || !legacy.email || !legacy.password) {
        throw new Error(
          `Admin record ${legacy._id} is missing required fields.`,
        );
      }

      const username = String(legacy.username).trim();
      const email = String(legacy.email).trim().toLowerCase();

      const existing = await Admin.findOne({
        $or: [{ email }, { username }],
      });

      if (existing) {
        console.log(
          `Skipped ${email}: a matching admin already exists. Verify it manually.`,
        );
        continue;
      }

      await Admin.create({
        username,
        email,
        password: legacy.password,
        isActive: legacy.isActive ?? true,
        lastSeenAt: legacy.lastSeenAt ?? null,
        createdAt: legacy.createdAt,
        updatedAt: legacy.updatedAt,
      });

      console.log(`Copied admin: ${email}`);
    }

    console.log(
      "Migration finished. Original records in users were not deleted.",
    );
  } catch (error) {
    console.error("Admin migration failed:", error);
    process.exitCode = 1;
  } finally {
    if (mongoose) {
      await mongoose.disconnect();
    }
  }
}

migrateAdmins();
