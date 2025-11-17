import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PetiqaGame } from '../../Petiqa-SDK/src';

type RootStackParamList = {
  Home: undefined;
  SDKTest: undefined;
};

type SDKTestScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SDKTest'>;
};

const SDKTestScreen: React.FC<SDKTestScreenProps> = ({ navigation }) => {
  const theme = {
    background: '#FFFFFF',
    text: '#000000',
    button: '#4CAF50',
    buttonText: '#FFFFFF',
    primary: '#4CAF50',
    secondary: '#2196F3',
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>
          Petiqa SDK Test
        </Text>

        <View style={styles.content}>
          <PetiqaGame
            apiBaseUrl="http://localhost:3000"
            theme={theme}
            onExit={() => navigation.navigate('Home')}
            onSave={(data) => console.log('Saved data:', data)}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  content: { flex: 1 },
});

export default SDKTestScreen;
