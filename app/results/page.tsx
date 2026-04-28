'use client';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cheaperfind:lastResults');
    if (stored) setData(JSON.parse(stored));
  }, []);

  const products = (data?.results || []).sort((a:any,b:any)=>{
    const pa = parseFloat((a.price||'').replace(/[^0-9.]/g,'')) || 9999;
    const pb = parseFloat((b.price||'').replace(/[^0-9.]/g,'')) || 9999;
    return pa - pb;
  });

  return (
    <section>
      <h1>Results</h1>
      <div className="grid">
        {products.length > 0 ? (
          products.map((p: any, i: number) => (
            <ProductCard key={p.link || i} product={p} />
          ))
        ) : (
          <div className="card">
            <h2>No results</h2>
          </div>
        )}
      </div>
    </section>
  );
}
