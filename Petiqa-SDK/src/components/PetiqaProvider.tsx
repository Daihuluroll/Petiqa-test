import React from 'react';
import { PetiqaProvider as ContextProvider, PetiqaProviderProps as ContextProviderProps } from '../context/PetiqaContext';
import { PetiqaApiService } from '../services/api';
import { StorageService } from '../services/storage';

interface PetiqaProviderProps extends Omit<ContextProviderProps, 'apiService' | 'storageService'> {
  apiBaseUrl?: string;
  children: React.ReactNode;
}

/**
 * Convenience wrapper for PetiqaProvider that initializes the API and Storage services
 */
export const PetiqaProvider: React.FC<PetiqaProviderProps> = ({
  apiBaseUrl = 'http://localhost:3000',
  theme,
  onExit,
  onSave,
  children,
}) => {
  // Initialize services
  const apiService = new PetiqaApiService(apiBaseUrl);
  const storageService = new StorageService();

  return (
    <ContextProvider
      apiService={apiService}
      storageService={storageService}
      theme={theme}
      onExit={onExit}
      onSave={onSave}
    >
      {children}
    </ContextProvider>
  );
};
