import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseUrl } from '../../config';
import MainGame from '../MainGame';
import Store from '../Store';
import Inventory from '../Inventory';
import Achievement from '../Achievement';
import Activities from '../Activities';
import Quiz from '../Quiz';
import Task from '../Task';
import Gym from '../Gym';
import StepCounter from '../StepCounter';
import WeightliftingScreen from '../Weightlifting';
import RunningScreen from '../Running';
import CyclingScreen from '../Cycling';
import FarmingScreen from '../Farming';
import FishingScreen from '../Fishing';
import TravellingScreen from '../Travelling';
import HollywoodScreen from '../Hollywood';
import OsakaScreen from '../Osaka';
const Stack = createStackNavigator();
const savePetName = async (petName) => {
    try {
        const response = await axios.post(`${baseUrl}petiqa/pet`, {
            petName: petName,
            initialStatus: {
                energy: 100,
                happiness: 100,
                hunger: 100,
                health: 100,
            },
            initialWallet: {
                coins: 10000,
                points: 1000,
            },
            initialInventory: {
                "salmon": { name: "salmon", kind: "food", quantity: 10 },
                "shrimp": { name: "shrimp", kind: "food", quantity: 10 },
                "crab": { name: "crab", kind: "food", quantity: 10 },
                "tuna": { name: "tuna", kind: "food", quantity: 10 },
                "wheat": { name: "wheat", kind: "material", quantity: 10 },
                "onion": { name: "onion", kind: "food", quantity: 10 },
                "potato": { name: "potato", kind: "food", quantity: 10 },
                "cucumber": { name: "cucumber", kind: "food", quantity: 10 },
                "Pet Food": { name: "Pet Food", kind: "food", quantity: 10 },
                "Treats": { name: "Treats", kind: "food", quantity: 10 },
                "Chocolate Cake": { name: "Chocolate Cake", kind: "food", quantity: 10 },
                "Salad": { name: "Salad", kind: "food", quantity: 10 },
                "Sausage": { name: "Sausage", kind: "food", quantity: 0 },
                "Potato Chips": { name: "Potato Chips", kind: "food", quantity: 10 },
                "Pizza": { name: "Pizza", kind: "food", quantity: 10 },
                "Fruits": { name: "Fruits", kind: "food", quantity: 10 },
                "Gaming Console": { name: "Gaming Console", kind: "toy", quantity: 10 },
                "Football": { name: "Football", kind: "toy", quantity: 10 },
                "Piano": { name: "Piano", kind: "toy", quantity: 10 },
                "Darts": { name: "Darts", kind: "toy", quantity: 10 },
                "Taiko Drum": { name: "Taiko Drum", kind: "toy", quantity: 10 },
                "Book": { name: "Book", kind: "toy", quantity: 10 },
                "Traveling": { name: "Traveling", kind: "misc", quantity: 10 },
                "Medical": { name: "Medical", kind: "insurance", quantity: 10 },
                "Accident": { name: "Accident", kind: "insurance", quantity: 10 }
            }
        });
        const oid = response.data.data._id;
        console.log("Successfully created new pet details with oid:", oid);
        return oid;
    }
    catch (error) {
        console.error("Error saving pet name:", error.message);
        console.error("Error code:", error.code);
        console.error("Full error:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error response status:", error.response?.status);
        console.error("Attempting to POST to:", `${baseUrl}petiqa/pet`);
        return null;
    }
};
// Home Screen Component
const HomeScreen = ({ navigation }) => {
    const checkPetData = async () => {
        const petName = await AsyncStorage.getItem('petName');
        const character = await AsyncStorage.getItem('character');
        if (petName && character) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainGame', params: { petName, character } }],
            });
        }
        else {
            navigation.navigate('CreateName');
        }
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.backgroundImage, source: require('../../../assets/images/movingbackground.gif'), resizeMode: "cover" }), _jsx(Text, { style: styles.headerText, children: "PeTiQa" }), _jsx(View, { style: styles.petContainer, children: _jsx(FastImage, { style: styles.petImage, source: require('../../../assets/images/walk_test.gif'), resizeMode: FastImage.resizeMode.contain }) }), _jsx(TouchableOpacity, { style: styles.button, onPress: checkPetData, children: _jsx(Text, { style: styles.buttonText, children: "Play" }) })] }));
};
// Create Name Screen Component
const CreateName = ({ navigation }) => {
    const [petName, setPetName] = useState('');
    const [error, setError] = useState(null);
    const validatePetName = (name) => {
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
        }
        else {
            setError(null);
            const oid = await savePetName(petName);
            if (oid) {
                await AsyncStorage.setItem('petName', petName); // Save pet name
                await AsyncStorage.setItem('oid', oid);
                navigation.navigate('PetSelection', { petName });
            }
            else {
                setError('Failed to create pet. Please try again.');
            }
        }
    };
    return (_jsxs(View, { style: styles.createNameContainer, children: [_jsx(FastImage, { style: styles.backgroundImage, source: require('../../../assets/images/background4.jpeg'), resizeMode: "cover" }), _jsx(Text, { style: styles.createNameHeaderText, children: "Create a name for your pet!" }), _jsx(TextInput, { style: styles.createNameInput, placeholder: "Enter your pet's name", value: petName, onChangeText: setPetName, maxLength: 20 }), error && _jsx(Text, { style: styles.errorText, children: error }), _jsx(TouchableOpacity, { style: styles.button, onPress: handleContinue, children: _jsx(Text, { style: styles.buttonText, children: "Continue" }) })] }));
};
// Pet Selection Screen Component
const PetSelection = ({ navigation, route }) => {
    const { petName } = route.params;
    const characters = [
        { id: 1, source: require('../../../assets/images/tiger_HQ1.gif'), name: 'Tiger' },
        { id: 2, source: require('../../../assets/images/koala_HQ1.gif'), name: 'Koala' },
    ];
    const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
    const handleNextCharacter = () => {
        setCurrentCharacterIndex((prevIndex) => prevIndex === characters.length - 1 ? 0 : prevIndex + 1);
    };
    const handlePreviousCharacter = () => {
        setCurrentCharacterIndex((prevIndex) => prevIndex === 0 ? characters.length - 1 : prevIndex - 1);
    };
    const selectedCharacter = characters[currentCharacterIndex];
    const handleContinue = async () => {
        await AsyncStorage.setItem('character', selectedCharacter.name); // Save selected character
        navigation.navigate('MainGame', { petName, character: selectedCharacter.name });
    };
    return (_jsxs(View, { style: styles.petSelectContainer, children: [_jsx(FastImage, { style: styles.petSelectBackgroundImage, source: require('../../../assets/images/background5.jpeg'), resizeMode: "cover" }), _jsxs(Text, { style: styles.petSelectHeaderText, children: ["Select a pet for ", petName, "!"] }), _jsxs(View, { style: styles.characterSelectionContainer, children: [_jsx(TouchableOpacity, { onPress: handlePreviousCharacter, style: styles.navButton, children: _jsx(Text, { style: styles.navButtonText, children: "<" }) }), _jsx(FastImage, { style: styles.petSelectImage, source: selectedCharacter.source, resizeMode: FastImage.resizeMode.contain }), _jsx(TouchableOpacity, { onPress: handleNextCharacter, style: styles.navButton, children: _jsx(Text, { style: styles.navButtonText, children: ">" }) })] }), _jsx(Text, { style: styles.characterNameText, children: selectedCharacter.name }), _jsx(TouchableOpacity, { style: styles.button, onPress: handleContinue, children: _jsx(Text, { style: styles.buttonText, children: "Continue" }) })] }));
};
const App = ({ userId, apiUrl, petName, character }) => {
    // Store userId in AsyncStorage if provided
    useEffect(() => {
        if (userId) {
            AsyncStorage.setItem('oid', userId).catch(err => console.error('Error setting userId:', err));
        }
        if (petName) {
            AsyncStorage.setItem('petName', petName).catch(err => console.error('Error setting petName:', err));
        }
        if (character) {
            AsyncStorage.setItem('character', character).catch(err => console.error('Error setting character:', err));
        }
    }, [userId, petName, character]);
    return (_jsx(NavigationContainer, { independent: true, children: _jsxs(Stack.Navigator, { initialRouteName: "Home", screenOptions: {
                headerShown: false, // Disable the top toolbar for all screens
            }, children: [_jsx(Stack.Screen, { name: "Home", component: HomeScreen }), _jsx(Stack.Screen, { name: "CreateName", component: CreateName }), _jsx(Stack.Screen, { name: "PetSelection", component: PetSelection }), _jsx(Stack.Screen, { name: "MainGame", component: MainGame }), _jsx(Stack.Screen, { name: "Store", component: Store }), _jsx(Stack.Screen, { name: "Inventory", component: Inventory }), _jsx(Stack.Screen, { name: "Achievement", component: Achievement }), _jsx(Stack.Screen, { name: "Activities", component: Activities }), _jsx(Stack.Screen, { name: "Quiz", component: Quiz }), _jsx(Stack.Screen, { name: "Task", component: Task }), _jsx(Stack.Screen, { name: "Gym", component: Gym }), _jsx(Stack.Screen, { name: "StepCounter", component: StepCounter }), _jsx(Stack.Screen, { name: "Travelling", component: TravellingScreen }), _jsx(Stack.Screen, { name: "Weightlifting", component: WeightliftingScreen }), _jsx(Stack.Screen, { name: "Running", component: RunningScreen }), _jsx(Stack.Screen, { name: "Cycling", component: CyclingScreen }), _jsx(Stack.Screen, { name: "Farming", component: FarmingScreen }), _jsx(Stack.Screen, { name: "Fishing", component: FishingScreen }), _jsx(Stack.Screen, { name: "Hollywood", component: HollywoodScreen }), _jsx(Stack.Screen, { name: "Osaka", component: OsakaScreen })] }) }));
};
export const PetiqaGame = App;
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
