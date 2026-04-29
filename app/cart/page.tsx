'use client';
import { useEffect, useState } from 'react';
import { getCart, removeFromCart } from '../../lib/cart';

function getPriceNumber(price: string = '') {
  const match = String(price).replace(/,/g, '').match(/([0-9]+(?:\.[0-9]{1,2})?)/);
  return match ? Number(match[1]) : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);

  function refresh() { setItems(getCart()); }

  useEffect(() => {
    refresh();
    window.addEventListener('cheaperfind:cart-changed', refresh);
    return () => window.removeEventListener('cheaperfind:cart-changed', refresh);
  }, []);

  function remove(link: string) {
    removeFromCart(link);
    refresh();
  }

  const cartTotal = items.reduce((sum, item) => sum + getPriceNumber(item.price), 0);

  return <section>
    <h1>Cart</h1>
    {items.length ? <>
      <div className="grid">{items.map(item => <div className="cartItem" key={item.link}>
        <button className="removeCart" onClick={() => remove(item.link)}>x</button>
        <div className="card product">
          {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
          <h3>{item.title}</h3>
          <p className="price">{item.price}</p>
          <p className="muted">{item.source}</p>
          <a className="button" href={item.link} target="_blank" rel="noreferrer">Checkout</a>
        </div>
      </div>)}</div>
      <div className="card" style={{marginTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16}}>
        <h2 style={{margin:0}}>Cart Total</h2>
        <p className="price" style={{margin:0}}>{formatMoney(cartTotal)}</p>
      </div>
    </> : <div className="card empty"><h2>Cart empty</h2></div>}
  </section>;
}
