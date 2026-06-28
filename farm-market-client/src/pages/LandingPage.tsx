import { Link } from 'react-router-dom';

const FeatureIcon = ({ d }: { d: string }) => (
  <div className="feature-icon-wrap">
    <svg viewBox="0 0 24 24"><path d={d} /></svg>
  </div>
);

function LandingPage() {
  return (
    <div>
      {/* HERO */}
      <section className="landing-hero">
        <div className="hero-badge">India's Trusted Farm Marketplace</div>
        <h1 className="hero-title">
          Connecting Farmers<br />to <span>Better Markets</span>
        </h1>
        <p className="hero-subtitle">
          A verified platform where farmers list fresh produce, buyers discover quality crops,
          and representatives ensure trust — all in one place.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/login" className="btn-outline">Sign In</Link>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-strip">
        {[
          { number: '5,000+', label: 'Active Farmers' },
          { number: '12,000+', label: 'Ads Listed' },
          { number: '98%', label: 'Verified Produce' },
          { number: '24 States', label: 'Across India' },
        ].map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-number">{s.number}</span>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section className="section">
        <div className="section-center">
          <span className="section-tag">Why Farm Market?</span>
          <h2 className="section-title">Everything You Need, In One Place</h2>
          <p className="section-subtitle">
            Built for every role in the agricultural value chain — from farm to table.
          </p>
        </div>
        <div className="features-grid">
          {[
            {
              d: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4v4l3 3',
              title: 'For Farmers',
              desc: 'List your crops with detailed information — quantities, prices, harvest dates, and farm location. Reach verified buyers directly.',
            },
            {
              d: 'M3 3h18M3 9h18M3 15h18M3 21h18',
              title: 'For Buyers',
              desc: 'Browse verified produce from farms across India. Send offers, negotiate prices, and source fresh crops with confidence.',
            },
            {
              d: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
              title: 'Verified Listings',
              desc: 'Field representatives personally verify farm produce before it is visible to buyers, ensuring quality and accuracy.',
            },
            {
              d: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
              title: 'Real-time Chat',
              desc: 'Communicate directly with farmers, buyers, or representatives in real time for seamless deal-making.',
            },
            {
              d: 'M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z',
              title: 'Fair Negotiations',
              desc: 'Submit and manage offers transparently. Both parties can negotiate until a fair price is reached.',
            },
            {
              d: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
              title: 'Pan-India Coverage',
              desc: 'From village to district to state, our platform covers farms across 24 states with growing reach.',
            },
          ].map((f) => (
            <div className="feature-card" key={f.title}>
              <FeatureIcon d={f.d} />
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-center">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">Simple. Transparent. Trusted.</h2>
        </div>
        <div className="steps-grid">
          {[
            { n: '1', title: 'Create Your Account', desc: 'Register as a Farmer, Buyer, or Representative in under a minute.' },
            { n: '2', title: 'List or Browse Ads', desc: 'Farmers post produce listings. Buyers browse and discover verified crops.' },
            { n: '3', title: 'Verify and Connect', desc: 'Representatives verify listings. Buyers send offers and chat directly.' },
            { n: '4', title: 'Close the Deal', desc: 'Negotiate, agree on price, and complete the transaction with confidence.' },
          ].map((s) => (
            <div className="step-item" key={s.n}>
              <div className="step-number">{s.n}</div>
              <h4 className="step-title">{s.title}</h4>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner">
        <div className="section-center" style={{ margin: '0 auto' }}>
          <h2 className="section-title" style={{ color: '#F0C98A' }}>
            Ready to Join the Community?
          </h2>
          <p className="section-subtitle" style={{ color: 'rgba(245,230,204,0.7)', margin: '16px auto 32px' }}>
            Whether you're a farmer with fresh produce or a buyer looking for quality crops,
            Farm Market is where it happens.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary">Join for Free</Link>
            <Link to="/login" className="btn-outline" style={{ borderColor: '#F0C98A', color: '#F0C98A' }}>
              Already a Member
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-name">Farm Market</div>
            <p className="footer-brand-desc">
              India's trusted agricultural marketplace — connecting farmers, buyers, and field
              representatives for transparent and fair farm produce trade.
            </p>
          </div>
          <div>
            <div className="footer-heading">Platform</div>
            <ul className="footer-links">
              <li><Link to="/login">Browse Ads</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/login">Post a Listing</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">Roles</div>
            <ul className="footer-links">
              <li><a href="#">For Farmers</a></li>
              <li><a href="#">For Buyers</a></li>
              <li><a href="#">For Representatives</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Farm Market. Built for India's farmers.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
