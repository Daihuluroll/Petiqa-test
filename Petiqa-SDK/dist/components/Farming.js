import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckCoin from '../utils/CheckCoin';
import axios from 'axios';
import { baseUrl } from '../config';
import { completeTask } from '../utils/TaskManager';
import { checkFarmerAchievement } from '../utils/AchievementManager';
const cropImages = [
    require('../../assets/images/crop1.png'),
    require('../../assets/images/crop2.png'),
    require('../../assets/images/crop3.png'),
];
const rewards = ['Wheat', 'Cucumber', 'Onion', 'Potato'];
const FarmingScreen = () => {
    const [crops, setCrops] = useState([0, 1, 2]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [userCoins, setUserCoins] = useState(0);
    const [oid, setOid] = useState(null);
    const navigation = useNavigation();
    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setTimer(15);
    };
    useEffect(() => {
        if (gameStarted) {
            const cropMovement = setInterval(() => {
                setCrops((crops) => crops.map(() => Math.random() * 300));
            }, 1500);
            return () => clearInterval(cropMovement);
        }
    }, [gameStarted]);
    useEffect(() => {
        if (gameStarted && timer > 0) {
            const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(countdown);
        }
        else if (timer === 0) {
            setGameOver(true);
            assignRandomReward();
        }
    }, [gameStarted, timer]);
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
    const assignRandomReward = () => {
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        Alert.alert(`You harvested: ${randomReward}!`, 'You earned 10 coins with it!');
        const updatedCoins = userCoins + 10;
        setUserCoins(updatedCoins);
        if (oid) {
            updateCoins(oid, updatedCoins);
        }
    };
    const handleWaterCrop = async (cropIndex) => {
        if (!gameOver) {
            setScore((prevScore) => prevScore + 1);
            setCrops((crops) => crops.map((crop, index) => (index === cropIndex ? Math.random() * 300 : crop)));
            const harvestedCropType = rewards[Math.floor(Math.random() * rewards.length)];
            try {
                // Update harvested crops in AsyncStorage
                const harvestedCrops = await AsyncStorage.getItem('harvestedCrops');
                let cropsArray = harvestedCrops ? JSON.parse(harvestedCrops) : [];
                if (!cropsArray.includes(harvestedCropType)) {
                    cropsArray.push(harvestedCropType);
                    await AsyncStorage.setItem('harvestedCrops', JSON.stringify(cropsArray));
                    // Check achievement after updating storage
                    await checkFarmerAchievement();
                }
            }
            catch (error) {
                console.error('Error updating harvested crops:', error);
            }
        }
        completeTask('Catch fish / Harvest crops once');
    };
    const handleBackButton = async () => {
        const petName = await AsyncStorage.getItem('petName');
        const character = await AsyncStorage.getItem('character');
        if (petName && character) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Activities', params: { petName, character } }],
            });
        }
        else {
            navigation.navigate('Home');
        }
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/farmingBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsx(TouchableOpacity, { style: styles.backButton, onPress: handleBackButton, children: _jsx(Image, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backIcon }) }), oid && _jsx(CheckCoin, { oid: oid, onCoinFetch: setUserCoins }), !gameStarted ? (_jsxs(View, { style: styles.introContainer, children: [_jsx(Text, { style: styles.introText, children: "Harvest as many crops as you can in 15 seconds!" }), _jsx(TouchableOpacity, { style: styles.startButton, onPress: startGame, children: _jsx(Text, { style: styles.startButtonText, children: "Start Farming" }) })] })) : (_jsxs(_Fragment, { children: [_jsxs(View, { style: styles.upperTextContainer, children: [_jsx(Text, { style: styles.headerText, children: "Farming Game" }), _jsxs(Text, { style: styles.timerText, children: ["Time Left: ", timer, " seconds"] }), _jsxs(Text, { style: styles.scoreText, children: ["Score: ", score] })] }), crops.map((crop, index) => (_jsx(TouchableOpacity, { style: [styles.crop, { left: crop }], onPress: () => handleWaterCrop(index), children: _jsx(Image, { source: cropImages[index % cropImages.length], style: styles.cropImage }) }, index))), gameOver && _jsxs(Text, { style: styles.gameOverText, children: ["Game Over! Your score: ", score] })] }))] }));
};
export default FarmingScreen;
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
    upperTextContainer: {
        position: 'absolute',
        top: 150, // Position text near the top
        alignItems: 'center',
        width: '100%',
    },
    headerText: {
        fontSize: 24,
        fontFamily: 'joystix monospace',
        marginBottom: 10,
        color: 'black',
    },
    timerText: {
        fontSize: 18,
        marginBottom: 5,
        color: 'black',
    },
    scoreText: {
        fontSize: 18,
        marginBottom: 20,
        color: 'black',
    },
    introContainer: {
        position: 'absolute',
        top: 200, // Position text near the top
        alignItems: 'center',
        width: '100%',
    },
    introText: {
        fontSize: 20,
        marginBottom: 20,
        fontFamily: 'joystix monospace',
        color: 'black',
    },
    startButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    crop: {
        position: 'absolute',
        bottom: 100,
        width: 30,
        height: 80,
    },
    cropImage: {
        flex: 1,
        resizeMode: 'contain',
        width: '100%',
        height: '100%',
    },
    gameOverText: {
        fontSize: 24,
        color: 'red',
        marginTop: 20,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        padding: 10,
    },
    backIcon: {
        width: 30,
        height: 30,
    },
});
