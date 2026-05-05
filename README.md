# Dead of Night — Weather App

A cinematic dark weather app built with React Native (Expo) — runs on **mobile (iOS & Android), web, and desktop** from a single codebase. Built for the HNG14 Mobile Internship Stage 3 & 4.

**🌐 Live Web App:** https://dist-sepia-two-33.vercel.app

## Platforms

| Platform | How to run |
|---|---|
| iOS | `pnpm expo run:ios` |
| Android | `pnpm expo run:android` |
| Web | `pnpm web` or `pnpm build:web` → deploy `dist/` |
| Desktop (macOS) | Open web build in browser, or Electron (planned) |

## Features

- **Current weather** — temperature, condition, humidity, wind speed, feels-like, UV index
- **Location-based weather** — auto-detects device GPS on launch
- **City search** — search any city globally; recent searches and popular Nigerian cities as chips
- **5-day forecast** — tap/click any day to expand an hourly breakdown
- **Hourly forecast** — scrollable pill cards for the current day
- **°C / °F toggle** — keyboard shortcut `⌘T` on web, toggle in View menu
- **km/h ↔ mph** — wind unit toggle in View menu
- **Offline caching** — last successful response cached per city (1-hour TTL); stale data shown with a "Last updated X mins ago" badge
- **Error states** — full illustrated screens for no internet, location denied, city not found, and API failures
- **Skeleton loaders** — shape-matched shimmer placeholders for all content areas

## Responsive Layout

Layout adapts by **screen width** — not `Platform.OS`:

| Width | Layout |
|---|---|
| < 768px | Mobile: bottom sheets, touch gestures |
| 768–1024px | Tablet: right sidebar panel (360px) |
| > 1024px | Desktop: two-column, fixed right sidebar (380px) |

## Desktop / Web Features

- **App menu bar** — File, Edit, View, Help with full dropdowns
- **Keyboard shortcuts** — `⌘K` search, `⌘R` refresh, `⌘T` toggle °C/°F, `⌘L` use location, `⌘D` theme toggle
- **Right-click context menus** — on forecast rows (view hourly, copy temperature) and city name (search, copy)
- **Hover states** — forecast rows highlight on hover (150ms), cursor: pointer everywhere
- **Browser tab title** — updates to `Lagos · 31°C — Dead of Night Weather`

## APIs

- [OpenWeatherMap Current Weather](https://openweathermap.org/current) — `api.openweathermap.org/data/2.5/weather`
- [OpenWeatherMap 5-Day Forecast](https://openweathermap.org/forecast5) — `api.openweathermap.org/data/2.5/forecast`

Add your key to `.env`:
```
EXPO_PUBLIC_OWM_API_KEY=your_key_here
```

## Animations

**Mobile (Stage 3)**
1. Temperature switcher — slides up/out, springs in on city change
2. Hourly list stagger — 30ms delay per card (`moti`)
3. Search sheet spring physics
4. Weather particle canvas (Skia) — condition-matched ambient animation
5. Stats count-up — humidity/wind animate 0 → value on load
6. Skeleton shimmer cycling
7. Error screen entrance scale + fade

**Web / Desktop (Stage 4)**
8. Sidebar slides in from right on first load (translateX +40px → 0, spring)
9. Temperature cross-fades on °C/°F toggle
10. Search result stagger-fade on web sidebar
11. Error screens scale-spring entrance on all platforms

## Architecture

```
src/
  core/
    theme/           colors, typography, spacing
    api/             axios client, interceptors, typed error classes
    cache/
      mmkv.native.ts   MMKV storage (iOS/Android)
      mmkv.ts          localStorage fallback (web)
    hooks/
      usePlatform.ts        breakpoint → 'mobile' | 'tablet' | 'desktop'
      useStorage.ts         unified MMKV / localStorage abstraction
      useKeyboardShortcut.ts  ⌘/Ctrl shortcuts (web only)
  features/
    weather/
      components/
        WeatherBackground.tsx  Skia particles (native) / CSS gradient (web)
        WeatherSidebar.tsx     right panel on tablet/desktop
        AppMenuBar.tsx         top menu bar (web/desktop only)
        ContextMenu.tsx        right-click menus (web/desktop only)
        HourlyCard, ForecastRow, StatsTile, ConditionIcon, SkeletonCard
      screens/    HomeScreen, SearchSheet, DayDetailSheet, ErrorScreens
      hooks/      useWeather, useForecast, useLocation
      store/      Zustand (selectedCity, recentSearches, tempUnit, windUnit)
      types/      WeatherResponse, ForecastItem, DayForecast, Condition
  App.tsx
```

## Libraries

| Library | Purpose |
|---|---|
| `expo-location` | Device GPS |
| `expo-font` + Google Fonts | Instrument Serif, DM Sans, DM Mono |
| `axios` | HTTP client |
| `@tanstack/react-query` | Server state, caching, refetch |
| `zustand` | Client state (city, unit toggles) |
| `react-native-mmkv` | Offline cache (native) |
| `react-native-web` | Web rendering layer |
| `@gorhom/bottom-sheet` | Sheets on mobile |
| `react-native-reanimated` | Core animation engine |
| `moti` | Declarative stagger animations |
| `@shopify/react-native-skia` | Particle canvas (native) |
| `react-native-svg` | Weather icons |
| `@react-native-community/netinfo` | Network connectivity |

## Setup

```bash
pnpm install
cp .env.example .env
# add your OpenWeatherMap key to .env

pnpm start          # Expo dev server
pnpm web            # Web dev server
pnpm build:web      # Export web bundle → dist/
pnpm expo run:ios   # Native iOS build
pnpm expo run:android # Native Android build
```

## Deployment

- **Web**: `pnpm build:web` → deploy `dist/` to Vercel (includes `vercel.json` for SPA routing)
- **Android APK**: EAS build → `eas build --platform android --profile preview`
- **iOS**: `pnpm expo run:ios` (requires Xcode)
