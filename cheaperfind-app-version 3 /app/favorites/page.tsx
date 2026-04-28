'use client';
import { useEffect, useState } from 'react';
import ProductCard, { Product } from '../../components/ProductCard';
import { getFavorites } from '../../lib/favorites';

export default function FavoritesPage() {
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    const refresh = () => setItems(getFavorites());
    refresh();
    window.addEventListener('cheaperfind:favorites-changed', refresh);
    return () => window.removeEventListener('cheaperfind:favorites-changed', refresh);
  }, []);
  return <section>
    <div className="pageHeader"><span className="badge">Saved for later</span><h1>Favorites</h1><p className="muted">Tap the heart on any product to save it here. This MVP stores favorites on your device; Supabase user syncing is ready to add next.</p></div>
    {items.length ? <div className="grid">{items.map((p) => <ProductCard key={p.link} product={p} />)}</div> : <div className="card empty"><h2>No favorites yet</h2><p className="muted">Search for a product, then hit the heart or Save button.</p></div>}
  </section>;
}
