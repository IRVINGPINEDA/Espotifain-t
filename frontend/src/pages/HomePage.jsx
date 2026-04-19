import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { recommendationsApi, usersApi } from '../api/services';
import EmptyState from '../components/ui/EmptyState';
import Loader from '../components/ui/Loader';
import SectionBlock from '../components/ui/SectionBlock';
import SongCard from '../components/ui/SongCard';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';

const sectionCopy = [
  ['recommendedForYou', 'Recommended for you', 'Weighted from your genres, likes, listening history, and what is already trending.'],
  ['basedOnYourGenres', 'Based on your genres', 'Direct pulls from your selected preferences, with Mexico-first catalog bias.'],
  ['trendingInMexico', 'Trending in Mexico', 'Tracks climbing through the local catalog based on streams and popularity.'],
  ['similarToYourLikes', 'Similar to your likes', 'Artist, mood, and genre matches around songs you already saved.'],
  ['newReleases', 'New releases', 'Fresh drops ordered by release date so the feed keeps rotating.'],
];

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToQueue, currentTrack, playCollection } = usePlayer();

  const feedQuery = useQuery({
    queryKey: ['home-feed', user?.id || 'guest'],
    queryFn: recommendationsApi.home,
  });

  const favoriteMutation = useMutation({
    mutationFn: usersApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['home-feed'] });
    },
  });

  const handleToggleFavorite = (song) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    favoriteMutation.mutate(song.id);
  };

  if (feedQuery.isLoading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <Loader label="Building your home feed" />
      </div>
    );
  }

  if (feedQuery.isError) {
    return (
      <EmptyState
        title="Feed unavailable"
        description="The recommendation service could not load right now. Check your API and database containers, then refresh."
      />
    );
  }

  const feed = feedQuery.data;

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2.4rem] px-6 py-7 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <div className="chip">
              <Sparkles className="size-4" />
              Smart feed + autoplay + admin uploads
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              Stream, discover, and manage a catalog built for a Dockerized cloud deployment.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-[var(--copy-soft)]">
              Spotifyn´t mixes Spotify-style continuity with a YouTube Music-style discovery surface, tuned around Mexican genre preferences and a self-hosted admin catalog.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/search" className="action-button action-primary">
                Start listening
              </Link>
              {user ? (
                <Link to="/library" className="action-button action-secondary">
                  Open library
                </Link>
              ) : (
                <Link to="/auth" className="action-button action-secondary">
                  Create a profile
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {['Regional Mexicano', 'Reggaeton', 'Banda', 'Rock en Español'].map((genre) => (
              <div key={genre} className="rounded-[1.7rem] border border-white/8 bg-white/4 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">Featured</p>
                <h3 className="mt-3 text-xl font-semibold">{genre}</h3>
                <p className="mt-2 text-sm text-[var(--copy-soft)]">
                  One-click preference options used by the onboarding flow and recommendation engine.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {(feed.genres || []).map((genre) => (
          <span key={genre.id} className="chip">
            {genre.name}
          </span>
        ))}
      </section>

      {sectionCopy.map(([key, title, description], sectionIndex) => {
        const songs = feed[key] || [];
        if (!songs.length) {
          return null;
        }

        return (
          <SectionBlock
            key={key}
            eyebrow={`Feed block ${sectionIndex + 1}`}
            title={title}
            description={description}
            action={
              <Link to="/search" className="action-button action-secondary">
                Explore all
                <ArrowRight className="size-4" />
              </Link>
            }
          >
            <div className="flex snap-x gap-4 overflow-x-auto pb-2">
              {songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  active={currentTrack?.id === song.id}
                  song={song}
                  onAddToQueue={addToQueue}
                  onPlay={() => playCollection(songs, index)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </SectionBlock>
        );
      })}

      <SectionBlock
        eyebrow="Artist radar"
        title="Popular artists"
        description="Highest-listener profiles surfaced on the home feed for quick discovery."
      >
        {feed.popularArtists?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {feed.popularArtists.map((artist) => (
              <article key={artist.id} className="rounded-[1.8rem] border border-white/8 bg-white/4 p-4">
                <img
                  src={artist.imageUrl || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80'}
                  alt={artist.name}
                  className="h-56 w-full rounded-[1.4rem] object-cover"
                />
                <h3 className="mt-4 text-xl font-semibold">{artist.name}</h3>
                <p className="mt-2 text-sm text-[var(--copy-soft)]">{artist.country}</p>
                <p className="mt-2 text-sm text-[var(--copy-soft)]">{artist.monthlyListeners?.toLocaleString('es-MX')} monthly listeners</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No artists yet"
            description="Upload songs and catalog metadata from the admin panel to populate discovery blocks."
          />
        )}
      </SectionBlock>
    </div>
  );
}
