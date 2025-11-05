import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const defaultTheme = {
    primary: '#ffff00',
    secondary: '#000000',
    background: '#ffffff',
    text: '#000000',
    button: '#ffff00',
    buttonText: '#000000',
};
const PetiqaContext = createContext(null);
export const PetiqaProvider = ({ apiService, storageService, theme = defaultTheme, onExit, onSave, children, }) => {
    const [petData, setPetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        loadPetData();
    }, []);
    const loadPetData = async () => {
        try {
            const data = await storageService.getPetData();
            if (data) {
                setPetData(data);
            }
        }
        catch (err) {
            setError('Failed to load pet data');
        }
        finally {
            setLoading(false);
        }
    };
    const updatePetStatus = async (status) => {
        if (!petData)
            return;
        try {
            const updatedData = { ...petData, ...status };
            await storageService.savePetData(updatedData);
            setPetData(updatedData);
            if (onSave) {
                onSave(updatedData);
            }
        }
        catch (err) {
            setError('Failed to update pet status');
        }
    };
    const savePet = async (data) => {
        try {
            await storageService.savePetData(data);
            setPetData(data);
            if (onSave) {
                onSave(data);
            }
        }
        catch (err) {
            setError('Failed to save pet data');
        }
    };
    const exitGame = () => {
        if (onExit) {
            onExit();
        }
    };
    return (_jsx(PetiqaContext.Provider, { value: {
            petData,
            loading,
            error,
            theme,
            updatePetStatus,
            savePet,
            exitGame,
        }, children: children }));
};
export const usePetiqa = () => {
    const context = useContext(PetiqaContext);
    if (!context) {
        throw new Error('usePetiqa must be used within a PetiqaProvider');
    }
    return context;
};
