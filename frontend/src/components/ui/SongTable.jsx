import { Heart, ListPlus, Play, Trash2 } from 'lucide-react';
import { formatDuration } from '../../utils/format';

export default function SongTable({
  onAddToQueue,
  onPlay,
  onRemove,
  onToggleFavorite,
  songs,
}) {
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-white/8 bg-white/4">
      <div className="grid grid-cols-[48px_minmax(0,1.3fr)_minmax(0,1fr)_110px_160px] gap-3 border-b border-white/8 px-5 py-3 text-xs uppercase tracking-[0.22em] text-[var(--copy-soft)]">
        <span />
        <span>Song</span>
        <span>Album / Genre</span>
        <span>Duration</span>
        <span>Actions</span>
      </div>
      <div>
        {songs.map((song, index) => (
          <div
            key={`${song.id}-${index}`}
            className="grid grid-cols-[48px_minmax(0,1.3fr)_minmax(0,1fr)_110px_160px] items-center gap-3 px-5 py-4 transition hover:bg-white/4"
          >
            <button type="button" className="action-button action-primary size-10 p-0" onClick={() => onPlay?.(song)}>
              <Play className="size-4 fill-current" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-semibold">{song.title}</p>
              <p className="truncate text-sm text-[var(--copy-soft)]">{song.artist?.name || 'Unknown artist'}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm">{song.album?.title || song.genre?.name || 'Standalone single'}</p>
              <p className="truncate text-xs text-[var(--copy-soft)]">{song.genre?.name || 'No genre'}</p>
            </div>
            <span className="text-sm text-[var(--copy-soft)]">{formatDuration(song.durationSeconds)}</span>
            <div className="flex items-center gap-2">
              <button type="button" className="action-button action-secondary size-10 p-0" onClick={() => onAddToQueue?.(song)}>
                <ListPlus className="size-4" />
              </button>
              {onToggleFavorite ? (
                <button
                  type="button"
                  className={`action-button size-10 p-0 ${song.isFavorite ? 'action-primary' : 'action-secondary'}`}
                  onClick={() => onToggleFavorite(song)}
                >
                  <Heart className={`size-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                </button>
              ) : null}
              {onRemove ? (
                <button type="button" className="action-button action-secondary size-10 p-0" onClick={() => onRemove(song)}>
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
