'use client';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(JSON.parse(sessionStorage.getItem('cheaperfind:lastResults') || '{}'));
  }, []);

  const products = data?.results || [];

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
            <p>Add SERPAPI_KEY in Vercel to get real products</p>
          </div>
        )}
      </div>
    </section>
  );
}
