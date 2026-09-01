# Mobile TV Live — Project Memory & Build Trajectory

**Last Updated**: 2026-09-01  
**Project Path**: `d:/All Projects\Mobile Tv Live`  
**Tech Stack**: React Native, Expo SDK 57, TypeScript, Expo Router, `expo-video`, Zustand, `@react-native-async-storage/async-storage`, `expo-secure-store`, `expo-file-system`, `@react-native-community/netinfo`, `expo-keep-awake`, EAS Build workflow.

---

## 🎯 Architecture Summary

- **100% Local-First Architecture**: No remote user database (No MongoDB, PostgreSQL, Firebase DB, Supabase, or Redis). No user login server, authentication, passwords, or emails.
- **Anonymous Device Identification**: Generated on first launch and stored locally in `SecureStore` (or `AsyncStorage` web fallback).
- **Data Source with 350+ Bundled Indian Channels**:
  - Bundled Static M3U Dataset (`src/data/indianChannelsM3u.ts`) with 350+ direct Indian channels (Aaj Tak, ABP News, NDTV, Republic Bharat, Star Sports, Sony Max, Zee Cinema, Goldmines, 9XM, Colors, ETV, B4U, DD National, etc.).
  - Primary global catalogue: `https://iptv-org.github.io/iptv/index.m3u`
  - Dedicated India country playlist: `https://iptv-org.github.io/iptv/countries/in.m3u`
  - Indian subdivisions (Delhi `in-dl`, Maharashtra `in-mh`, Tamil Nadu `in-tn`, Kerala `in-kl`, Karnataka `in-ka`, Andhra Pradesh `in-ap`).
  - Indian languages (Hindi `hin`, Tamil `tam`, Telugu `tel`, Malayalam `mal`, Bengali `ben`, Marathi `mar`, Kannada `kan`, Gujarati `guj`, Punjabi `pan`, Bhojpuri `bho`, Assamese `asm`, Odia `ori`).
- **Local Storage Strategy**:
  - `AsyncStorage`: Small user preferences (theme, filters, sleep timer), favorite channel IDs, recently watched channels (bounded to 20 items).
  - `SecureStore`: Local anonymous device ID.
  - `Expo FileSystem`: Large cached channel catalogue JSON (`CACHE_SCHEMA_VERSION = 1`) and EPG schedule envelope (`EPG_CACHE_SCHEMA_VERSION = 1`).
- **Video Player**: Native `expo-video` (`VideoView`, `useVideoPlayer`) wrapped in a modular state machine architecture using Zustand (`usePlayerStore.ts`).

---

## 🔍 Detailed Review & Hardening Log for Milestones 8 – 21 & Rules 76 – 79

