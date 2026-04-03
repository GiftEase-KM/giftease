import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { GiftIcon } from '../components/Icons';
import '../styles/onboarding.css';

const slides = [
  {
    emoji: '📋',
    title: 'Add your contacts.',
    description: 'Add the people you care about — their name, address, nickname, and any notes or memories you want to remember.',
  },
  {
    emoji: '💌',
    title: 'A handwritten card gets sent.',
    description: 'Choose an occasion — birthday, anniversary, holiday — and GiftEase sends a real handwritten card on your behalf.',
  },
  {
    emoji: '🎉',
    title: 'Never miss a moment.',
    description: "You'll get a reminder 10 days before each event so you can customize the card and message. We handle the rest.",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [fonts, setFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [selectedFont, setSelectedFont] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      // After last slide, show font picker
      setShowFontPicker(true);
      loadFonts();
    }
  };

  async function loadFonts() {
    setFontsLoading(true);
    try {
      const data = await api.getHWFonts();
      if (data.fonts) {
        const mapped = data.fonts.map(f => ({
          id: f.id,
          name: f.label || f.font_name || f.id,
          font_path: f.path || null,
        }));
        setFonts(mapped);

        // Load font files dynamically
        data.fonts.forEach(f => {
          if (f.path) {
            const fontFace = new FontFace(f.id, `url(${f.path})`);
            fontFace.load().then(loaded => {
              document.fonts.add(loaded);
            }).catch(() => {});
          }
        });
      }
    } catch (e) { console.error(e); }
    setFontsLoading(false);
  }

  const handleFontSelect = async () => {
    if (!selectedFont) {
      // Skip without selecting — that's fine
      navigate('/persons', { state: { addNew: true } });
      return;
    }

    setSaving(true);
    try {
      await api.updateProfile({ default_font_id: selectedFont.id });
    } catch (e) { console.error(e); }
    setSaving(false);
    navigate('/persons', { state: { addNew: true } });
  };

  // Tutorial slides view
  if (!showFontPicker) {
    const slide = slides[current];
    const isLast = current === slides.length - 1;

    return (
      <div className="onboarding-page">
        <div className="onboarding-card animate-fade" key={current}>
          <div className="onboarding-logo">
            <div className="onboarding-logo-icon"><GiftIcon /></div>
            <span className="onboarding-logo-text">GIFTEASE</span>
          </div>

          <div className="onboarding-illustration">
            <span className="onboarding-emoji">{slide.emoji}</span>
          </div>

          <div className="onboarding-text">
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
          </div>

          <div className="onboarding-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`onboarding-dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>

          <button className="btn btn-primary btn-full" onClick={handleNext}>
            {isLast ? 'Almost done!' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // Font picker view
  return (
    <div className="onboarding-page">
      <div className="onboarding-card" style={{ maxWidth: 440 }}>
        <div className="onboarding-logo">
          <div className="onboarding-logo-icon"><GiftIcon /></div>
          <span className="onboarding-logo-text">GIFTEASE</span>
        </div>

        <div className="onboarding-text" style={{ marginBottom: 16 }}>
          <h2>Choose your handwriting</h2>
          <p>Pick a default handwriting style for your cards. You can always change it later.</p>
        </div>

        {fontsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ge-text-muted)' }}>
            Loading handwriting styles...
          </div>
        ) : (
          <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 20 }}>
            {fonts.map(font => (
              <div
                key={font.id}
                onClick={() => setSelectedFont(font)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--ge-radius-md)',
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: selectedFont?.id === font.id ? '2px solid var(--ge-teal-600)' : '2px solid transparent',
                  background: selectedFont?.id === font.id ? 'var(--ge-sage-50)' : 'var(--ge-sage-100)',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: `"${font.id}", cursive`,
                  fontSize: '1.2rem',
                  lineHeight: 1.4,
                  color: 'var(--ge-text-primary)',
                  marginBottom: 4,
                }}>
                  Wishing you all the best!
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ge-text-muted)', fontWeight: 600 }}>
                  {font.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-primary btn-full"
          onClick={handleFontSelect}
          disabled={saving}
        >
          {saving ? 'Saving...' : selectedFont ? 'Continue' : 'Skip for now'}
        </button>
      </div>
    </div>
  );
}