'use client';
import { useEffect, useState } from 'react';
import ProductCard, { Product } from '../../components/ProductCard';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { setData(JSON.parse(sessionStorage.getItem('cheaperfind:lastResults') || '{}')); }, []);
  const products: Product[] = data?.results || [];
  return <section>
    <div className="pageHeader"><span className="badge">Best matches</span><h1>Results</h1><p className="muted">Favorite anything you want to come back to later.</p></div>
    {data?.identified && <div className="card"><p className="muted">Search query</p><h2>{data.identified.searchQuery}</h2><p>{data.identified.styleKeywords?.join(', ')}</p></div>}
    <div className="grid">{products.map((p, i) => <ProductCard key={p.link || i} product={p} />)}</div>
    {!products.length && <div className="card empty"><h2>No results yet</h2><p className="muted">Go to Search and use a product link or image.</p></div>}
  </section>;
}
