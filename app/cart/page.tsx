'use client';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { getCart } from '../../lib/cart';

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const refresh = () => setItems(getCart());
    refresh();
    window.addEventListener('cheaperfind:cart-changed', refresh);
    return () => window.removeEventListener('cheaperfind:cart-changed', refresh);
  }, []);
  return <section>
    <h1>Cart</h1>
    {items.length ? <div className="grid">{items.map(item => <ProductCard key={item.link} product={item} />)}</div> : <div className="card empty"><h2>Cart empty</h2></div>}
  </section>;
}