| Milestone / Rule | Requirement | Audit & Hardening Status | File References |
|------------------|-------------|--------------------------|-----------------|
| **MILESTONE 8 (PLAYER FOUNDATION)** | Video surface, stream loading, play/pause/error states, basic retry, fullscreen foundation | ✅ Native `expo-video` integration with 10 explicit player states and state machine transitions. | `src/player/VideoSurface.tsx`, `src/player/usePlayerStore.ts` |
| **MILESTONE 9 (CUSTOM CONTROLS)** | Play/pause, mute, volume, fullscreen, channel info, favorite, control auto-hide (3.5s) | ✅ Custom animated player controls with 3.5s auto-hide fade animation. | `src/player/PlayerOverlayControls.tsx` |
| **MILESTONE 10 (ADVANCED PLAYER)** | 10s seek, Go Live, quality/audio/subtitle selector (capability-aware), lock mode, sleep timer (15/30/45/60m), network state | ✅ Dynamic capability inspection (`seekable`, `qualitySelection`, `audioTracks`, `subtitles`), sleep timer hook, gesture handler. | `src/player/PlayerAdvancedSettingsModal.tsx`, `src/hooks/useSleepTimer.ts` |
| **MILESTONE 11 (CHANNEL SWITCHING)** | Prev/next channel buttons, channel drawer, alternate source fallback, controlled retry | ✅ Fast channel switching drawer, alternate stream fallback engine in `PlayerRecovery.ts`. | `src/player/ChannelDrawer.tsx`, `src/player/playerRecovery.ts` |
| **MILESTONE 12 (EPG)** | EPG fetch, parser, local cache, channel mapping, current & next programme | ✅ XMLTV/JSON EPG parser, local FileSystem cache, program lookup service with fallback. | `src/parsers/epgParser.ts`, `src/services/epgService.ts` |
| **MILESTONE 13 (TV GUIDE)** | Guide screen, day navigation (Today/Tomorrow), category chips, search bar, playback shortcuts | ✅ Dedicated Guide screen (`guide.tsx`) with formatted program timestamps (`HH:mm`), search, and category chips. | `src/app/(tabs)/guide.tsx` |
| **MILESTONE 14 (FAVORITES & HISTORY)** | Favorites actions, favorites screen, recent channels section, clear history, empty states | ✅ 100% local persistence via AsyncStorage, clear history confirmation, bounded to 20 items. | `src/app/(tabs)/favorites.tsx`, `src/storage/historyStorage.ts` |
| **MILESTONE 15 (IMMERSIVE PLAYER)** | Gesture layer (volume/brightness), double-tap seek, lock mode, fullscreen, mini-player, PiP | ✅ Touch gesture overlay, double-tap seek (seekable streams only), lock mode overlay, keep-awake hook. | `src/player/PlayerGestureHandler.tsx`, `src/hooks/usePlayerKeepAwake.ts` |
| **MILESTONE 16 (OFFLINE RESILIENCE)** | Cold start offline, cached install, stale cache, corrupt cache handling | ✅ NetInfo connectivity hook, non-blocking offline banner, cached dataset fallback. | `src/hooks/useNetworkState.ts`, `src/components/OfflineBanner.tsx` |
| **MILESTONE 17 (PERFORMANCE PASS)** | Virtualized FlatLists (`removeClippedSubviews`, `windowSize`), memoized cards, bounded history & cache | ✅ `React.memo` wrapped channel cards, FlatList virtualization props across all screens. | `src/components/ChannelCard.tsx`, `src/app/(tabs)/live.tsx` |
| **MILESTONE 18 (ERROR HARDENING)** | Human-readable exception mapping, retry count display, global ErrorBoundary safety net | ✅ Raw error message translator in `PlayerErrorView.tsx`, top-level `ErrorBoundary.tsx`. | `src/player/PlayerErrorView.tsx`, `src/components/ErrorBoundary.tsx` |
| **MILESTONE 19 (PRIVACY REVIEW)** | 100% local storage, zero remote database/auth backend, anonymous local device ID | ✅ 100% local storage architecture, verified in privacy unit audit test. | `src/storage/__tests__/securityPrivacyAudit.test.ts` |
| **MILESTONE 20 (ANDROID PRODUCTION CONFIG)** | `app.json` package `com.mobiletvlive.app`, minimal permissions (`INTERNET`, `ACCESS_NETWORK_STATE`, `WAKE_LOCK`), dark splash screen | ✅ `app.json` fully configured with dark theme `#090D16`, predictive back, minimal permissions. | `app.json` |
| **MILESTONE 21 (RELEASE QA & EAS CONFIG)** | Modern Expo/EAS production workflow configuration for APK & Play Store AAB generation | ✅ `eas.json` created with `preview` profile (APK) and `production` profile (App Bundle AAB). | `eas.json` |
| **RULE 76 (VISUAL QA STANDARD)** | Clean spacing, no clipped text, 44dp min touch targets, readable contrast, no AI demo look | ✅ Verified 44dp min touch targets, clean restrained color tokens, responsive layout bounds. | `src/theme/tokens.ts`, `src/components/ui/` |
| **RULES 77-79 (STREAMING & CATALOGUE RULES)** | Capability-aware player UI (No fake seek/quality/audio/subtitle menus), tolerant stream recovery | ✅ Seek controls & track menus rendered conditionally based on dynamic stream inspection (`capabilities.seekable`). | `src/player/PlayerOverlayControls.tsx`, `src/player/VideoSurface.tsx` |

---

## 🧪 Test Suite Summary (`npx jest`)

- **Total Test Suites**: 9 passed, 9 total
- **Total Unit Tests**: 26 passed, 26 total
- **Test Files**:
  1. `src/storage/__tests__/storage.test.ts`
  2. `src/storage/__tests__/securityPrivacyAudit.test.ts`
  3. `src/parsers/__tests__/m3uParser.test.ts`
  4. `src/parsers/__tests__/epgParser.test.ts`
  5. `src/services/__tests__/channelNormalizer.test.ts`
  6. `src/player/__tests__/playerCapabilityResolver.test.ts`
  7. `src/player/__tests__/usePlayerStore.test.ts`
  8. `src/player/__tests__/playerRecovery.test.ts`
  9. `src/hooks/__tests__/useNetworkState.test.ts`

---

## 📋 Continuation Guidelines for Future Updates

Whenever requested to perform future updates or add features:
1. **Read this File First**: Always check `memory/PROJECT_MEMORY.md` to understand the state of the project before writing new code.
2. **Follow Phase Gate Rule**:
   - Make changes sequentially.
   - Run type checks (`npx tsc --noEmit`), lint checks (`npm run lint`), and tests (`npx jest`).
3. **Update Memory File**: Whenever a new feature, bug fix, or phase update is completed, update `memory/PROJECT_MEMORY.md` with the new changes, updated test counts, and files modified.
