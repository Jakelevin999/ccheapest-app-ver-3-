import Link from 'next/link';
export default function SavedPage() {
  return <section className="card"><h1>Saved moved to Favorites</h1><p className="muted">The app now uses a Favorites tab for saved items.</p><Link className="button" href="/favorites">Open Favorites</Link></section>;
}
