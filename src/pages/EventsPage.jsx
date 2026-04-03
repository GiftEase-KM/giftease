import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import TabBar from '../components/TabBar';
import { SearchIcon, TrashIcon } from '../components/Icons';

const EVENT_EMOJIS = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', custom: '✨',
  christmas: '🎄', valentines_day: '💝', mothers_day: '👩', fathers_day: '👨',
  new_year: '🎆', independence_day: '🇺🇸', easter: '🐣', thanksgiving: '🦃',
};

export default function EventsPage() {
  const [filter, setFilter] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadEvents();
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

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(id);
      loadEvents();
    } catch (err) { alert(err.message); }
  };

  const openCardFlow = (event) => {
    navigate(`/card?eventId=${event.id}&personId=${event.person_id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusBadge = (status) => {
    const styles = {
      upcoming: { bg: 'var(--ge-sage-50)', color: 'var(--ge-teal-600)', label: 'Upcoming' },
      completed: { bg: '#e8f5e9', color: 'var(--ge-green-check)', label: 'Sent' },
      paused: { bg: '#fff3e0', color: 'var(--ge-orange)', label: 'Paused' },
    };
    const s = styles[status] || styles.upcoming;
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 'var(--ge-radius-full)',
        fontSize: '0.7rem', fontWeight: 700, background: s.bg, color: s.color,
      }}>
        {s.label}
      </span>
    );
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
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📅</div>
            <p>No {filter} events</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--ge-text-muted)', marginTop: -12 }}>
              Events are created when you add a contact.
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event, i) => {
              const emoji = EVENT_EMOJIS[event.event_type_id] || '📬';
              return (
                <div
                  key={event.id}
                  className="card card-bordered animate-in"
                  style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                  onClick={() => openCardFlow(event)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{emoji}</span>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{event.event_name}</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', margin: '2px 0 0' }}>
                          {formatDate(event.event_date)} · {event.frequency === 'one_time' ? 'One-time' : 'Annually'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {statusBadge(event.status)}
                    </div>
                  </div>

                  {event.persons && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--ge-sage-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                          {event.persons.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{event.persons.full_name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--ge-text-muted)', display: 'block' }}>{event.persons.relationship}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          className="btn-send-card"
                          onClick={(e) => { e.stopPropagation(); openCardFlow(event); }}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--ge-radius-full)',
                            border: 'none', background: 'var(--ge-teal-600)', color: 'white',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                          }}
                        >
                          ✉️ Send Card
                        </button>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ge-red)', width: 18 }}
                          onClick={(e) => handleDelete(event.id, e)}
                        ><TrashIcon /></button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}