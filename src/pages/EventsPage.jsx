import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import TabBar from '../components/TabBar';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '../components/Icons';

export default function EventsPage() {
  const [filter, setFilter] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const [persons, setPersons] = useState([]);
  const location = useLocation();

  const [form, setForm] = useState({
    event_name: '', event_type_id: '', event_date: '',
    person_id: '', event_theme: '', frequency: 'annually',
  });

  useEffect(() => {
    loadEvents();
    api.getEventTypes().then(setEventTypes).catch(() => {});
    api.getPersons().then(setPersons).catch(() => {});
    if (location.state?.addNew) setShowAdd(true);
  }, []);

  useEffect(() => { loadEvents(); }, [filter]);

  async function loadEvents() {
    setLoading(true);
    try {
      const data = await api.getEvents(filter);
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const selectedType = eventTypes.find(t => t.id === form.event_type_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createEvent(form);
      setShowAdd(false);
      setForm({ event_name: '', event_type_id: '', event_date: '', person_id: '', event_theme: '', frequency: 'annually' });
      loadEvents();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(id);
      loadEvents();
    } catch (err) { alert(err.message); }
  };

  const statusIcon = (status) => {
    if (status === 'completed') return <span style={{ color: 'var(--ge-green-check)' }}>✓</span>;
    if (status === 'paused') return <span style={{ color: 'var(--ge-red)' }}>⏸</span>;
    return null;
  };

  return (
    <div className="app-shell">
      <div className="header-bar">
        <h1>Events</h1>
        <button className="header-action"><SearchIcon /></button>
      </div>

      <div className="page-content">
        <div className="filter-bar">
          {['upcoming', 'completed', 'paused'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {events.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No {filter} events</p>
          </div>
        ) : (
          events.map((event, i) => (
            <div key={event.id} className="card card-bordered animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{event.event_name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', margin: '2px 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBD'}
                    {event.event_types && <span className="chip" style={{ marginLeft: 8 }}>{event.event_types.label}</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    ${event.budget_per_card?.toFixed(2) || '3.98'}
                  </span>
                  {statusIcon(event.status)}
                </div>
              </div>

              {event.persons && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                    {event.persons.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{event.persons.full_name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--ge-text-muted)', display: 'block' }}>{event.persons.relationship}</span>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ge-text-muted)', width: 20 }}><EditIcon /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ge-red)', width: 20 }} onClick={() => handleDelete(event.id)}><TrashIcon /></button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)}>
        <PlusIcon />
      </button>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Event</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Enter Event Name</label>
                <input className="input-field" placeholder="e.g. Candle light dinner" value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} required />
              </div>

              <div className="input-group">
                <label>Select Event Type</label>
                <select className="input-field" value={form.event_type_id} onChange={(e) => setForm({ ...form, event_type_id: e.target.value })} required>
                  <option value="">Select Event Type</option>
                  {eventTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {selectedType?.requires_date_input && (
                <div className="input-group">
                  <label>Select Event Date</label>
                  <input type="date" className="input-field" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
                </div>
              )}

              <div className="input-group">
                <label>Select Person</label>
                <select className="input-field" value={form.person_id} onChange={(e) => setForm({ ...form, person_id: e.target.value })} required>
                  <option value="">Select Person</option>
                  {persons.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Select Event Theme</label>
                <select className="input-field" value={form.event_theme} onChange={(e) => setForm({ ...form, event_theme: e.target.value })}>
                  <option value="">Select Theme</option>
                  <option value="romantic">Romantic</option>
                  <option value="casual">Casual</option>
                  <option value="professional">Professional</option>
                  <option value="funny">Funny</option>
                  <option value="heartfelt">Heartfelt</option>
                </select>
              </div>

              <div className="input-group">
                <label>Select Frequency</label>
                <select className="input-field" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  <option value="annually">Annually</option>
                  <option value="monthly">Monthly</option>
                  <option value="one_time">One Time</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>Add Event</button>
              <button type="button" className="btn btn-text btn-full" onClick={() => setShowAdd(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
