"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signupAction } from "@/app/actions/auth";

export function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await signupAction({
      username,
      email,
      password,
    });

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    router.push("/login");
  };

  return (
    <div className="container auth-container">
      <div className="card auth-card">
        <div className="back-home">
          <Link href="/" className="back-btn">
            ← Back to Home
          </Link>
        </div>

        <h2>Create Account</h2>

        <p className="subtitle">
          Fill in your details to create a new account.
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-black"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-black"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-black"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="text-black"
        />

        {error && <p className="error-message">{error}</p>}

        {success && <p className="success-message">{success}</p>}

        <button className="primary-btn full-width" onClick={handleSignup}>
          Sign Up
        </button>

        <p className="switch-page text-black">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
