'use client';
import { useState } from 'react';

type CardItem = {
  title: string;
  subtitle: string;
  link: string;
  badge?: string;
  logo?: string;
};

const flightCompanies = [
  { name: 'Delta', logo: 'DL', url: 'https://www.delta.com/flight-search/search-results' },
  { name: 'United', logo: 'UA', url: 'https://www.united.com/en/us/fsr/choose-flights' },
  { name: 'American', logo: 'AA', url: 'https://www.aa.com/booking/find-flights' },
  { name: 'Southwest', logo: 'SW', url: 'https://www.southwest.com/air/booking/' },
  { name: 'JetBlue', logo: 'JB', url: 'https://www.jetblue.com/booking/flights' },
  { name: 'Spirit', logo: 'NK', url: 'https://www.spirit.com/' },
  { name: 'Frontier', logo: 'F9', url: 'https://www.flyfrontier.com/' },
  { name: 'Expedia', logo: 'EX', url: 'https://www.expedia.com/Flights' },
  { name: 'Kayak', logo: 'KY', url: 'https://www.kayak.com/flights' },
  { name: 'Priceline', logo: 'PL', url: 'https://www.priceline.com/relax/in/3000000011/from/3000000011/flights' }
];

function shoppingLink(query: string) {
  return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`;
}

export default function Travel() {
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [gender, setGender] = useState('Men');
  const [guests, setGuests] = useState('1');
  const [searched, setSearched] = useState(false);

  const cleanDestination = destination.trim() || 'your trip';
  const dateText = date ? new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'choose dates';

  const flightItems: CardItem[] = flightCompanies.map(company => ({
    title: company.name,
    subtitle: `${cleanDestination} • ${dateText} • ${guests} guest${guests === '1' ? '' : 's'}`,
    link: company.url,
    badge: 'Official / trusted',
    logo: company.logo
  }));

  const outfitBase = `${gender} ${cleanDestination} travel outfit clothes shoes ${dateText}`;
  const outfitItems: CardItem[] = [
    { title: `${gender} travel outfit`, subtitle: cleanDestination, link: shoppingLink(`${outfitBase} affordable outfit`) },
    { title: 'Comfortable airport fit', subtitle: 'hoodie / pants / sneakers', link: shoppingLink(`${outfitBase} airport outfit`) },
    { title: 'Dinner outfit', subtitle: 'night-out clothes', link: shoppingLink(`${outfitBase} dinner outfit`) },
    { title: 'Walking shoes', subtitle: 'comfortable shoes', link: shoppingLink(`${gender} ${cleanDestination} comfortable walking shoes travel`) },
    { title: 'Weather-ready layer', subtitle: 'jacket / coat / sweater', link: shoppingLink(`${gender} ${cleanDestination} travel jacket coat sweater`) },
    { title: 'Cheap full fit', subtitle: 'budget outfit picks', link: shoppingLink(`${gender} ${cleanDestination} cheap travel outfit clothes`) }
  ];

  const accessoryItems: CardItem[] = [
    { title: 'Carry-on luggage', subtitle: 'cheap travel bag', link: shoppingLink(`${cleanDestination} carry on luggage affordable`) },
    { title: 'Packing cubes', subtitle: 'organize clothes', link: shoppingLink('packing cubes affordable travel') },
    { title: 'Phone holder', subtitle: 'flight / hotel / car', link: shoppingLink('travel phone holder airplane affordable') },
    { title: 'Eye mask', subtitle: 'sleep on flight', link: shoppingLink('travel eye mask comfortable affordable') },
    { title: 'Neck pillow', subtitle: 'long flight comfort', link: shoppingLink('travel neck pillow affordable') },
    { title: 'Toiletry bag', subtitle: 'TSA-friendly', link: shoppingLink('travel toiletry bag TSA affordable') },
    { title: 'Portable charger', subtitle: 'trip essential', link: shoppingLink('portable charger travel affordable') },
    { title: 'Passport holder', subtitle: 'documents', link: shoppingLink('passport holder travel affordable') }
  ];

  function Row({ title, items, flight }: { title: string; items: CardItem[]; flight?: boolean }) {
    return <section style={{ width: '100%', marginTop: 26 }}>
      <h2 style={{ fontSize: 24, margin: '0 0 12px', letterSpacing: '-.04em' }}>{title}</h2>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, scrollSnapType: 'x mandatory' }}>
        {items.map(item => <a key={item.title} href={item.link} target="_blank" rel="noreferrer" style={{ minWidth: flight ? 170 : 220, scrollSnapAlign: 'start' }}>
          <div className="card" style={{ minHeight: flight ? 150 : 190, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 18 }}>
            {flight ? <div style={{ width: 58, height: 58, borderRadius: 18, background: 'var(--surface2)', display: 'grid', placeItems: 'center', fontWeight: 950, fontSize: 22 }}>{item.logo}</div> : <div style={{ width: '100%', height: 86, borderRadius: 18, background: 'var(--surface2)', display: 'grid', placeItems: 'center', fontSize: 34 }}>{title.includes('Outfit') ? '👕' : '🧳'}</div>}
            <div>
              <h3 style={{ margin: '12px 0 4px', fontSize: 17, lineHeight: 1.15 }}>{item.title}</h3>
              <p className="muted" style={{ fontSize: 13 }}>{item.subtitle}</p>
              {item.badge ? <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{item.badge}</p> : null}
            </div>
          </div>
        </a>)}
      </div>
    </section>;
  }

  return <div style={{ width: '100%', maxWidth: 980, margin: '0 auto' }}>
    <h1 style={{ fontSize: 'clamp(42px,7vw,72px)', margin: '20px 0', letterSpacing: '-.06em' }}>Travel</h1>

    <div className="card" style={{ display: 'grid', gap: 12 }}>
      <input className="input" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select className="input" value={gender} onChange={e => setGender(e.target.value)}>
          <option>Men</option>
          <option>Women</option>
          <option>Unisex</option>
        </select>
        <input className="input" type="number" min="1" placeholder="Guests" value={guests} onChange={e => setGuests(e.target.value)} />
      </div>
      <button className="button" onClick={() => setSearched(true)} disabled={!destination.trim()}>Search trip</button>
    </div>

    {searched ? <>
      <Row title="Cheapest flights" items={flightItems} flight />
      <Row title="Outfits for your trip" items={outfitItems} />
      <Row title="Travel accessories" items={accessoryItems} />
    </> : null}
  </div>;
}
