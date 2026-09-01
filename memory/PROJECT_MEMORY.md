# Mobile TV Live — Project Memory & Build Trajectory

**Last Updated**: 2026-09-01  
**Project Path**: `d:/All Projects/Mobile Tv Live`  
**Tech Stack**: React Native, Expo SDK 57, TypeScript, Expo Router, `expo-video`, Zustand, `@react-native-async-storage/async-storage`, `expo-secure-store`, `expo-file-system`, `@react-native-community/netinfo`, `expo-keep-awake`.

---

## 🎯 Architecture Summary

- **100% Local-First Architecture**: No remote user database (No MongoDB, PostgreSQL, Firebase DB, Supabase, or Redis). No user login server, authentication, passwords, or emails.
- **Anonymous Device Identification**: Generated on first launch and stored locally in `SecureStore` (or `AsyncStorage` web fallback).
- **Data Source**: IPTV-org public catalogue (`https://iptv-org.github.io/iptv/index.m3u`).
- **Local Storage Strategy**:
  - `AsyncStorage`: Small user preferences (theme, filters, sleep timer), favorite channel IDs, recently watched channels (bounded to 20 items).
  - `SecureStore`: Local anonymous device ID.
  - `Expo FileSystem`: Large cached channel catalogue JSON (`CACHE_SCHEMA_VERSION = 1`) and EPG schedule envelope (`EPG_CACHE_SCHEMA_VERSION = 1`).
- **Video Player**: Native `expo-video` (`VideoView`, `useVideoPlayer`) wrapped in a modular state machine architecture using Zustand (`usePlayerStore.ts`).

---

## 📌 Phase Progress (Phases 01 – 25 Complete)

| Phase | Phase Name | Status | Key Deliverables & Files |
|-------|------------|--------|--------------------------|
| **Phase 01** | Project Foundation | ✅ Completed | Expo SDK 57 setup, Expo Router stack/tab navigation, clean folder structure |
| **Phase 02** | Design System | ✅ Completed | `src/theme/tokens.ts`, `useTheme.ts`, UI primitives (`AppText`, `AppButton`, `AppCard`, `AppBadge`, `AppInput`, `AppLoading`, `AppContainer`) |
| **Phase 03** | App Shell & Navigation | ✅ Completed | Native tabs (`/home`, `/live`, `/guide`, `/favorites`, `/settings`), `/search`, `/channel/[id]`, `/player/[id]` |
| **Phase 04** | Local Storage Architecture | ✅ Completed | Storage abstractions in `src/storage/`: `guestStorage.ts`, `settingsStorage.ts`, `favoritesStorage.ts`, `historyStorage.ts`, `channelCacheStorage.ts` |
| **Phase 05** | M3U Ingestion Engine | ✅ Completed | Dedicated parser `src/parsers/m3uParser.ts` for `#EXTINF` tags, HTTP headers, logos, countries, malformed lines |
| **Phase 06** | Channel Normalization | ✅ Completed | `src/services/channelNormalizer.ts` stable ID generation, duplicate alternate stream URL merging, multi-attribute filter engine |
| **Phase 07** | Channel Catalogue UI | ✅ Completed | `src/components/ChannelCard.tsx` with image error fallback, virtualized `FlatList` in `live.tsx`, category chips filter bar |
| **Phase 08** | Search & Discovery | ✅ Completed | `src/app/search.tsx` for 100% instant local search across titles, countries, languages, categories |
| **Phase 09** | Live Player Foundation | ✅ Completed | Installed `expo-video`, created `VideoSurface.tsx`, `PlayerCapabilityResolver.ts` for dynamic capability inspection |
| **Phase 10** | Custom Player Controls | ✅ Completed | `PlayerOverlayControls.tsx` with play/pause, mute, favorite toggle, title header, 3.5s auto-hide fade animation |
| **Phase 11** | Live Playback State Machine | ✅ Completed | Zustand store `src/player/usePlayerStore.ts` managing playback states (`IDLE`, `CONNECTING`, `BUFFERING`, `PLAYING`, `PAUSED`, `SEEKING`, `LIVE_EDGE`, `RECONNECTING`, `ERROR`, `OFFLINE`) and max 3 auto-retries |
| **Phase 12** | Advanced Player Controls | ✅ Completed | `useSleepTimer.ts` (15m, 30m, 45m, 60m), `PlayerLockOverlay.tsx` lock mode, `PlayerAdvancedSettingsModal.tsx` for quality/audio/subtitles |
| **Phase 13** | Channel Switch & Fallback | ✅ Completed | `ChannelDrawer.tsx` quick in-player channel switching, `PlayerRecovery.ts` alternate stream fallback handling |
| **Phase 14** | EPG Integration | ✅ Completed | `src/types/epg.ts`, `epgCacheStorage.ts`, XMLTV & JSON guide parser `epgParser.ts`, `epgService.ts` current/next program lookup |
| **Phase 15** | Mobile TV Guide | ✅ Completed | `src/app/(tabs)/guide.tsx` schedule screen with day selector and direct channel watch shortcuts |
| **Phase 16** | Favorites & History UX | ✅ Completed | Full `favorites.tsx` screen with clear all confirmation, bounded `Recently Watched` history section on Home screen |
| **Phase 17** | Offline & Cache Resilience | ✅ Completed | NetInfo hook `useNetworkState.ts`, non-blocking `OfflineBanner.tsx`, cached catalogue fallback |
| **Phase 18** | Gestures & Immersive UX | ✅ Completed | `PlayerGestureHandler.tsx` vertical swipe feedback for volume/brightness, double-tap seek, screen keep-awake `usePlayerKeepAwake.ts` |
| **Phase 19** | Accessibility & Adaptability | ✅ Completed | `accessibilityLabel` & `accessibilityRole` attributes across elements, 44x44 dp minimum touch targets, tablet container bounds |
| **Phase 20** | Performance Optimization | ✅ Completed | `React.memo` wrapped channel cards, FlatList virtualization settings, image memory caching, bounded history |
| **Phase 21** | Error-State Hardening | ✅ Completed | Global `ErrorBoundary.tsx` safety net, human-readable error overlays |
| **Phase 22** | Security & Privacy Review | ✅ Completed | 100% local storage audit, anonymous guest ID generation, zero remote database/auth backend |
| **Phase 23** | Android Production Config | ✅ Completed | `app.json` package `com.mobiletvlive.app`, permissions (`INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`), dark splash screen |
| **Phase 24** | Build & Device Testing | ✅ Completed | Verified all 26 unit tests passed, 0 TypeScript errors, 0 lint warnings |
| **Phase 25** | Release Readiness | ✅ Completed | Comprehensive `README.md` and repository build trajectory documentation |

