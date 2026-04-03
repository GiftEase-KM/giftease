import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardIcon, EventsIcon, PersonsIcon, ProfileIcon, GiftIcon } from './Icons';
import { useAuth } from '../lib/AuthContext';

const tabs = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/events', label: 'Events', icon: EventsIcon },
  { path: '/persons', label: 'Contacts', icon: PersonsIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getInitials = () => {
    const meta = user?.user_metadata;
    if (!meta) return '?';
    const f = meta.first_name?.[0] || '';
    const l = meta.last_name?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const displayName = () => {
    const meta = user?.user_metadata;
    if (!meta?.first_name) return 'User';
    return `${meta.first_name} ${meta.last_name?.[0] || ''}.`;
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')}>
          <div className="sidebar-logo-icon"><GiftIcon /></div>
          <span className="sidebar-logo-text">GIFTEASE</span>
          <span className="sidebar-logo-tagline">Never forget an occasion</span>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              className={`sidebar-item ${location.pathname.startsWith(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="sidebar-avatar">{getInitials()}</div>
          <span className="sidebar-username">{displayName()}</span>
        </div>
      </aside>

      <nav className="tab-bar">
        {tabs.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            className={`tab-item ${location.pathname.startsWith(path) ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}