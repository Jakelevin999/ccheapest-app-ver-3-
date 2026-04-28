export default function PremiumPage() {
  return <section>
    <div className="pageHeader"><span className="badge">Premium</span><h1>Unlock smarter shopping</h1><p className="muted">This page is ready for Stripe when you add your payment keys.</p></div>
    <div className="pricing card">
      <h2>CheaperFind Pro</h2><p className="price">$4.99/mo</p>
      <ul><li>Unlimited searches</li><li>Price alerts</li><li>Advanced dupe ranking</li><li>Cloud-synced favorites</li></ul>
      <a className="button" href="mailto:founder@cheaperfind.app">Join waitlist</a>
    </div>
  </section>;
}
