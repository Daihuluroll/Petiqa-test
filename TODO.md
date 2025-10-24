# TODO: Switch to Local Storage (Disable Backend)

## Plan Overview
- Remove baseUrl dependency from config files.
- Modify App.tsx to store initial pet data locally instead of posting to backend.
- Create local data management utilities (get/update pet data, wallet, inventory).
- Replace all axios calls in utilities and components with AsyncStorage operations.
- Maintain data structure consistency for status, wallet, and inventory.

## Dependent Files to be Edited
- config.js, config.ts
- src/app/App.tsx
- Utilities: GetPetStatus.js, PetStatus.js, CheckCoin.js, CheckPoint.js, DisplayCoin.js, DisplayPoint.js, GetEnergy.js, GetItem.js, UseItem.js, CheckInsurance.js, CheckItem.js
- Components: Store.tsx, Task.tsx, Quiz.tsx, Travelling.tsx, Gym.tsx, Hollywood.tsx, Osaka.tsx, Fishing.tsx, Farming.tsx, Inventory.tsx, Achievement.tsx

## Steps
- [ ] Step 1: Update config files to remove baseUrl
- [ ] Step 2: Modify App.tsx for local pet data storage
- [ ] Step 3: Create local data management utilities
- [ ] Step 4: Update utilities to use AsyncStorage
- [ ] Step 5: Update components to use AsyncStorage (Store, Task, Quiz, Travelling)
- [ ] Step 6: Update additional components (Gym, Hollywood, Osaka, Fishing, Farming, Inventory, Achievement)
- [ ] Step 7: Test data persistence and offline functionality
- [ ] Step 8: Add error handling for AsyncStorage failures
