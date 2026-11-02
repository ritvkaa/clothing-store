export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

const CART_KEY = "closet-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const cart = localStorage.getItem(CART_KEY);

  if (!cart) return [];

  try {
    return JSON.parse(cart);
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  const existingItem = cart.find(
    (cartItem) =>
      cartItem.id === item.id &&
      cartItem.size === item.size &&
      cartItem.color === item.color,
  );

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  saveCart(cart);
}

export function removeFromCart(
  id: string,
  size: string,
  color: string,
) {
  const cart = getCart().filter(
    (item) =>
      !(
        item.id === id &&
        item.size === size &&
        item.color === color
      ),
  );

  saveCart(cart);
}