import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, DATA_SOURCE_MODE} from '../../config';

export type DataSourceMode = 'local' | 'remote';

const MODE_STORAGE_KEY = '@petiqa/data-source-mode';
const DEFAULT_MODE: DataSourceMode = DATA_SOURCE_MODE ?? 'local';
const DEFAULT_BASE_URL = API_BASE_URL ?? 'http://10.0.2.2:3000';

let currentMode: DataSourceMode = DEFAULT_MODE;
let apiBaseUrl = DEFAULT_BASE_URL;

export const getDataSourceMode = (): DataSourceMode => currentMode;

export const isRemoteMode = (): boolean => currentMode === 'remote';

export const setDataSourceMode = async (
  mode: DataSourceMode,
  options: {persist?: boolean} = {},
): Promise<void> => {
  currentMode = mode;
  if (options.persist ?? true) {
    await AsyncStorage.setItem(MODE_STORAGE_KEY, mode);
  }
};

export const loadPersistedDataSourceMode = async (): Promise<DataSourceMode> => {
  try {
    const stored = await AsyncStorage.getItem(MODE_STORAGE_KEY);
    if (stored === 'local' || stored === 'remote') {
      currentMode = stored;
    }
  } catch (error) {
    console.warn('Unable to load stored data source mode', error);
  }

  return currentMode;
};

export const getApiBaseUrl = (): string => apiBaseUrl;

export const setApiBaseUrl = (url: string): void => {
  apiBaseUrl = url;
};

export const resetDataSourceMode = async (): Promise<void> => {
  currentMode = DEFAULT_MODE;
  await AsyncStorage.removeItem(MODE_STORAGE_KEY);
};

export const initializeDataSource = async (): Promise<DataSourceMode> => {
  apiBaseUrl = DEFAULT_BASE_URL;
  const storedMode = await loadPersistedDataSourceMode();
  currentMode = storedMode ?? DEFAULT_MODE;
  return currentMode;
};
