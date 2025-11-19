# Petiqa SDK

A complete, standalone React Native + TypeScript game SDK that you can embed in any React Native host app.

## What's in the SDK

The SDK provides:
- **20+ game screens** (MainGame, Quiz, Store, Inventory, Achievement tracking, mini-games: Fishing, Gym, Running, Cycling, Farming, Weightlifting, Travelling, Hollywood, Osaka, etc.)
- **Complete game logic** (pet management, coin/point economy, inventory, achievements, daily tasks)
- **Network API integration** (async calls to backend for pet status, wallet, inventory, quiz)
- **Storage management** (AsyncStorage for persisting game state)
- **Native sensor support** (accelerometer for step counting)
- **Audio & animation** (sound playback, fast image rendering, smooth transitions)
- **Self-contained routing** (internal navigation stack, no host app setup needed)

## Installation

### As an npm package (published)
```bash
npm install petiqa-sdk
```

### From this repo (local development)
```bash
npm install ./Petiqa-SDK
```

## Quick Start

### Simplest Usage

Wrap your app with `PetiqaProvider` and render the main game component:

```typescript
import { PetiqaProvider, PetiqaGame } from 'petiqa-sdk';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <PetiqaProvider>
      <SafeAreaProvider>
        <PetiqaGame userId="user-123" />
      </SafeAreaProvider>
    </PetiqaProvider>
  );
}
```

That's it. The full game runs immediately with navigation, state, and API integration included.

### Customization

Pass optional props to configure the SDK:

```typescript
<PetiqaGame
  userId="user-123"                    // Required: unique user identifier
  apiUrl="http://your-backend:3000"    // Optional: backend base URL (default: Android emulator local)
  petName="Fluffy"                     // Optional: initial pet name
  character="Koala"                    // Optional: 'Koala' or 'Tiger'
/>
```

### Backend API Requirements

Your backend must implement these endpoints (used by the SDK):

```
POST   /petiqa/pet                           # Create new pet
GET    /petiqa/pet/{userId}/wallet           # Get coins/points
PATCH  /petiqa/pet/{userId}/wallet           # Update coins/points
GET    /petiqa/pet/{userId}/inventory        # Get inventory items
PATCH  /petiqa/pet/{userId}/inventory        # Update inventory
GET    /petiqa/quiz                          # Fetch quiz questions
```

See `Petiqa-Backend/` folder for example Nest.js implementation.

## Architecture

### Independence

The SDK is completely **standalone** and independent:
- ✅ All imports are relative (stay within SDK)
- ✅ No dependencies on host app code
- ✅ Assets are bundled
- ✅ Config is centralized and overridable
- ✅ Navigation is self-contained
- ✅ Storage and state are self-initialized

This means you can:
- Drop it into any React Native app
- Install from npm or local folder
- Use it without any setup beyond `import` and `render`
- Change the backend URL without recompiling

### Native Modules

The SDK uses these native React Native libraries (already declared as dependencies in `package.json`):

- `@react-native-async-storage/async-storage` — Persistent storage
- `react-native-fast-image` — Fast native image rendering
- `react-native-sound-player` — Audio playback
- `react-native-sensors` — Accelerometer (step counter)
- `@react-native-community/slider` — Native slider component
- `@react-navigation/native` & `@react-navigation/stack` — Navigation

All native modules are pre-configured and auto-linked when the SDK is installed. For local development, ensure these are installed in the host app's `package.json`.

### Component Structure

```
src/
├── components/
│   ├── game/
│   │   └── PetiqaGame.tsx              # Main entry point (creates navigation)
│   ├── MainGame.tsx                    # Game home screen
│   ├── Store.tsx                       # Shop
│   ├── Inventory.tsx                   # Item management
│   ├── Achievement.tsx                 # Achievement tracker
│   ├── Activities.tsx                  # Activity hub
│   ├── Quiz.tsx                        # Daily quiz
│   ├── Task.tsx                        # Task management
│   ├── Gym.tsx                         # Gym mini-game
│   ├── StepCounter.tsx                 # Accelerometer-based step counter
│   ├── Fishing.tsx, Farming.tsx, ...   # Other mini-games
│   └── PetiqaProvider.tsx              # Context provider for SDK
├── context/
│   └── PetiqaContext.tsx               # Game state & API context
├── services/
│   ├── api.ts                          # API client (axios)
│   └── storage.ts                      # AsyncStorage wrapper
├── types/
│   └── index.ts                        # TypeScript types
├── utils/
│   ├── AchievementManager.tsx          # Achievement logic
│   ├── TaskManager.tsx                 # Task completion tracking
│   ├── CheckCoin.js, CheckPoint.js     # Utility functions
│   └── sharedData.ts                   # Item definitions, data arrays
├── config.ts                           # Centralized config (baseUrl)
└── index.ts                            # Public API exports
```

### Public API

All exports from the SDK (via `index.ts`):

