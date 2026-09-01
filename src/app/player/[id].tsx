import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoSurface, VideoSurfaceRef, TrackItem } from '@/player/VideoSurface';
import { PlayerOverlayControls } from '@/player/PlayerOverlayControls';
import { PlayerLockOverlay } from '@/player/PlayerLockOverlay';
import { PlayerAdvancedSettingsModal } from '@/player/PlayerAdvancedSettingsModal';
import { ChannelDrawer } from '@/player/ChannelDrawer';
import { PlayerErrorView } from '@/player/PlayerErrorView';
import { PlayerGestureHandler } from '@/player/PlayerGestureHandler';
import { PlayerState } from '@/player/playerTypes';
import { PlayerCapabilityResolver } from '@/player/playerCapabilityResolver';
import { PlayerRecovery } from '@/player/playerRecovery';
import { useSleepTimer, SleepTimerOption } from '@/player/useSleepTimer';
import { usePlayerKeepAwake } from '@/player/usePlayerKeepAwake';
import { AppLoading, AppBadge } from '@/components/ui';
import { PlaylistService } from '@/services/playlistService';
import { ChannelNormalizer } from '@/services/channelNormalizer';
import { addRecentlyWatched, getFavorites, isFavorite as checkIsFavorite, addFavorite, removeFavorite } from '@/storage';
import { Channel, StreamCapabilities } from '@/types/channel';

