import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import TabBar from '../components/TabBar';
import { ChevronLeftIcon, MapPinIcon } from '../components/Icons';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function SubPageHeader({ title, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 12px',
    }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', width: 24, height: 24, padding: 0, color: 'var(--ge-text-primary)' }}>
        <ChevronLeftIcon />
      </button>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>{title}</h1>
    </div>
  );
}

function MenuItem({ icon, label, subtitle, onClick }) {
  return (
    <div className="card" style={{ cursor: 'pointer', marginBottom: 8 }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--ge-sage-100)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: '0.92rem', display: 'block' }}>{label}</span>
          {subtitle && <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)' }}>{subtitle}</span>}
        </div>
        <span style={{ color: 'var(--ge-text-muted)', fontSize: '1.2rem' }}>›</span>
      </div>
    </div>
  );
}

/* ============================================================
   EDIT PERSONAL INFO
   ============================================================ */
function EditPersonalInfo({ profile, user, onSave, onBack }) {
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onBack();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  return (
    <>
      <SubPageHeader title="Personal Info" onBack={onBack} />
      <div style={{ padding: '8px 20px 80px' }}>
        <div className="input-group"><label>First Name</label><input className="input-field" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
        <div className="input-group"><label>Last Name</label><input className="input-field" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
        <div className="input-group"><label>Phone</label><input className="input-field" type="tel" placeholder="(555) 123-4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="input-group"><label>Email</label><input className="input-field" value={profile?.email || user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} /></div>
        <p style={{ fontSize: '0.75rem', color: 'var(--ge-text-muted)', marginTop: -4, marginBottom: 16 }}>Email cannot be changed.</p>
        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button className="btn btn-text btn-full" onClick={onBack}>Cancel</button>
      </div>
    </>
  );
}

/* ============================================================
   RETURN ADDRESS
   ============================================================ */
function EditReturnAddress({ profile, onSave, onBack }) {
  const [form, setForm] = useState({
    address_line1: profile?.address_line1 || '',
    address_line2: profile?.address_line2 || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zip_code: profile?.zip_code || '',
    country: profile?.country || 'US',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onBack();
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  return (
    <>
      <SubPageHeader title="Return Address" onBack={onBack} />
      <div style={{ padding: '8px 20px 80px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--ge-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          This address appears as the "from" address on every card you send.
        </p>

        <div className="input-group"><label>Street Address</label><input className="input-field" placeholder="123 Main Street" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} /></div>
        <div className="input-group"><label>Apt, Suite, Unit</label><input className="input-field" placeholder="Optional" value={form.address_line2} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} /></div>
        <div className="input-group"><label>City</label><input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label>State</label>
            <select className="input-field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
              <option value="">State</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label>Zip Code</label>
            <input className="input-field" placeholder="85251" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} />
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Saving...' : 'Save Return Address'}
        </button>
        <button className="btn btn-text btn-full" onClick={onBack}>Cancel</button>
      </div>
    </>
  );
}

/* ============================================================
   PAYMENT METHODS
   ============================================================ */
function PaymentMethodsView({ onBack }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPaymentMethods().then(setMethods).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const brandIcon = (brand) => {
    const icons = { visa: '💳', mastercard: '💳', amex: '💳' };
    return icons[brand] || '💳';
  };

  return (
    <>
      <SubPageHeader title="Payment Methods" onBack={onBack} />
      <div style={{ padding: '8px 20px 80px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--ge-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Your payment method is charged when a card is sent. All payment data is handled securely by Stripe.
        </p>

        {loading ? (
          <div className="empty-state"><p>Loading...</p></div>
        ) : methods.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💳</div>
            <p>No payment methods added yet</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--ge-text-muted)', marginTop: -8 }}>
              Stripe integration coming soon.
            </p>
          </div>
        ) : (
          methods.map(method => (
            <div key={method.id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.5rem' }}>{brandIcon(method.card_brand)}</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block', textTransform: 'capitalize' }}>
                      {method.card_brand}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--ge-text-muted)' }}>
                      •••• {method.last_four}
                    </span>
                  </div>
                </div>
                {method.is_default && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 'var(--ge-radius-full)',
                    fontSize: '0.7rem', fontWeight: 700, background: 'var(--ge-sage-100)',
                    color: 'var(--ge-teal-600)',
                  }}>
                    Default
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        <button className="btn btn-primary btn-full" style={{ marginTop: 12 }}>
          + Add Payment Method
        </button>
        <button className="btn btn-text btn-full" onClick={onBack}>Back</button>
      </div>
    </>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */
function SettingsView({ profile, onSave, onBack }) {
  const [settings, setSettings] = useState({
    automated_reminders: profile?.automated_reminders ?? true,
    event_notifications: profile?.event_notifications ?? false,
  });

  const toggleSetting = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await onSave(updated);
    } catch (err) { alert(err.message); }
  };

  return (
    <>
      <SubPageHeader title="Settings" onBack={onBack} />
      <div style={{ padding: '8px 20px 80px' }}>
        <div className="toggle-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1rem' }}>⏰</span>
            <div>
              <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>Automated reminders</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ge-text-muted)' }}>Get notified 10 days before events</span>
            </div>
          </div>
          <button className={`toggle ${settings.automated_reminders ? 'on' : ''}`} onClick={() => toggleSetting('automated_reminders')} />
        </div>

        <div className="toggle-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1rem' }}>🔔</span>
            <div>
              <span style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem' }}>Event notifications</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ge-text-muted)' }}>Email updates about upcoming events</span>
            </div>
          </div>
          <button className={`toggle ${settings.event_notifications ? 'on' : ''}`} onClick={() => toggleSetting('event_notifications')} />
        </div>
      </div>
    </>
  );
}

