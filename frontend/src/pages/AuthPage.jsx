import { useQuery } from '@tanstack/react-query';
import { Music4, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const navigate = useNavigate();
  const { register, login, user } = useAuth();
  const [mode, setMode] = useState('register');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    favoriteGenreIds: [],
  });

  const genresQuery = useQuery({
    queryKey: ['preference-genres'],
    queryFn: authApi.getPreferenceGenres,
  });

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const account =
        mode === 'register'
          ? await register(form)
          : await login({
              email: form.email,
              password: form.password,
            });
      navigate(account.role === 'admin' ? '/admin' : '/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to continue right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGenre = (genreId) => {
    setForm((current) => ({
      ...current,
      favoriteGenreIds: current.favoriteGenreIds.includes(genreId)
        ? current.favoriteGenreIds.filter((item) => item !== genreId)
        : [...current.favoriteGenreIds, genreId],
    }));
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto grid max-w-[1450px] gap-6 lg:grid-cols-[1.1fr_0.95fr]">
        <section className="glass-panel rounded-[2.4rem] p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Spotifyn´t platform</p>
          <h1 className="mt-4 max-w-2xl text-5xl font-semibold leading-tight">
            A production-ready streaming stack inspired by Spotify and YouTube Music.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[var(--copy-soft)]">
            User accounts, admin uploads, playlists, recommendations, smart autoplay, Dockerized services, and an AWS-ready deployment path.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/8 bg-white/4 p-5">
              <Music4 className="size-7 text-[var(--accent)]" />
              <h2 className="mt-4 text-xl font-semibold">Taste-first onboarding</h2>
              <p className="mt-2 text-sm text-[var(--copy-soft)]">
                Registration starts with the ten most listened genres in Mexico so recommendations have a useful baseline from day one.
              </p>
            </div>
            <div className="rounded-[2rem] border border-white/8 bg-white/4 p-5">
              <ShieldCheck className="size-7 text-[var(--highlight)]" />
              <h2 className="mt-4 text-xl font-semibold">Secure by default</h2>
              <p className="mt-2 text-sm text-[var(--copy-soft)]">
                JWT auth, hashed passwords, rate limiting, Helmet headers, and role-protected administration are all wired into the platform.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(242,166,90,0.12),rgba(51,196,141,0.1))] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Default admin bootstrap</p>
            <p className="mt-3 text-lg font-semibold">`admin@spotifynt.local` / `Admin123!`</p>
            <p className="mt-2 text-sm text-[var(--copy-soft)]">
              Replace these defaults with environment variables before a real deployment.
            </p>
          </div>
        </section>

        <section className="glass-panel rounded-[2.4rem] p-7 md:p-10">
          <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 p-1">
            {['register', 'login'].map((value) => (
              <button
                key={value}
                type="button"
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize ${
                  mode === value ? 'bg-[rgba(242,166,90,0.18)] text-[var(--copy)]' : 'text-[var(--copy-soft)]'
                }`}
                onClick={() => setMode(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            {mode === 'register' ? (
              <div>
                <label className="mb-2 block text-sm text-[var(--copy-soft)]">Display name</label>
                <input
                  className="field"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your public profile name"
                  required
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm text-[var(--copy-soft)]">Email</label>
              <input
                className="field"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-[var(--copy-soft)]">Password</label>
              <input
                className="field"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 8 characters"
                required
              />
            </div>

            {mode === 'register' ? (
              <div>
                <label className="mb-2 block text-sm text-[var(--copy-soft)]">Favorite genres</label>
                {genresQuery.isLoading ? (
                  <Loader label="Loading genres" />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(genresQuery.data?.genres || []).map((genre) => {
                      const active = form.favoriteGenreIds.includes(genre.id);
                      return (
                        <button
                          key={genre.id}
                          type="button"
                          className={`rounded-full border px-4 py-2 text-sm transition ${
                            active
                              ? 'border-[rgba(242,166,90,0.5)] bg-[rgba(242,166,90,0.14)] text-[var(--copy)]'
                              : 'border-white/8 bg-white/4 text-[var(--copy-soft)] hover:bg-white/6'
                          }`}
                          onClick={() => toggleGenre(genre.id)}
                        >
                          {genre.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {error ? <p className="rounded-2xl border border-[rgba(243,111,69,0.25)] bg-[rgba(243,111,69,0.12)] px-4 py-3 text-sm text-[#ffd3c4]">{error}</p> : null}

            <button type="submit" className="action-button action-primary w-full justify-center" disabled={submitting}>
              {submitting ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Log in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
