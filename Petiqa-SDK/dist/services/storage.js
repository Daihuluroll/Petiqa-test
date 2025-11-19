import AsyncStorage from '@react-native-async-storage/async-storage';
export class StorageService {
    constructor() {
        this.PET_DATA_KEY = '@petiqa:pet_data';
        this.PET_ID_KEY = '@petiqa:pet_id';
    }
    checkAsyncStorage() {
        if (!AsyncStorage) {
            throw new Error('[@RNC/AsyncStorage]: NativeModule not linked. ' +
                'Make sure @react-native-async-storage/async-storage is in your package.json ' +
                'and you have run: npm install && npm start --reset-cache');
        }
    }
    async savePetData(data) {
        try {
            this.checkAsyncStorage();
            await AsyncStorage.setItem(this.PET_DATA_KEY, JSON.stringify(data));
        }
        catch (error) {
            throw new Error(`Failed to save pet data: ${error}`);
        }
    }
    async getPetData() {
        try {
            this.checkAsyncStorage();
            const data = await AsyncStorage.getItem(this.PET_DATA_KEY);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            throw new Error(`Failed to get pet data: ${error}`);
        }
    }
    async savePetId(id) {
        try {
            this.checkAsyncStorage();
            await AsyncStorage.setItem(this.PET_ID_KEY, id);
        }
        catch (error) {
            throw new Error(`Failed to save pet ID: ${error}`);
        }
    }
    async getPetId() {
        try {
            this.checkAsyncStorage();
            return await AsyncStorage.getItem(this.PET_ID_KEY);
        }
        catch (error) {
            throw new Error(`Failed to get pet ID: ${error}`);
        }
    }
    async clearPetData() {
        try {
            this.checkAsyncStorage();
            await AsyncStorage.multiRemove([this.PET_DATA_KEY, this.PET_ID_KEY]);
        }
        catch (error) {
            throw new Error(`Failed to clear pet data: ${error}`);
        }
    }
}
