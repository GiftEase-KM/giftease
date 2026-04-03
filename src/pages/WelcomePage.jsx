import { useNavigate } from 'react-router-dom';
import { GiftIcon } from '../components/Icons';
import '../styles/welcome.css';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <div className="welcome-bg">
        <div className="doodle doodle-1">🎂</div>
        <div className="doodle doodle-2">🎁</div>
        <div className="doodle doodle-3">💌</div>
        <div className="doodle doodle-4">🎈</div>
        <div className="doodle doodle-5">🧁</div>
        <div className="doodle doodle-6">🎉</div>
        <div className="doodle doodle-7">💐</div>
        <div className="doodle doodle-8">🍕</div>
      </div>

      <div className="welcome-content">
        <div className="welcome-logo">
          <span className="welcome-tagline-above">Welcome to</span>
          <div className="welcome-brand">
            <div className="welcome-icon"><GiftIcon /></div>
            <h1>GIFT<br />EASE</h1>
          </div>
          <p className="welcome-tagline">
            Keep your loved ones in your thoughts — never miss a moment that matters.
          </p>
        </div>

        <div className="welcome-actions">
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-secondary btn-full" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}