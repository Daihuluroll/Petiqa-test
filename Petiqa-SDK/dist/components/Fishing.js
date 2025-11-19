import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { baseUrl } from '../config';
import CheckCoin from '../utils/CheckCoin';
import { completeTask } from '../utils/TaskManager';
import { checkFishermanAchievement } from '../utils/AchievementManager';
const fishImages = [
    require('../../assets/images/fish1.png'),
    require('../../assets/images/fish2.png'),
    require('../../assets/images/fish3.png'),
];
const rewards = ['Salmon', 'Tuna', 'Shrimp', 'Crab'];
const FishingScreen = () => {
    const [fishes, setFishes] = useState([0, 1, 2]);
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(30); // 30 seconds to catch fish
    const [gameStarted, setGameStarted] = useState(false); // Track if game started
    const [gameOver, setGameOver] = useState(false); // Track if game is over 
    const [userCoins, setUserCoins] = useState(0);
    const [oid, setOid] = useState(null);
    // Start game function
    const startGame = () => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setTimer(15);
    };
    // Handle fish movement
    useEffect(() => {
        if (gameStarted) {
            const fishMovement = setInterval(() => {
                setFishes((fishes) => fishes.map(() => Math.random() * 300));
            }, 1000);
            return () => clearInterval(fishMovement);
        }
    }, [gameStarted]);
    // Countdown timer
    useEffect(() => {
        if (gameStarted && timer > 0) {
            const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(countdown);
        }
        else if (timer === 0) {
            setGameOver(true);
            assignRandomReward(); // Give reward on game over
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
    // Assign a random reward
    const assignRandomReward = () => {
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        Alert.alert(`You caught: ${randomReward}!`, 'You earned 10 coins with it!');
        const updatedCoins = userCoins + 10;
        setUserCoins(updatedCoins);
        if (oid) {
            updateCoins(oid, updatedCoins);
        }
    };
    // Handle fishing rod action (catching a fish)
    const handleFishCatch = async (fishIndex) => {
        if (!gameOver) {
            setScore((prevScore) => prevScore + 1);
            setFishes((fishes) => fishes.map((fish, index) => (index === fishIndex ? Math.random() * 300 : fish)));
            const caughtFishType = rewards[Math.floor(Math.random() * rewards.length)];
            try {
                // Update caught fish in AsyncStorage
                const caughtFish = await AsyncStorage.getItem('caughtFish');
                let fishArray = caughtFish ? JSON.parse(caughtFish) : [];
                if (!fishArray.includes(caughtFishType)) {
                    fishArray.push(caughtFishType);
                    await AsyncStorage.setItem('caughtFish', JSON.stringify(fishArray));
                    // Check achievement after updating storage
                    await checkFishermanAchievement();
                }
            }
            catch (error) {
                console.error('Error updating caught fish:', error);
            }
        }
        completeTask('Catch fish / Harvest crops once');
    };
    const navigation = useNavigation();
    // Function to handle back button functionality
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
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/fishingBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsx(TouchableOpacity, { style: styles.backButton, onPress: handleBackButton, children: _jsx(Image, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backIcon }) }), oid && _jsx(CheckCoin, { oid: oid, onCoinFetch: setUserCoins }), !gameStarted ? (_jsxs(View, { style: styles.introContainer, children: [_jsx(Text, { style: styles.introText, children: "Catch as many fish as you can in 15 seconds!" }), _jsx(TouchableOpacity, { style: styles.startButton, onPress: startGame, children: _jsx(Text, { style: styles.startButtonText, children: "Start Fishing" }) })] })) : (_jsxs(_Fragment, { children: [_jsxs(View, { style: styles.upperTextContainer, children: [_jsx(Text, { style: styles.headerText, children: "Fishing Game" }), _jsxs(Text, { style: styles.timerText, children: ["Time Left: ", timer, " seconds"] }), _jsxs(Text, { style: styles.scoreText, children: ["Score: ", score] })] }), fishes.map((fish, index) => (_jsx(TouchableOpacity, { style: [styles.fish, { left: fish }], onPress: () => handleFishCatch(index), children: _jsx(Image, { source: fishImages[index % fishImages.length], style: styles.fishImage }) }, index))), gameOver && _jsxs(Text, { style: styles.gameOverText, children: ["Game Over! Your score: ", score] })] }))] }));
};
export default FishingScreen;
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
    headerText: {
        fontSize: 24,
        fontFamily: 'joystix monospace',
        marginBottom: 10,
        color: 'black',
    },
    timerText: {
        fontSize: 18,
        marginBottom: 10,
        color: 'black',
    },
    scoreText: {
        fontSize: 18,
        marginBottom: 20,
        color: 'black',
    },
    fish: {
        position: 'absolute',
        bottom: 100,
        width: 90,
        height: 70,
    },
    fishImage: {
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
        backgroundColor: 'transparent',
    },
    backIcon: {
        width: 30,
        height: 30,
    },
    upperTextContainer: {
        position: 'absolute',
        top: 150,
        alignItems: 'center',
        width: '100%',
    },
});
