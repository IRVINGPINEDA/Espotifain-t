import { ListMusic, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayer } from '../../hooks/usePlayer';
import { formatDuration } from '../../utils/format';

export default function PlayerBar() {
  const {
    currentTrack,
    cycleRepeatMode,
    duration,
    isPlaying,
    next,
    playTrack,
    previous,
    progress,
    queue,
    queueOpen,
    repeatMode,
    seekTo,
    setQueueOpen,
    setShuffle,
    shuffle,
    togglePlayPause,
    volume,
    setVolume,
  } = usePlayer();

  return (
    <>
      {queueOpen ? (
        <aside className="glass-panel fixed bottom-32 right-4 z-40 max-h-[60vh] w-[360px] overflow-auto rounded-[2rem] p-5 md:right-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--accent)]">Queue</p>
              <h3 className="mt-2 text-xl font-semibold">Up next</h3>
            </div>
            <button type="button" className="action-button action-secondary px-4 py-2" onClick={() => setQueueOpen(false)}>
              Close
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {queue.map((song) => (
              <button
                key={song.id}
                type="button"
                className={`flex w-full items-center gap-3 rounded-[1.25rem] border p-3 text-left ${
                  currentTrack?.id === song.id
                    ? 'border-[rgba(242,166,90,0.5)] bg-[rgba(242,166,90,0.08)]'
                    : 'border-white/8 bg-white/4'
                }`}
                onClick={() => playTrack(song)}
              >
                <img
                  src={song.coverImageUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80'}
                  alt={song.title}
                  className="size-14 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{song.title}</p>
                  <p className="truncate text-sm text-[var(--copy-soft)]">{song.artist?.name}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="glass-panel fixed bottom-4 left-4 right-4 z-30 rounded-[2rem] px-4 py-4 md:left-6 md:right-6 md:px-6">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr_0.9fr] lg:items-center">
          <div className="flex items-center gap-4">
            <img
              src={currentTrack?.coverImageUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'}
              alt={currentTrack?.title || 'Playback placeholder'}
              className="size-16 rounded-[1.3rem] object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm uppercase tracking-[0.22em] text-[var(--accent)]">Now playing</p>
              <h3 className="truncate text-lg font-semibold">{currentTrack?.title || 'Pick a track to begin'}</h3>
              <p className="truncate text-sm text-[var(--copy-soft)]">{currentTrack?.artist?.name || 'Autoplay ready'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                className={`action-button size-10 p-0 ${shuffle ? 'action-primary' : 'action-secondary'}`}
                onClick={() => setShuffle(!shuffle)}
              >
                <Shuffle className="size-4" />
              </button>
              <button type="button" className="action-button action-secondary size-10 p-0" onClick={previous}>
                <SkipBack className="size-4" />
              </button>
              <button type="button" className="action-button action-primary size-14 p-0" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
              </button>
              <button type="button" className="action-button action-secondary size-10 p-0" onClick={next}>
                <SkipForward className="size-4" />
              </button>
              <button
                type="button"
                className={`action-button size-10 p-0 ${repeatMode !== 'off' ? 'action-primary' : 'action-secondary'}`}
                onClick={cycleRepeatMode}
              >
                {repeatMode === 'one' ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-12 text-right text-xs text-[var(--copy-soft)]">{formatDuration(progress)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="1"
                value={Math.min(progress, duration || 0)}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-2 flex-1 cursor-pointer"
              />
              <span className="w-12 text-xs text-[var(--copy-soft)]">{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <button type="button" className="action-button action-secondary" onClick={() => setQueueOpen(!queueOpen)}>
              <ListMusic className="size-4" />
              Queue
            </button>
            <div className="flex min-w-[180px] items-center gap-3 rounded-full border border-white/8 bg-white/4 px-4 py-3">
              <Volume2 className="size-4 text-[var(--copy-soft)]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="flex-1 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
