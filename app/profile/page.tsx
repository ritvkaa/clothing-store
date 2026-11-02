
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../actions/profile";
import { Profile } from "../_components/Profile";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const result = await getUser();

        if (!result) {
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setUser(result);
          setLoading(false);
        }
      } catch (error) {
        console.error("Profile loading failed:", error);

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="container py-10 text-center">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-10 text-center">
        Unable to load your profile. Please try logging in again.
      </div>
    );
  }

  return <Profile user={user} />;
}
