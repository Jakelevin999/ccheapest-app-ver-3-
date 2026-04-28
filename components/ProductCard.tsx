'use client';
import { useEffect, useState } from 'react';
import { addToCart } from '../lib/cart';

function getColor(score?: number) {
  if (!score) return '#aaa';
  if (score <= 4) return '#ff3b30';
  if (score <= 7) return '#ff9500';
  return '#34c759';
}

export default function ProductCard({ product }: any) {
  function add() {
    addToCart(product);
    alert('Added to cart');
  }

  return <div className="card product">
    {product.image ? <img src={product.image} alt={product.title} /> : <div className="imagePlaceholder" />}
    <h3>{product.title}</h3>
    <p className="price">{product.price}</p>
    <div style={{display:'flex', flexDirection:'column', gap:6}}>
      <span style={{color:getColor(product.dealRating)}}>Deal {product.dealRating || 5}/10</span>
      <span style={{color:getColor(product.cheapTrustRating)}}>Trust {product.cheapTrustRating || 6}/10</span>
    </div>
    <div className="row">
      <button className="button" onClick={add}>Add</button>
      <a className="button secondary" href={product.link} target="_blank">View</a>
    </div>
  </div>;
}
