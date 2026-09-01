import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { PlayerState } from './playerTypes';

export function usePlayerKeepAwake(playerState: PlayerState) {
  useEffect(() => {
    const isPlaying = playerState === 'PLAYING' || playerState === 'BUFFERING';
    const tag = 'live_tv_player_keep_awake';

    if (isPlaying) {
      activateKeepAwakeAsync(tag).catch((err) => console.warn('[usePlayerKeepAwake] Failed activate', err));
    } else {
      deactivateKeepAwake(tag).catch(() => {});
    }

    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [playerState]);
}
