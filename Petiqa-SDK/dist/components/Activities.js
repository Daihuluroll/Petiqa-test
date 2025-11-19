import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getRuntimeBaseUrl } from '../setupAxios';
import { joinBasePath } from '../url';
import { completeTask } from '../utils/TaskManager';
import GetPetStatus from '../utils/GetPetStatus';
const activityItems = [
    { name: 'Farming', icon: require('../../assets/images/farming.png'), energy: -15, happiness: 20, hunger: -20, health: 0, screen: 'Farming' },
    { name: 'Fishing', icon: require('../../assets/images/fishing.png'), energy: -15, happiness: 20, hunger: -20, health: 0, screen: 'Fishing' },
];
const ActivitiesScreen = ({ navigation }) => {
    const [petName, setPetName] = useState(null);
    const [oid, setOid] = useState(null);
    const [energyValue, setEnergyValue] = useState(0);
    const [happinessValue, setHappinessValue] = useState(0);
    const [hungerValue, setHungerValue] = useState(0);
    const [healthValue, setHealthValue] = useState(0);
    const [notEnoughEnergyModalVisible, setNotEnoughEnergyModalVisible] = useState(false);
    // Fetch the pet name for displaying in the activities section
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
    useEffect(() => {
        completeTask('Go to activity');
    }, []);
    const updatePetStatus = async (oid, newEnergy, newHappiness, newHunger, newHealth) => {
        try {
            const response = await axios.patch(joinBasePath(getRuntimeBaseUrl(), `petiqa/pet/${oid}/status`), {
                set: {
                    energy: newEnergy,
                    happiness: newHappiness,
                    hunger: newHunger,
                    health: newHealth,
                },
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
        if (energyValue > 15) {
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
            setNotEnoughEnergyModalVisible(true);
            console.log(`You don't have enough energy.`);
        }
    };
    // Function to handle navigation to the selected mini-game
    const handleNavigation = (screen) => {
        navigation.navigate(screen); // Navigate to the respective activity screen
    };
    const renderActivities = () => {
        return activityItems.map((item, index) => (_jsxs(TouchableOpacity, { style: styles.itemContainer, onPress: () => handleConsumption(item.energy, item.happiness, item.hunger, item.health, item.screen), children: [_jsx(Image, { source: item.icon, style: styles.itemIcon }), _jsx(View, { style: styles.itemDetails, children: _jsx(Text, { style: styles.itemText, children: item.name }) })] }, index)));
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/activitiesBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsx(Text, { style: styles.headerText, children: "Activities" }), oid && _jsx(GetPetStatus, { oid: oid, onEnergyFetch: setEnergyValue, onHappinessFetch: setHappinessValue, onHungerFetch: setHungerValue, onHealthFetch: setHealthValue }), _jsx(TouchableOpacity, { style: styles.backButton, onPress: handleBackButton, children: _jsx(Image, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backIcon }) }), _jsx(Modal, { animationType: "slide", transparent: true, visible: notEnoughEnergyModalVisible, onRequestClose: () => setNotEnoughEnergyModalVisible(false), children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.modalContent, children: [_jsx(Text, { style: styles.modalText, children: "You don't have enough energy to perform this activity!" }), _jsx(TouchableOpacity, { style: styles.modalButton, onPress: () => setNotEnoughEnergyModalVisible(false), children: _jsx(Text, { style: styles.modalButtonText, children: "OK" }) })] }) }) }), _jsx(ScrollView, { style: styles.scrollView, contentContainerStyle: styles.scrollViewContent, children: renderActivities() })] }));
};
export default ActivitiesScreen;
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
    headerText: {
        fontSize: 24,
        fontFamily: 'joystix monospace',
        color: 'black',
        zIndex: 1,
        marginVertical: 100,
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
        backgroundColor: 'transparent',
    },
    backIcon: {
        width: 30,
        height: 30,
    },
    scrollView: {
        flex: 1,
        width: '100%',
        marginBottom: 70,
    },
    scrollViewContent: {
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        width: '90%',
    },
    itemIcon: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontFamily: 'joystix monospace',
        color: '#000',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        color: 'black',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#FFCC00',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        left: 80,
    },
    modalButtonText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        color: 'black',
        textAlign: 'center',
    },
});
