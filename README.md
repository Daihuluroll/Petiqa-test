This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

# Petiqa Test

This repository contains the Petiqa host app, the Petiqa SDK, and the backend example used for testing and development.

This README consolidates the usable, up-to-date instructions from the project's internal docs so you can get the app running quickly.

## What this repository contains

- `Petiqa-SDK/` — The embeddable SDK (React Native + TypeScript) you can drop into a host app.
- `src/` — The host app (React Native) used to test the SDK integration.
- `Petiqa-Backend/` — Example backend code (Nest.js) used by the SDK during development.

## Quick start (Windows)

Prerequisites:
- Node.js >= 18
- Java JDK and Android SDK set up for React Native
- Yarn or npm installed

1) Install dependencies

```cmd
cd d:\repos\Petiqa-test
npm install
```

2) Start Metro in one terminal (NOTE: this project uses a non-default port)

We run Metro on port 8082 (not the default 8081) to avoid conflicts with other dev servers. Start Metro with:

```cmd
npx react-native start --port 8082
```

3) In a separate terminal build & install the Android app

By default the Android run command connects to the packager on 8081. If you started Metro on another port you must tell the native build which port to use. Two options:

- Simple (often works if Metro is already running):

```cmd
npx react-native run-android
```

- Explicit port (Windows cmd.exe):

```cmd
set RCT_METRO_PORT=8082 && npx react-native run-android
```

Or on PowerShell:

```powershell
$env:RCT_METRO_PORT=8082; npx react-native run-android
```

4) iOS (macOS only)

```bash
cd d:/repos/Petiqa-test/ios
pod install
cd ..
npx react-native run-ios
```

## Native modules used by this project

The SDK and host app use a few native modules. These must be present in the root `package.json` so React Native's autolinking registers their native views and modules:

- `@react-native-async-storage/async-storage` (storage)
- `react-native-fast-image` (fast native image view)
- `react-native-sound-player` (simple native sound API)
- `react-native-sensors` (accelerometer / sensors)
- `@react-native-community/slider` (native slider view)

If you add/remove native libraries, reinstall and rebuild the native app (see Troubleshooting).

## Troubleshooting

- If you see "NativeModule: AsyncStorage is null" or "requireNativeComponent ... was not found", run:

```cmd
cd d:\repos\Petiqa-test
npm install
npm start -- --reset-cache
cd android
gradlew.bat clean
cd ..
npx react-native run-android
```

- For iOS, after changing native deps run `pod install` in `ios/` and rebuild.

- If a native UI component (FastImageView, RNCSlider) is missing, confirm the package is in the root `package.json` and that `npm install` completed without errors. Then clean & rebuild the native project.

## Runtime safety and fallbacks

To keep the host app stable while native modules are being added or rebuilt, the codebase includes defensive guards around native calls (for example, SoundPlayer and sensors are checked before use). If a native module isn't linked the app will log a warning and keep running (features relying on the native module will be disabled until you rebuild).

## SDK integration notes

- The SDK exposes a main component you can mount in a host app. The host app in this repo demonstrates how to wrap the SDK with a `PetiqaProvider` and launch the SDK from a button in the host navigation.
- If you embed the SDK into an existing app, prefer adding the SDK as a screen in your navigation (so host app controls navigation). The SDK can also be run as a standalone app by rendering the SDK root component directly.

## Useful commands

- Build SDK (TypeScript -> dist): `cd Petiqa-SDK && npm run build`
- Start Metro (custom port example): `npx react-native start --port 8082`
- Android clean: `cd android && gradlew.bat clean`
- Rebuild Android: `npx react-native run-android` (or set `RCT_METRO_PORT` if Metro runs on a non-default port)

## If you get stuck

Paste the Metro or Gradle build logs into an issue and I can triage linking/build failures (common causes: missing pod install on iOS, Metro caching, or autolinking errors in Gradle).

---
This README was updated to include the working instructions from the project's internal docs and to keep the setup steps concise and actionable.
