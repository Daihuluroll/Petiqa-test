// LocalDataManager.ts - Utility for managing pet data via local storage or API

import AsyncStorage from '@react-native-async-storage/async-storage';
import {isRemoteMode} from '../config/dataSource';
import type {PetData, PetStatus, PetWallet, InventoryItem} from '../types/pet';
import {
  createPetProfile as apiCreatePetProfile,
  fetchPetProfile,
  fetchInventory,
  fetchPetStatus,
  fetchWallet,
  incrementPetStatus as incrementRemotePetStatus,
  updateInventory as updateRemoteInventory,
  useInventoryItem as useRemoteInventoryItem,
  updatePetStatus as updateRemotePetStatus,
  updateWallet as updateRemoteWallet,
  updateIdentity as updateRemoteIdentity,
} from '../services/petApiClient';

const LOCAL_PET_DATA_KEY = 'petData';
const LOCAL_PET_ID_KEY = 'oid';
const LOCAL_PET_NAME_KEY = 'petName';
const LOCAL_PET_CHARACTER_KEY = 'character';

export type PetIdentity = {
  id: string;
  petName: string;
  character: string | null;
};

const DEFAULT_STATUS: PetStatus = {
  energy: 100,
  happiness: 100,
  hunger: 100,
  health: 100,
};

const DEFAULT_WALLET: PetWallet = {
  coins: 10000,
  points: 1000,
};

const normalizeLocalPetData = (petData: PetData | null): PetData | null => {
  if (!petData) {
    return null;
  }

  return {
    petName: petData.petName ?? 'Pet',
    character: petData.character ?? null,
    status: {
      ...DEFAULT_STATUS,
      ...(petData.status ?? {}),
    },
    wallet: {
      ...DEFAULT_WALLET,
      ...(petData.wallet ?? {}),
    },
    inventory: petData.inventory ?? {},
  };
};

const persistPetSnapshot = async (petData: PetData): Promise<void> => {
  const normalized = normalizeLocalPetData(petData);
  if (!normalized) {
    return;
  }

  await AsyncStorage.setItem(LOCAL_PET_DATA_KEY, JSON.stringify(normalized));
  await AsyncStorage.setItem(LOCAL_PET_NAME_KEY, normalized.petName);
  await AsyncStorage.setItem(
    LOCAL_PET_CHARACTER_KEY,
    normalized.character ?? '',
  );
};

const persistPetId = async (petId: string): Promise<void> => {
  await AsyncStorage.setItem(LOCAL_PET_ID_KEY, petId);
};

const getCachedPetData = async (): Promise<PetData | null> => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PET_DATA_KEY);
    if (raw) {
      return normalizeLocalPetData(JSON.parse(raw));
    }
  } catch (error) {
    console.error('Error reading cached pet data:', error);
  }
  return null;
};

// Get pet data from AsyncStorage or remote API
export const getPetData = async (): Promise<PetData | null> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return null;
      }
      const profile = await fetchPetProfile(petId);
      await persistPetSnapshot(profile);
      return profile;
    } catch (error) {
      console.error('Error fetching remote pet profile:', error);
      // Fall-through to local snapshot.
    }
  }

  return getCachedPetData();
};

// Update pet status
export const updatePetStatus = async (updates: Partial<PetStatus>): Promise<void> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return;
      }
      const status = await updateRemotePetStatus(petId, updates);
      const cached = await getCachedPetData();
      if (cached) {
        cached.status = status;
        await persistPetSnapshot(cached);
      }
      return;
    } catch (error) {
      console.error('Error updating remote pet status:', error);
      // Fall-through to local update.
    }
  }

  try {
    const petData = await getPetData();
    if (petData) {
      petData.status = { ...petData.status, ...updates };
      await persistPetSnapshot(petData);
    }
  } catch (error) {
    console.error('Error updating pet status:', error);
  }
};

