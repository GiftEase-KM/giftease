import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ChevronLeftIcon } from '../components/Icons';
import '../styles/card-flow.css';

const CARD_PRICE = 10.00;

// Map event_type_id to Handwrytten category names for smart defaults
const EVENT_TO_CATEGORY = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  christmas: 'Christmas',
  valentines_day: 'Valentine',
  mothers_day: "Mother",
  fathers_day: "Father",
  graduation: 'Graduation',
  new_year: 'New Year',
  easter: 'Easter',
  thanksgiving: 'Thanksgiving',
};

function generateMockMessage(personName, eventType, relationship) {
  const messages = {
    birthday: `Dear ${personName},\n\nWishing you the happiest of birthdays! May this year bring you everything you've been hoping for and more. You deserve all the joy and love in the world.`,
    christmas: `Dear ${personName},\n\nMerry Christmas! Wishing you a season filled with warmth, laughter, and wonderful memories with the people you love most.`,
    anniversary: `Dear ${personName},\n\nHappy Anniversary! Celebrating this special milestone with you is a reminder of all the beautiful moments we've shared. Here's to many more.`,
    mothers_day: `Dear ${personName},\n\nHappy Mother's Day! Thank you for everything you do. Your love, patience, and strength inspire me every single day.`,
    fathers_day: `Dear ${personName},\n\nHappy Father's Day! Thank you for your guidance, wisdom, and unconditional love. I'm so grateful to have you in my life.`,
    default: `Dear ${personName},\n\nJust wanted to let you know I'm thinking of you. You mean so much to me, and I hope this card brings a smile to your face.`,
  };
  return messages[eventType] || messages.default;
}

/* ============================================================
   STEP 1: PICK A CARD (no "All" button, defaults to event category)
   ============================================================ */
