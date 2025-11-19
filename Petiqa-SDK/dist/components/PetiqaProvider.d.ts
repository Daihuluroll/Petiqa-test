import React from 'react';
import { PetiqaProviderProps as ContextProviderProps } from '../context/PetiqaContext';
interface PetiqaProviderProps extends Omit<ContextProviderProps, 'apiService' | 'storageService'> {
    apiBaseUrl?: string;
    children: React.ReactNode;
}
/**
 * Convenience wrapper for PetiqaProvider that initializes the API and Storage services
 */
export declare const PetiqaProvider: React.FC<PetiqaProviderProps>;
export {};
