"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "../actions/logout";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction("user");

    router.push("/");
    router.refresh();
  }

  return (
    <button className="secondary-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}