function StepPickCard({ cards, categories, selectedCard, onSelect, onCategoryChange, loading, activeCategory }) {
  return (
    <div>
      <h2 className="step-title">Choose a card</h2>
      <p className="step-subtitle">Pick a design that fits the occasion.</p>

      <div className="card-filter-bar">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`card-filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading cards...</p></div>
      ) : cards.length === 0 ? (
        <div className="empty-state"><p>No cards found in this category.</p></div>
      ) : (
        <div className="card-grid">
          {cards.map(card => (
            <div
              key={card.id}
              className={`card-option ${selectedCard?.id === card.id ? 'selected' : ''}`}
              onClick={() => onSelect(card)}
            >
              <div className="card-preview">
                {card.cover_url ? (
                  <img src={card.cover_url} alt={card.name} />
                ) : (
                  <span className="card-preview-placeholder">🃏</span>
                )}
              </div>
              <div className="card-option-info">
                <span className="card-option-name">{card.name}</span>
                <span className="card-option-price">${CARD_PRICE.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STEP 2: PICK A HANDWRITING STYLE (pre-selects user's default)
   ============================================================ */
function StepPickFont({ fonts, selectedFont, onSelect, loading }) {
  return (
    <div>
      <h2 className="step-title">Choose a handwriting style</h2>
      <p className="step-subtitle">Select how your card will be written.</p>

      {loading ? (
        <div className="empty-state"><p>Loading fonts...</p></div>
      ) : (
        <div className="font-list">
          {fonts.map(font => (
            <div
              key={font.id}
              className={`font-option ${selectedFont?.id === font.id ? 'selected' : ''}`}
              onClick={() => onSelect(font)}
            >
              <div className="font-sample" style={{ fontFamily: `"${font.id}", cursive`, fontSize: '1.4rem', lineHeight: 1.5 }}>
                Wishing you all the best on your special day!
              </div>
              <div className="font-name">{font.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STEP 3: WRITE THE MESSAGE + SIGN OFF
   ============================================================ */
function StepWriteMessage({ message, onChange, signOff, onSignOffChange, onGenerate, generating }) {
  return (
    <div>
      <h2 className="step-title">Write your message</h2>
      <p className="step-subtitle">We drafted something for you — feel free to edit it.</p>

      <div className="message-editor">
        <textarea
          className="message-textarea"
          value={message}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="Your message here..."
        />

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ge-text-secondary)', marginBottom: 6 }}>
            Sign off
          </label>
          <input
            className="input-field"
            value={signOff}
            onChange={(e) => onSignOffChange(e.target.value)}
            placeholder="e.g. Love, Uncle Bob"
            style={{ fontSize: '0.9rem', padding: '10px 14px' }}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--ge-text-muted)', marginTop: 4 }}>
            This will appear at the end of your message.
          </p>
        </div>

        <div className="message-actions" style={{ marginTop: 12 }}>
          <button className="btn-generate" onClick={onGenerate} disabled={generating}>
            {generating ? '✨ Generating...' : '✨ Regenerate with AI'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 4: REVIEW & CONFIRM
   ============================================================ */
function StepReview({ card, font, message, signOff, person, event, selectedAddress, onAddressChange, onConfirm, confirming, profile, onSaveReturnAddress }) {
  const addresses = person?.person_addresses || [];
  const hasReturnAddress = !!(profile?.address_line1 && profile?.city && profile?.state && profile?.zip_code);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnForm, setReturnForm] = useState({
    address_line1: profile?.address_line1 || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zip_code: profile?.zip_code || '',
  });
  const [savingReturn, setSavingReturn] = useState(false);

  const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

  const handleSaveReturn = async () => {
    setSavingReturn(true);
    try {
      await onSaveReturnAddress(returnForm);
      setShowReturnForm(false);
    } catch (err) { alert(err.message); }
    setSavingReturn(false);
  };

  const fullMessage = signOff ? `${message}\n\n${signOff}` : message;

  return (
    <div>
      <h2 className="step-title">Review your card</h2>
      <p className="step-subtitle">Everything look good? Confirm to send.</p>

      <div className="review-sections">
        <div className="review-card-preview">
          <div className="review-card-front">
            {card?.cover_url ? (
              <img src={card.cover_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--ge-radius-md)' }} />
            ) : (
              <>
                <span style={{ fontSize: '2rem' }}>🃏</span>
                <span className="review-card-name">{card?.name}</span>
              </>
            )}
          </div>
          <div className="review-card-inside">
            <pre className="review-message">{fullMessage}</pre>
          </div>
        </div>

        {/* Delivery address selector */}
        <div style={{ background: 'var(--ge-bg-card, var(--ge-sage-100))', borderRadius: 'var(--ge-radius-md)', padding: 14 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ge-text-secondary)', marginBottom: 10 }}>
            📬 Deliver to:
          </div>
          {addresses.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--ge-red)' }}>
              No address on file. Please add an address to this contact first.
            </p>
          ) : (
            addresses.map((addr, i) => (
              <div
                key={addr.id || i}
                onClick={() => onAddressChange(addr)}
                style={{
                  padding: '10px 14px', borderRadius: 'var(--ge-radius-sm)',
                  marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s',
                  border: selectedAddress?.id === addr.id ? '2px solid var(--ge-teal-600)' : '1.5px solid var(--ge-border-medium, rgba(0,0,0,0.1))',
                  background: selectedAddress?.id === addr.id ? 'var(--ge-sage-50, #f6f8f4)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.9rem' }}>{addr.address_type === 'business' ? '🏢' : '🏠'}</span>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize', display: 'block' }}>
                      {addr.address_type} Address
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)' }}>
                      {addr.address_line1}, {addr.city}, {addr.state} {addr.zip_code}
                    </span>
                  </div>
                  {selectedAddress?.id === addr.id && <span style={{ marginLeft: 'auto', color: 'var(--ge-teal-600)', fontWeight: 700 }}>✓</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Return address */}
        <div style={{ background: 'var(--ge-bg-card, var(--ge-sage-100))', borderRadius: 'var(--ge-radius-md)', padding: 14 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ge-text-secondary)', marginBottom: 10 }}>
            📍 Your return address:
          </div>
          {hasReturnAddress && !showReturnForm ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--ge-text-primary)' }}>
                {profile.address_line1}, {profile.city}, {profile.state} {profile.zip_code}
              </span>
              <button onClick={() => setShowReturnForm(true)} style={{
                background: 'none', border: 'none', color: 'var(--ge-teal-600)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}>Edit</button>
            </div>
          ) : (
            <div>
              {!hasReturnAddress && !showReturnForm && (
                <p style={{ fontSize: '0.85rem', color: 'var(--ge-text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
                  We need your return address to mail this card.
                </p>
              )}
              {(showReturnForm || !hasReturnAddress) && (
                <div>
                  <div className="input-group">
                    <input className="input-field" placeholder="Street Address" value={returnForm.address_line1}
                      onChange={(e) => setReturnForm({ ...returnForm, address_line1: e.target.value })} style={{ fontSize: '0.85rem', padding: '10px 12px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="input-group" style={{ flex: 2 }}>
                      <input className="input-field" placeholder="City" value={returnForm.city}
                        onChange={(e) => setReturnForm({ ...returnForm, city: e.target.value })} style={{ fontSize: '0.85rem', padding: '10px 12px' }} />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <select className="input-field" value={returnForm.state}
                        onChange={(e) => setReturnForm({ ...returnForm, state: e.target.value })} style={{ fontSize: '0.85rem', padding: '10px 8px' }}>
                        <option value="">State</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <input className="input-field" placeholder="Zip" value={returnForm.zip_code}
                        onChange={(e) => setReturnForm({ ...returnForm, zip_code: e.target.value })} style={{ fontSize: '0.85rem', padding: '10px 12px' }} />
                    </div>
                  </div>
                  <button onClick={handleSaveReturn} disabled={savingReturn || !returnForm.address_line1 || !returnForm.city || !returnForm.state || !returnForm.zip_code}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 'var(--ge-radius-full)',
                      background: 'var(--ge-teal-600)', color: 'white', border: 'none',
                      fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
                      opacity: (!returnForm.address_line1 || !returnForm.city || !returnForm.state || !returnForm.zip_code) ? 0.5 : 1,
                    }}>
                    {savingReturn ? 'Saving...' : 'Save Return Address'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="review-details">
          <div className="review-row">
            <span className="review-label">To</span>
            <span className="review-value">{person?.full_name}</span>
          </div>
          <div className="review-row">
            <span className="review-label">Event</span>
            <span className="review-value">{event?.event_name}</span>
          </div>
          <div className="review-row">
            <span className="review-label">Card</span>
            <span className="review-value">{card?.name}</span>
          </div>
          <div className="review-row">
            <span className="review-label">Handwriting</span>
            <span className="review-value">{font?.name}</span>
          </div>
          {signOff && (
            <div className="review-row">
              <span className="review-label">Sign off</span>
              <span className="review-value">{signOff}</span>
            </div>
          )}
          <div className="review-row total">
            <span className="review-label">Total</span>
            <span className="review-value">${CARD_PRICE.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={onConfirm}
        disabled={confirming || !selectedAddress || !hasReturnAddress}
        style={{ marginTop: 20 }}
      >
        {confirming ? 'Sending...' : `Confirm & Send — $${CARD_PRICE.toFixed(2)}`}
      </button>
      {!selectedAddress && addresses.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--ge-red)', marginTop: 8 }}>
          Please select a delivery address above.
        </p>
      )}
      {!hasReturnAddress && (
        <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--ge-red)', marginTop: 8 }}>
          Please add your return address above.
        </p>
      )}
    </div>
  );
}

/* ============================================================
   MAIN CARD FLOW PAGE
   ============================================================ */
export default function CardFlowPage() {
  const navigate = useNavigate();
  const { occurrenceId } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const personId = searchParams.get('personId');

  const [step, setStep] = useState(1);
  const [event, setEvent] = useState(null);
  const [person, setPerson] = useState(null);

  // Handwrytten data
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [fontsLoading, setFontsLoading] = useState(true);

  // Selections
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedFont, setSelectedFont] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [signOff, setSignOff] = useState('');
  const [generating, setGenerating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadData();
    loadFonts();
    loadCategories();
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (e) { console.error(e); }
  }

  async function handleSaveReturnAddress(addressData) {
    const updated = await api.updateProfile(addressData);
    setProfile(updated);
  }

  async function loadData() {
    try {
      let pId = personId;
      let eventTypeId = null;

      if (eventId) {
        const evt = await api.getEvent(eventId);
        setEvent(evt);
        eventTypeId = evt.event_type_id;
        if (evt.person_id) pId = evt.person_id;
        else if (evt.persons?.id) pId = evt.persons.id;
      }

      if (pId) {
        const fullPerson = await api.getPerson(pId);
        setPerson(fullPerson);
        const addrs = fullPerson.person_addresses || [];
        const defaultAddr = addrs.find(a => a.is_default) || addrs[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }

      // Load cards with smart category default based on event type
      // We'll set the category after categories load
      if (eventTypeId) {
        // Store event type so we can match it to a category after categories load
        window.__giftease_event_type = eventTypeId;
      }
      loadCards(null); // Load all initially, will re-load with category after categories come in
    } catch (e) { console.error(e); }
  }

  async function loadCards(categoryId) {
    setCardsLoading(true);
    try {
      const data = await api.getHWCards(categoryId, 0);
      if (data.cards) {
        setCards(data.cards.map(c => ({
          id: c.id,
          name: c.name,
          category_id: c.category_id,
          category_name: c.category_name,
          price: c.price,
          cover_url: c.cover || (c.images && c.images[0]) || null,
        })));
      } else {
        setCards([]);
      }
    } catch (e) { console.error(e); setCards([]); }
    setCardsLoading(false);
  }

  async function loadFonts() {
    setFontsLoading(true);
    try {
      const data = await api.getHWFonts();
      if (data.fonts) {
        const mapped = data.fonts.map(f => ({
          id: f.id,
          name: f.label || f.font_name || f.id,
          preview_url: f.image || null,
          font_path: f.path || null,
          font_id: f.font_id,
        }));
        setFonts(mapped);

        data.fonts.forEach(f => {
          if (f.path) {
            const fontFace = new FontFace(f.id, `url(${f.path})`);
            fontFace.load().then(loaded => {
              document.fonts.add(loaded);
            }).catch(() => {});
          }
        });

        // Pre-select default font from profile
        const prof = await api.getProfile();
        if (prof?.default_font_id) {
          const defaultFont = mapped.find(f => f.id === prof.default_font_id);
          if (defaultFont) setSelectedFont(defaultFont);
        }
      }
    } catch (e) { console.error(e); setFonts([]); }
    setFontsLoading(false);
  }

  async function loadCategories() {
    try {
      const data = await api.getHWCategories();
      if (data.categories) {
        const cats = data.categories.map(c => ({ id: c.id, name: c.name }));
        setCategories(cats);

        // Smart default: match event type to a category
        const eventTypeId = window.__giftease_event_type;
        if (eventTypeId) {
          const searchTerm = EVENT_TO_CATEGORY[eventTypeId];
          if (searchTerm) {
            const matchedCat = cats.find(c =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matchedCat) {
              setActiveCategory(matchedCat.id);
              loadCards(matchedCat.id);
            }
          }
        }
      }
    } catch (e) { console.error(e); }
  }

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    loadCards(catId);
  };

  const generateMessage = () => {
    setGenerating(true);
    setTimeout(() => {
      const eventType = event?.event_type_id || 'default';
      const msg = generateMockMessage(
        person?.full_name || 'Friend',
        eventType,
        person?.relationship || '',
      );
      setMessage(msg);
      setGenerating(false);
    }, 1200);
  };

  const handleConfirm = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address.');
      return;
    }
    if (!profile?.address_line1) {
      alert('Please add your return address.');
      return;
    }

    setConfirming(true);
    try {
      const fullMessage = signOff ? `${message}\n\n${signOff}` : message;

      const orderData = {
        card_id: selectedCard.id,
        font_label: selectedFont.name,
        message: fullMessage,
        sender_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        sender_address1: profile.address_line1 || '',
        sender_city: profile.city || '',
        sender_state: profile.state || '',
        sender_zip: profile.zip_code || '',
        sender_country: profile.country || 'United States',
        recipient_name: person.full_name || '',
        recipient_address1: selectedAddress.address_line1 || '',
        recipient_city: selectedAddress.city || '',
        recipient_state: selectedAddress.state || '',
        recipient_zip: selectedAddress.zip_code || '',
        recipient_country: selectedAddress.country || 'United States',
      };

      const result = await api.placeHWOrder(orderData);

      if (result.status === 'ok' || result.httpCode === 200) {
        alert('Card order placed successfully! (Test mode — no real card sent)');
        navigate('/events');
      } else {
        alert(`Order failed: ${result.message || JSON.stringify(result)}`);
      }
    } catch (err) {
      alert(`Error placing order: ${err.message}`);
    }
    setConfirming(false);
  };

  useEffect(() => {
    if (step === 3 && !message && person) {
      generateMessage();
    }
  }, [step]);

  const canProceed = () => {
    if (step === 1) return !!selectedCard;
    if (step === 2) return !!selectedFont;
    if (step === 3) return message.trim().length > 0;
    return true;
  };

  const stepLabels = ['Card', 'Handwriting', 'Message', 'Review'];

  return (
    <div className="card-flow-page">
      <div className="card-flow-header">
        <button className="card-flow-back" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
          <ChevronLeftIcon />
        </button>
        <h1>
          {person ? `Card for ${person.full_name}` : 'Customize Card'}
        </h1>
      </div>

      <div className="step-indicator">
        {stepLabels.map((label, i) => (
          <div key={i} className={`step-dot-group ${i + 1 === step ? 'active' : ''} ${i + 1 < step ? 'done' : ''}`}>
            <div className="step-dot">{i + 1 < step ? '✓' : i + 1}</div>
            <span className="step-dot-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="card-flow-content">
        {step === 1 && (
          <StepPickCard
            cards={cards}
            categories={categories}
            selectedCard={selectedCard}
            onSelect={setSelectedCard}
            onCategoryChange={handleCategoryChange}
            loading={cardsLoading}
            activeCategory={activeCategory}
          />
        )}
        {step === 2 && (
          <StepPickFont fonts={fonts} selectedFont={selectedFont} onSelect={setSelectedFont} loading={fontsLoading} />
        )}
        {step === 3 && (
          <StepWriteMessage
            message={message}
            onChange={setMessage}
            signOff={signOff}
            onSignOffChange={setSignOff}
            onGenerate={generateMessage}
            generating={generating}
          />
        )}
        {step === 4 && (
          <StepReview
            card={selectedCard}
            font={selectedFont}
            message={message}
            signOff={signOff}
            person={person}
            event={event}
            selectedAddress={selectedAddress}
            onAddressChange={setSelectedAddress}
            onConfirm={handleConfirm}
            confirming={confirming}
            profile={profile}
            onSaveReturnAddress={handleSaveReturnAddress}
          />
        )}
      </div>

      {step < 4 && (
        <div className="card-flow-footer">
          <button
            className="btn btn-primary btn-full"
            disabled={!canProceed()}
            onClick={() => setStep(step + 1)}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}