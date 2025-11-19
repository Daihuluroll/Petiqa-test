import { PetData } from '../types';
export declare class StorageService {
    private readonly PET_DATA_KEY;
    private readonly PET_ID_KEY;
    private checkAsyncStorage;
    savePetData(data: PetData): Promise<void>;
    getPetData(): Promise<PetData | null>;
    savePetId(id: string): Promise<void>;
    getPetId(): Promise<string | null>;
    clearPetData(): Promise<void>;
}