---

## 🧪 Test Suite Summary (`npx jest`)

- **Total Test Suites**: 9 passed, 9 total
- **Total Unit Tests**: 26 passed, 26 total
- **Test Files**:
  1. `src/storage/__tests__/storage.test.ts` (AsyncStorage, SecureStore, FileSystem cache versioning)
  2. `src/storage/__tests__/securityPrivacyAudit.test.ts` (Local-first device ID & privacy audit)
  3. `src/parsers/__tests__/m3uParser.test.ts` (M3U playlist ingestion & tag parsing)
  4. `src/parsers/__tests__/epgParser.test.ts` (XMLTV date parsing & program schedule extraction)
  5. `src/services/__tests__/channelNormalizer.test.ts` (Catalogue normalization, duplicate stream merging, filtering)
  6. `src/player/__tests__/playerCapabilityResolver.test.ts` (Dynamic stream capability resolution)
  7. `src/player/__tests__/usePlayerStore.test.ts` (Zustand player store & state machine transitions)
  8. `src/player/__tests__/playerRecovery.test.ts` (Alternate stream fallback recovery)
  9. `src/hooks/__tests__/useNetworkState.test.ts` (NetInfo status listener)

---

## 📋 Continuation Guidelines for Future Updates

Whenever requested to perform future updates or add features:
1. **Read this File First**: Always check `memory/PROJECT_MEMORY.md` to understand the state of the project before writing new code.
2. **Follow Phase Gate Rule**:
   - Make changes sequentially.
   - Run type checks (`npx tsc --noEmit`), lint checks (`npm run lint`), and tests (`npx jest`).
3. **Update Memory File**: Whenever a new feature, bug fix, or phase update is completed, update `memory/PROJECT_MEMORY.md` with the new changes, updated test counts, and files modified.
