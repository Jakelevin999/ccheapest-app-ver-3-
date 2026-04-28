'use client';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { getFavorites } from '../../lib/favorites';

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const refresh = () => setItems(getFavorites());
    refresh();
    window.addEventListener('cheaperfind:favorites-changed', refresh);
    return () => window.removeEventListener('cheaperfind:favorites-changed', refresh);
  }, []);

  return <section>
    <h1>Saved</h1>
    {items.length ? <div className="grid">{items.map((p) => <ProductCard key={p.link} product={p} />)}</div> : <div className="card empty"><h2>No saved items</h2></div>}
  </section>;
}
