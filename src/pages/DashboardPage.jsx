import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import TabBar from '../components/TabBar';

export default function DashboardPage() {
  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [evts, favs] = await Promise.all([
          api.getEvents('upcoming').catch(() => []),
          api.getFavorites().catch(() => []),
        ]);
        setEvents(Array.isArray(evts) ? evts : []);
        setFavorites(Array.isArray(favs) ? favs : []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="app-shell">
      <div className="header-bar">
        <h1>Welcome</h1>
      </div>

      <div className="page-content">
        {/* Upcoming Events */}
        <div className="section-header">
          <h2>Upcoming Events</h2>
          {events.length > 0 && (
            <button onClick={() => navigate('/events')}>View All</button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="empty-state animate-in">
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>📅</div>
            <p>There are no events</p>
            <button className="btn btn-primary" onClick={() => navigate('/events')}>
              Add Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, padding: '0 16px', overflowX: 'auto' }}>
            {events.slice(0, 4).map((event, i) => (
              <div
                key={event.id}
                className="card card-bordered animate-in"
                style={{ minWidth: 200, animationDelay: `${i * 0.1}s` }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{event.event_name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--ge-text-muted)', margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  📅 {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'TBD'}
                </p>
                {event.persons && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--ge-text-secondary)' }}>
                    {event.persons.full_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '0 16px', marginTop: 8 }}>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/events', { state: { addNew: true } })}>
            Add New Event
          </button>
        </div>

        {/* Favorite Persons */}
        <div className="section-header" style={{ marginTop: 20 }}>
          <h2>Favorite Persons</h2>
          {favorites.length > 0 && (
            <button onClick={() => navigate('/persons')}>View All</button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state animate-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>👥</div>
            <p>There are no Persons</p>
            <button className="btn btn-primary" onClick={() => navigate('/persons')}>
              Add Person
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 16, padding: '0 20px', overflowX: 'auto' }}>
            {favorites.map((person, i) => (
              <div
                key={person.id}
                className="animate-in"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 6, animationDelay: `${0.2 + i * 0.1}s`, cursor: 'pointer',
                }}
                onClick={() => navigate(`/persons/${person.id}`)}
              >
                <div className="avatar">
                  {person.avatar_url ? (
                    <img src={person.avatar_url} alt={person.full_name} />
                  ) : (
                    getInitials(person.full_name)
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>
                  {person.full_name}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--ge-text-muted)' }}>
                  {person.relationship}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '8px 16px' }}>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/persons', { state: { addNew: true } })}>
            Add New Person
          </button>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
