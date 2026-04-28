import { ShoppingResult } from './types';

const KEY = 'cheaperfind:favorites';

export function getFavorites(): ShoppingResult[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function isFavorite(link: string): boolean {
  return getFavorites().some(item => item.link === link);
}

export function toggleFavorite(product: ShoppingResult): ShoppingResult[] {
  const items = getFavorites();
  const exists = items.some(item => item.link === product.link);
  const next = exists ? items.filter(item => item.link !== product.link) : [product, ...items];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('cheaperfind:favorites-changed'));
  return next;
}
