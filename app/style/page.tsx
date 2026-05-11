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
const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
const [canUndo, setCanUndo] = useState(false);

const topSizes = gender === 'Women' ? womenTopSizes : menTopSizes;
const bottomSizes = gender === 'Women' ? womenBottomSizes : menBottomSizes;
const shoeSizes = gender === 'Women' ? womenShoeSizes : menShoeSizes;

function toggleSpecial(name:string){
setSpecialFilters(current => current.includes(name) ? current.filter(x => x !== name) : [...current, name]);
}

function handleGender(next:string){
setGender(next);
setTopSize('Any');
setBottomSize('Any');
setShoeSize('Any');
}

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
const query = buildQuery();
const res = await fetch('/api/search', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ description: query, mode: 'style', page: Math.floor(nextIndex / 20) + 1, specialFilters, maxPrice, excludeKeys: incomingSeen, seed: Date.now() + nextIndex })
});
const data = await res.json();
const next = (data.results || []).filter((p:any)=>p.productKey && !incomingSeen.includes(p.productKey));
const newKeys = next.map((p:any)=>p.productKey).filter(Boolean);
setSeenKeys(current => Array.from(new Set([...current, ...newKeys])));
setItems(current => [...current, ...next]);
}

async function generate() {
setSearched(true);
setWarned(false);
setSwipeCount(0);
setCanUndo(false);
setItems([]);
setSeenKeys([]);
setIndex(0);
await loadMore(0, []);
}

function resetSearch() {
setSearched(false);
setItems([]);
setSeenKeys([]);
setIndex(0);
setAnimating(null);
setTouchX(0);
targetX.current = 0;
setCanUndo(false);
}

function undoLast() {
if (!canUndo || index <= 0 || animating) return;
setIndex(index - 1);
setTouchX(0);
targetX.current = 0;
setCanUndo(false);
}

function finishAdvance(add: boolean) {
const item = items[index];
if (!item) return;
if (add) addToCart(item);
const nextCount = swipeCount + 1;
setSwipeCount(nextCount);
const nextIndex = index + 1;
setIndex(nextIndex);
setCanUndo(true);
setTouchX(0);
targetX.current = 0;
setAnimating(null);
if (items.length - nextIndex < 7) loadMore(nextIndex);
}

function advance(add: boolean) {
if (animating) return;
setAnimating(add ? 'right' : 'left');
setTimeout(() => finishAdvance(add), 260);
}

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
if (Math.abs(diff) > 70) diff > 0 ? advance(true) : advance(false);
else { targetX.current = 0; setTouchX(0); }
}

const item = items[index];
const dragTilt = Math.max(-18, Math.min(18, touchX / 12));
const dragMove = Math.max(-170, Math.min(170, touchX));
const activeDir = animating || (touchX > 35 ? 'right' : touchX < -35 ? 'left' : null);

return <div className="styleCenter compactSwipePage">
{!searched ? <>
<h1>Style</h1>
<div className="card searchBox styleSearch">
<input className="input" placeholder="Describe your style" value={style} onChange={e => setStyle(e.target.value)} />
<button type="button" className="button secondary" onClick={() => setFiltersOpen(v => !v)}>☰ Filters</button>
{filtersOpen && <div className="filterPanel premiumFilters">
<div className="premiumRow"><label>Gender</label><select className="input" value={gender} onChange={e=>handleGender(e.target.value)}>{genders.map(g=><option key={g}>{g}</option>)}</select></div>
<div className="premiumRow"><label>Category</label><select className="input" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
<div className="premiumRow"><label>Top size</label><select className="input" value={topSize} onChange={e=>setTopSize(e.target.value)}>{topSizes.map(s=><option key={s}>{s}</option>)}</select></div>
<div className="premiumRow"><label>Bottom size</label><select className="input" value={bottomSize} onChange={e=>setBottomSize(e.target.value)}>{bottomSizes.map(s=><option key={s}>{s}</option>)}</select></div>
<div className="premiumRow"><label>Shoe size</label><select className="input" value={shoeSize} onChange={e=>setShoeSize(e.target.value)}>{shoeSizes.map(s=><option key={s}>{s}</option>)}</select></div>
<div className="premiumRow"><label>Max price</label><div className="sliderTop"><strong>${maxPrice}</strong></div><input className="priceSlider" type="range" min="10" max="1000" step="10" value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} /></div>
<div className="premiumRow"><label>Special filters</label><div className="filterRow">{specialOptions.map(name => <button type="button" key={name} className={specialFilters.includes(name) ? 'filter active greenFilter' : 'filter'} onClick={()=>toggleSpecial(name)}>{name}</button>)}</div></div>
</div>}
<button className="button" onClick={generate} disabled={!style.trim()}>Generate</button>
</div>
</> : <></>}
</div>;
}
