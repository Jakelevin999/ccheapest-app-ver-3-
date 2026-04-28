'use client';
import { useEffect, useState } from 'react';
import { addToCart } from '../../lib/cart';

const genders = ['Any', 'Men', 'Women', 'Unisex'];
const categories = ['Clothes', 'Tops', 'Hoodies', 'Jackets', 'Pants', 'Shorts', 'Dresses', 'Skirts'];
const clothingSizes = ['Any', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];

const clothingWords = [
  'shirt', 't-shirt', 'tee', 'top', 'blouse', 'tank', 'hoodie', 'sweatshirt', 'crewneck',
  'sweater', 'jacket', 'coat', 'vest', 'pants', 'jeans', 'trousers', 'sweatpants',
  'shorts', 'dress', 'skirt', 'leggings', 'flannel', 'jersey', 'cardigan', 'clothes',
  'clothing', 'apparel', 'outfit'
];

const blockedNonClothingWords = [
  'phone', 'case', 'charger', 'cable', 'camera', 'laptop', 'tablet', 'headphones', 'speaker',
  'furniture', 'lamp', 'toy', 'game', 'card', 'pokemon', 'makeup', 'perfume', 'skincare',
  'bag', 'backpack', 'purse', 'wallet', 'watch', 'jewelry', 'necklace', 'bracelet', 'ring',
  'shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandals', 'hat', 'cap', 'beanie'
];

function isClothingProduct(product: any) {
  const text = `${product?.title || ''} ${product?.source || ''}`.toLowerCase();
  const hasClothingWord = clothingWords.some(word => text.includes(word));
  const hasBlockedWord = blockedNonClothingWords.some(word => text.includes(word));
  return hasClothingWord && !hasBlockedWord;
}

export default function StylePage() {
  const [style, setStyle] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gender, setGender] = useState('Any');
  const [category, setCategory] = useState('Clothes');
  const [size, setSize] = useState('Any');
  const [items, setItems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [warned, setWarned] = useState(false);

  function buildQuery() {
    const parts = [style.trim()];
    if (gender !== 'Any') parts.unshift(gender);
    if (category !== 'Clothes') parts.push(category);
    if (size !== 'Any') parts.push(`size ${size}`);
    parts.push('clothing apparel clothes only buy');
    return parts.filter(Boolean).join(' ');
  }

  async function loadMore(nextIndex = index) {
    const query = buildQuery();
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: query, page: Math.floor(nextIndex / 20) + 1 })
    });
    const data = await res.json();
    const next = (data.results || []).filter(isClothingProduct);
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
  }, [items, index, swipeCount, warned, gender, category, size, style]);

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
        <input className="input" placeholder="Describe clothes or outfit style" value={style} onChange={e => setStyle(e.target.value)} />
        <button type="button" className="button secondary" onClick={() => setFiltersOpen(v => !v)}>☰ Filters</button>
        {filtersOpen && <div className="filterPanel">
          <div className="filterRow">{genders.map(f => <button type="button" key={f} className={gender === f && f !== 'Any' ? 'filter active' : 'filter'} onClick={() => setGender(f)}>{f}</button>)}</div>
          <div className="filterRow">{categories.map(f => <button type="button" key={f} className={category === f && f !== 'Clothes' ? 'filter active' : 'filter'} onClick={() => setCategory(f)}>{f}</button>)}</div>
          <div className="filterRow">{clothingSizes.map(s => <button type="button" key={s} className={size === s && s !== 'Any' ? 'filter active' : 'filter'} onClick={() => setSize(s)}>{s}</button>)}</div>
        </div>}
        <button className="button" onClick={generate} disabled={!style.trim()}>Generate</button>
      </div>

      {item ? <div className="swipeWrap">
        <div className="card swipeCard" onTouchStart={e => setTouchStart(e.touches[0].clientX)} onTouchMove={e => e.preventDefault()} onTouchEnd={onTouchEnd}>
          {item.image ? <img src={item.image} alt={item.title} /> : <div className="imagePlaceholder" />}
          <h3>{item.title}</h3>
          <p className="price">{item.price || 'Check price'}</p>
          <p className="muted">{item.source}</p>
          <div className="row"><button className="button secondary" onClick={() => advance(false)}>Skip</button><button className="button" onClick={() => advance(true)}>Add to Cart</button></div>
        </div>
      </div> : items.length > 0 ? <div className="card empty"><h2>Loading more...</h2></div> : null}
    </div>
  );
}
