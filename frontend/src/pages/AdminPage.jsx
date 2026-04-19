import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { adminApi } from '../api/services';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import SectionBlock from '../components/ui/SectionBlock';

const emptySongForm = {
  title: '',
  artistId: '',
  albumId: '',
  genreId: '',
  durationSeconds: '',
  year: '',
  popularityScore: '50',
  moodTags: '',
  language: 'Spanish',
  country: 'Mexico',
  releaseDate: '',
  coverImage: null,
  audioFile: null,
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [genreForm, setGenreForm] = useState({ name: '', description: '' });
  const [artistForm, setArtistForm] = useState({ name: '', bio: '', country: 'Mexico', monthlyListeners: '', image: null });
  const [albumForm, setAlbumForm] = useState({ title: '', artistId: '', releaseYear: '', releaseDate: '', coverImage: null });
  const [songForm, setSongForm] = useState(emptySongForm);
  const [editingSongId, setEditingSongId] = useState(null);
  const [notice, setNotice] = useState('');

  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.dashboard,
  });

  const catalogQuery = useQuery({
    queryKey: ['admin-catalog'],
    queryFn: adminApi.catalog,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.users,
  });

  const genreMutation = useMutation({
    mutationFn: adminApi.createGenre,
    onSuccess: async () => {
      setGenreForm({ name: '', description: '' });
      setNotice('Genre created.');
      await queryClient.invalidateQueries({ queryKey: ['admin-catalog'] });
    },
  });

  const artistMutation = useMutation({
    mutationFn: adminApi.createArtist,
    onSuccess: async () => {
      setArtistForm({ name: '', bio: '', country: 'Mexico', monthlyListeners: '', image: null });
      setNotice('Artist created.');
      await queryClient.invalidateQueries({ queryKey: ['admin-catalog'] });
    },
  });

  const albumMutation = useMutation({
    mutationFn: adminApi.createAlbum,
    onSuccess: async () => {
      setAlbumForm({ title: '', artistId: '', releaseYear: '', releaseDate: '', coverImage: null });
      setNotice('Album created.');
      await queryClient.invalidateQueries({ queryKey: ['admin-catalog'] });
    },
  });

  const songMutation = useMutation({
    mutationFn: ({ payload, songId }) => adminApi.saveSong(payload, songId),
    onSuccess: async () => {
      setSongForm(emptySongForm);
      setEditingSongId(null);
      setNotice('Song saved.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-catalog'] }),
        queryClient.invalidateQueries({ queryKey: ['home-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['browse-songs'] }),
      ]);
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: adminApi.deleteSong,
    onSuccess: async () => {
      setNotice('Song deleted.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-catalog'] }),
        queryClient.invalidateQueries({ queryKey: ['home-feed'] }),
        queryClient.invalidateQueries({ queryKey: ['browse-songs'] }),
      ]);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }) => adminApi.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setNotice('User updated.');
    },
  });

  const catalog = catalogQuery.data;

  if (dashboardQuery.isLoading || catalogQuery.isLoading || usersQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader label="Loading admin studio" />
      </div>
    );
  }

  const startEditSong = (song) => {
    setEditingSongId(song.id);
    setSongForm({
      title: song.title,
      artistId: String(song.artist?.id || ''),
      albumId: String(song.album?.id || ''),
      genreId: String(song.genre?.id || ''),
      durationSeconds: String(song.durationSeconds || ''),
      year: String(song.year || ''),
      popularityScore: String(song.popularityScore || 50),
      moodTags: (song.moodTags || []).join(', '),
      language: song.language || 'Spanish',
      country: song.country || 'Mexico',
      releaseDate: song.releaseDate || '',
      coverImage: null,
      audioFile: null,
    });
  };

  const submitSong = (event) => {
    event.preventDefault();

    const payload = {
      ...songForm,
      moodTags: songForm.moodTags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    songMutation.mutate({ payload, songId: editingSongId });
  };

  return (
    <div className="space-y-8">
      {notice ? <div className="rounded-[1.4rem] border border-[rgba(51,196,141,0.28)] bg-[rgba(51,196,141,0.12)] px-5 py-3 text-sm text-[#d7fff0]">{notice}</div> : null}

      <SectionBlock title="Platform analytics" description="Core metrics from users, catalog size, activity, and listening volume.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(dashboardQuery.data.metrics).map(([key, value]) => (
            <article key={key} className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="mt-4 text-4xl font-semibold">{value.toLocaleString('es-MX')}</p>
            </article>
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Catalog foundations" description="Create genres, artists, and albums before uploading songs.">
        <div className="grid gap-5 xl:grid-cols-3">
          <form className="glass-panel rounded-[2rem] p-5" onSubmit={(event) => {
            event.preventDefault();
            genreMutation.mutate(genreForm);
          }}>
            <h3 className="text-2xl font-semibold">Add genre</h3>
            <div className="mt-4 space-y-4">
              <input className="field" placeholder="Genre name" value={genreForm.name} onChange={(event) => setGenreForm((current) => ({ ...current, name: event.target.value }))} required />
              <textarea className="field min-h-28" placeholder="Description" value={genreForm.description} onChange={(event) => setGenreForm((current) => ({ ...current, description: event.target.value }))} />
              <button type="submit" className="action-button action-primary w-full justify-center">Create genre</button>
            </div>
          </form>

          <form className="glass-panel rounded-[2rem] p-5" onSubmit={(event) => {
            event.preventDefault();
            artistMutation.mutate(artistForm);
          }}>
            <h3 className="text-2xl font-semibold">Add artist</h3>
            <div className="mt-4 space-y-4">
              <input className="field" placeholder="Artist name" value={artistForm.name} onChange={(event) => setArtistForm((current) => ({ ...current, name: event.target.value }))} required />
              <textarea className="field min-h-28" placeholder="Bio" value={artistForm.bio} onChange={(event) => setArtistForm((current) => ({ ...current, bio: event.target.value }))} />
              <input className="field" placeholder="Country" value={artistForm.country} onChange={(event) => setArtistForm((current) => ({ ...current, country: event.target.value }))} />
              <input className="field" placeholder="Monthly listeners" value={artistForm.monthlyListeners} onChange={(event) => setArtistForm((current) => ({ ...current, monthlyListeners: event.target.value }))} />
              <input type="file" className="field" accept="image/*" onChange={(event) => setArtistForm((current) => ({ ...current, image: event.target.files?.[0] || null }))} />
              <button type="submit" className="action-button action-primary w-full justify-center">Create artist</button>
            </div>
          </form>

          <form className="glass-panel rounded-[2rem] p-5" onSubmit={(event) => {
            event.preventDefault();
            albumMutation.mutate(albumForm);
          }}>
            <h3 className="text-2xl font-semibold">Add album</h3>
            <div className="mt-4 space-y-4">
              <input className="field" placeholder="Album title" value={albumForm.title} onChange={(event) => setAlbumForm((current) => ({ ...current, title: event.target.value }))} required />
              <select className="field" value={albumForm.artistId} onChange={(event) => setAlbumForm((current) => ({ ...current, artistId: event.target.value }))} required>
                <option value="">Select artist</option>
                {(catalog?.artists || []).map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
              <input className="field" placeholder="Release year" value={albumForm.releaseYear} onChange={(event) => setAlbumForm((current) => ({ ...current, releaseYear: event.target.value }))} />
              <input className="field" type="date" value={albumForm.releaseDate} onChange={(event) => setAlbumForm((current) => ({ ...current, releaseDate: event.target.value }))} />
              <input type="file" className="field" accept="image/*" onChange={(event) => setAlbumForm((current) => ({ ...current, coverImage: event.target.files?.[0] || null }))} />
              <button type="submit" className="action-button action-primary w-full justify-center">Create album</button>
            </div>
          </form>
        </div>
      </SectionBlock>

      <SectionBlock title="Song upload and editing" description="MP3 uploads, cover images, metadata, and full edit/delete support.">
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <form className="glass-panel rounded-[2rem] p-5" onSubmit={submitSong}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold">{editingSongId ? 'Edit song' : 'Upload song'}</h3>
                <p className="mt-2 text-sm text-[var(--copy-soft)]">Audio and cover files are stored in mounted Docker volumes.</p>
              </div>
              {editingSongId ? (
                <button type="button" className="action-button action-secondary" onClick={() => {
                  setEditingSongId(null);
                  setSongForm(emptySongForm);
                }}>
                  Reset
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="field md:col-span-2" placeholder="Song title" value={songForm.title} onChange={(event) => setSongForm((current) => ({ ...current, title: event.target.value }))} required />
              <select className="field" value={songForm.artistId} onChange={(event) => setSongForm((current) => ({ ...current, artistId: event.target.value }))} required>
                <option value="">Artist</option>
                {(catalog?.artists || []).map((artist) => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
              <select className="field" value={songForm.genreId} onChange={(event) => setSongForm((current) => ({ ...current, genreId: event.target.value }))} required>
                <option value="">Genre</option>
                {(catalog?.genres || []).map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
              <select className="field" value={songForm.albumId} onChange={(event) => setSongForm((current) => ({ ...current, albumId: event.target.value }))}>
                <option value="">Album (optional)</option>
                {(catalog?.albums || []).map((album) => (
                  <option key={album.id} value={album.id}>{album.title}</option>
                ))}
              </select>
              <input className="field" placeholder="Duration seconds" value={songForm.durationSeconds} onChange={(event) => setSongForm((current) => ({ ...current, durationSeconds: event.target.value }))} required />
              <input className="field" placeholder="Year" value={songForm.year} onChange={(event) => setSongForm((current) => ({ ...current, year: event.target.value }))} />
              <input className="field" placeholder="Popularity score (0-100)" value={songForm.popularityScore} onChange={(event) => setSongForm((current) => ({ ...current, popularityScore: event.target.value }))} />
              <input className="field" placeholder="Language" value={songForm.language} onChange={(event) => setSongForm((current) => ({ ...current, language: event.target.value }))} />
              <input className="field" placeholder="Country" value={songForm.country} onChange={(event) => setSongForm((current) => ({ ...current, country: event.target.value }))} />
              <input className="field" type="date" value={songForm.releaseDate} onChange={(event) => setSongForm((current) => ({ ...current, releaseDate: event.target.value }))} />
              <input className="field md:col-span-2" placeholder="Mood tags separated by commas" value={songForm.moodTags} onChange={(event) => setSongForm((current) => ({ ...current, moodTags: event.target.value }))} />
              <input type="file" className="field" accept="image/*" onChange={(event) => setSongForm((current) => ({ ...current, coverImage: event.target.files?.[0] || null }))} />
              <input type="file" className="field" accept=".mp3,audio/*" onChange={(event) => setSongForm((current) => ({ ...current, audioFile: event.target.files?.[0] || null }))} required={!editingSongId} />
            </div>

            <button type="submit" className="action-button action-primary mt-5 w-full justify-center">
              <UploadCloud className="size-4" />
              {editingSongId ? 'Save changes' : 'Upload song'}
            </button>
          </form>

          <div className="glass-panel rounded-[2rem] p-5">
            <h3 className="text-2xl font-semibold">Catalog songs</h3>
            <div className="mt-5 space-y-3">
              {catalog?.songs?.length ? (
                catalog.songs.map((song) => (
                  <div key={song.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-white/8 bg-white/4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <img
                        src={song.coverImageUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80'}
                        alt={song.title}
                        className="size-16 rounded-[1.2rem] object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{song.title}</p>
                        <p className="truncate text-sm text-[var(--copy-soft)]">{song.artist?.name}</p>
                        <p className="truncate text-xs text-[var(--copy-soft)]">{song.genre?.name} • {song.language} • {song.year || 'No year'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="action-button action-secondary" onClick={() => startEditSong(song)}>
                        <Pencil className="size-4" />
                        Edit
                      </button>
                      <button type="button" className="action-button action-secondary" onClick={() => deleteSongMutation.mutate(song.id)}>
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No songs uploaded yet"
                  description="Upload at least one MP3 to activate playback, search, and recommendation sections."
                />
              )}
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="User management" description="Review current accounts, switch roles, or deactivate listeners.">
        <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-white/4">
          <div className="grid grid-cols-[minmax(0,1.1fr)_180px_180px_180px] gap-3 border-b border-white/8 px-5 py-3 text-xs uppercase tracking-[0.22em] text-[var(--copy-soft)]">
            <span>User</span>
            <span>Role</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          <div>
            {usersQuery.data.users.map((user) => (
              <div key={user.id} className="grid grid-cols-[minmax(0,1.1fr)_180px_180px_180px] items-center gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-[var(--copy-soft)]">{user.email}</p>
                </div>
                <select
                  className="field"
                  defaultValue={catalog.roles.find((role) => role.name === user.role)?.id}
                  onChange={(event) =>
                    updateUserMutation.mutate({
                      userId: user.id,
                      payload: { roleId: Number(event.target.value) },
                    })
                  }
                >
                  {catalog.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <select
                  className="field"
                  defaultValue={user.isActive ? 'active' : 'disabled'}
                  onChange={(event) =>
                    updateUserMutation.mutate({
                      userId: user.id,
                      payload: { isActive: event.target.value === 'active' },
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
                <button
                  type="button"
                  className="action-button action-secondary"
                  onClick={() =>
                    updateUserMutation.mutate({
                      userId: user.id,
                      payload: { isActive: !user.isActive },
                    })
                  }
                >
                  Toggle status
                </button>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>
    </div>
  );
}
