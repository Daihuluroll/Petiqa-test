import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { usePetiqa } from '../context/PetiqaContext';
import { RootStackParamList } from './game/PetiqaGame'; // ✅ now works because the type is exported

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;
type CreateNameScreenProps = StackScreenProps<RootStackParamList, 'CreateName'>;
type PetSelectionScreenProps = StackScreenProps<RootStackParamList, 'PetSelection'>;
type MainGameScreenProps = StackScreenProps<RootStackParamList, 'MainGame'>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { theme } = usePetiqa();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>PeTiQa</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => navigation.navigate('CreateName')}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Play</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CreateNameScreen: React.FC<CreateNameScreenProps> = ({ navigation }) => {
  const [petName, setPetName] = useState('');
  const { theme } = usePetiqa();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>Create Pet Name</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => navigation.navigate('PetSelection', { petName })}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export const PetSelectionScreen: React.FC<PetSelectionScreenProps> = ({ navigation, route }) => {
  const { petName } = route.params;
  const { theme } = usePetiqa();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>Select Pet</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.button }]}
        onPress={() => navigation.navigate('MainGame', { petName, character: 'Tiger' })}
      >
        <Text style={[styles.buttonText, { color: theme.buttonText }]}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export const MainGameScreen: React.FC<MainGameScreenProps> = ({ route }) => {
  const { petName, character } = route.params;
  const { theme } = usePetiqa();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.headerText, { color: theme.text }]}>
        Welcome {petName} the {character}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: 24, marginBottom: 20 },
  button: { padding: 10, borderRadius: 5, marginTop: 10 },
  buttonText: { fontSize: 16 },
});
