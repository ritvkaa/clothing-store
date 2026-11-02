"use client";

import { toggleWishlist } from "@/app/actions/wishlist";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WishlistRemoveButton({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    if (loading) return;

    setLoading(true);

    const result = await toggleWishlist(productId);

    if (result.requiresLogin) {
      router.push("/login?redirect=/products/" + productId);
      return;
    }

    setLoading(false);

    if (result.success) {
      router.refresh();
    }
  };

  return (
    <button
      onClick={remove}
      disabled={loading}
      aria-label="Remove from wishlist"
      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-white text-lg shadow-sm transition hover:bg-black hover:text-white disabled:opacity-50"
    >
      ♥
    </button>
  );
}