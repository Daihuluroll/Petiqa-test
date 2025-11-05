import { PetData, PetStatus, Inventory } from '../types';
export declare class PetiqaApiService {
    private api;
    constructor(baseUrl: string);
    createPet(petName: string): Promise<string>;
    updatePetStatus(petId: string, status: PetStatus): Promise<void>;
    updateInventory(petId: string, inventory: Inventory): Promise<void>;
    getPetData(petId: string): Promise<PetData>;
}
