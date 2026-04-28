'use client';
import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite } from '../lib/favorites';
import { ShoppingResult } from '../lib/types';

export type Product = ShoppingResult;

export default function ProductCard({ product }: { product: Product }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(isFavorite(product.link)), [product.link]);
  function onSave() { setSaved(toggleFavorite(product).some(item => item.link === product.link)); }
  return <div className="card product">
    <button className={`heart ${saved ? 'saved' : ''}`} onClick={onSave} aria-label={saved ? 'Remove favorite' : 'Save favorite'}>{saved ? '♥' : '♡'}</button>
    {product.image ? <img src={product.image} alt={product.title} /> : <div className="imagePlaceholder" />}
    <h3>{product.title}</h3>
    <p className="price">{product.price || 'Check price'}</p>
    <p className="muted">{product.source || 'Store'} {product.reason ? `• ${product.reason}` : ''}</p>
    <div className="row"><a className="button" href={product.link} target="_blank">Buy / View</a><button className="button secondary" onClick={onSave}>{saved ? 'Saved' : 'Save'}</button></div>
  </div>;
}
