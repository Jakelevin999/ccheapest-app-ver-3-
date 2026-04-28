'use client';
import { useEffect, useState } from 'react';
import { addToCart } from '../../lib/cart';

const categories = ['Men', 'Women', 'Shoes', 'Bags', 'Accessories', 'Outfits'];
const sizes = ['Any', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '7', '8', '9', '10', '11', '12', '13'];

export default function StylePage() {
  const [style, setStyle] = useState('');
  const [category, setCategory] = useState('Men');
  const [size, setSize] = useState('Any');
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  async function generate() {
    const sizePart = size === 'Any' ? '' : ` size ${size}`;
    const query = `${category} ${style}${sizePart} cheap product`;
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: query })
    });
    const data = await res.json();
    setItems(data.results || []);
    setIndex(0);
  }

  function addCurrentToCart() {
    const item = items[index];
    if (!item) return;
    addToCart(item);
    setIndex(i => i + 1);
  }

  function skipCurrent() {
    setIndex(i => i + 1);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!items[index]) return;
      if (e.key === 'ArrowLeft') skipCurrent();
      if (e.key === 'ArrowRight') addCurrentToCart();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, index]);

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchStart;
    if (Math.abs(diff) > 70) {
      if (diff > 0) addCurrentToCart();
      else skipCurrent();
    }
    setTouchStart(null);
  }

  const item = items[index];

  return (
    <div className="stylePage" style={{minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <h1>Style</h1>
      <div className="card searchBox" style={{width:'min(760px, 100%)'}}>
        <input className="input" placeholder="Describe your style" value={style} onChange={e => setStyle(e.target.value)} />
        <div className="filterRow">
          {categories.map(f => (
            <button type="button" key={f} className={category === f ? 'filter active' : 'filter'} onClick={() => setCategory(f)}>{f}</button>
          ))}
        </div>
        <div className="filterRow">
          {sizes.map(s => (
            <button type="button" key={s} className={size === s ? 'filter active' : 'filter'} onClick={() => setSize(s)}>{s}</button>
          ))}
        </div>
        <button className="button" onClick={generate} disabled={!style.trim()}>Generate</button>
      </div>

      {item ? (
        <div className="swipeWrap" style={{width:'min(520px, 100%)'}}>
          <div className="card swipeCard" onTouchStart={e => setTouchStart(e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
            {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
            <h3>{item.title}</h3>
            <p className="price">{item.price}</p>
            <p className="muted">{item.source}</p>
            <div className="row">
              <button className="button secondary" onClick={skipCurrent}>Skip</button>
              <button className="button" onClick={addCurrentToCart}>Add to Cart</button>
            </div>
          </div>
        </div>
      ) : items.length > 0 ? (
        <div className="card empty"><h2>Done</h2></div>
      ) : null}
    </div>
  );
}
