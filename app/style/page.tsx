'use client';
import { useEffect, useState } from 'react';
import { addToCart } from '../../lib/cart';

const genders = ['Any', 'Men', 'Women', 'Unisex'];
const categories = ['Clothes', 'Shoes', 'Bags', 'Accessories', 'Outfits'];
const clothingSizes = ['Any', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
const shoeSizes = ['Any', '6', '7', '8', '9', '10', '11', '12', '13'];

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
  const [swipeCount, setSwipeCount] = useState(0);
  const [warned, setWarned] = useState(false);

  const selectedSize = category === 'Shoes' ? shoeSize : size;

  function buildQuery() {
    const parts = [style.trim(), 'clothes'];
    if (gender !== 'Any') parts.unshift(gender);
    if (category !== 'Clothes') parts.push(category);
    if (category === 'Shoes' && shoeSize !== 'Any') parts.push(`shoe size ${shoeSize}`);
    if (category !== 'Shoes' && size !== 'Any') parts.push(`size ${size}`);
    parts.push('apparel fashion outfit wearable only');
    return parts.filter(Boolean).join(' ');
  }

  async function loadMore(nextIndex = index) {
    const query = buildQuery();
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: query, mode: 'style', page: Math.floor(nextIndex / 20) + 1 })
    });
    const data = await res.json();
    const next = (data.results || []).map((p:any) => ({...p, selectedSize: selectedSize !== 'Any' ? selectedSize : ''}));
    setItems(current => [...current, ...next]);
  }

  async function generate() {
    setWarned(false);
    setSwipeCount(0);
    setItems([]);
    setIndex(0);
    await loadMore(0);
  }

  function advance(add: boolean) {
    const item = items[index];
    if (!item) return;
    if (add) addToCart(item);
    const nextCount = swipeCount + 1;
    setSwipeCount(nextCount);
    if (nextCount === 20 && !warned) {
      alert('Slow down — you swiped 20 products.');
      setWarned(true);
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (items.length - nextIndex < 5) loadMore(nextIndex);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!items[index]) return;
      if (e.key === 'ArrowLeft') advance(false);
      if (e.key === 'ArrowRight') advance(true);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, index, swipeCount, warned, gender, category, size, shoeSize, style]);

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 70) diff > 0 ? advance(true) : advance(false);
    setTouchStart(null);
  }

  const item = items[index];

  return (
    <div className="styleCenter">
      <h1>Style</h1>
      <div className="card searchBox styleSearch">
        <input className="input" placeholder="Describe your style" value={style} onChange={e => setStyle(e.target.value)} />
        <button type="button" className="button secondary" onClick={() => setFiltersOpen(v => !v)}>☰ Filters</button>
        {filtersOpen && <div className="filterPanel">
          <div className="filterRow">{genders.map(f => <button type="button" key={f} className={gender === f && f !== 'Any' ? 'filter active' : 'filter'} onClick={() => setGender(f)}>{f}</button>)}</div>
          <div className="filterRow">{categories.map(f => <button type="button" key={f} className={category === f && f !== 'Clothes' ? 'filter active' : 'filter'} onClick={() => setCategory(f)}>{f}</button>)}</div>
          <div className="filterRow">{clothingSizes.map(s => <button type="button" key={s} className={size === s && s !== 'Any' ? 'filter active' : 'filter'} onClick={() => setSize(s)}>{s}</button>)}</div>
          <div className="filterRow">{shoeSizes.map(s => <button type="button" key={s} className={shoeSize === s && s !== 'Any' ? 'filter active' : 'filter'} onClick={() => setShoeSize(s)}>{s}</button>)}</div>
        </div>}
        <button className="button" onClick={generate} disabled={!style.trim()}>Generate</button>
      </div>

      {item ? <div className="swipeWrap">
        <div className="card swipeCard" onTouchStart={e => setTouchStart(e.touches[0].clientX)} onTouchMove={e => e.preventDefault()} onTouchEnd={onTouchEnd}>
          {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
          <h3>{item.title}</h3>
          <p className="price">{item.price || 'Check price'}</p>
          {item.selectedSize ? <p className="muted">Size: {item.selectedSize}</p> : null}
          <p className="muted">{item.source}</p>
          <div className="row"><button className="button secondary" onClick={() => advance(false)}>Skip</button><button className="button" onClick={() => advance(true)}>Add to Cart</button></div>
        </div>
      </div> : items.length > 0 ? <div className="card empty"><h2>Loading more...</h2></div> : null}
    </div>
  );
}
