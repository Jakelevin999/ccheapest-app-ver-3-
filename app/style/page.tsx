'use client';
import { useEffect, useState } from 'react';
import { addToCart } from '../../lib/cart';

const genders = ['Any', 'Men', 'Women', 'Unisex'];
const clothingSizes = ['Any', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const shoeSizes = ['Any', '6', '7', '8', '9', '10', '11', '12', '13'];
const categories = ['Clothes', 'Shoes', 'Bags', 'Accessories', 'Outfits'];

export default function StylePage() {
  const [style, setStyle] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gender, setGender] = useState('Any');
  const [category, setCategory] = useState('Clothes');
  const [size, setSize] = useState('Any');
  const [shoeSize, setShoeSize] = useState('Any');
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function buildQuery() {
    const parts = [style.trim()];
    if (gender !== 'Any') parts.unshift(gender);
    if (category !== 'Clothes') parts.push(category);
    if (size !== 'Any' && category !== 'Shoes') parts.push(`size ${size}`);
    if (shoeSize !== 'Any' && category === 'Shoes') parts.push(`shoe size ${shoeSize}`);
    parts.push('cheap affordable buy');
    return parts.filter(Boolean).join(' ');
  }

  async function generate() {
    const query = buildQuery();
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: query })
    });
    const data = await res.json();
    setItems(data.results || []);
    setIndex(0);
    localStorage.setItem('cheaperfind:lastResults', JSON.stringify(data));
  }

  function addCurrentToCart() {
    const item = items[index];
    if (!item) return;
    addToCart(item);
    setIndex(i => i + 1);
  }

  function skipCurrent() { setIndex(i => i + 1); }

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
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 70) diff > 0 ? addCurrentToCart() : skipCurrent();
    setTouchStart(null);
  }

  const item = items[index];

  return (
    <div className="stylePage" style={{minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <h1>Style</h1>
      <div className="card searchBox" style={{width:'min(760px, 100%)'}}>
        <input className="input" placeholder="Describe your style" value={style} onChange={e => setStyle(e.target.value)} />
        <button type="button" className="button secondary" onClick={() => setFiltersOpen(v => !v)}>☰ Filters</button>

        {filtersOpen && <div style={{display:'grid', gap:12}}>
          <div className="filterRow">{genders.map(f => <button type="button" key={f} className={gender === f ? 'filter active' : 'filter'} onClick={() => setGender(f)}>{f}</button>)}</div>
          <div className="filterRow">{categories.map(f => <button type="button" key={f} className={category === f ? 'filter active' : 'filter'} onClick={() => setCategory(f)}>{f}</button>)}</div>
          <div className="filterRow">{clothingSizes.map(s => <button type="button" key={s} className={size === s ? 'filter active' : 'filter'} onClick={() => setSize(s)}>{s}</button>)}</div>
          <div className="filterRow">{shoeSizes.map(s => <button type="button" key={s} className={shoeSize === s ? 'filter active' : 'filter'} onClick={() => setShoeSize(s)}>{s}</button>)}</div>
        </div>}

        <button className="button" onClick={generate} disabled={!style.trim()}>Generate</button>
      </div>

      {item ? <div className="swipeWrap" style={{width:'min(520px, 100%)'}}>
        <div className="card swipeCard" onTouchStart={e => setTouchStart(e.touches[0].clientX)} onTouchEnd={onTouchEnd}>
          {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
          <h3>{item.title}</h3>
          <p className="price">{item.price}</p>
          <p className="muted">{item.source}</p>
          <div className="row"><button className="button secondary" onClick={skipCurrent}>Skip</button><button className="button" onClick={addCurrentToCart}>Add to Cart</button></div>
        </div>
      </div> : items.length > 0 ? <div className="card empty"><h2>Done</h2></div> : null}
    </div>
  );
}
