import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MainGame from '../components/MainGame';
import Store from '../components/Store';
import Inventory from '../components/Inventory';
import Achievement from '../components/Achievement';
import Activities from '../components/Activities';
import Quiz from '../components/Quiz';
import Task from '../components/Task';
import Gym from '../components/Gym';
import StepCounter from '../components/StepCounter';
import WeightliftingScreen from '../components/Weightlifting';
import RunningScreen from '../components/Running';
import CyclingScreen from '../components/Cycling';
import FarmingScreen from '../components/Farming';
import FishingScreen from '../components/Fishing';
import TravellingScreen from '../components/Travelling';
import HollywoodScreen from '../components/Hollywood';
import OsakaScreen from '../components/Osaka';


// Define the types for the navigation parameters
type RootStackParamList = {
  Home: undefined;
  CreateName: undefined;
  PetSelection: { petName: string };
  MainGame: { petName: string; character: string };
  Store: undefined;
  Inventory: undefined;
  Achievement: undefined;
  Activities: undefined;
  Quiz: undefined;
  Task: undefined;
  Gym: undefined;
  StepCounter: undefined;
  Travelling: undefined;
  Weightlifting: undefined;
  Running: undefined;
  Cycling: undefined;
  Farming: undefined;
  Fishing: undefined;
  Hollywood: { location: string; character: string };
  Osaka: { location: string; character: string };
};

// Define types for each screen's props
type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;
type CreateNameProps = StackScreenProps<RootStackParamList, 'CreateName'>;
type PetSelectionProps = StackScreenProps<RootStackParamList, 'PetSelection'>;

const Stack = createStackNavigator<RootStackParamList>();

const savePetName = async (petName: string) => {
  try {
    const response = await axios.post(
      'https://ap-southeast-1.aws.data.mongodb-api.com/app/petdata-byqpwja/endpoint/data/v1/action/insertOne', {
        dataSource: "Cluster-1",
        database: "Petiqa",
        collection: "allItems",
        document: 
          { "petName": petName,
            "energy": 100,
            "happiness": 100,
            "hunger": 100,
            "health": 100,
            "coins": 10000,
            "points": 1000,
            "salmon": 0,
            "shrimp": 0,
            "crab": 0,
            "tuna": 0,
            "wheat": 0,
            "onion": 0,
            "potato": 0,
            "cucumber": 0,
            "Pet Food": 0,
            "Treats": 0,
            "Chocolate Cake": 0,
            "Salad": 0,
            "Sausage": 0,
            "Potato Chips": 0,
            "Pizza": 0,
            "Fruits": 0,
            "Gaming Console": 0,
            "Football": 0,
            "Piano": 0,
            "Darts": 0,
            "Taiko Drum": 0,
            "Book": 0,
            "Traveling": 0,
            "Medical": 0,
            "Accident": 0
          }
        },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apiKey': '44790142-9a06-406f-b7b6-672e604bc8cd'
        }
      }
    );

    const oid = response.data.insertedId;
    console.log("Successfully created new pet details with oid:", oid);

    return oid;
  } catch (error) {
    console.error("Error saving pet name:", error);
  }
};



// Home Screen Component
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
 

  const checkPetData = async () => {
    const petName = await AsyncStorage.getItem('petName');
    const character = await AsyncStorage.getItem('character');
    if (petName && character) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainGame', params: { petName, character } }],
      });
    } else {
      navigation.navigate('CreateName');
    }
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.backgroundImage}
        source={require('../assets/images/movingbackground.gif')}
        resizeMode="cover"
      />
      <Text style={styles.headerText}>PeTiQa</Text>
      <View style={styles.petContainer}>
        <FastImage
          style={styles.petImage}
          source={require('../assets/images/walk_test.gif')}
          resizeMode={FastImage.resizeMode.contain}
        />

      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={checkPetData}
      >
        <Text style={styles.buttonText}>Play</Text>
      </TouchableOpacity>
    </View>
  );
};

