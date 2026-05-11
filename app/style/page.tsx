'use client';
import { useEffect, useRef, useState } from 'react';
import { addToCart } from '../../lib/cart';

const genders = ['Men', 'Women', 'Unisex'];
const categories = ['Clothes', 'Shoes', 'Bags', 'Accessories', 'Outfits'];
const specialOptions = ['BPA Free','Greenguard Certified','Vegan','Cruelty Free','Non Toxic','Organic','FSC Certified'];
const menTopSizes = ['Any','XS','S','M','L','XL','XXL'];
const womenTopSizes = ['Any','XXS','XS','S','M','L','XL','XXL','00','0','2','4','6','8','10','12','14','16'];
const menBottomSizes = ['Any','28','29','30','31','32','33','34','36','38','40','42'];
const womenBottomSizes = ['Any','00','0','2','4','6','8','10','12','14','16','24','25','26','27','28','29','30','31','32'];
const menShoeSizes = ['Any','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','12.5','13','14','15'];
const womenShoeSizes = ['Any','5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12'];

export default function StylePage() {
  const [style, setStyle] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gender, setGender] = useState('Men');
  const [category, setCategory] = useState('Clothes');
  const [topSize, setTopSize] = useState('Any');
  const [bottomSize, setBottomSize] = useState('Any');
  const [shoeSize, setShoeSize] = useState('Any');
  const [specialFilters, setSpecialFilters] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [items, setItems] = useState<any[]>([]);
  const [seenKeys, setSeenKeys] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchX, setTouchX] = useState(0);
  const targetX = useRef(0);
  const raf = useRef<number | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [warned, setWarned] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  const topSizes = gender === 'Women' ? womenTopSizes : menTopSizes;
  const bottomSizes = gender === 'Women' ? womenBottomSizes : menBottomSizes;
  const shoeSizes = gender === 'Women' ? womenShoeSizes : menShoeSizes;

  function toggleSpecial(name:string){ setSpecialFilters(current => current.includes(name) ? current.filter(x => x !== name) : [...current, name]); }
  function handleGender(next:string){ setGender(next); setTopSize('Any'); setBottomSize('Any'); setShoeSize('Any'); }
  function buildQuery() {
    const parts = [style.trim(), 'clothes'];
    if (gender) parts.unshift(gender);
    if (category !== 'Clothes') parts.push(category);
    if (topSize !== 'Any') parts.push(`top size ${topSize}`);
    if (bottomSize !== 'Any') parts.push(`bottom size ${bottomSize}`);
    if (shoeSize !== 'Any') parts.push(`shoe size ${shoeSize}`);
    if (specialFilters.length) parts.push(specialFilters.join(' '));
    parts.push(`under $${maxPrice}`);
    parts.push('apparel fashion outfit wearable only');
    return parts.filter(Boolean).join(' ');
  }
  async function loadMore(nextIndex = index, incomingSeen = seenKeys) {
    const res = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description: buildQuery(), mode: 'style', page: Math.floor(nextIndex / 20) + 1, specialFilters, maxPrice, excludeKeys: incomingSeen, seed: Date.now() + nextIndex }) });
    const data = await res.json();
    const next = (data.results || []).filter((p:any)=>p.productKey && !incomingSeen.includes(p.productKey));
    const newKeys = next.map((p:any)=>p.productKey).filter(Boolean);
    setSeenKeys(current => Array.from(new Set([...current, ...newKeys])));
    setItems(current => [...current, ...next]);
  }
  async function generate() {
    setSearched(true); setLoading(true); setWarned(false); setSwipeCount(0); setCanUndo(false); setItems([]); setSeenKeys([]); setIndex(0);
    try { await loadMore(0, []); } finally { setLoading(false); }
  }
  function resetSearch() { setSearched(false); setItems([]); setSeenKeys([]); setIndex(0); setAnimating(null); setTouchX(0); targetX.current = 0; setCanUndo(false); }
  function undoLast() { if (!canUndo || index <= 0 || animating) return; setIndex(index - 1); setTouchX(0); targetX.current = 0; setCanUndo(false); }
  function finishAdvance(add: boolean) {
    const item = items[index]; if (!item) return;
    if (add) addToCart(item);
    const nextCount = swipeCount + 1; setSwipeCount(nextCount);
    if (nextCount === 20 && !warned) { alert('Slow down — you swiped 20 products.'); setWarned(true); }
    const nextIndex = index + 1; setIndex(nextIndex); setCanUndo(true); setTouchX(0); targetX.current = 0; setAnimating(null);
    if (items.length - nextIndex < 7) loadMore(nextIndex);
  }
  function advance(add: boolean) { if (animating) return; setAnimating(add ? 'right' : 'left'); setTimeout(() => finishAdvance(add), 260); }
  useEffect(() => { function onKeyDown(e: KeyboardEvent) { if (!items[index] || animating) return; if (e.key === 'ArrowLeft') advance(false); if (e.key === 'ArrowRight') advance(true); } window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [items, index, swipeCount, warned, animating]);
  function onTouchMove(e: React.TouchEvent) { if (touchStart === null || animating) return; e.preventDefault(); targetX.current = e.touches[0].clientX - touchStart; if (raf.current) cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => setTouchX(targetX.current)); }
  function onTouchEnd(e: React.TouchEvent) { if (touchStart === null || animating) return; const diff = e.changedTouches[0].clientX - touchStart; setTouchStart(null); if (Math.abs(diff) > 70) diff > 0 ? advance(true) : advance(false); else { targetX.current = 0; setTouchX(0); } }

  const item = items[index];
  const dragTilt = Math.max(-18, Math.min(18, touchX / 12));
  const dragMove = Math.max(-170, Math.min(170, touchX));
  const activeDir = animating || (touchX > 35 ? 'right' : touchX < -35 ? 'left' : null);
  const undoStyle: React.CSSProperties = {width:68,height:68,borderRadius:999,border:0,background:'#a7a7a7',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 16px 36px rgba(0,0,0,.18)',pointerEvents:'auto',cursor:'pointer',padding:0};

  return <div className="styleCenter compactSwipePage">
    {!searched ? <>
      <h1>Style</h1>
      <div className="card searchBox styleSearch">
        <input className="input" placeholder="Describe your style" value={style} onChange={e => setStyle(e.target.value)} />
        <button type="button" className="button secondary" onClick={() => setFiltersOpen(v => !v)}>☰ Filters</button>
        {filtersOpen && <div className="filterPanel premiumFilters">
          <details className="filterDrop"><summary>Gender · {gender}</summary><select className="input" value={gender} onChange={e=>handleGender(e.target.value)}>{genders.map(g=><option key={g}>{g}</option>)}</select></details>
          <details className="filterDrop"><summary>Category · {category}</summary><select className="input" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></details>
          <details className="filterDrop"><summary>Top size · {topSize}</summary><select className="input" value={topSize} onChange={e=>setTopSize(e.target.value)}>{topSizes.map(s=><option key={s}>{s}</option>)}</select></details>
          <details className="filterDrop"><summary>Bottom size · {bottomSize}</summary><select className="input" value={bottomSize} onChange={e=>setBottomSize(e.target.value)}>{bottomSizes.map(s=><option key={s}>{s}</option>)}</select></details>
          <details className="filterDrop"><summary>Shoe size · {shoeSize}</summary><select className="input" value={shoeSize} onChange={e=>setShoeSize(e.target.value)}>{shoeSizes.map(s=><option key={s}>{s}</option>)}</select></details>
          <details className="filterDrop"><summary>Price · Under ${maxPrice}</summary><div className="sliderBlock"><div className="sliderTop"><strong>${maxPrice}</strong></div><input className="priceSlider" type="range" min="10" max="1000" step="10" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} /></div></details>
          <details className="filterDrop"><summary>Special filters · {specialFilters.length ? specialFilters.length + ' selected' : 'None'}</summary><div className="filterRow">{specialOptions.map(name => <button type="button" key={name} className={specialFilters.includes(name) ? 'filter active greenFilter' : 'filter'} onClick={()=>toggleSpecial(name)}>{name}</button>)}</div></details>
        </div>}
        <button className="button" onClick={generate} disabled={!style.trim() || loading}>{loading ? 'Generating...' : 'Generate'}</button>
      </div>
    </> : <>
      <button className="backButton" onClick={resetSearch} aria-label="Back to style search"><span>← Back</span></button>
      {loading ? <div className="card empty"><h2>Loading products...</h2></div> : item ? <div className="swipeWrap swipeOnly">
        <div className={`card swipeCard animatedSwipeCard ${animating === 'left' ? 'swipeOutLeft' : animating === 'right' ? 'swipeOutRight' : ''}`} style={!animating ? { transform: `translate3d(${dragMove}px,0,0) rotate(${dragTilt}deg)` } : undefined} onTouchStart={e => setTouchStart(e.touches[0].clientX)} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
          <h3>{item.title}</h3><p className="price">{item.price || 'Check price'}</p><p className="muted">{item.source}</p>
        </div>
        <div className="swipeActions">
          {canUndo ? <button style={undoStyle} onClick={undoLast} aria-label="Go back one product"><svg width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M19 14L9 24L19 34" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 24H29C36 24 40 28 40 34" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg></button> : <div className="undoSpacer" />}
          <button className={`swipeCircle no ${activeDir === 'left' ? 'active' : ''}`} onClick={() => advance(false)}>✕</button>
          <button className={`swipeCircle yes ${activeDir === 'right' ? 'active' : ''}`} onClick={() => advance(true)}>✓</button>
        </div>
      </div> : <div className="card empty"><h2>No products found</h2><p className="muted">Tap Back and try a broader style.</p></div>}
    </>}
  </div>;
}
