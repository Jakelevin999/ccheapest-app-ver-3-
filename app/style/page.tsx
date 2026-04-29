'use client';
import { useEffect, useRef, useState } from 'react';
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
  const [touchX, setTouchX] = useState(0);
  const targetX = useRef(0);
  const raf = useRef<number | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [warned, setWarned] = useState(false);
  const [searched, setSearched] = useState(false);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);

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
    setSearched(true);
    setWarned(false);
    setSwipeCount(0);
    setItems([]);
    setIndex(0);
    await loadMore(0);
  }

  function resetSearch() {
    setSearched(false);
    setItems([]);
    setIndex(0);
    setAnimating(null);
    setTouchX(0);
    targetX.current = 0;
  }

  function undoLast() {
    if (index <= 0 || animating) return;
    setIndex(index - 1);
    setTouchX(0);
    targetX.current = 0;
  }

  function finishAdvance(add: boolean) {
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
    setTouchX(0);
    targetX.current = 0;
    setAnimating(null);
    if (items.length - nextIndex < 5) loadMore(nextIndex);
  }

  function advance(add: boolean) {
    if (animating) return;
    setAnimating(add ? 'right' : 'left');
    setTimeout(() => finishAdvance(add), 260);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!items[index] || animating) return;
      if (e.key === 'ArrowLeft') advance(false);
      if (e.key === 'ArrowRight') advance(true);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, index, swipeCount, warned, gender, category, size, shoeSize, style, animating]);

  function onTouchMove(e: React.TouchEvent) {
    if (touchStart === null || animating) return;
    e.preventDefault();
    targetX.current = e.touches[0].clientX - touchStart;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setTouchX(targetX.current));
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null || animating) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    setTouchStart(null);
    if (Math.abs(diff) > 70) {
      diff > 0 ? advance(true) : advance(false);
    } else {
      targetX.current = 0;
      setTouchX(0);
    }
  }

  const item = items[index];
  const dragTilt = Math.max(-18, Math.min(18, touchX / 12));
  const dragMove = Math.max(-170, Math.min(170, touchX));
  const activeDir = animating || (touchX > 35 ? 'right' : touchX < -35 ? 'left' : null);

  return (
    <div className="styleCenter compactSwipePage">
      {!searched ? <>
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
      </> : <>
        <button className="backButton" onClick={resetSearch}>← Back</button>
        {item ? <div className="swipeWrap swipeOnly">
          <div
            className={`card swipeCard animatedSwipeCard ${animating === 'left' ? 'swipeOutLeft' : animating === 'right' ? 'swipeOutRight' : ''}`}
            style={!animating ? { transform: `translate3d(${dragMove}px,0,0) rotate(${dragTilt}deg)` } : undefined}
            onTouchStart={e => setTouchStart(e.touches[0].clientX)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
            <h3>{item.title}</h3>
            <p className="price">{item.price || 'Check price'}</p>
            {item.selectedSize ? <p className="muted">Size: {item.selectedSize}</p> : null}
            <p className="muted">{item.source}</p>
          </div>
          <div className="swipeActions">
            <button className="undoCircle" onClick={undoLast}>↩</button>
            <button className={`swipeCircle no ${activeDir === 'left' ? 'active' : ''}`} onClick={() => advance(false)}>✕</button>
            <button className={`swipeCircle yes ${activeDir === 'right' ? 'active' : ''}`} onClick={() => advance(true)}>✓</button>
          </div>
        </div> : <div className="card empty"><h2>Loading more...</h2></div>}
      </>}
    </div>
  );
}
