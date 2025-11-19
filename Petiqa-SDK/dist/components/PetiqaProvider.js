import { jsx as _jsx } from "react/jsx-runtime";
import { PetiqaProvider as ContextProvider } from '../context/PetiqaContext';
import { PetiqaApiService } from '../services/api';
import { StorageService } from '../services/storage';
/**
 * Convenience wrapper for PetiqaProvider that initializes the API and Storage services
 */
export const PetiqaProvider = ({ apiBaseUrl = 'http://localhost:3000', theme, onExit, onSave, children, }) => {
    // Initialize services
    const apiService = new PetiqaApiService(apiBaseUrl);
    const storageService = new StorageService();
    return (_jsx(ContextProvider, { apiService: apiService, storageService: storageService, theme: theme, onExit: onExit, onSave: onSave, children: children }));
};