/* ============================================================
   MAIN PROFILE PAGE
   ============================================================ */
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('main');
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handleSave = async (updates) => {
    const data = await api.updateProfile(updates);
    setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      alert('Account deletion will be available soon. Please contact support.');
    }
  };

  const getInitials = () => {
    if (!profile) return '?';
    const f = profile.first_name?.[0] || '';
    const l = profile.last_name?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const getReturnAddressPreview = () => {
    if (!profile?.address_line1) return 'Not set';
    return `${profile.address_line1}, ${profile.city || ''} ${profile.state || ''} ${profile.zip_code || ''}`.trim();
  };

  if (loading) return (
    <div className="app-shell">
      <div className="page-content"><div className="empty-state">Loading...</div></div>
      <TabBar />
    </div>
  );

  return (
    <div className="app-shell">
      {view === 'main' && (
        <>
          <div className="header-bar"><h1>Profile</h1></div>

          <div className="page-content">
            {/* Profile header card */}
            <div className="card" style={{ margin: '8px 20px 16px', padding: '24px 20px', textAlign: 'center' }}>
              <div className="avatar avatar-lg" style={{
                margin: '0 auto 12px', border: '3px solid var(--ge-sage-100)',
                background: 'var(--ge-sage-100)', color: 'var(--ge-teal-700)',
              }}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" /> : getInitials()}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
                {profile?.first_name || ''} {profile?.last_name || ''}
              </h2>
              {profile?.phone && (
                <p style={{ fontSize: '0.85rem', color: 'var(--ge-text-muted)', marginTop: 4 }}>{profile.phone}</p>
              )}
            </div>

            {/* Menu items */}
            <div style={{ padding: '0 20px' }}>
              <MenuItem icon="👤" label="Personal Info" subtitle="Name, phone" onClick={() => setView('personal')} />
              <MenuItem
                icon="📍"
                label="Return Address"
                subtitle={getReturnAddressPreview()}
                onClick={() => setView('return_address')}
              />
              <MenuItem icon="💳" label="Payment Methods" subtitle="Manage your cards" onClick={() => setView('payment')} />
              <MenuItem icon="⚙️" label="Settings" subtitle="Reminders, notifications" onClick={() => setView('settings')} />
            </div>

            {/* Account actions */}
            <div style={{ padding: '24px 20px 20px' }}>
              <button className="btn btn-secondary btn-full" onClick={handleSignOut} style={{ marginBottom: 10 }}>
                Sign Out
              </button>
              <button
                className="btn btn-text btn-full"
                onClick={handleDeleteAccount}
                style={{ color: 'var(--ge-red)', fontSize: '0.85rem' }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </>
      )}

      {view === 'personal' && (
        <EditPersonalInfo profile={profile} user={user} onSave={handleSave} onBack={() => { setView('main'); loadProfile(); }} />
      )}

      {view === 'return_address' && (
        <EditReturnAddress profile={profile} onSave={handleSave} onBack={() => { setView('main'); loadProfile(); }} />
      )}

      {view === 'payment' && (
        <PaymentMethodsView onBack={() => setView('main')} />
      )}

      {view === 'settings' && (
        <SettingsView profile={profile} onSave={handleSave} onBack={() => { setView('main'); loadProfile(); }} />
      )}

      <TabBar />
    </div>
  );
}