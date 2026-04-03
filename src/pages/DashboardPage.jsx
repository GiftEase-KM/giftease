import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import TabBar from '../components/TabBar';

const EVENT_EMOJIS = {
  birthday: '🎂', anniversary: '💍', graduation: '🎓', custom: '✨',
  christmas: '🎄', valentines_day: '💝', mothers_day: '👩', fathers_day: '👨',
  new_year: '🎆', independence_day: '🇺🇸', easter: '🐣', thanksgiving: '🦃',
};

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const openCardFlow = (event) => {
    navigate(`/card?eventId=${event.id}&personId=${event.person_id}`);
  };

  return (
    <div className="app-shell">
      <div className="header-bar">
        <h1>GiftEase</h1>
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
            <button className="btn btn-primary" onClick={() => navigate('/persons')}>
              Add a Contact
            </button>
          </div>
        ) : (
            <div className="upcoming-events-row">
              <div className="scroll-spacer" style={{ minWidth: 16, flexShrink: 0 }} aria-hidden="true" />
              {events.slice(0, 6).map((event, i) => {
              const emoji = EVENT_EMOJIS[event.event_type_id] || '📬';
              return (
                <div
                  key={event.id}
                  className="card animate-in"
                  style={{ animationDelay: `${i * 0.1}s`, cursor: 'pointer', marginLeft: i === 0 ? 36 : 0 }}
                  onClick={() => openCardFlow(event)}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{emoji}</span>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{event.event_name}</h3>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', margin: '0 0 6px' }}>
                    {formatDate(event.event_date)}
                  </p>
                  {event.persons && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="avatar" style={{ width: 22, height: 22, fontSize: '0.55rem' }}>
                        {getInitials(event.persons.full_name)}
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-secondary)' }}>
                        {event.persons.full_name}
                      </span>
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 'var(--ge-radius-full)',
                      background: 'var(--ge-teal-600)', color: 'white',
                      fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      ✉️ Send Card
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="content-padded" style={{ marginTop: 8 }}>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/persons', { state: { addNew: true } })}>
            Add New Contact
          </button>
        </div>

        {/* Favorites */}
        <div className="section-header" style={{ marginTop: 20 }}>
          <h2>Favorites</h2>
          {favorites.length > 0 && (
            <button onClick={() => navigate('/persons')}>View All</button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state animate-in" style={{ animationDelay: '0.2s' }}>
            <div style={{ fontSize: '4rem', marginBottom: 12 }}>👥</div>
            <p>No favorites yet</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--ge-text-muted)', marginTop: -12 }}>
              Mark contacts as favorites to see them here.
            </p>
          </div>
        ) : (
          <div style={{ padding: '0 16px' }}>
            {favorites.map((person, i) => (
              <div
                key={person.id}
                className="card animate-in"
                style={{ animationDelay: `${0.2 + i * 0.05}s`, cursor: 'pointer' }}
                onClick={() => navigate(`/persons/${person.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar">
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt={person.full_name} />
                    ) : (
                      getInitials(person.full_name)
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>⭐ {person.full_name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ge-teal-600)', fontWeight: 600, display: 'block' }}>{person.relationship}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}