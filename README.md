# Mobile TV Live — Professional Android Live TV APK

**Mobile TV Live** is a production-quality, local-first Android Live TV mobile application built with **React Native**, **Expo SDK 57**, **TypeScript**, **Expo Router**, and **expo-video**.

---

## 🌟 Key Architecture & Product Features

### 1. 100% Local-First & Zero Remote Database
- **No Remote Database**: Zero backend databases (No MongoDB, PostgreSQL, Firebase, Supabase, or Redis user servers).
- **No Authentication Server**: No passwords, emails, OTPs, or cloud logins required. Anonymous guest device ID generated locally using `expo-secure-store` / `AsyncStorage`.
- **Local Storage Split**:
  - `AsyncStorage`: App settings, favorites list, watch history (bounded to 20 items).
  - `SecureStore`: Sensitive local device guest identifier.
  - `Expo FileSystem`: Schema-versioned cached channel catalogue JSON (`CACHE_SCHEMA_VERSION = 1`) and EPG schedule envelope.

### 2. IPTV-org Primary Data Source
- Ingests public IPTV catalogue (`https://iptv-org.github.io/iptv/index.m3u`).
- Dedicated M3U parser (`src/parsers/m3uParser.ts`) handles `#EXTINF` tags, malformed lines, HTTP headers, logos, countries, and categories.
- Channel normalizer (`src/services/channelNormalizer.ts`) merges alternate stream URLs for duplicate channels and generates stable identifiers.

### 3. Professional Live Streaming Player (`expo-video`)
- **State Machine**: Predictable playback state transitions (`IDLE`, `CONNECTING`, `BUFFERING`, `PLAYING`, `PAUSED`, `SEEKING`, `LIVE_EDGE`, `RECONNECTING`, `ERROR`, `OFFLINE`).
- **Dynamic Capability Resolver**: Dynamic inspection of stream capabilities (`live`, `seekable`, `qualitySelection`, `audioTracks`, `subtitles`, `pictureInPicture`). No fake seek or quality buttons displayed if unsupported!
- **Advanced Player Overlay**: Auto-hiding control bar, lock mode overlay (`PlayerLockOverlay.tsx`), sleep timer hook (`useSleepTimer.ts`), settings modal, and in-player channel drawer (`ChannelDrawer.tsx`).
- **Automatic Stream Recovery**: `PlayerRecovery` attempts alternate backup stream URLs sequentially upon playback failure before displaying human-readable error banners.
- **Gestures & Keep-Awake**: Vertical swipe feedback for volume/brightness, double-tap seek detection, and screen keep-awake (`usePlayerKeepAwake.ts`).

### 4. EPG Integration & Mobile TV Guide
- EPG XMLTV / JSON guide schedule parser (`src/parsers/epgParser.ts`).
- `EpgService`: `getCurrentProgram` and `getNextProgram` lookup with clean fallback ("Program information unavailable.").
- TV Guide screen (`src/app/(tabs)/guide.tsx`) optimized for mobile phone screens without dense horizontal grid clutter.

### 5. Intentional Design System & Accessibility
- Custom dark theme system with semantic tokens (`src/theme/tokens.ts`).
- Accessibility attributes (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`) and 44x44 dp minimum touch targets.
- Responsive layout container (`AppContainer.tsx`) enforcing bounds on wide phone screens and tablets.
- Global `ErrorBoundary.tsx` catching UI rendering exceptions gracefully.

---

## 📁 Folder Structure

```
Mobile Tv Live/
├── assets/                  # App icons, splash screens, and images
├── src/
│   ├── app/                 # Expo Router file-based navigation routes
│   │   ├── (tabs)/          # Native tab navigator (Home, Live, Guide, Favorites, Settings)
│   │   ├── channel/[id].tsx # Channel details route
│   │   ├── player/[id].tsx  # Fullscreen Live Player modal route
│   │   └── search.tsx       # Instant local search route
│   ├── components/          # Reusable UI primitives & card components
│   ├── hooks/               # Custom hooks (useTheme, useNetworkState, etc.)
│   ├── parsers/             # M3U parser & EPG XMLTV parser
│   ├── player/              # Native VideoSurface, Overlay Controls, State Store, Recovery, Sleep Timer
│   ├── services/            # PlaylistService, ChannelNormalizer, EpgService
│   ├── storage/             # Guest ID, Settings, Favorites, History, Cache storage
│   ├── theme/               # Design tokens, color palettes, spacing, typography
│   └── types/               # TypeScript interfaces (Channel, EpgProgram, PlayerState)
├── app.json                 # Expo SDK 57 Android production configuration
├── jest.config.js           # Automated test suite configuration
└── package.json             # App dependencies & scripts
```

---

## 🛠️ Verification & Build Commands

### 1. Execute Unit Test Suite
```bash
npx jest
```
Runs 26 automated unit tests covering M3U parsing, EPG parsing, channel normalization, local storage persistence, player capability resolution, Zustand store state machine, stream recovery, network monitoring, and security/privacy audits.

### 2. Type Check
```bash
npx tsc --noEmit
```
Strict TypeScript compilation check.

### 3. Code Linting
```bash
npm run lint
```
Expo ESLint check.

---

## 🚀 Running Locally

```bash
npm start
```
Runs the development server using Expo CLI.
