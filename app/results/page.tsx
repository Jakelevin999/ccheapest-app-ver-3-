'use client';
import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../../components/ProductCard';

function keyFor(p:any){return (p.productKey || `${p.title}-${p.source}-${p.price}`).toLowerCase();}

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(4);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cheaperfind:lastResults');
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      setProducts(parsed.results || []);
    }
  }, []);

  const sortedProducts = useMemo(() => {
    const seen = new Set<string>();
    return products.filter((p:any) => {
      const k = keyFor(p);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [products]);

  async function loadMore() {
    if (!data?.query || loadingMore) return;
    setLoadingMore(true);
    try {
      const excludeKeys = sortedProducts.map((p:any)=>p.productKey).filter(Boolean);
      const res = await fetch('/api/search', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ description:data.query, page, excludeKeys, seed:Date.now() + page, priceTier:data.priceTier, specialFilters:data.specialFilters || [] })
      });
      const next = await res.json();
      const merged = [...sortedProducts, ...(next.results || [])];
      setProducts(merged);
      localStorage.setItem('cheaperfind:lastResults', JSON.stringify({...data, results:merged}));
      setPage(page + 3);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!data?.query) return;
    if (sortedProducts.length < 40 && !loadingMore) loadMore();
  }, [data?.query, sortedProducts.length]);

  return (
    <section className="resultsPage">
      <div className="resultsHeader"><h1>Results</h1><p className="muted">{sortedProducts.length} options found</p></div>
      <div className="grid shopGalleryGrid">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((p: any, i: number) => (
            <ProductCard key={p.productKey || p.link || i} product={p} />
          ))
        ) : (
          <div className="card"><h2>No results</h2></div>
        )}
      </div>
      {sortedProducts.length > 0 && <button className="button loadMoreButton" onClick={loadMore} disabled={loadingMore}>{loadingMore ? 'Loading more...' : 'Load more products'}</button>}
    </section>
  );
}
