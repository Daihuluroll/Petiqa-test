// Core exports
export { PetiqaGame } from './components/game/PetiqaGame';
export { PetiqaProvider } from './components/PetiqaProvider';
export { PetiqaApiService } from './services/api';
export { StorageService } from './services/storage';
export { usePetiqa } from './context/PetiqaContext';

// Component exports
export { default as Achievement } from './components/Achievement';
export { default as Activities } from './components/Activities';
export { default as Cycling } from './components/Cycling';
export { default as Farming } from './components/Farming';
export { default as Fishing } from './components/Fishing';
export { default as Gym } from './components/Gym';
export { default as Hollywood } from './components/Hollywood';
export { default as InventoryComponent } from './components/Inventory';
export { default as MainGame } from './components/MainGame';
export { default as Osaka } from './components/Osaka';
export { default as Quiz } from './components/Quiz';
export { default as Running } from './components/Running';
export { default as StepCounter } from './components/StepCounter';
export { default as Store } from './components/Store';
export { default as Task } from './components/Task';
export { default as Travelling } from './components/Travelling';
export { default as Weightlifting } from './components/Weightlifting';

// Utility exports
export * from './utils/AchievementManager';
export * from './utils/TaskManager';
export { default as CheckCoin } from './utils/CheckCoin';
export { default as CheckInsurance } from './utils/CheckInsurance';
export { default as CheckItem } from './utils/CheckItem';
export { default as CheckPoint } from './utils/CheckPoint';
export { default as DisplayCoin } from './utils/DisplayCoin';
export { default as DisplayPoint } from './utils/DisplayPoint';
export { default as GetEnergy } from './utils/GetEnergy';
export { default as GetItem } from './utils/GetItem';
export { default as GetPetStatus } from './utils/GetPetStatus';
export { default as PetStatusUtil } from './utils/PetStatus';
export { default as UseItem } from './utils/UseItem';
export * from './utils/sharedData';

// Config export
export { baseUrl } from './config';

// Type exports
export type {
  PetData,
  PetStatus,
  Inventory,
  InventoryItem,
  Wallet,
  PetiqaTheme,
  PetiqaSDKConfig,
} from './types';