const DEFAULT_TEST_STREAM = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
const AUTO_HIDE_MS = 3500;

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const { id, streamUrl, title } = useLocalSearchParams<{
    id: string;
    streamUrl?: string;
    title?: string;
  }>();

  const router = useRouter();
  const videoRef = useRef<VideoSurfaceRef>(null);

  const [activeStreamUrl, setActiveStreamUrl] = useState<string>(streamUrl || DEFAULT_TEST_STREAM);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [channelTitle, setChannelTitle] = useState<string>(title || 'Live Channel');

  const [playerState, setPlayerState] = useState<PlayerState>('CONNECTING');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [retryKey, setRetryKey] = useState<number>(0);
  const [autoRetryCount, setAutoRetryCount] = useState<number>(0);

  // Dynamic capabilities state resolved from active stream
  const [dynamicCapabilities, setDynamicCapabilities] = useState<StreamCapabilities>(() =>
    PlayerCapabilityResolver.resolveCapabilities(streamUrl || DEFAULT_TEST_STREAM)
  );
  const [audioTracksList, setAudioTracksList] = useState<TrackItem[]>([]);
  const [subtitleTracksList, setSubtitleTracksList] = useState<TrackItem[]>([]);
  const [qualitiesList, setQualitiesList] = useState<string[]>([]);

  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string | undefined>(undefined);
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto');

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep screen awake while playing (Section 39)
  usePlayerKeepAwake(playerState);

  // Sleep timer expiration handler (Section 38)
  const handleTimerExpired = useCallback(() => {
    videoRef.current?.pause();
    setPlayerState('PAUSED');
    router.back();
  }, [router]);

  const { activeMinutesOption, minutesLeft, setTimer } = useSleepTimer(handleTimerExpired);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!isLocked) {
      setControlsVisible(true);
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, AUTO_HIDE_MS);
    }
  }, [isLocked]);

  useEffect(() => {
    resetHideTimer();
    async function loadCatalogue() {
      try {
        const favs = await getFavorites();
        setFavorites(favs);
        if (id) {
          const isFav = favs.includes(id);
          setIsFavorite(isFav);
        }
        const res = await PlaylistService.loadPlaylist();
        const normalized = ChannelNormalizer.normalizeCatalogue(res.items);
        setAllChannels(normalized);

        const current = normalized.find((ch) => ch.id === id);
        if (current) {
          setActiveChannel(current);
          setChannelTitle(current.name);
          if (!streamUrl) setActiveStreamUrl(current.streamUrl);
        }
      } catch (err) {
        console.warn('[PlayerScreen] Failed loading catalogue context', err);
      }
    }
    loadCatalogue();

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [id, streamUrl, resetHideTimer]);

  const handleCapabilitiesResolved = useCallback(
    (
      capabilities: StreamCapabilities,
      audioTracks: TrackItem[],
      subtitleTracks: TrackItem[],
      qualities: string[]
    ) => {
      setDynamicCapabilities(capabilities);
      setAudioTracksList(audioTracks);
      setSubtitleTracksList(subtitleTracks);
      setQualitiesList(qualities);
      if (audioTracks.length > 0 && !selectedAudioTrack) {
        setSelectedAudioTrack(audioTracks[0].id);
      }
    },
    [selectedAudioTrack]
  );

  const handleStateChange = useCallback((state: PlayerState, err?: string) => {
    setPlayerState(state);

    if (state === 'ERROR' && activeChannel) {
      const fallback = PlayerRecovery.getNextFallbackStream(activeChannel);
      if (fallback) {
        setAutoRetryCount(fallback.attemptCount);
        setActiveStreamUrl(fallback.nextStreamUrl);
        setPlayerState('CONNECTING');
        setRetryKey((k) => k + 1);
        return;
      }
      setErrorMessage(err || 'Stream unavailable. No alternate fallback streams.');
    }

    if (state === 'PLAYING' && id) {
      addRecentlyWatched(id);
    }
  }, [activeChannel, id]);

  const handleTogglePlay = useCallback(() => {
    videoRef.current?.togglePlay();
  }, []);

  const handleToggleMute = useCallback(() => {
    videoRef.current?.toggleMute();
  }, []);

  const handleSeekBackward = useCallback(() => {
    if (!dynamicCapabilities.seekable) return;
    videoRef.current?.seekBy(-10);
  }, [dynamicCapabilities.seekable]);

  const handleSeekForward = useCallback(() => {
    if (!dynamicCapabilities.seekable) return;
    videoRef.current?.seekBy(10);
  }, [dynamicCapabilities.seekable]);

  const handleGoLive = useCallback(() => {
    if (!dynamicCapabilities.seekable) return;
    videoRef.current?.seekToLive();
  }, [dynamicCapabilities.seekable]);

  const handleToggleFavorite = useCallback(async () => {
    if (!id) return;
    if (isFavorite) {
      const updated = await removeFavorite(id);
      setIsFavorite(false);
      setFavorites(updated);
    } else {
      const updated = await addFavorite(id);
      setIsFavorite(true);
      setFavorites(updated);
    }
  }, [id, isFavorite]);

  const handleSwitchChannel = useCallback((newChannel: Channel) => {
    if (activeChannel?.id) {
      PlayerRecovery.resetFallbackAttempts(activeChannel.id);
    }
    videoRef.current?.pause();
    setActiveChannel(newChannel);
    setChannelTitle(newChannel.name);
    setActiveStreamUrl(newChannel.streamUrl);
    setDynamicCapabilities(PlayerCapabilityResolver.resolveCapabilities(newChannel.streamUrl));
    setAudioTracksList([]);
    setSubtitleTracksList([]);
    setQualitiesList([]);
    setAutoRetryCount(0);
    setPlayerState('CONNECTING');
    setErrorMessage(undefined);
    setRetryKey((k) => k + 1);
    checkIsFavorite(newChannel.id).then((fav) => setIsFavorite(fav));
    resetHideTimer();
  }, [activeChannel, resetHideTimer]);

  const handlePrevChannel = useCallback(() => {
    if (!allChannels.length || !activeChannel) return;
    const currentIndex = allChannels.findIndex((c) => c.id === activeChannel.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + allChannels.length) % allChannels.length;
    handleSwitchChannel(allChannels[prevIndex]);
  }, [allChannels, activeChannel, handleSwitchChannel]);

  const handleNextChannel = useCallback(() => {
    if (!allChannels.length || !activeChannel) return;
    const currentIndex = allChannels.findIndex((c) => c.id === activeChannel.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % allChannels.length;
    handleSwitchChannel(allChannels[nextIndex]);
  }, [allChannels, activeChannel, handleSwitchChannel]);

  const handleRetry = useCallback(() => {
    if (activeChannel?.id) {
      PlayerRecovery.resetFallbackAttempts(activeChannel.id);
    }
    setAutoRetryCount(0);
    setErrorMessage(undefined);
    setPlayerState('CONNECTING');
    setRetryKey((prev) => prev + 1);
  }, [activeChannel]);

  const handleSurfaceTap = useCallback(() => {
    if (isLocked) return;
    if (controlsVisible) {
      setControlsVisible(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
  }, [isLocked, controlsVisible, resetHideTimer]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <PlayerGestureHandler
        seekable={dynamicCapabilities.seekable}
        onTap={handleSurfaceTap}
        onDoubleTapSeekBackward={handleSeekBackward}
        onDoubleTapSeekForward={handleSeekForward}>
        <VideoSurface
          ref={videoRef}
          key={`surface_${retryKey}`}
          streamUrl={activeStreamUrl}
          onStateChange={handleStateChange}
          onPlayingChange={setIsPlaying}
          onMuteChange={setIsMuted}
          onCapabilitiesResolved={handleCapabilitiesResolved}
        />
      </PlayerGestureHandler>

      {/* Lock Overlay (Section 34) */}
      <PlayerLockOverlay
        locked={isLocked}
        onUnlock={() => {
          setIsLocked(false);
          resetHideTimer();
        }}
      />

      {/* Custom Player Controls Overlay (Section 33 & 35) */}
      {!isLocked && (
        <PlayerOverlayControls
          visible={controlsVisible}
          channel={activeChannel || undefined}
          title={channelTitle}
          isPlaying={isPlaying}
          isMuted={isMuted}
          isFavorite={isFavorite}
          playerState={playerState}
          capabilities={dynamicCapabilities}
          sleepTimerMinutes={minutesLeft || activeMinutesOption}
          onTogglePlay={handleTogglePlay}
          onToggleMute={handleToggleMute}
          onToggleFavorite={handleToggleFavorite}
          onSeekBackward={handleSeekBackward}
          onSeekForward={handleSeekForward}
          onGoLive={handleGoLive}
          onPrevChannel={handlePrevChannel}
          onNextChannel={handleNextChannel}
          onLock={() => {
            setIsLocked(true);
            setControlsVisible(false);
          }}
          onOpenDrawer={() => setDrawerVisible(true)}
          onOpenSettings={() => setSettingsModalVisible(true)}
          onClose={() => router.back()}
          onUserInteraction={resetHideTimer}
        />
      )}

      {/* Channel Drawer for Quick Switching */}
      <ChannelDrawer
        visible={drawerVisible}
        channels={allChannels}
        activeChannelId={activeChannel?.id}
        favorites={favorites}
        onSelectChannel={handleSwitchChannel}
        onToggleFavorite={async (chId) => {
          if (favorites.includes(chId)) {
            const updated = await removeFavorite(chId);
            setFavorites(updated);
            if (chId === id) setIsFavorite(false);
          } else {
            const updated = await addFavorite(chId);
            setFavorites(updated);
            if (chId === id) setIsFavorite(true);
          }
        }}
        onClose={() => setDrawerVisible(false)}
      />

      {/* Advanced Player Settings Modal */}
      <PlayerAdvancedSettingsModal
        visible={settingsModalVisible}
        capabilities={dynamicCapabilities}
        sleepTimerMinutes={activeMinutesOption}
        audioTracks={audioTracksList}
        subtitleTracks={subtitleTracksList}
        qualities={qualitiesList}
        selectedAudioTrackId={selectedAudioTrack}
        selectedSubtitleTrackId={selectedSubtitleTrack}
        selectedQuality={selectedQuality}
        onSelectSleepTimer={(min: SleepTimerOption) => setTimer(min)}
        onSelectAudioTrack={(trackId) => {
          setSelectedAudioTrack(trackId);
          videoRef.current?.setAudioTrack?.(trackId);
        }}
        onSelectSubtitleTrack={(trackId) => {
          setSelectedSubtitleTrack(trackId);
          videoRef.current?.setSubtitleTrack?.(trackId);
        }}
        onSelectQuality={(q) => {
          setSelectedQuality(q);
          videoRef.current?.setVideoQuality?.(q);
        }}
        onClose={() => setSettingsModalVisible(false)}
      />

      {/* Initial Connecting / Reconnecting Overlay (Section 32) */}
      {(playerState === 'CONNECTING' || playerState === 'RECONNECTING') && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <AppLoading
            message={
              autoRetryCount > 0
                ? `Reconnecting stream (Attempt ${autoRetryCount})...`
                : 'Connecting live stream...'
            }
          />
        </View>
      )}

      {/* Non-Blocking Subtle Buffering Badge (Section 32) */}
      {playerState === 'BUFFERING' && (
        <View style={[styles.subtleBufferingBadge, { top: insets.top + 60 }]} pointerEvents="none">
          <AppBadge label="BUFFERING..." status="info" />
        </View>
      )}

      {/* Error Overlay (Section 31) */}
      {playerState === 'ERROR' && (
        <PlayerErrorView
          message={errorMessage}
          retryCount={autoRetryCount}
          onRetry={handleRetry}
          onClose={() => router.back()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  subtleBufferingBadge: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 8,
  },
});
