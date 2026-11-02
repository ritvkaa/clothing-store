"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Homepage from "@/models/Homepage";
import { getCurrentAdmin } from "@/lib/admin-auth";

export async function getHomepage() {
  await connectDB();

  let homepage = await Homepage.findOne().lean();

  if (!homepage) {
    homepage = await Homepage.create({
      heroImage: "",
      heroTitle: "NEW SEASON",
      heroSubtitle: "DEFINE YOUR STYLE",
      heroButtonText: "SHOP NOW",
    });
  }

  return JSON.parse(JSON.stringify(homepage));
}

export async function updateHero(
  heroImage: string,
  heroTitle: string,
  heroSubtitle: string,
  heroButtonText: string,
) {
  if (!(await getCurrentAdmin())) {
    return { success: false, message: "Unauthorized." };
  }

  await connectDB();

  if (!heroImage) {
    return {
      success: false,
      message: "Hero image is required",
    };
  }

  const homepage = await Homepage.findOneAndUpdate(
    {},
    {
      heroImage,
      heroTitle: heroTitle.trim() || "NEW SEASON",
      heroSubtitle: heroSubtitle.trim() || "DEFINE YOUR STYLE",
      heroButtonText: heroButtonText.trim() || "SHOP NOW",
    },
    {
      new: true,
      upsert: true,
    },
  );

  revalidatePath("/");
  revalidatePath("/admin/homepage");

  return {
    success: true,
    homepage: JSON.parse(JSON.stringify(homepage)),
  };
}
