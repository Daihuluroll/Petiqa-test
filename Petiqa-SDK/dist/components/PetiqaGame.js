import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PetiqaApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { PetiqaProvider } from '../context/PetiqaContext';
import { HomeScreen, CreateNameScreen, PetSelectionScreen, MainGameScreen } from './screens';
const Stack = createStackNavigator();
export const PetiqaGame = ({ apiBaseUrl, theme, onExit, onSave, }) => {
    const apiService = new PetiqaApiService(apiBaseUrl);
    const storageService = new StorageService();
    return (_jsx(PetiqaProvider, { apiService: apiService, storageService: storageService, theme: theme, onExit: onExit, onSave: onSave, children: _jsx(NavigationContainer, { ...{ independent: true }, children: _jsxs(Stack.Navigator, { screenOptions: {
                    headerShown: false,
                }, children: [_jsx(Stack.Screen, { name: "Home", component: HomeScreen }), _jsx(Stack.Screen, { name: "CreateName", component: CreateNameScreen }), _jsx(Stack.Screen, { name: "PetSelection", component: PetSelectionScreen }), _jsx(Stack.Screen, { name: "MainGame", component: MainGameScreen })] }) }) }));
};
