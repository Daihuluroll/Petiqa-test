import AsyncStorage from '@react-native-async-storage/async-storage';
import { PetData } from '../types';

export class StorageService {
  private readonly PET_DATA_KEY = '@petiqa:pet_data';
  private readonly PET_ID_KEY = '@petiqa:pet_id';

  async savePetData(data: PetData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PET_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      throw new Error('Failed to save pet data');
    }
  }

  async getPetData(): Promise<PetData | null> {
    try {
      const data = await AsyncStorage.getItem(this.PET_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      throw new Error('Failed to get pet data');
    }
  }

  async savePetId(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PET_ID_KEY, id);
    } catch (error) {
      throw new Error('Failed to save pet ID');
    }
  }

  async getPetId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.PET_ID_KEY);
    } catch (error) {
      throw new Error('Failed to get pet ID');
    }
  }

  async clearPetData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.PET_DATA_KEY, this.PET_ID_KEY]);
    } catch (error) {
      throw new Error('Failed to clear pet data');
    }
  }
}