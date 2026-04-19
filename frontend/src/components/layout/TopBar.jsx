import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const titles = {
  '/': {
    title: 'Your soundtrack for Mexico',
    subtitle: 'Recommendations, trends, autoplay, and a real upload pipeline for your own catalog.',
  },
  '/search': {
    title: 'Search the catalog',
    subtitle: 'Find songs, artists, albums, and genres in one pass.',
  },
  '/library': {
    title: 'Library and playlists',
    subtitle: 'Favorites, history, and your owned playlists live here.',
  },
  '/admin': {
    title: 'Admin Studio',
    subtitle: 'Upload songs, manage catalog data, inspect analytics, and control users.',
  },
};

export default function TopBar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const copy = titles[location.pathname] || titles['/'];

  return (
    <header className="glass-panel rounded-[2rem] px-5 py-5 md:px-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--accent)]">Cloud-ready music platform</p>
          <h2 className="mt-2 text-3xl font-semibold">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--copy-soft)]">{copy.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 p-1.5 lg:hidden">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm ${isActive ? 'bg-white/12 text-[var(--copy)]' : 'text-[var(--copy-soft)]'}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm ${isActive ? 'bg-white/12 text-[var(--copy)]' : 'text-[var(--copy-soft)]'}`
              }
            >
              Search
            </NavLink>
          </nav>

          {user ? (
            <>
              <div className="hidden rounded-full border border-white/8 bg-white/4 px-4 py-2 text-sm text-[var(--copy-soft)] md:block">
                {user.role === 'admin' ? 'Admin' : 'Listener'} mode
              </div>
              <button type="button" className="action-button action-secondary" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/auth" className="action-button action-primary">
              Join now
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
