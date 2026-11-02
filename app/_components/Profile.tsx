import Link from "next/link";
import { House, Heart, Package } from "lucide-react";

import { LogoutButton } from "./LogoutButton";

type ProfileProps = {
  user: {
    username: string;
    email: string;
  } | null;
};

export function Profile({ user }: ProfileProps) {
  return (
    <div className="container auth-container">
      <div className="card auth-card profile-card">
        {/* HOME ICON */}
        <Link
          href="/"
          aria-label="Go to home"
          title="Home"
          className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-sm text-black transition hover:bg-black hover:text-white"
        >
          <House size={18} strokeWidth={1.5} />
        </Link>

        {/* PROFILE HEADER */}
        <h2>My Account</h2>

        <p className="subtitle">Manage your CLOSET account and orders.</p>

        {/* USER INFORMATION */}
        <div className="profile-info">
          <div className="profile-row">
            <span className="label">Username</span>

            <span className="profile-value">
              {user?.username ?? "Not Logged In"}
            </span>
          </div>

          <div className="profile-row">
            <span className="label">Email</span>

            <span className="profile-value">
              {user?.email ?? "Not Logged In"}
            </span>
          </div>
        </div>

        {/* ORDERS + WISHLIST */}
        <div className="profile-actions">
          <Link href="/orders" className="profile-action">
            <span>
              <Package size={17} strokeWidth={1.5} />
              MY ORDERS
            </span>
          </Link>

          <Link href="/wishlist" className="profile-action">
            <span>
              <Heart size={17} strokeWidth={1.5} />
              WISHLIST
            </span>
          </Link>
        </div>

        {/* LOGOUT */}
        <div className="profile-logout">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
