export type WishlistItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
};

const WISHLIST_KEY = "closet-wishlist";

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  const wishlist = localStorage.getItem(WISHLIST_KEY);

  if (!wishlist) return [];

  try {
    return JSON.parse(wishlist);
  } catch {
    return [];
  }
}

export function saveWishlist(wishlist: WishlistItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(wishlist),
  );
}

export function toggleWishlist(item: WishlistItem) {
  const wishlist = getWishlist();

  const exists = wishlist.some(
    (wishlistItem) => wishlistItem.id === item.id,
  );

  const updated = exists
    ? wishlist.filter(
        (wishlistItem) => wishlistItem.id !== item.id,
      )
    : [...wishlist, item];

  saveWishlist(updated);

  return !exists;
}

export function isInWishlist(id: string) {
  return getWishlist().some(
    (item) => item.id === id,
  );
}
