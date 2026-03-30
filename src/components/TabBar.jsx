import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardIcon, EventsIcon, PersonsIcon, ProfileIcon } from './Icons';

const tabs = [
  { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { path: '/events', label: 'Events', icon: EventsIcon },
  { path: '/persons', label: 'Persons', icon: PersonsIcon },
  { path: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
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
  );
}
