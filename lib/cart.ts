import { ShoppingResult } from './types';

const CART_KEY = 'cheaperfind:cart';

export function getCart(): ShoppingResult[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
}

export function addToCart(product: ShoppingResult) {
  const items = getCart();
  const exists = items.some(item => item.link === product.link);
  const next = exists ? items : [product, ...items];
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  return next;
}

export function removeFromCart(link: string) {
  const next = getCart().filter(item => item.link !== link);
  localStorage.setItem(CART_KEY, JSON.stringify(next));
  return next;
}
