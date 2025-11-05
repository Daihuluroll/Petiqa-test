import axios from 'axios';
export class PetiqaApiService {
    constructor(baseUrl) {
        this.api = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async createPet(petName) {
        try {
            const response = await this.api.post('/petiqa/pet', {
                petName,
                initialStatus: {
                    energy: 100,
                    happiness: 100,
                    hunger: 100,
                    health: 100,
                },
                initialWallet: {
                    coins: 10000,
                    points: 1000,
                },
                initialInventory: {
                // Initial inventory items...
                },
            });
            return response.data.data._id;
        }
        catch (error) {
            throw new Error('Failed to create pet');
        }
    }
    async updatePetStatus(petId, status) {
        try {
            await this.api.patch(`/petiqa/pet/${petId}/status`, { status });
        }
        catch (error) {
            throw new Error('Failed to update pet status');
        }
    }
    async updateInventory(petId, inventory) {
        try {
            await this.api.patch(`/petiqa/pet/${petId}/inventory`, { inventory });
        }
        catch (error) {
            throw new Error('Failed to update inventory');
        }
    }
    async getPetData(petId) {
        try {
            const response = await this.api.get(`/petiqa/pet/${petId}`);
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to get pet data');
        }
    }
}
