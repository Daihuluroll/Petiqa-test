import { jsx as _jsx } from "react/jsx-runtime";
import { PetiqaProvider as ContextProvider } from '../context/PetiqaContext';
import { PetiqaApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { setRuntimeBaseUrl } from '../setupAxios';
import { baseUrl as packagedBaseUrl } from '../config';
/**
 * Convenience wrapper for PetiqaProvider that initializes the API and Storage services
 */
export const PetiqaProvider = ({ apiBaseUrl, theme, onExit, onSave, children, }) => {
    // Force the SDK to use the packaged emulator base URL so dist works standalone.
    const effectiveBaseUrl = packagedBaseUrl || apiBaseUrl || 'http://10.0.2.2:3000/';

    try {
        // set runtime axios logging base to the effective url
        setRuntimeBaseUrl(effectiveBaseUrl);
        // attempt to patch the config module's exported baseUrl so other modules importing it pick up the value
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const cfg = require('../config');
            if (cfg && typeof cfg === 'object' && 'baseUrl' in cfg) {
                cfg.baseUrl = effectiveBaseUrl;
            }
        }
        catch (e) {
            console.warn('[PetiqaProvider] could not patch config module at runtime:', e && e.message);
        }
    }
    catch (e) {
        // ignore
    }

    // Initialize services with the enforced effective base URL
    const apiService = new PetiqaApiService(effectiveBaseUrl);
    const storageService = new StorageService();
    return (_jsx(ContextProvider, { apiService: apiService, storageService: storageService, theme: theme, onExit: onExit, onSave: onSave, children: children }));
};
