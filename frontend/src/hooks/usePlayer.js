import { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';

export function usePlayer() {
  return useContext(PlayerContext);
}
