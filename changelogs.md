# Changelogs

## 2025-10-24 Step 1 - Scaffold migration
- Created initial src/app structure and moved the template App component there.
- Pointed index.js to src/app/App so upcoming migrations plug in cleanly.
- Verified the default React Native screen still renders as before.

## 2025-10-24 Step 2 - Port shared resources
- Copied legacy assets, components, and utilities into src to match the prior project layout.
- Migrated config.ts/config.js so existing imports resolve without edits.
- Confirmed files landed under src with original relative paths intact.

## 2025-10-24 Step 3 - Align dependencies and native assets
- Added navigation, storage, and gameplay library dependencies required by the migrated code.
- Registered font assets via react-native.config.js to match the legacy setup.
- Note: run `npm install` in PetiqaNext to refresh node_modules and package-lock.json.

## 2025-10-24 Step 4 - Move Petiqa app shell
- Replaced the placeholder App component with the legacy navigation-driven App from Petiqa-test.
- Ensured the gesture handler bootstrap runs before app registration in index.js.
- Ready for runtime validation of the migrated feature set.

## 2025-10-24 Step 5 - First bridged run
- Installed updated dependencies and rebuilt the Android app on the device.
- Confirmed the migrated shell launches without registration errors.
- Ready to iterate on feature verification and modernize configuration next.

## 2025-10-24 Step 6 - Legacy project comparison
- Documented why PetiqaNext runs while Petiqa-test stalls: RN 0.76 template vs 0.74 legacy stack.
- Noted Metro port mismatch (8081 vs 8082) and new-architecture toggle differences.
- Recorded older project prerequisites: `npm install`, `npm run start`, and `npx react-native run-android --port 8082`.

## 2025-10-24 Step 7 - TypeScript migration prep
- Catalogued the remaining `.js` utilities in `src/utils` and their consuming screens.
- Confirmed `config.js` and `GetEnergy.js` are unused so they can be removed or converted last.
- Ready to begin converting helpers to `.tsx` with typed props in the next step.

## 2025-10-24 Step 8 - Port shared helpers to TSX
- Converted DisplayCoin/DisplayPoint and CheckCoin/CheckPoint/CheckItem/CheckInsurance to `.tsx` with typed props.
- Ported `GetItem` to `.tsx` and removed unused view imports.
- Attempted `npx tsc --noEmit`; run blocked by missing backend dependencies, so TS gate deferred until those packages are restored.

## 2025-10-24 Step 9 - Convert remaining React utils
- Migrated `GetPetStatus`, `UseItem`, `PetStatus`, and `GetEnergy` to `.tsx` and added explicit prop/state types.
- Added typed status interval handling in `PetStatus` with guards for absent `oid`.
- Ready to tackle config cleanup next so TypeScript is the only runtime source format.

## 2025-10-24 Step 10 - Remove redundant config.js
- Deleted the unused `config.js` shim; `config.ts` remains the sole source for future environment settings.
- Confirmed there are no live imports of the JS version (only a commented reference in `App.tsx`).

## 2025-10-24 Step 11 - Enforce TypeScript gate
- Pointed tests at the new `src/app/App` entry and tightened `tsconfig.json` (`noImplicitAny`, `strictNullChecks`, backend exclusion).
- Added npm scripts `typecheck` and `verify` so CI/pre-commit flows can run ESLint plus `tsc --noEmit`.
- Verified `npx tsc --noEmit` now passes after excluding the backend project.

## 2025-10-24 Step 12 - Data source toggle + API client
- Introduced `src/config/dataSource.ts` + `src/services/petApiClient.ts` to switch between AsyncStorage and the Petiqa backend via `DATA_SOURCE_MODE`.
- `LocalDataManager` now proxies reads/writes through the selected mode, caching remote state while keeping legacy AsyncStorage keys (`petName`, `character`, `oid`).
- App onboarding calls `initializePetProfile` / `updateIdentity`, so creating or selecting a pet syncs with the API when remote mode is enabled.
