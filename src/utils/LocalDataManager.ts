// LocalDataManager.ts - Utility for managing local pet data with AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PetStatus {
  energy: number;
  happiness: number;
  hunger: number;
  health: number;
}

export interface PetWallet {
  coins: number;
  points: number;
}

export interface InventoryItem {
  name: string;
  kind: string;
  quantity: number;
}

export interface PetData {
  petName: string;
  status: PetStatus;
  wallet: PetWallet;
  inventory: { [key: string]: InventoryItem };
}

// Get pet data from AsyncStorage
export const getPetData = async (): Promise<PetData | null> => {
  try {
    const data = await AsyncStorage.getItem('petData');
    if (data) {
      const parsedData = JSON.parse(data);
      // Ensure the data structure is correct
      if (!parsedData.status) {
        parsedData.status = { energy: 100, happiness: 100, hunger: 100, health: 100 };
      }
      if (!parsedData.wallet) {
        parsedData.wallet = { coins: 10000, points: 1000 };
      }
      if (!parsedData.inventory) {
        parsedData.inventory = {};
      }
      return parsedData;
    }
    return null;
  } catch (error) {
    console.error('Error getting pet data:', error);
    return null;
  }
};

// Update pet status
export const updatePetStatus = async (updates: Partial<PetStatus>): Promise<void> => {
  try {
    const petData = await getPetData();
    if (petData) {
      petData.status = { ...petData.status, ...updates };
      await AsyncStorage.setItem('petData', JSON.stringify(petData));
    }
  } catch (error) {
    console.error('Error updating pet status:', error);
  }
};

// Adjust pet status (delta)
export const adjustPetStatus = async (deltas: Partial<PetStatus>): Promise<void> => {
  try {
    const petData = await getPetData();
    if (petData) {
      petData.status.energy = Math.min(100, Math.max(0, petData.status.energy + (deltas.energy || 0)));
      petData.status.happiness = Math.min(100, Math.max(0, petData.status.happiness + (deltas.happiness || 0)));
      petData.status.hunger = Math.min(100, Math.max(0, petData.status.hunger + (deltas.hunger || 0)));
      petData.status.health = Math.min(100, Math.max(0, petData.status.health + (deltas.health || 0)));
      await AsyncStorage.setItem('petData', JSON.stringify(petData));
    }
  } catch (error) {
    console.error('Error adjusting pet status:', error);
  }
};

// Update pet wallet
export const updatePetWallet = async (updates: { coins?: number; points?: number }): Promise<void> => {
  try {
    const petData = await getPetData();
    if (petData) {
      if (updates.coins !== undefined) {
        petData.wallet.coins = updates.coins;
      }
      if (updates.points !== undefined) {
        petData.wallet.points = updates.points;
      }
      await AsyncStorage.setItem('petData', JSON.stringify(petData));
    }
  } catch (error) {
    console.error('Error updating pet wallet:', error);
  }
};

// Update inventory item quantity
export const updateInventoryItem = async (itemName: string, quantity: number): Promise<void> => {
  try {
    const petData = await getPetData();
    if (petData) {
      if (petData.inventory[itemName]) {
        petData.inventory[itemName].quantity = quantity;
      } else {
        // If item doesn't exist, add it (though this shouldn't happen in normal flow)
        petData.inventory[itemName] = { name: itemName, kind: 'misc', quantity };
      }
      await AsyncStorage.setItem('petData', JSON.stringify(petData));
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
  }
};

// Adjust inventory item quantity (delta)
export const adjustInventoryItem = async (itemName: string, delta: number): Promise<void> => {
  try {
    const petData = await getPetData();
    if (petData) {
      if (!petData.inventory[itemName]) {
        // If item doesn't exist, initialize it
        petData.inventory[itemName] = { name: itemName, kind: 'misc', quantity: 0 };
      }
      petData.inventory[itemName].quantity = Math.max(0, petData.inventory[itemName].quantity + delta);
      await AsyncStorage.setItem('petData', JSON.stringify(petData));
    }
  } catch (error) {
    console.error('Error adjusting inventory item:', error);
  }
};

// Get specific status value
export const getPetStatusValue = async (key: keyof PetStatus): Promise<number> => {
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
  try {
    const petData = await getPetData();
    return petData && petData.inventory[itemName] ? petData.inventory[itemName].quantity : 0;
  } catch (error) {
    console.error('Error getting inventory item quantity:', error);
    return 0;
  }
};
