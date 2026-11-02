"use client";

import { toggleWishlist } from "@/app/actions/wishlist";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WishlistButton({
  productId,
  initialWishlisted = false,
}: {
  productId: string;
  initialWishlisted?: boolean;
}) {
  const router = useRouter();

  const [wishlisted, setWishlisted] =
    useState(initialWishlisted);

  const [loading, setLoading] = useState(false);

  const handleWishlist = async () => {
    if (loading) return;

    setLoading(true);

    const result = await toggleWishlist(productId);

    setLoading(false);

    if (result.requiresLogin) {
      router.push("/login");
      return;
    }

    if (!result.success) {
      return;
    }

    setWishlisted(!!result.isWishlisted);

    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={loading}
      aria-label={
        wishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className="flex min-h-12 items-center gap-3 border border-black/30 px-6 py-3 transition hover:bg-black hover:text-white disabled:opacity-50"
    >
      <span className="text-xl leading-none">
        {wishlisted ? "♥" : "♡"}
      </span>

      <span className="text-xs tracking-[0.18em]">
        {wishlisted
          ? "SAVED TO WISHLIST"
          : "ADD TO WISHLIST"}
      </span>
    </button>
  );
}