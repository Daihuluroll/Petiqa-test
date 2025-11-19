import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PetiqaGame } from '../../Petiqa-SDK/dist';

type RootStackParamList = {
  Home: undefined;
  SDKTest: undefined;
};

type SDKTestScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SDKTest'>;
};

const SDKTestScreen: React.FC<SDKTestScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.headerText}>
          Petiqa SDK Test
        </Text>

        <View style={styles.content}>
          <PetiqaGame
            userId="test-user"
            apiBaseUrl="http://localhost:3000"
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  headerText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginVertical: 20,
    color: '#000000'
  },
  content: { flex: 1 },
});

export default SDKTestScreen;
