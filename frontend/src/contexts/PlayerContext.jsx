import { createContext, useEffect, useEffectEvent, useRef, useState } from 'react';
import { recommendationsApi, songsApi } from '../api/services';

export const PlayerContext = createContext(null);

const randomIndex = (length, currentIndex) => {
  if (length <= 1) {
    return currentIndex;
  }

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }
  return nextIndex;
};

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [queueOpen, setQueueOpen] = useState(false);
  const [pendingAutoplay, setPendingAutoplay] = useState(false);
  const lastTrackedSongRef = useRef(null);

  const currentTrack = queue[currentIndex] || null;

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const playIndex = async (nextIndex, shouldAutoplay = true) => {
    if (nextIndex < 0 || nextIndex >= queueRef.current.length) {
      return;
    }

    setPendingAutoplay(shouldAutoplay);
    setCurrentIndex(nextIndex);
  };

  const handleTrackEnd = useEffectEvent(async () => {
    if (!queueRef.current.length || currentIndex < 0) {
      setIsPlaying(false);
      return;
    }

    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      return;
    }

    if (shuffle) {
      await playIndex(randomIndex(queueRef.current.length, currentIndex));
      return;
    }

    if (currentIndex < queueRef.current.length - 1) {
      await playIndex(currentIndex + 1);
      return;
    }

    if (repeatMode === 'all' && queueRef.current.length) {
      await playIndex(0);
      return;
    }

    if (currentTrack) {
      try {
        const response = await recommendationsApi.autoplay(currentTrack.id);
        if (response.nextSong) {
          const nextQueue = [...queueRef.current, response.nextSong];
          queueRef.current = nextQueue;
          setQueue(nextQueue);
          await playIndex(nextQueue.length - 1);
          return;
        }
      } catch (error) {
        console.error('Autoplay failed', error);
      }
    }

    setIsPlaying(false);
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime || 0);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      handleTrackEnd();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioFileUrl) {
      return;
    }

    audioRef.current.src = currentTrack.audioFileUrl;
    audioRef.current.load();
    setProgress(0);
    setDuration(currentTrack.durationSeconds || 0);

    if (currentTrack.id !== lastTrackedSongRef.current) {
      songsApi.play(currentTrack.id).catch(() => {});
      lastTrackedSongRef.current = currentTrack.id;
    }

    if (pendingAutoplay) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setPendingAutoplay(false);
    }
  }, [currentTrack, pendingAutoplay]);

  const playCollection = (tracks, startAt = 0) => {
    const cleaned = tracks.filter((track) => track?.audioFileUrl);
    if (!cleaned.length) {
      return;
    }

    queueRef.current = cleaned;
    setQueue(cleaned);
    setPendingAutoplay(true);
    setCurrentIndex(startAt);
  };

  const playTrack = (track, tracks = null) => {
    if (tracks?.length) {
      const nextIndex = tracks.findIndex((item) => item.id === track.id);
      playCollection(tracks, Math.max(nextIndex, 0));
      return;
    }

    const existingIndex = queueRef.current.findIndex((item) => item.id === track.id);
    if (existingIndex >= 0) {
      playIndex(existingIndex);
      return;
    }

    const nextQueue = [...queueRef.current, track];
    queueRef.current = nextQueue;
    setQueue(nextQueue);
    setPendingAutoplay(true);
    setCurrentIndex(nextQueue.length - 1);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) {
      return;
    }

    if (!currentTrack && queueRef.current.length) {
      playIndex(0);
      return;
    }

    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      return;
    }

    audioRef.current.pause();
  };

  const next = () => handleTrackEnd();

  const previous = () => {
    if (!audioRef.current) {
      return;
    }

    if (audioRef.current.currentTime > 5) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (currentIndex > 0) {
      playIndex(currentIndex - 1);
    }
  };

  const seekTo = (value) => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const cycleRepeatMode = () => {
    setRepeatMode((current) => {
      if (current === 'off') {
        return 'all';
      }
      if (current === 'all') {
        return 'one';
      }
      return 'off';
    });
  };

  const addToQueue = (track) => {
    if (!track?.audioFileUrl) {
      return;
    }

    const exists = queueRef.current.some((item) => item.id === track.id);
    if (exists) {
      return;
    }

    const nextQueue = [...queueRef.current, track];
    queueRef.current = nextQueue;
    setQueue(nextQueue);
  };

  return (
    <PlayerContext.Provider
      value={{
        addToQueue,
        currentIndex,
        currentTrack,
        cycleRepeatMode,
        duration,
        isPlaying,
        next,
        playCollection,
        playTrack,
        previous,
        progress,
        queue,
        queueOpen,
        repeatMode,
        seekTo,
        setQueueOpen,
        setShuffle,
        setVolume,
        shuffle,
        togglePlayPause,
        volume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
