import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import TabBar from '../components/TabBar';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, MapPinIcon } from '../components/Icons';

const RELATIONSHIPS = [
  'Friend', 'Wife', 'Husband', 'Mother', 'Father', 'Sister', 'Brother',
  'Grandmother', 'Grandfather', 'Son', 'Daughter', 'Cousin', 'Uncle', 'Aunt',
  'Boss', 'Colleague', 'Step-Father', 'Step-Mother', 'Father-in-law', 'Mother-in-law',
];

export default function PersonsPage() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    full_name: '', nickname: '', relationship: '', notes: '',
    address_type: 'residential', address_line1: '', address_line2: '',
    city: '', state: '', zip_code: '', country: 'US',
  });

  useEffect(() => {
    loadPersons();
    if (location.state?.addNew) setShowAdd(true);
  }, []);

  async function loadPersons() {
    setLoading(true);
    try {
      const data = await api.getPersons();
      setPersons(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { address_type, address_line1, address_line2, city, state, zip_code, country, ...personData } = form;
      const addresses = address_line1 ? [{
        address_type, address_line1, address_line2, city, state, zip_code, country, is_default: true,
      }] : [];

      await api.createPerson({ ...personData, addresses });
      setShowAdd(false);
      setForm({ full_name: '', nickname: '', relationship: '', notes: '', address_type: 'residential', address_line1: '', address_line2: '', city: '', state: '', zip_code: '', country: 'US' });
      loadPersons();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this person and all their events?')) return;
    try {
      await api.deletePerson(id);
      loadPersons();
    } catch (err) { alert(err.message); }
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="app-shell">
      <div className="header-bar">
        <h1>Persons</h1>
        <button className="header-action"><SearchIcon /></button>
      </div>

      <div className="page-content">
        {persons.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No persons added yet</p>
          </div>
        ) : (
          persons.map((person, i) => (
            <div key={person.id} className="card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="avatar" onClick={() => navigate(`/persons/${person.id}`)} style={{ cursor: 'pointer' }}>
                  {person.avatar_url ? (
                    <img src={person.avatar_url} alt={person.full_name} />
                  ) : (
                    getInitials(person.full_name)
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{person.full_name}</h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ge-teal-600)', fontWeight: 600 }}>{person.relationship}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ge-text-muted)', width: 20 }}><EditIcon /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ge-red)', width: 20 }} onClick={() => handleDelete(person.id)}><TrashIcon /></button>
                    </div>
                  </div>

                  {person.person_addresses?.[0] && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', marginTop: 6, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--ge-orange)', flexShrink: 0, width: 14, marginTop: 1 }}><MapPinIcon /></span>
                      {person.person_addresses[0].address_line1}, {person.person_addresses[0].city}, {person.person_addresses[0].state} {person.person_addresses[0].zip_code}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>
        <PlusIcon />
      </button>

      {/* Add Person Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Person</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input className="input-field" placeholder="Enter Contact Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>

              <div className="input-group">
                <input className="input-field" placeholder="Nickname (optional)" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              </div>

              <div className="input-group">
                <select className="input-field" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} required>
                  <option value="">Select Contact Type</option>
                  {RELATIONSHIPS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                </select>
              </div>

              <div className="input-group">
                <select className="input-field" value={form.address_type} onChange={(e) => setForm({ ...form, address_type: e.target.value })}>
                  <option value="residential">Residential</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="input-group">
                <input className="input-field" placeholder="Enter Address" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
              </div>

              <div className="input-group">
                <input className="input-field" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <select className="input-field" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                    <option value="">State</option>
                    <option value="AZ">AZ</option>
                    <option value="CA">CA</option>
                    <option value="FL">FL</option>
                    <option value="NY">NY</option>
                    <option value="TX">TX</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <input className="input-field" placeholder="Zip Code" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <textarea className="input-field" placeholder="Notes (funny memories, preferences...)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 4 }}>Add Person</button>
              <button type="button" className="btn btn-text btn-full" onClick={() => setShowAdd(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
