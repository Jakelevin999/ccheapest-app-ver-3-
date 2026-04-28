'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [description, setDescription] = useState('');
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
        body: JSON.stringify({ description: description.trim(), url: url.trim(), imageData })
      });
      const data = await res.json();
      localStorage.setItem('cheaperfind:lastResults', JSON.stringify(data));
      router.push('/results');
    } finally { setLoading(false); }
  }

  return <section className="shopHome">
    <h1>Shop</h1>
    <div className="card searchBox shopCard">
      <input className="input" placeholder="Describe product" value={description} onChange={e => setDescription(e.target.value)} />
      <input className="input" placeholder="Paste product link" value={url} onChange={e => setUrl(e.target.value)} />
      <label className="uploadBox"><input type="file" accept="image/*" onChange={e => onFile(e.target.files?.[0])} /><span>Upload photo</span></label>
      {imageData && <img src={imageData} alt="preview" className="preview" />}
      <button className="button" onClick={search} disabled={loading || (!description && !url && !imageData)}>{loading ? 'Searching...' : 'Search'}</button>
    </div>
  </section>;
}