// Adjust pet status (delta)
export const adjustPetStatus = async (deltas: Partial<PetStatus>): Promise<void> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return;
      }
      const status = await incrementRemotePetStatus(petId, deltas, 'tick');
      const cached = await getCachedPetData();
      if (cached) {
        cached.status = status;
        await persistPetSnapshot(cached);
      }
      return;
    } catch (error) {
      console.error('Error adjusting remote pet status:', error);
    }
  }

  try {
    const petData = await getPetData();
    if (petData) {
      petData.status.energy = Math.min(100, Math.max(0, petData.status.energy + (deltas.energy || 0)));
      petData.status.happiness = Math.min(100, Math.max(0, petData.status.happiness + (deltas.happiness || 0)));
      petData.status.hunger = Math.min(100, Math.max(0, petData.status.hunger + (deltas.hunger || 0)));
      petData.status.health = Math.min(100, Math.max(0, petData.status.health + (deltas.health || 0)));
      await persistPetSnapshot(petData);
    }
  } catch (error) {
    console.error('Error adjusting pet status:', error);
  }
};

// Update pet wallet
export const updatePetWallet = async (updates: { coins?: number; points?: number }): Promise<void> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return;
      }
      const wallet = await updateRemoteWallet(petId, updates);
      const cached = await getCachedPetData();
      if (cached) {
        cached.wallet = wallet;
        await persistPetSnapshot(cached);
      }
      return;
    } catch (error) {
      console.error('Error updating remote wallet:', error);
    }
  }

  try {
    const petData = await getPetData();
    if (petData) {
      if (updates.coins !== undefined) {
        petData.wallet.coins = updates.coins;
      }
      if (updates.points !== undefined) {
        petData.wallet.points = updates.points;
      }
      await persistPetSnapshot(petData);
    }
  } catch (error) {
    console.error('Error updating pet wallet:', error);
  }
};

// Update inventory item quantity
export const updateInventoryItem = async (itemName: string, quantity: number): Promise<void> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return;
      }
      const cached = await getCachedPetData();
      const currentQuantity = cached?.inventory[itemName]?.quantity ?? 0;
      const delta = quantity - currentQuantity;
      const inventory = await updateRemoteInventory(
        petId,
        [{item: itemName, delta}],
        `set ${itemName} quantity`,
      );
      if (cached) {
        cached.inventory = inventory;
        await persistPetSnapshot(cached);
      }
      return;
    } catch (error) {
      console.error('Error syncing remote inventory:', error);
    }
  }

  try {
    const petData = await getPetData();
    if (petData) {
      if (petData.inventory[itemName]) {
        petData.inventory[itemName].quantity = quantity;
      } else {
        // If item doesn't exist, add it (though this shouldn't happen in normal flow)
        petData.inventory[itemName] = { name: itemName, kind: 'misc', quantity };
      }
      await persistPetSnapshot(petData);
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
  }
};

// Adjust inventory item quantity (delta)
export const adjustInventoryItem = async (itemName: string, delta: number): Promise<void> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return;
      }
      const inventory = await updateRemoteInventory(
        petId,
        [{item: itemName, delta}],
        `adjust ${itemName}`,
      );
      const cached = await getCachedPetData();
      if (cached) {
        cached.inventory = inventory;
        await persistPetSnapshot(cached);
      }
      return;
    } catch (error) {
      console.error('Error adjusting remote inventory item:', error);
    }
  }

  try {
    const petData = await getPetData();
    if (petData) {
      if (!petData.inventory[itemName]) {
        // If item doesn't exist, initialize it
        petData.inventory[itemName] = { name: itemName, kind: 'misc', quantity: 0 };
      }
      petData.inventory[itemName].quantity = Math.max(0, petData.inventory[itemName].quantity + delta);
      await AsyncStorage.setItem(LOCAL_PET_DATA_KEY, JSON.stringify(petData));
    }
  } catch (error) {
    console.error('Error adjusting inventory item:', error);
  }
};

// Get specific status value
export const getPetStatusValue = async (key: keyof PetStatus): Promise<number> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return 0;
      }
      const status = await fetchPetStatus(petId);
      const cached = await getCachedPetData();
      if (cached) {
        cached.status = status;
        await persistPetSnapshot(cached);
      }
      return status[key] ?? 0;
    } catch (error) {
      console.error('Error getting remote pet status value:', error);
    }
  }

  try {
    const petData = await getPetData();
    return petData ? petData.status[key] : 0;
  } catch (error) {
    console.error('Error getting pet status value:', error);
    return 0;
  }
};

