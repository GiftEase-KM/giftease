import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import TabBar from '../components/TabBar';
import { ChevronLeftIcon } from '../components/Icons';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('main'); // main, payment, settings, edit
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await api.getProfile();
      setProfile(data);
      setEditForm(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handleSaveProfile = async () => {
    try {
      const data = await api.updateProfile(editForm);
      setProfile(data);
      setView('main');
    } catch (err) { alert(err.message); }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!profile) return '?';
    const f = profile.first_name?.[0] || '';
    const l = profile.last_name?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  if (loading) return <div className="app-shell"><div className="page-content"><div className="empty-state">Loading...</div></div></div>;

  return (
    <div className="app-shell">
      {view === 'main' && (
        <>
          <div style={{ background: 'var(--ge-sage-200)', borderRadius: '0 0 40px 40px', padding: '30px 20px 24px', textAlign: 'center' }}>
            <div className="avatar avatar-lg" style={{ margin: '0 auto 12px', border: '3px solid var(--ge-sage-100)' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" />
              ) : (
                getInitials()
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>
              {profile?.first_name || ''} {profile?.last_name || ''}
            </h2>
            {(profile?.address_line1 || profile?.city) && (
              <p style={{ fontSize: '0.82rem', color: 'var(--ge-text-muted)', marginTop: 4 }}>
                {[profile.address_line1, profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ')}
              </p>
            )}
            <button className="btn btn-primary" style={{ marginTop: 14, fontSize: '0.85rem', padding: '10px 24px' }} onClick={() => setView('edit')}>
              Edit Profile
            </button>
          </div>

          <div className="page-content" style={{ paddingTop: 16 }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setView('payment')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ge-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>💳</div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Payment Info</span>
              </div>
            </div>

            <div className="card" style={{ cursor: 'pointer' }} onClick={() => setView('settings')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ge-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>⚙️</div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>User Settings</span>
              </div>
            </div>

            <div style={{ padding: '20px 16px' }}>
              <button className="btn btn-secondary btn-full" onClick={handleSignOut} style={{ color: 'var(--ge-red)' }}>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {view === 'edit' && (
        <>
          <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setView('main')} style={{ position: 'absolute', left: 16, background: 'none', border: 'none', cursor: 'pointer', width: 24 }}><ChevronLeftIcon /></button>
            <h1>Edit Profile</h1>
          </div>
          <div className="page-content" style={{ padding: '16px 16px 80px' }}>
            <div className="input-group"><label>First Name</label><input className="input-field" value={editForm.first_name || ''} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} /></div>
            <div className="input-group"><label>Last Name</label><input className="input-field" value={editForm.last_name || ''} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} /></div>
            <div className="input-group"><label>Phone</label><input className="input-field" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            <div className="input-group"><label>Address</label><input className="input-field" value={editForm.address_line1 || ''} onChange={(e) => setEditForm({ ...editForm, address_line1: e.target.value })} /></div>
            <div className="input-group"><label>City</label><input className="input-field" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="input-group" style={{ flex: 1 }}><label>State</label><input className="input-field" value={editForm.state || ''} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} /></div>
              <div className="input-group" style={{ flex: 1 }}><label>Zip</label><input className="input-field" value={editForm.zip_code || ''} onChange={(e) => setEditForm({ ...editForm, zip_code: e.target.value })} /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSaveProfile} style={{ marginTop: 8 }}>Save Changes</button>
            <button className="btn btn-text btn-full" onClick={() => setView('main')}>Cancel</button>
          </div>
        </>
      )}

      {view === 'settings' && (
        <>
          <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setView('main')} style={{ position: 'absolute', left: 16, background: 'none', border: 'none', cursor: 'pointer', width: 24 }}><ChevronLeftIcon /></button>
            <h1>User Settings</h1>
          </div>
          <div className="page-content" style={{ padding: '16px 16px 80px' }}>
            <div className="toggle-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>⏰</span>
                <span>Automated reminders</span>
              </div>
              <button
                className={`toggle ${profile?.automated_reminders ? 'on' : ''}`}
                onClick={async () => {
                  const updated = await api.updateProfile({ automated_reminders: !profile.automated_reminders });
                  setProfile(updated);
                }}
              />
            </div>
            <div className="toggle-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>🔔</span>
                <span>Notifications for upcoming events</span>
              </div>
              <button
                className={`toggle ${profile?.event_notifications ? 'on' : ''}`}
                onClick={async () => {
                  const updated = await api.updateProfile({ event_notifications: !profile.event_notifications });
                  setProfile(updated);
                }}
              />
            </div>
          </div>
        </>
      )}

      {view === 'payment' && (
        <>
          <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={() => setView('main')} style={{ position: 'absolute', left: 16, background: 'none', border: 'none', cursor: 'pointer', width: 24 }}><ChevronLeftIcon /></button>
            <h1>Payment Info</h1>
          </div>
          <div className="page-content" style={{ padding: '16px 16px 80px' }}>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 12, paddingLeft: 4 }}>Select Payment Type</p>
            <div className="empty-state">
              <p>No payment methods added yet</p>
            </div>
            <button className="btn btn-primary btn-full">Add New Payment Method</button>
            <button className="btn btn-text btn-full" onClick={() => setView('main')}>Cancel</button>
          </div>
        </>
      )}

      <TabBar />
    </div>
  );
}
