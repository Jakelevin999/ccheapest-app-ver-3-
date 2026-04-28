'use client';
import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { ShoppingResult } from '../lib/types';

export type Product = ShoppingResult;

function ratingClass(score?: number) {
  if (!score) return 'ratingMid';
  if (score <= 4) return 'ratingBad';
  if (score <= 7) return 'ratingMid';
  return 'ratingGood';
}

export default function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => setSaved(isFavorite(product.link)), [product.link]);

  function onSave() {
    setSaved(toggleFavorite(product).some(item => item.link === product.link));
  }

  return <div className="card product">
    <button className={`heart ${saved ? 'saved' : ''}`} onClick={onSave} aria-label="Save item">{saved ? '♥' : '♡'}</button>
    {product.image ? <img src={product.image} alt={product.title} /> : <div className="imagePlaceholder" />}
    <h3>{product.title}</h3>
    <p className="price">{product.price || 'Check price'}</p>
    <div className="ratings">
      <span className={ratingClass(product.dealRating)}>Deal {product.dealRating || 5}/10</span>
      <span className={ratingClass(product.cheapTrustRating)}>CheapTrust {product.cheapTrustRating || 6}/10</span>
    </div>
    <p className="muted">{product.source || 'Store'}</p>
    <div className="row"><a className="button" href={product.link} target="_blank">Buy</a><button className="button secondary" onClick={onSave}>{saved ? 'Saved' : 'Save'}</button></div>
  </div>;
}
