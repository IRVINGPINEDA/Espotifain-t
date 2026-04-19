import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { playlistsApi, songsApi, usersApi } from '../api/services';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import SectionBlock from '../components/ui/SectionBlock';
import SongTable from '../components/ui/SongTable';
import { usePlayer } from '../hooks/usePlayer';

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const { addToQueue, playCollection } = usePlayer();
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: false });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');

  const libraryQuery = useQuery({
    queryKey: ['library'],
    queryFn: usersApi.library,
  });

  const discoverSongsQuery = useQuery({
    queryKey: ['playlist-discover'],
    queryFn: () => songsApi.list({ limit: 20 }),
  });

  useEffect(() => {
    if (!selectedPlaylistId && libraryQuery.data?.playlists?.[0]) {
      setSelectedPlaylistId(String(libraryQuery.data.playlists[0].id));
    }
  }, [selectedPlaylistId, libraryQuery.data]);

  const createPlaylistMutation = useMutation({
    mutationFn: playlistsApi.create,
    onSuccess: async (response) => {
      setNewPlaylist({ name: '', description: '', isPublic: false });
      setSelectedPlaylistId(String(response.playlist.id));
      await queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const addSongMutation = useMutation({
    mutationFn: ({ playlistId, songId }) => playlistsApi.addSong(playlistId, { songId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const removeSongMutation = useMutation({
    mutationFn: ({ playlistId, songId }) => playlistsApi.removeSong(playlistId, songId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: playlistsApi.remove,
    onSuccess: async () => {
      setSelectedPlaylistId('');
      await queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  if (libraryQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader label="Loading your library" />
      </div>
    );
  }

  const library = libraryQuery.data;

  return (
    <div className="space-y-8">
      <SectionBlock
        eyebrow="Owned collection"
        title="Your listening base"
        description="Favorites, history, and playlists stay in sync with your account."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Favorites</p>
            <p className="mt-3 text-4xl font-semibold">{library.favorites.length}</p>
            <p className="mt-2 text-sm text-[var(--copy-soft)]">Saved songs ready for replay and playlist curation.</p>
          </div>
          <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">History</p>
            <p className="mt-3 text-4xl font-semibold">{library.history.length}</p>
            <p className="mt-2 text-sm text-[var(--copy-soft)]">Recent playback signals used by the recommendation engine.</p>
          </div>
          <div className="rounded-[1.8rem] border border-white/8 bg-white/4 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Playlists</p>
            <p className="mt-3 text-4xl font-semibold">{library.playlists.length}</p>
            <p className="mt-2 text-sm text-[var(--copy-soft)]">Custom collections with explicit ownership and management.</p>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Favorite songs" description="These tracks double as strong recommendation signals.">
        {library.favorites.length ? (
          <SongTable
            songs={library.favorites}
            onAddToQueue={addToQueue}
            onPlay={(song) => {
              const index = library.favorites.findIndex((item) => item.id === song.id);
              playCollection(library.favorites, index);
            }}
          />
        ) : (
          <EmptyState
            title="No favorites yet"
            description="Use the heart action from the feed or search results to save songs here."
          />
        )}
      </SectionBlock>

      <SectionBlock title="Recent history" description="Quick replay of your latest listening activity.">
        {library.history.length ? (
          <SongTable
            songs={library.history.map((item) => item.song)}
            onAddToQueue={addToQueue}
            onPlay={(song) => {
              const tracks = library.history.map((item) => item.song);
              const index = tracks.findIndex((item) => item.id === song.id);
              playCollection(tracks, index);
            }}
          />
        ) : (
          <EmptyState title="No listening history yet" description="Start playback from Home or Search to generate listening history." />
        )}
      </SectionBlock>

      <SectionBlock
        title="Playlist workshop"
        description="Create playlists, then add songs from the discovery set into a selected playlist."
      >
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <form
            className="glass-panel rounded-[2rem] p-5"
            onSubmit={(event) => {
              event.preventDefault();
              createPlaylistMutation.mutate(newPlaylist);
            }}
          >
            <h3 className="text-2xl font-semibold">Create playlist</h3>
            <div className="mt-5 space-y-4">
              <input
                className="field"
                placeholder="Playlist name"
                value={newPlaylist.name}
                onChange={(event) => setNewPlaylist((current) => ({ ...current, name: event.target.value }))}
                required
              />
              <textarea
                className="field min-h-28"
                placeholder="Description"
                value={newPlaylist.description}
                onChange={(event) => setNewPlaylist((current) => ({ ...current, description: event.target.value }))}
              />
              <label className="flex items-center gap-3 text-sm text-[var(--copy-soft)]">
                <input
                  type="checkbox"
                  checked={newPlaylist.isPublic}
                  onChange={(event) => setNewPlaylist((current) => ({ ...current, isPublic: event.target.checked }))}
                />
                Make playlist public
              </label>
              <button type="submit" className="action-button action-primary w-full justify-center">
                <Plus className="size-4" />
                Create playlist
              </button>
            </div>
          </form>

          <div className="glass-panel rounded-[2rem] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-semibold">Add songs to a playlist</h3>
                <p className="mt-2 text-sm text-[var(--copy-soft)]">Pick a destination playlist, then drop tracks into it.</p>
              </div>
              <select className="field max-w-xs" value={selectedPlaylistId} onChange={(event) => setSelectedPlaylistId(event.target.value)}>
                <option value="">Select playlist</option>
                {library.playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.name}
                  </option>
                ))}
              </select>
            </div>

            {discoverSongsQuery.isLoading ? (
              <div className="mt-6">
                <Loader label="Loading discovery tracks" />
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {discoverSongsQuery.data?.songs?.map((song) => (
                  <div key={song.id} className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{song.title}</p>
                      <p className="truncate text-sm text-[var(--copy-soft)]">{song.artist?.name}</p>
                    </div>
                    <button
                      type="button"
                      className="action-button action-secondary"
                      disabled={!selectedPlaylistId}
                      onClick={() => addSongMutation.mutate({ playlistId: selectedPlaylistId, songId: song.id })}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Your playlists" description="Playable collections with per-song removal and delete actions.">
        {library.playlists.length ? (
          <div className="space-y-6">
            {library.playlists.map((playlist) => (
              <article key={playlist.id} className="glass-panel rounded-[2rem] p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">{playlist.isPublic ? 'Public playlist' : 'Private playlist'}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{playlist.name}</h3>
                    <p className="mt-2 text-sm text-[var(--copy-soft)]">{playlist.description || 'No description yet.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="action-button action-secondary"
                      onClick={() => playCollection(playlist.songs, 0)}
                    >
                      Play
                    </button>
                    <button
                      type="button"
                      className="action-button action-secondary"
                      onClick={() => deletePlaylistMutation.mutate(playlist.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {playlist.songs.length ? (
                  <div className="mt-5">
                    <SongTable
                      songs={playlist.songs}
                      onAddToQueue={addToQueue}
                      onPlay={(song) => {
                        const index = playlist.songs.findIndex((item) => item.id === song.id);
                        playCollection(playlist.songs, index);
                      }}
                      onRemove={(song) => removeSongMutation.mutate({ playlistId: playlist.id, songId: song.id })}
                    />
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-white/4 p-5 text-sm text-[var(--copy-soft)]">
                    This playlist is empty. Use the workshop above to add songs.
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No playlists yet"
            description="Create your first playlist, then start collecting songs from the discovery panel."
          />
        )}
      </SectionBlock>
    </div>
  );
}
