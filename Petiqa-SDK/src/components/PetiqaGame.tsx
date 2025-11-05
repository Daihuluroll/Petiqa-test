import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PetiqaSDKConfig } from '../types';
import { PetiqaApiService } from '../services/api';
import { StorageService } from '../services/storage';
import { PetiqaProvider } from '../context/PetiqaContext';
import { HomeScreen, CreateNameScreen, PetSelectionScreen, MainGameScreen } from './screens';

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  CreateName: undefined;
  PetSelection: { petName: string };
  MainGame: { petName: string; character: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const PetiqaGame: React.FC<PetiqaSDKConfig> = ({ apiBaseUrl, theme, onExit, onSave }) => {
  const apiService = new PetiqaApiService(apiBaseUrl);
  const storageService = new StorageService();

  return (
    <PetiqaProvider apiService={apiService} storageService={storageService} theme={theme} onExit={onExit} onSave={onSave}>
      <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateName" component={CreateNameScreen} />
          <Stack.Screen name="PetSelection" component={PetSelectionScreen} />
          <Stack.Screen name="MainGame" component={MainGameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PetiqaProvider>
  );
};
