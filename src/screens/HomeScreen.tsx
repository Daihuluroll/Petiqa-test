import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePetiqa } from 'petiqa-sdk';

type RootStackParamList = {
  Home: undefined;
  SDKTest: undefined;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = usePetiqa();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>Welcome to your App</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('SDKTest')}
        style={[styles.button, { backgroundColor: theme.button }]}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Open Petiqa SDK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
