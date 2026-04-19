import { Heart, ListPlus, Play } from 'lucide-react';
import { formatDuration, formatNumber } from '../../utils/format';

export default function SongCard({
  active = false,
  onAddToQueue,
  onPlay,
  onToggleFavorite,
  song,
}) {
  return (
    <article
      className={`group flex h-full min-w-[255px] flex-col rounded-[1.7rem] border p-4 transition ${
        active
          ? 'border-[rgba(242,166,90,0.6)] bg-[rgba(242,166,90,0.08)]'
          : 'border-white/8 bg-[rgba(255,255,255,0.04)] hover:border-white/14 hover:bg-white/6'
      }`}
    >
      <div className="relative overflow-hidden rounded-[1.35rem]">
        <img
          src={song.coverImageUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'}
          alt={song.title}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/65">{song.genre?.name || 'Single'}</p>
            <p className="text-sm text-white/80">{formatDuration(song.durationSeconds)}</p>
          </div>
          <button type="button" className="action-button action-primary size-11 p-0" onClick={() => onPlay?.(song)}>
            <Play className="size-4 fill-current" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-lg font-semibold">{song.title}</h3>
        <p className="mt-1 text-sm text-[var(--copy-soft)]">{song.artist?.name || 'Unknown artist'}</p>
        <p className="mt-3 text-sm text-[var(--copy-soft)] line-clamp-2">
          {song.moodTags?.length
            ? `Mood: ${song.moodTags.join(', ')}`
            : `${song.language} • ${song.country} • ${song.year || 'N/A'}`}
        </p>

        <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--copy-soft)]">
          <span>{formatNumber(song.playCount || song.popularityScore || 0)} engagement</span>
          <span>{song.album?.title || 'No album'}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button type="button" className="action-button action-secondary flex-1" onClick={() => onAddToQueue?.(song)}>
            <ListPlus className="size-4" />
            Queue
          </button>
          <button
            type="button"
            className={`action-button size-11 p-0 ${
              song.isFavorite ? 'action-primary' : 'action-secondary'
            }`}
            onClick={() => onToggleFavorite?.(song)}
          >
            <Heart className={`size-4 ${song.isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
