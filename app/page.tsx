'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const [imageData, setImageData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function search() {
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), imageData })
      });
      const data = await res.json();
      sessionStorage.setItem('cheaperfind:lastResults', JSON.stringify(data));
      router.push('/results');
    } finally { setLoading(false); }
  }

  return <>
    <section className="hero">
      <span className="badge">AI shopping search</span>
      <h1>Find the same look for less.</h1>
      <p>Upload a product photo or paste a link. CheaperFind searches for cheaper exact matches and similar alternatives.</p>
    </section>
    <section className="card searchBox">
      <input className="input" placeholder="Paste a product link" value={url} onChange={e => setUrl(e.target.value)} />
      <label className="uploadBox"><input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} /><span>Upload product photo</span><small>JPG, PNG, or screenshot</small></label>
      {imageData && <img src={imageData} alt="preview" className="preview" />}
      <button className="button" onClick={search} disabled={loading || (!url && !imageData)}>{loading ? 'Searching...' : 'Find cheaper options'}</button>
    </section>
    <div className="grid featureGrid">
      <div className="card"><h2>Photo or link</h2><p className="muted">Works from screenshots, product pages, or saved photos.</p></div>
      <div className="card"><h2>Favorites tab</h2><p className="muted">Heart items and come back later before you buy.</p></div>
      <div className="card"><h2>Light + dark</h2><p className="muted">Real settings screen with appearance controls.</p></div>
    </div>
  </>;
}
