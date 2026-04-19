import { Disc3, Home, Library, Radio, Search, Shield } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Library', icon: Library, auth: true },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="glass-panel hidden w-[300px] shrink-0 flex-col rounded-[2rem] p-6 lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(242,166,90,0.14)] text-[var(--accent)]">
          <Disc3 className="size-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Spotifyn´t</p>
          <h1 className="mt-1 text-2xl font-semibold">Mexico-first streaming</h1>
        </div>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems
          .filter((item) => !item.auth || user)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-[rgba(242,166,90,0.14)] text-[var(--copy)]'
                      : 'text-[var(--copy-soft)] hover:bg-white/6 hover:text-[var(--copy)]'
                  }`
                }
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

        {user?.role === 'admin' ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? 'bg-[rgba(51,196,141,0.16)] text-[var(--copy)]'
                  : 'text-[var(--copy-soft)] hover:bg-white/6 hover:text-[var(--copy)]'
              }`
            }
          >
            <Shield className="size-5" />
            <span>Admin Studio</span>
          </NavLink>
        ) : null}
      </nav>

      <div className="mt-8 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(135deg,rgba(242,166,90,0.18),rgba(51,196,141,0.12))] p-5">
        <div className="flex items-center gap-3">
          <Radio className="size-5 text-[var(--accent)]" />
          <p className="text-sm font-semibold">Smart autoplay queue</p>
        </div>
        <p className="mt-3 text-sm text-[var(--copy-soft)]">
          Search any song, play it, and Spotifyn´t keeps the session alive with artist, genre, mood, and popularity matches.
        </p>
      </div>

      <div className="mt-auto rounded-[1.7rem] border border-white/8 bg-white/4 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--copy-soft)]">Current profile</p>
        {user ? (
          <>
            <p className="mt-3 text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-[var(--copy-soft)]">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(user.favoriteGenres || []).slice(0, 3).map((genre) => (
                <span key={genre.id} className="chip">
                  {genre.name}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--copy-soft)]">Sign in to sync likes, playlists, history, and recommendations.</p>
        )}
      </div>
    </aside>
  );
}
