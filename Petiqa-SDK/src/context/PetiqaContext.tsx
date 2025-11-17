import React, { createContext, useContext, useState, useEffect } from 'react';
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

export interface PetiqaProviderProps {
  apiService: PetiqaApiService;
  storageService: StorageService;
  theme?: PetiqaTheme;
  onExit?: () => void;
  onSave?: (gameState: PetData) => void;
  children: React.ReactNode;
}

const defaultTheme: PetiqaTheme = {
  primary: '#ffff00',
  secondary: '#000000',
  background: '#ffffff',
  text: '#000000',
  button: '#ffff00',
  buttonText: '#000000',
};

const PetiqaContext = createContext<PetiqaContextType | null>(null);

export const PetiqaProvider: React.FC<PetiqaProviderProps> = ({
  apiService,
  storageService,
  theme = defaultTheme,
  onExit,
  onSave,
  children,
}) => {
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPetData();
  }, []);

  const loadPetData = async () => {
    try {
      const data = await storageService.getPetData();
      if (data) {
        setPetData(data);
      }
    } catch (err) {
      setError('Failed to load pet data');
    } finally {
      setLoading(false);
    }
  };

  const updatePetStatus = async (status: Partial<PetData>) => {
    if (!petData) return;

    try {
      const updatedData = { ...petData, ...status };
      await storageService.savePetData(updatedData);
      setPetData(updatedData);
      if (onSave) {
        onSave(updatedData);
      }
    } catch (err) {
      setError('Failed to update pet status');
    }
  };

  const savePet = async (data: PetData) => {
    try {
      await storageService.savePetData(data);
      setPetData(data);
      if (onSave) {
        onSave(data);
      }
    } catch (err) {
      setError('Failed to save pet data');
    }
  };

  const exitGame = () => {
    if (onExit) {
      onExit();
    }
  };

  return (
    <PetiqaContext.Provider
      value={{
        petData,
        loading,
        error,
        theme,
        updatePetStatus,
        savePet,
        exitGame,
      }}
    >
      {children}
    </PetiqaContext.Provider>
  );
};

export const usePetiqa = () => {
  const context = useContext(PetiqaContext);
  if (!context) {
    throw new Error('usePetiqa must be used within a PetiqaProvider');
  }
  return context;
};