// Get wallet value
export const getWalletValue = async (key: 'coins' | 'points'): Promise<number> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return 0;
      }
      const wallet = await fetchWallet(petId);
      const cached = await getCachedPetData();
      if (cached) {
        cached.wallet = wallet;
        await persistPetSnapshot(cached);
      }
      return wallet[key] ?? 0;
    } catch (error) {
      console.error('Error getting remote wallet value:', error);
    }
  }

  try {
    const petData = await getPetData();
    return petData ? petData.wallet[key] : 0;
  } catch (error) {
    console.error('Error getting wallet value:', error);
    return 0;
  }
};

// Get inventory item quantity
export const getInventoryItemQuantity = async (itemName: string): Promise<number> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return 0;
      }
      const inventory = await fetchInventory(petId, [itemName]);
      const petData = await getPetData();
      if (petData) {
        petData.inventory = {...petData.inventory, ...inventory};
        await persistPetSnapshot(petData);
      }
      return inventory[itemName]?.quantity ?? 0;
    } catch (error) {
      console.error('Error getting remote inventory item quantity:', error);
    }
  }

  try {
    const petData = await getPetData();
    return petData && petData.inventory[itemName] ? petData.inventory[itemName].quantity : 0;
  } catch (error) {
    console.error('Error getting inventory item quantity:', error);
    return 0;
  }
};

export const initializePetProfile = async (petData: PetData): Promise<string | null> => {
  const normalized = normalizeLocalPetData(petData);
  if (!normalized) {
    return null;
  }

  if (isRemoteMode()) {
    try {
      const profile = await apiCreatePetProfile({
        petName: normalized.petName,
        character: normalized.character ?? null,
        initialStatus: normalized.status,
        initialWallet: normalized.wallet,
        initialInventory: normalized.inventory,
      });
      await persistPetSnapshot(profile);
      await persistPetId(profile.id);
      return profile.id;
    } catch (error) {
      console.error('Error creating remote pet profile:', error);
      return null;
    }
  }

  const localId = `local-pet-${Date.now()}`;
  await persistPetSnapshot(normalized);
  await persistPetId(localId);
  return localId;
};

export const savePetIdentity = async (
  identity: PetIdentity,
  persistMode = true,
): Promise<void> => {
  await persistPetId(identity.id);
  await persistPetSnapshot({
    petName: identity.petName,
    character: identity.character,
    status: DEFAULT_STATUS,
    wallet: DEFAULT_WALLET,
    inventory: {},
  });
};

export const getPetIdentity = async (): Promise<PetIdentity | null> => {
  const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
  if (!petId) {
    return null;
  }
  const cached = await getCachedPetData();
  const petName =
    cached?.petName ??
    (await AsyncStorage.getItem(LOCAL_PET_NAME_KEY)) ??
    'Pet';
  const characterValue =
    cached?.character ??
    (await AsyncStorage.getItem(LOCAL_PET_CHARACTER_KEY));
  const character = characterValue && characterValue.length > 0 ? characterValue : null;
  return {id: petId, petName, character};
};

export const useInventoryItem = async (itemName: string): Promise<void> => {
  if (isRemoteMode()) {
    try {
      const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
      if (!petId) {
        return;
      }
      const inventory = await useRemoteInventoryItem(petId, itemName);
      const petData = await getPetData();
      if (petData) {
        petData.inventory = inventory;
        await AsyncStorage.setItem(LOCAL_PET_DATA_KEY, JSON.stringify(petData));
      }
      return;
    } catch (error) {
      console.error('Error using remote inventory item:', error);
    }
  }

  await adjustInventoryItem(itemName, -1);
};

export const updateIdentity = async (petName: string, character: string | null): Promise<void> => {
  const petId = await AsyncStorage.getItem(LOCAL_PET_ID_KEY);
  if (isRemoteMode() && petId) {
    try {
      await updateRemoteIdentity(petId, {petName, character});
    } catch (error) {
      console.error('Error updating remote pet identity:', error);
    }
  }
  await AsyncStorage.setItem(LOCAL_PET_NAME_KEY, petName);
  await AsyncStorage.setItem(LOCAL_PET_CHARACTER_KEY, character ?? '');
  const petData = await getPetData();
  if (petData) {
    petData.petName = petName;
    petData.character = character;
    await AsyncStorage.setItem(LOCAL_PET_DATA_KEY, JSON.stringify(petData));
  }
};
