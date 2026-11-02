"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function signupAction(data: {
  username: string;
  email: string;
  password: string;
}) {
  await connectDB();

  const { username, email, password } = data;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return {
      success: false,
      message: "User already exists",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashedPassword,
    role: "user",
  });

  return {
    success: true,
    message: "User created successfully",
  };
}
