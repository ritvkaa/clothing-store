"use client";

import Link from "next/link";
import { useState } from "react";
import { House } from "lucide-react";
import { loginAction } from "@/app/actions/login";
import { addToCart } from "@/app/actions/cart";

export function Login({
  accountType = "user",
}: {
  accountType?: "user" | "admin";
}) {
  const isAdminLogin = accountType === "admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const result = await loginAction(
        { email: email.trim(), password },
        accountType,
      );

      if (!result || !result.success) {
        setError(result?.message || "Login failed. Please try again.");
        return;
      }

      setSuccess(result.message);

      if (isAdminLogin) {
        window.location.assign("/admin");
        return;
      }

      const requestedPath = new URLSearchParams(window.location.search).get("redirect");
      const returnPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/";
      const pendingItem = sessionStorage.getItem("closet-pending-cart-item");

      if (pendingItem) {
        try {
          const item = JSON.parse(pendingItem);
          const cartResult = await addToCart(item);

          if (!cartResult.success) {
            sessionStorage.removeItem("closet-pending-cart-item");
            setError(`Signed in, but ${cartResult.message.toLowerCase()}.`);
            return;
          }

          sessionStorage.removeItem("closet-pending-cart-item");
          window.location.assign("/cart");
          return;
        } catch {
          setError("Signed in, but we couldn’t add the product. Please try again.");
          return;
        }
      }

      window.location.assign(returnPath);
    } catch (err) {
      console.error("[LOGIN CLIENT] Login failed:", err);
      setError("Unable to log in. Check the server terminal for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container">
      <div className="card auth-card relative">
        <Link
          href="/"
          aria-label="Go to home"
          title="Home"
          className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-sm text-black transition hover:bg-black hover:text-white"
        >
          <House size={18} strokeWidth={1.5} />
        </Link>

        <h2>{isAdminLogin ? "Admin Login" : "Login"}</h2>
        <p className="subtitle">
          {isAdminLogin
            ? "Sign in to manage your store."
            : "Sign in to continue to your account."}
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="text-black"
            autoComplete="email"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="text-black"
            autoComplete="current-password"
            required
          />

          {error && <p className="error-message">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : isAdminLogin
                ? "Sign In to Admin"
                : "Login"}
          </button>
        </form>

        {isAdminLogin ? (
          <p className="mt-6 text-center text-xs tracking-wide text-slate-500">
            Authorized administrators only
          </p>
        ) : (
          <p className="switch-page text-black">
            Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
          </p>
        )}
      </div>
    </div>
  );
}
