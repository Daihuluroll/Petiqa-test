import AsyncStorage from '@react-native-async-storage/async-storage';
export class StorageService {
    constructor() {
        this.PET_DATA_KEY = '@petiqa:pet_data';
        this.PET_ID_KEY = '@petiqa:pet_id';
    }
    async savePetData(data) {
        try {
            await AsyncStorage.setItem(this.PET_DATA_KEY, JSON.stringify(data));
        }
        catch (error) {
            throw new Error('Failed to save pet data');
        }
    }
    async getPetData() {
        try {
            const data = await AsyncStorage.getItem(this.PET_DATA_KEY);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            throw new Error('Failed to get pet data');
        }
    }
    async savePetId(id) {
        try {
            await AsyncStorage.setItem(this.PET_ID_KEY, id);
        }
        catch (error) {
            throw new Error('Failed to save pet ID');
        }
    }
    async getPetId() {
        try {
            return await AsyncStorage.getItem(this.PET_ID_KEY);
        }
        catch (error) {
            throw new Error('Failed to get pet ID');
        }
    }
    async clearPetData() {
        try {
            await AsyncStorage.multiRemove([this.PET_DATA_KEY, this.PET_ID_KEY]);
        }
        catch (error) {
            throw new Error('Failed to clear pet data');
        }
    }
}
