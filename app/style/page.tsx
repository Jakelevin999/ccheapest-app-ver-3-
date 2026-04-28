'use client';
import { useState } from 'react';
import { addToCart } from '../../lib/cart';

export default function StylePage() {
  const [style, setStyle] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  async function generate() {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: style })
    });
    const data = await res.json();
    setItems(data.results || []);
    setIndex(0);
  }

  function swipeRight() {
    addToCart(items[index]);
    setIndex(i => i + 1);
  }

  function swipeLeft() {
    setIndex(i => i + 1);
  }

  const item = items[index];

  return (
    <div style={{padding:20}}>
      <input placeholder="Describe style (streetwear, old money...)" value={style} onChange={e=>setStyle(e.target.value)} />
      <button onClick={generate}>Generate</button>

      {item && (
        <div className="card">
          <img src={item.image} style={{width:'100%', borderRadius:12}} />
          <h3>{item.title}</h3>
          <p>{item.price}</p>
          <div style={{display:'flex', gap:10}}>
            <button onClick={swipeLeft}>Skip</button>
            <button onClick={swipeRight}>Add to Cart</button>
          </div>
        </div>
      )}
    </div>
  );
}
