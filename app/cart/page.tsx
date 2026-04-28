'use client';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { getCart, removeFromCart } from '../../lib/cart';

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);

  function refresh() {
    setItems(getCart());
  }

  useEffect(() => {
    refresh();
    window.addEventListener('cheaperfind:cart-changed', refresh);
    return () => window.removeEventListener('cheaperfind:cart-changed', refresh);
  }, []);

  function remove(link: string) {
    removeFromCart(link);
    refresh();
  }

  return <section>
    <h1>Cart</h1>
    {items.length ? <div className="grid">{items.map(item => <div className="cartItem" key={item.link}>
      <button className="removeCart" onClick={() => remove(item.link)}>x</button>
      <ProductCard product={item} />
    </div>)}</div> : <div className="card empty"><h2>Cart empty</h2></div>}
  </section>;
}
