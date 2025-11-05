import React from 'react';
import { PetiqaApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { PetData, PetiqaTheme } from '../types';
interface PetiqaContextType {
    petData: PetData | null;
    loading: boolean;
    error: string | null;
    theme: PetiqaTheme;
    updatePetStatus: (status: Partial<PetData>) => Promise<void>;
    savePet: (petData: PetData) => Promise<void>;
    exitGame: () => void;
}
interface PetiqaProviderProps {
    apiService: PetiqaApiService;
    storageService: StorageService;
    theme?: PetiqaTheme;
    onExit?: () => void;
    onSave?: (gameState: PetData) => void;
    children: React.ReactNode;
}
export declare const PetiqaProvider: React.FC<PetiqaProviderProps>;
export declare const usePetiqa: () => PetiqaContextType;
export {};
