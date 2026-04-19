import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi, songsApi, usersApi } from '../api/services';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import SectionBlock from '../components/ui/SectionBlock';
import SongCard from '../components/ui/SongCard';
import SongTable from '../components/ui/SongTable';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';

export default function SearchPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToQueue, playCollection, playTrack } = usePlayer();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());

  const searchQuery = useQuery({
    queryKey: ['search', deferredQuery],
    queryFn: () => searchApi.search(deferredQuery),
    enabled: deferredQuery.length > 0,
  });

  const recentQuery = useQuery({
    queryKey: ['recent-searches', user?.id],
    queryFn: searchApi.recent,
    enabled: Boolean(user),
  });

  const browseQuery = useQuery({
    queryKey: ['browse-songs'],
    queryFn: () => songsApi.list({ limit: 18 }),
  });

  const favoriteMutation = useMutation({
    mutationFn: usersApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browse-songs'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
    },
  });

  const handleToggleFavorite = (song) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    favoriteMutation.mutate(song.id);
  };

  const results = searchQuery.data;

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2.4rem] p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Unified search</p>
            <h1 className="mt-3 text-4xl font-semibold">Songs, artists, albums, and genres</h1>
          </div>
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--copy-soft)]" />
            <input
              className="field pl-12"
              placeholder="Search the catalog"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {!deferredQuery && recentQuery.data?.items?.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {recentQuery.data.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip cursor-pointer hover:bg-white/8"
                onClick={() => setQuery(item.query)}
              >
                {item.query}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {deferredQuery ? (
        searchQuery.isLoading ? (
          <div className="flex justify-center">
            <Loader label="Searching the catalog" />
          </div>
        ) : results?.songs?.length || results?.artists?.length || results?.albums?.length || results?.genres?.length ? (
          <div className="space-y-8">
            {results.songs?.length ? (
              <SectionBlock title="Matching songs" description="Instant playback with queue and favorite controls.">
                <SongTable
                  songs={results.songs}
                  onAddToQueue={addToQueue}
                  onPlay={(song) => {
                    const index = results.songs.findIndex((item) => item.id === song.id);
                    playCollection(results.songs, index);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              </SectionBlock>
            ) : null}

            {results.artists?.length ? (
              <SectionBlock title="Artists" description="High-confidence artist matches.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {results.artists.map((artist) => (
                    <article key={artist.id} className="rounded-[1.8rem] border border-white/8 bg-white/4 p-4">
                      <img
                        src={artist.imageUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80'}
                        alt={artist.name}
                        className="h-52 w-full rounded-[1.3rem] object-cover"
                      />
                      <h3 className="mt-4 text-2xl font-semibold">{artist.name}</h3>
                      <p className="mt-2 text-sm text-[var(--copy-soft)]">{artist.country}</p>
                    </article>
                  ))}
                </div>
              </SectionBlock>
            ) : null}

            {results.albums?.length ? (
              <SectionBlock title="Albums" description="Browse structured album metadata and release dates.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {results.albums.map((album) => (
                    <article key={album.id} className="rounded-[1.8rem] border border-white/8 bg-white/4 p-4">
                      <img
                        src={album.coverImageUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80'}
                        alt={album.title}
                        className="h-52 w-full rounded-[1.3rem] object-cover"
                      />
                      <h3 className="mt-4 text-2xl font-semibold">{album.title}</h3>
                      <p className="mt-2 text-sm text-[var(--copy-soft)]">{album.artist?.name}</p>
                    </article>
                  ))}
                </div>
              </SectionBlock>
            ) : null}

            {results.genres?.length ? (
              <SectionBlock title="Genres" description="Genre-level matches from the onboarding preference matrix.">
                <div className="flex flex-wrap gap-3">
                  {results.genres.map((genre) => (
                    <span key={genre.id} className="chip">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </SectionBlock>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="No matches"
            description="Try a song title, artist name, album, or one of the Mexican priority genres."
          />
        )
      ) : browseQuery.isLoading ? (
        <div className="flex justify-center">
          <Loader label="Loading browse picks" />
        </div>
      ) : (
        <SectionBlock title="Browse highlights" description="Playable catalog cards while the search box is empty.">
          {browseQuery.data?.songs?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {browseQuery.data.songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onAddToQueue={addToQueue}
                  onPlay={() => playCollection(browseQuery.data.songs, index)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No songs uploaded yet"
              description="Open the admin panel and upload MP3 files to turn search into a playable catalog."
            />
          )}
        </SectionBlock>
      )}
    </div>
  );
}
