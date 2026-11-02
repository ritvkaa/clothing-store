"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function signupAction(
  name: string,
  email: string,
  password: string
) {
  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return {
      success: false,
      message: "Email already exists",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // 👇 Add this at the end of the function
  return {
    success: true,
    message: "User created successfully",
  };
}
