import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseUrl } from '../config';
import GetPetStatus from '../utils/GetPetStatus';
const gymActivities = [
    { name: 'Weightlifting', icon: require('../../assets/images/lightning_bolt.png'), energy: -20, happiness: 15, hunger: -20, health: 20, screen: 'Weightlifting' },
    { name: 'Running', icon: require('../../assets/images/lightning_bolt.png'), energy: -20, happiness: 20, hunger: -30, health: 30, screen: 'Running' },
    { name: 'Cycling', icon: require('../../assets/images/lightning_bolt.png'), energy: -20, happiness: 15, hunger: -25, health: 25, screen: 'Cycling' },
];
const GymScreen = ({ navigation }) => {
    const [petName, setPetName] = useState(null);
    const [oid, setOid] = useState(null);
    const [energyValue, setEnergyValue] = useState(0);
    const [happinessValue, setHappinessValue] = useState(0);
    const [hungerValue, setHungerValue] = useState(0);
    const [healthValue, setHealthValue] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    // Fetch the pet name for displaying in the gym section
    useEffect(() => {
        const fetchPetName = async () => {
            const storedPetName = await AsyncStorage.getItem('petName');
            setPetName(storedPetName);
        };
        fetchPetName();
    }, []);
    useEffect(() => {
        const fetchOid = async () => {
            try {
                const storedOid = await AsyncStorage.getItem('oid'); // Assuming 'oid' is the key you stored it under
                if (storedOid !== null) {
                    setOid(storedOid); // Set the oid to state
                }
                else {
                    console.log('No oid found in AsyncStorage');
                }
            }
            catch (error) {
                console.error('Error fetching oid from AsyncStorage:', error);
            }
        };
        fetchOid();
    }, []);
    const updatePetStatus = async (oid, newEnergy, newHappiness, newHunger, newHealth) => {
        try {
            const response = await axios.patch(`${baseUrl}petiqa/pet/${oid}/status`, {
                set: {
                    energy: newEnergy,
                    happiness: newHappiness,
                    hunger: newHunger,
                    health: newHealth
                }
            });
            console.log('Pet status updated successfully:', response.data);
        }
        catch (error) {
            console.error('Error updating pet status:', error);
        }
    };
    // Function to handle back button functionality
    const handleBackButton = async () => {
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
    const handleConsumption = (energy, happiness, hunger, health, screen) => {
        if (energyValue >= 20) {
            const updatedEnergy = Math.min(100, Math.max(0, energyValue + energy));
            setEnergyValue(updatedEnergy);
            const updatedHappiness = Math.min(100, Math.max(0, happinessValue + happiness));
            setHappinessValue(updatedHappiness);
            const updatedHunger = Math.min(100, Math.max(0, hungerValue + hunger));
            setHungerValue(updatedHunger);
            const updatedHealth = Math.min(100, Math.max(0, healthValue + health));
            setHealthValue(updatedHealth);
            if (oid) {
                updatePetStatus(oid, updatedEnergy, updatedHappiness, updatedHunger, updatedHealth);
                handleNavigation(screen);
            }
        }
        else {
            setModalVisible(true);
            console.log(`You don't have enough energy.`);
        }
    };
    const closeModal = () => {
        setModalVisible(false);
    };
    // Navigate to the specific activity screen
    const handleNavigation = (screen) => {
        navigation.navigate(screen); // Navigate to the respective activity screen
    };
    const renderGymOptions = () => {
        return gymActivities.map((item, index) => (_jsxs(TouchableOpacity, { style: styles.itemContainer, onPress: () => handleConsumption(item.energy, item.happiness, item.hunger, item.health, item.screen), children: [_jsx(Text, { style: styles.itemText, children: item.name }), _jsxs(View, { style: styles.costContainer, children: [_jsx(Image, { source: item.icon, style: styles.lightningIcon }), _jsx(Text, { style: styles.costText, children: item.energy })] })] }, index)));
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/gymBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsxs(View, { style: styles.headerContainer, children: [_jsx(Text, { style: styles.headerText, children: "Gym" }), oid && _jsx(GetPetStatus, { oid: oid, onEnergyFetch: setEnergyValue, onHappinessFetch: setHappinessValue, onHungerFetch: setHungerValue, onHealthFetch: setHealthValue }), _jsxs(Text, { style: styles.subHeaderText, children: ["Workout and stay fit with ", petName ? petName : '[pet name]', "!"] })] }), _jsx(TouchableOpacity, { style: styles.backButton, onPress: handleBackButton, children: _jsx(Image, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backIcon }) }), _jsx(Modal, { transparent: true, animationType: "slide", visible: isModalVisible, onRequestClose: closeModal, children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.modalContent, children: [_jsx(Text, { style: styles.modalText, children: "You don't have enough energy to exercise!" }), _jsx(TouchableOpacity, { onPress: closeModal, style: styles.closeButton, children: _jsx(Text, { style: styles.closeButtonText, children: "Close" }) })] }) }) }), _jsx(View, { style: styles.gymOptionsContainer, children: renderGymOptions() })] }));
};
export default GymScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    headerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20, // Space between header and content
    },
    headerText: {
        fontSize: 24,
        fontFamily: 'joystix monospace',
        color: 'black',
        textShadowRadius: 1,
    },
    subHeaderText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        color: 'black',
        textShadowRadius: 1,
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    backIcon: {
        width: 30,
        height: 30,
    },
    gymOptionsContainer: {
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        marginTop: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FFCC00',
        borderRadius: 5,
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lightningIcon: {
        width: 10,
        height: 10,
        marginRight: 5,
    },
    costText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        fontFamily: 'joystix monospace',
    },
    closeButton: {
        backgroundColor: '#FFCC00',
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
});
