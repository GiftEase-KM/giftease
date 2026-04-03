import { useNavigate } from 'react-router-dom';
import { GiftIcon } from '../components/Icons';
import '../styles/landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand" onClick={() => navigate('/')}>
            <div className="landing-nav-icon"><GiftIcon /></div>
            <span>GIFTEASE</span>
          </div>
          <div className="landing-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <button className="landing-nav-cta" onClick={() => navigate('/login')}>Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-doodle d1">🎂</div>
          <div className="hero-doodle d2">🎁</div>
          <div className="hero-doodle d3">💌</div>
          <div className="hero-doodle d4">🎈</div>
          <div className="hero-doodle d5">💐</div>
          <div className="hero-doodle d6">🎉</div>
        </div>
        <div className="landing-hero-content">
          <h1>Never forget a<br />special occasion.</h1>
          <p className="landing-hero-sub">
            GiftEase sends real handwritten cards to the people you love — automatically, for every birthday, anniversary, and holiday that matters.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section" id="how-it-works">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">How it works</h2>
          <p className="landing-section-subtitle">Three simple steps to never miss an occasion again.</p>

          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-number">1</div>
              <div className="how-step-icon">📋</div>
              <h3>Add your people</h3>
              <p>Add the people you care about — their name, address, and the occasions that matter to them.</p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-number">2</div>
              <div className="how-step-icon">✉️</div>
              <h3>Choose a card</h3>
              <p>Pick from our collection of beautiful cards, choose a handwriting style, and personalize your message.</p>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <div className="how-step-number">3</div>
              <div className="how-step-icon">🎉</div>
              <h3>We handle the rest</h3>
              <p>We write, stamp, and mail your card so it arrives right on time. You get all the credit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section landing-section-alt" id="features">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Why GiftEase?</h2>
          <p className="landing-section-subtitle">Because the people in your life deserve more than a text.</p>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">✍️</span>
              <h3>Real handwritten cards</h3>
              <p>Not printed. Not digital. Every card is written with a real pen by our robotic handwriting system — indistinguishable from the real thing.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h3>AI-drafted messages</h3>
              <p>Our AI writes a thoughtful, personal message for each card based on your relationship and the occasion. Edit it or use it as-is.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔔</span>
              <h3>Automated reminders</h3>
              <p>Get reminded 10 days before each occasion. Plenty of time to pick a card, tweak the message, and approve.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📅</span>
              <h3>Set it and forget it</h3>
              <p>Add someone once, attach their birthdays and holidays, and GiftEase handles it year after year.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏠</span>
              <h3>Home or office delivery</h3>
              <p>Send cards to residential or business addresses. We handle the stamps and postage — all included.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Pay per card</h3>
              <p>No subscriptions. No commitments. Just pay for each card you send, starting at $10.00.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Cards */}
      <section className="landing-section" id="cards">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">Cards for every occasion</h2>
          <p className="landing-section-subtitle">Browse our collection of beautiful, high-quality cards.</p>

          <div className="sample-cards">
            <div className="sample-card" style={{ backgroundColor: '#E8D5B7' }}>
              <div className="sample-card-label">Birthday</div>
              <span className="sample-card-emoji">🎂</span>
            </div>
            <div className="sample-card" style={{ backgroundColor: '#D4E2D4' }}>
              <div className="sample-card-label">Thank You</div>
              <span className="sample-card-emoji">💐</span>
            </div>
            <div className="sample-card" style={{ backgroundColor: '#F0D5D5' }}>
              <div className="sample-card-label">Anniversary</div>
              <span className="sample-card-emoji">💍</span>
            </div>
            <div className="sample-card" style={{ backgroundColor: '#D5E8F0' }}>
              <div className="sample-card-label">Holiday</div>
              <span className="sample-card-emoji">🎄</span>
            </div>
            <div className="sample-card" style={{ backgroundColor: '#F0E8D5' }}>
              <div className="sample-card-label">Congratulations</div>
              <span className="sample-card-emoji">🎉</span>
            </div>
            <div className="sample-card" style={{ backgroundColor: '#E2E2E8' }}>
              <div className="sample-card-label">Thinking of You</div>
              <span className="sample-card-emoji">💌</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta">
        <div className="landing-cta-inner">
          <div className="landing-cta-icon"><GiftIcon /></div>
          <h2>Start sending cards that matter.</h2>
          <p>Join GiftEase and never miss another birthday, anniversary, or holiday for the people you love.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-nav-icon"><GiftIcon /></div>
            <span>GIFTEASE</span>
          </div>
          <div className="landing-footer-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#cards">Cards</a>
          </div>
          <p className="landing-footer-copy">© 2026 GiftEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}