// Create Name Screen Component
const CreateName: React.FC<CreateNameProps> = ({ navigation }) => {
  const [petName, setPetName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validatePetName = (name: string) => {
    const maxLength = 20;
    const validCharacters = /^[a-zA-Z0-9]+$/;

    if (name.length > maxLength) {
      return 'Name is too long! (Max 20 characters)';
    }

    if (!validCharacters.test(name)) {
      return 'Name contains invalid characters!\n(Only letters and numbers allowed)';
    }

    return null;
  };

  const handleContinue = async () => {
    const validationError = validatePetName(petName);

    if (validationError) {
      setError(validationError);
    } else {
      setError(null);
      const oid = await savePetName(petName);
      await AsyncStorage.setItem('petName', petName);  // Save pet name
      await AsyncStorage.setItem('oid', oid);
      navigation.navigate('PetSelection', { petName });
    }
  };

  return (
    <View style={styles.createNameContainer}>
      <FastImage
        style={styles.backgroundImage}
        source={require('../assets/images/background4.jpeg')}
        resizeMode="cover"
      />
      <Text style={styles.createNameHeaderText}>Create a name for your pet!</Text>
      <TextInput
        style={styles.createNameInput}
        placeholder="Enter your pet's name"
        value={petName}
        onChangeText={setPetName}
        maxLength={20}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

// Pet Selection Screen Component
const PetSelection: React.FC<PetSelectionProps> = ({ navigation, route }) => {
  const { petName } = route.params;

  const characters = [
    { id: 1, source: require('../assets/images/tiger_HQ1.gif'), name: 'Tiger' },
    { id: 2, source: require('../assets/images/koala_HQ1.gif'), name: 'Koala' },
  ];

  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);

  const handleNextCharacter = () => {
    setCurrentCharacterIndex((prevIndex) =>
      prevIndex === characters.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePreviousCharacter = () => {
    setCurrentCharacterIndex((prevIndex) =>
      prevIndex === 0 ? characters.length - 1 : prevIndex - 1
    );
  };

  const selectedCharacter = characters[currentCharacterIndex];

  const handleContinue = async () => {
    await AsyncStorage.setItem('character', selectedCharacter.name);  // Save selected character
    navigation.navigate('MainGame', { petName, character: selectedCharacter.name });
  };

  return (
    <View style={styles.petSelectContainer}>
      <FastImage
        style={styles.petSelectBackgroundImage}
        source={require('../assets/images/background5.jpeg')}
        resizeMode="cover"
      />

      <Text style={styles.petSelectHeaderText}>Select a pet for {petName}!</Text>

      <View style={styles.characterSelectionContainer}>
        <TouchableOpacity onPress={handlePreviousCharacter} style={styles.navButton}>
          <Text style={styles.navButtonText}>{"<"}</Text>
        </TouchableOpacity>

        <FastImage
          style={styles.petSelectImage}
          source={selectedCharacter.source}
          resizeMode={FastImage.resizeMode.contain}
        />

        <TouchableOpacity onPress={handleNextCharacter} style={styles.navButton}>
          <Text style={styles.navButtonText}>{">"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.characterNameText}>{selectedCharacter.name}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

// App Navigation
const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // Disable the top toolbar for all screens
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateName" component={CreateName} />
        <Stack.Screen name="PetSelection" component={PetSelection} />
        <Stack.Screen name="MainGame" component={MainGame} />
        <Stack.Screen name="Store" component={Store} />
        <Stack.Screen name="Inventory" component={Inventory} />
        <Stack.Screen name="Achievement" component={Achievement} />
        <Stack.Screen name="Activities" component={Activities} />
        <Stack.Screen name="Quiz" component={Quiz} />
        <Stack.Screen name="Task" component={Task} />
        <Stack.Screen name="Gym" component={Gym} />
        <Stack.Screen name="StepCounter" component={StepCounter} />
        <Stack.Screen name="Travelling" component={TravellingScreen} />
        <Stack.Screen name="Weightlifting" component={WeightliftingScreen} />
        <Stack.Screen name="Running" component={RunningScreen} />
        <Stack.Screen name="Cycling" component={CyclingScreen} />
        <Stack.Screen name="Farming" component={FarmingScreen} />
        <Stack.Screen name="Fishing" component={FishingScreen} />
        <Stack.Screen name="Hollywood" component={HollywoodScreen} />
        <Stack.Screen name="Osaka" component={OsakaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerText: {
    fontFamily: 'joystix monospace',
    fontSize: 50,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#000',
    paddingTop: 150,
  },
  petContainer: {
    flex: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 150,
  },
  petImage: {
    width: 150,
    height: 150,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#ffff00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    fontFamily: 'joystix monospace',
  },
  buttonText: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'joystix monospace',
  },
  resetButtonText: {
    fontSize: 10,
    color: '#000',
    fontFamily: 'joystix monospace',
  },
  createNameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createNameHeaderText: {
    fontSize: 17.5,
    textAlign: 'center',
    fontFamily: 'joystix monospace',
    justifyContent: 'center',
    color: '#000',
    paddingTop: 160,
  },
  createNameInput: {
    height: 40,
    width: 400,
    borderColor: '#000',
    borderWidth: 2,
    fontFamily: 'joystix monospace',
    paddingHorizontal: 10,
    marginVertical: 300,
  },
  errorText: {
    color: 'red',
    fontFamily: 'joystix monospace',
    fontSize: 13,
    marginBottom: 200,
  },
  petSelectContainer: {
    flex: 1,
  },
  petSelectBackgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  petSelectHeaderText: {
    fontSize: 25,
    fontFamily: 'joystix monospace',
    textAlign: 'center',
    justifyContent: 'center',
    color: '#000',
    paddingTop: 100,
  },
  characterSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 100,
  },
  petSelectImage: {
    width: 200,
    height: 200,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#ffff00',
    borderRadius: 5,
    marginHorizontal: 30,
  },
  navButtonText: {
    fontSize: 24,
    fontFamily: 'joystix monospace',
    color: '#000',
  },
  characterNameText: {
    fontSize: 20,
    fontFamily: 'joystix monospace',
    textAlign: 'center',
    color: '#000',
    marginVertical: 10,
  },
});
