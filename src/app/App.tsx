// App.tsx (host app) — wrap root with SafeAreaProvider
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import SDKTestScreen from '../screens/SDKTestScreen';

// IMPORTANT: import your provider
import { PetiqaProvider } from '../../Petiqa-SDK/src/components/PetiqaProvider';

export type RootStackParamList = {
  Home: undefined;
  SDKTest: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <PetiqaProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#4CAF50' },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen 
              name="SDKTest" 
              component={SDKTestScreen} 
              options={{ title: 'Petiqa SDK' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PetiqaProvider>
  );
};

export default App;