```typescript
// Main component
export { PetiqaGame } from './components/game/PetiqaGame';

// Provider
export { PetiqaProvider } from './components/PetiqaProvider';

// Context hook
export { usePetiqa } from './context/PetiqaContext';

// Individual components (if you want to use them standalone)
export { default as Fishing } from './components/Fishing';
export { default as Farming } from './components/Farming';
export { default as Quiz } from './components/Quiz';
export { default as Store } from './components/Store';
export { default as Inventory } from './components/Inventory';
// ... (40+ exports)

// Utilities
export { incrementAppOpenCount, checkBackInShapeAchievement } from './utils/AchievementManager';
export { completeTask } from './utils/TaskManager';

// Data
export { foodItems, toyItems, insuranceItems, cosmeticsItems } from './utils/sharedData';

// Types
export type { PetData, PetiqaTheme } from './types';
export { baseUrl } from './config';
```

## Development

### Build the SDK

TypeScript source in `src/` compiles to JavaScript in `dist/`:

```bash
cd Petiqa-SDK
npm run build
```

This generates:
```
dist/
├── index.js
├── index.d.ts            # TypeScript types
├── components/
├── services/
├── utils/
├── config.js
└── ... (all compiled files)
```

### Testing in the Host App

This repo includes a host app (`src/`) that tests the SDK. To run:

```bash
# From root of repo
npm install
npx react-native start --port 8082

# In another terminal
set RCT_METRO_PORT=8082 && npx react-native run-android
# (or: npx react-native run-ios on macOS)
```

See root `README.md` for full setup instructions.

## Troubleshooting

### Native Module Errors

If you see "NativeModule not found" or "requireNativeComponent ... not found":

1. Ensure the package is in `package.json` (host app's or SDK's `peerDependencies` / `dependencies`)
2. Run `npm install`
3. Clear Metro cache: `npm start -- --reset-cache`
4. Clean and rebuild native app:
   ```bash
   cd android
   gradlew.bat clean
   cd ..
   npx react-native run-android
   ```
5. For iOS: run `pod install` in `ios/` folder

### AsyncStorage Errors

If "AsyncStorage is null":
- Ensure `@react-native-async-storage/async-storage` is in host app's `package.json`
- Run `npm install` and rebuild

### Slider / FastImage / SoundPlayer not found

- Confirm `@react-native-community/slider`, `react-native-fast-image`, `react-native-sound-player` are in `package.json`
- Run `npm install`
- Clean and rebuild native project

## Configuration

### Change Backend URL

The SDK uses a centralized `config.ts` for the backend URL:

```typescript
// Petiqa-SDK/src/config.ts
export const baseUrl = "http://10.0.2.2:3000/";  // Default for Android emulator
```

To override for a specific host app:

**Option 1: Override in host app before importing SDK**
```typescript
import { baseUrl } from 'petiqa-sdk/src/config';
// Not recommended; breaks encapsulation
```

**Option 2: Pass `apiUrl` prop (recommended)**
```typescript
<PetiqaGame userId="user-123" apiUrl="http://your-server:3000" />
```

The prop method is safer and recommended.

## Runtime Safety

The SDK includes defensive guards around native function calls. If a native module is missing, the app will:
1. Log a clear warning to console
2. Continue running (features that rely on the native module are disabled)
3. Allow other parts of the game to work normally

This keeps the app stable while native modules are being added or rebuilt.

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript → JavaScript (in dist/) |
| `npm run test` | Run Jest tests (if configured) |
| `npm start -- --reset-cache` | Start Metro, clear cache |
| `gradlew.bat clean` | Clean Android build (call from `android/` folder) |
| `pod install` | Install iOS CocoaPods (call from `ios/` folder) |

## What Happens When You Use the SDK

When the host app renders `<PetiqaGame userId="user-123" />`:

1. **Provider Initializes** — `PetiqaProvider` creates API and storage services
2. **Navigation Starts** — `PetiqaGame` creates internal `NavigationContainer` with 20+ routes
3. **Storage Loads** — AsyncStorage retrieves pet data (or creates new pet)
4. **API Calls** — Fetches pet status, wallet, inventory from backend
5. **Screens Render** — Navigation stack displays screens (Home → PetSelection → MainGame → etc.)
6. **All Features Available** — Mini-games, store, achievements, tasks all ready to use

No additional setup needed.

## Publishing to npm

When publishing the SDK to npm:

1. Ensure `dist/` is built: `npm run build`
2. Update version in `package.json`
3. Run: `npm publish`

Only `dist/`, `assets/`, and `package.json` are published (as defined in `package.json`'s `files` field). Source TypeScript files are not published.

## Questions?

Refer to the main project `README.md` at the root for:
- Host app setup & testing
- Running both Metro and the native build
- Port configuration (port 8082)
- Troubleshooting build issues

---

**SDK Status:** Production-ready. Fully independent and tested.

