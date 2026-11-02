"use client";

import { toggleWishlist } from "@/app/actions/wishlist";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductWishlistButton({
  productId,
  initialWishlisted = false,
}: {
  productId: string;
  initialWishlisted?: boolean;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    try {
      const result = await toggleWishlist(productId);
      if (result.requiresLogin) {
        router.push("/login");
        return;
      }
      if (result.success) {
        setWishlisted(Boolean(result.isWishlisted));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 text-neutral-800 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 disabled:cursor-wait disabled:opacity-60"
    >
      <Heart
        size={19}
        strokeWidth={1.7}
        className={wishlisted ? "fill-rose-600 text-rose-600" : ""}
      />
    </button>
  );
}
