import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OsakaScreen.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Modal, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cosmeticHat, cosmeticBody, cosmeticFace, cosmeticTall, cosmeticHelmet, cosmeticHighBody } from '../utils/sharedData';
import { completeTask } from '../utils/TaskManager';
import { addVisitedLocation } from '../utils/AchievementManager';
import { checkAccidentProneAchievement } from '../utils/AchievementManager';
import CheckInsurance from '../utils/CheckInsurance';
import axios from 'axios';
import CheckCoin from '../utils/CheckCoin';
import { baseUrl } from '../config';
// Back button handler
const handleBackButton = async (navigation) => {
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
// OsakaScreen component
const OsakaScreen = ({ route, navigation }) => {
    const { character } = route.params;
    const [pet, setPet] = useState(null);
    const [cosmeticItems, setCosmeticItems] = useState([]);
    // Modals state
    const [modalVisible, setModalVisible] = useState(false);
    const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [insuranceMessage, setInsuranceMessage] = useState('');
    const [oid, setOid] = useState(null);
    const [itemValue, setItemValue] = useState(0);
    const [userCoins, setUserCoins] = useState(0);
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
    const updateInsurance = async (oid) => {
        try {
            const response = await axios.patch(`${baseUrl}petiqa/pet/${oid}/inventory`, {
                adjustments: [{ item: 'Traveling', delta: -1 }]
            });
            console.log('Insurance updated successfully:', response.data);
        }
        catch (error) {
            console.error('Error updating insurance:', error);
        }
    };
    const updateCoins = async (oid, newCoins) => {
        try {
            const response = await axios.patch(`${baseUrl}petiqa/pet/${oid}/wallet`, {
                set: { coins: newCoins }
            });
            console.log('Coins updated successfully:', response.data);
        }
        catch (error) {
            console.error('Error updating coins:', error);
        }
    };
    const getInsurance = async (oid) => {
        try {
            const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/inventory`);
            return response.data.data.Traveling?.quantity || 0;
        }
        catch (error) {
            console.error('Error fetching insurance:', error);
            return 0;
        }
    };
    const getBackgroundImage = () => require('../../assets/images/osakaBG.jpeg');
    // Load cosmetic items from AsyncStorage
    const loadCosmeticItems = async () => {
        try {
            const storedCosmetics = await AsyncStorage.getItem('equippedCosmetics');
            if (storedCosmetics) {
                const equippedNames = JSON.parse(storedCosmetics);
                const equippedItems = [
                    ...cosmeticHat,
                    ...cosmeticBody,
                    ...cosmeticFace,
                    ...cosmeticTall,
                    ...cosmeticHelmet,
                    ...cosmeticHighBody,
                ].filter(item => equippedNames.includes(item.name));
                setCosmeticItems(equippedItems);
            }
        }
        catch (error) {
            console.error('Error loading cosmetics:', error);
        }
    };
    // Load the pet entity based on the character
    const loadPetEntity = async () => {
        if (character === 'Tiger') {
            setPet({ name: 'Tiger', image: require('../../assets/images/tiger_HQ1.gif') });
        }
        else if (character === 'Koala') {
            setPet({ name: 'Koala', image: require('../../assets/images/koala_HQ1.gif') });
        }
    };
    // Check for random events
    const checkForRandomEvents = async () => {
        const randomEvent = Math.random();
        if (randomEvent < 0.1) { // 10% chance for luggage lost event
            setModalVisible(true);
            setMessage("Oh no! The airport lost your luggage...");
            completeTask('Encounter any random event once');
            const currentCount = await AsyncStorage.getItem('lostLuggageEvents');
            const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
            await AsyncStorage.setItem('lostLuggageEvents', newCount.toString());
            // Check for the Accident prone achievement
            checkAccidentProneAchievement();
        }
        else if (randomEvent < 0.2) { // 10% chance for friend encounter
            setModalVisible(true);
            setMessage("You have encountered a friend while travelling, how nice! You gain +10 energy");
            completeTask('Encounter any random event once');
            // Update energy
            if (oid) {
                try {
                    await axios.patch(`${baseUrl}petiqa/pet/${oid}/status`, {
                        inc: { energy: 10 },
                        source: 'activity'
                    });
                    console.log('Energy updated successfully');
                }
                catch (error) {
                    console.error('Error updating energy:', error);
                }
            }
        }
        // 80% chance for nothing to happen (do nothing)
    };
    // Handle modal close and check for insurance
    const handleModalClose = async () => {
        setModalVisible(false);
        if (message === "Oh no! The airport lost your luggage...") {
            if (oid) {
                const insuranceCount = await getInsurance(oid);
                if (insuranceCount > 0) {
                    setInsuranceModalVisible(true);
                    setInsuranceMessage("Luckily you have travelling insurance! You don't have to pay since the insurance company will cover the cost of the lost luggage.");
                    updateInsurance(oid);
                }
                else {
                    setInsuranceModalVisible(true);
                    setInsuranceMessage("Sadly you don't have travelling insurance... you will have to cover the cost of the lost luggage yourself. You lost 50 coins");
                    const updatedCoins = userCoins - 50;
                    updateCoins(oid, updatedCoins);
                }
            }
        }
    };
    useEffect(() => {
        loadCosmeticItems();
        loadPetEntity();
    }, []);
    useEffect(() => {
        if (oid) {
            checkForRandomEvents();
        }
    }, [oid]);
    useEffect(() => {
        addVisitedLocation('Osaka');
    }, []);
    // Render the cosmetic items based on the character
    const renderCosmetics = () => {
        const stylesByCharacter = {
            Koala: {
                hatStyle: { position: 'absolute', top: 65, left: -35, width: 190, height: 190 },
                bodyStyle: { position: 'absolute', top: 240, left: -40, width: 190, height: 190 },
                faceStyle: { position: 'absolute', top: 125, left: -19, width: 190, height: 190 },
                tallStyle: { position: 'absolute', top: 30, left: -40, width: 190, height: 190 },
                helmetStyle: { position: 'absolute', top: 95, left: -40, width: 190, height: 190 },
                highbodyStyle: { position: 'absolute', top: 215, left: -40, width: 190, height: 190 },
            },
            Tiger: {
                hatStyle: { position: 'absolute', top: 100, left: -60, width: 190, height: 190 },
                bodyStyle: { position: 'absolute', top: 280, left: -70, width: 190, height: 190 },
                faceStyle: { position: 'absolute', top: 175, left: -45, width: 190, height: 190 },
                tallStyle: { position: 'absolute', top: 60, left: -64, width: 190, height: 190 },
                helmetStyle: { position: 'absolute', top: 150, left: -75, width: 210, height: 210 },
                highbodyStyle: { position: 'absolute', top: 260, left: -55, width: 150, height: 150 },
            },
        };
        const selectedStyles = character === 'Tiger' ? stylesByCharacter.Tiger : stylesByCharacter.Koala;
        return (_jsx(View, { style: styles.cosmeticsContainer, children: cosmeticItems.map((item, index) => {
                let cosmeticStyle;
                if (cosmeticHat.some(hat => hat.name === item.name)) {
                    cosmeticStyle = selectedStyles.hatStyle;
                }
                else if (cosmeticBody.some(body => body.name === item.name)) {
                    cosmeticStyle = selectedStyles.bodyStyle;
                }
                else if (cosmeticFace.some(face => face.name === item.name)) {
                    cosmeticStyle = selectedStyles.faceStyle;
                }
                else if (cosmeticTall.some(tall => tall.name === item.name)) {
                    cosmeticStyle = selectedStyles.tallStyle;
                }
                else if (cosmeticHelmet.some(helmet => helmet.name === item.name)) {
                    cosmeticStyle = selectedStyles.helmetStyle;
                }
                else if (cosmeticHighBody.some(highbody => highbody.name === item.name)) {
                    cosmeticStyle = selectedStyles.highbodyStyle;
                }
                console.log(`Item: ${item.name}, Assigned Style:`, cosmeticStyle);
                console.log(`Current Character: ${character}`);
                console.log(`Cosmetic Items:`, cosmeticItems);
                return cosmeticStyle ? (_jsx(FastImage, { style: cosmeticStyle, source: item.image, resizeMode: FastImage.resizeMode.contain }, index)) : null;
            }) }));
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: getBackgroundImage(), resizeMode: FastImage.resizeMode.cover }), pet && (_jsx(FastImage, { style: styles.petImage, source: pet.image, resizeMode: FastImage.resizeMode.contain })), oid && _jsx(CheckInsurance, { oid: oid, onItemFetch: setItemValue }), oid && _jsx(CheckCoin, { oid: oid, onCoinFetch: setUserCoins }), renderCosmetics(), _jsx(TouchableOpacity, { style: styles.backButton, onPress: () => handleBackButton(navigation), children: _jsx(Image, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backIcon }) }), _jsx(Modal, { animationType: "slide", transparent: true, visible: modalVisible, onRequestClose: () => handleModalClose(), children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.modalContent, children: [_jsx(Text, { style: styles.modalText, children: message }), _jsx(TouchableOpacity, { style: styles.modalButton, onPress: () => handleModalClose(), children: _jsx(Text, { style: styles.modalButtonText, children: "Close" }) })] }) }) }), _jsx(Modal, { animationType: "slide", transparent: true, visible: insuranceModalVisible, onRequestClose: () => setInsuranceModalVisible(false), children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.modalContent, children: [_jsx(Text, { style: styles.modalText, children: insuranceMessage }), _jsx(TouchableOpacity, { style: styles.modalButton, onPress: () => setInsuranceModalVisible(false), children: _jsx(Text, { style: styles.modalButtonText, children: "Close" }) })] }) }) })] }));
};
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
    petImage: {
        position: 'absolute',
        width: 250,
        height: 250,
        top: 560,
        left: 85,
        resizeMode: 'contain',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 10,
    },
    backIcon: {
        width: 50,
        height: 50,
    },
    cosmeticsContainer: {
        position: 'absolute',
        width: 100,
        height: 10,
        zIndex: 2,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'gray',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        color: 'white',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#FFCC00',
        padding: 10,
        borderRadius: 5,
        width: '40%',
        left: 85,
    },
    modalButtonText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        color: 'white',
    },
});
export default OsakaScreen;
