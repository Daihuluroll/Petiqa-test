import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PetBarStatus from '../utils/PetStatus';
import DisplayCoin from '../utils/DisplayCoin';
import DisplayPoint from '../utils/DisplayPoint';
import SoundPlayer from 'react-native-sound-player';
import Slider from '@react-native-community/slider'; // Import Slider for volume control
import { cosmeticHat, cosmeticBody, cosmeticFace, cosmeticTall, cosmeticHelmet, cosmeticHighBody } from '../utils/sharedData';
import { completeTask } from '../utils/TaskManager';
import { incrementAppOpenCount, checkBackInShapeAchievement } from '../utils/AchievementManager';
import GetPetStatus from '../utils/GetPetStatus';
const MainMenu = ({ route, navigation }) => {
    const clearData = async () => {
        await AsyncStorage.clear();
        navigation.navigate('Home');
    };
    const { petName, character } = route.params;
    const [confirmResetVisible, setConfirmResetVisible] = useState(false); // State to manage confirm reset modal visibility
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [oid, setOid] = useState(null);
    const [energyValue, setEnergyValue] = useState(0);
    const [happinessValue, setHappinessValue] = useState(0);
    const [hungerValue, setHungerValue] = useState(0);
    const [healthValue, setHealthValue] = useState(0);
    const [isMuted, setIsMuted] = useState(false); // State to manage mute status
    const [volume, setVolume] = useState(1); // State to manage volume level
    const [equippedCosmetics, setEquippedCosmetics] = useState([]);
    const [inventory, setInventory] = useState([]); // New state for inventory
    const petPosition = [100, 550]; // Example position
    const [previousHealthValue, setPreviousHealthValue] = useState(healthValue);
    const [refreshKey, setRefreshKey] = useState(0);
    //-------------------Function to play background music-----------------------------
    const playBackgroundMusic = () => {
        try {
            if (!isMuted) {
                // assets folder is at the package root (Petiqa-SDK/assets), so from
                // src/components the correct relative path is '../../assets/...'
                SoundPlayer.playAsset(require('../../assets/sounds/8bitMenu.mp3'));
                SoundPlayer.setVolume(volume); // Set initial volume
            }
        }
        catch (error) {
            console.error('Failed to play sound file', error);
        }
    };
    // When the component mounts or when the user logs in
    useEffect(() => {
        completeTask('Daily Check in');
    }, []);
    useEffect(() => {
        incrementAppOpenCount();
    }, []);
    useEffect(() => {
        // Pass current and previous health values to the AchievementManager
        checkBackInShapeAchievement(previousHealthValue, healthValue);
        // Update the previous health value after the health value changes
        setPreviousHealthValue(healthValue);
    }, [healthValue, previousHealthValue]);
    useEffect(() => {
        // Play the background music initially
        playBackgroundMusic();
        // Subscribe to FinishedPlaying event
        const onFinishedPlayingSubscription = SoundPlayer.addEventListener('FinishedPlaying', () => {
            if (!isMuted) {
                playBackgroundMusic(); // Restart the music if not muted
            }
        });
        return () => {
            // Cleanup: Stop the music when component unmounts and unsubscribe
            SoundPlayer.stop();
            onFinishedPlayingSubscription.remove(); // Correct way to unsubscribe from event
        };
    }, [isMuted, volume]); // Dependency on isMuted and volume to handle state changes
    // Function to handle muting/unmuting of the background music
    const handleToggleMute = () => {
        if (isMuted) {
            playBackgroundMusic(); // Play music again if unmuted
        }
        else {
            SoundPlayer.stop(); // Stop the music if muted
        }
        setIsMuted(!isMuted); // Toggle mute state
    };
    // Function to handle volume change
    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        SoundPlayer.setVolume(newVolume); // Adjust the volume
    };
    //Handle cosmetic item equip
    useEffect(() => {
        const loadEquippedCosmetics = async () => {
            try {
                const storedCosmetics = await AsyncStorage.getItem('equippedCosmetics');
                if (storedCosmetics) {
                    setEquippedCosmetics(JSON.parse(storedCosmetics));
                }
                else {
                    setEquippedCosmetics([]);
                }
            }
            catch (error) {
                console.error('Error loading cosmetics:', error);
                setEquippedCosmetics([]);
            }
        };
        loadEquippedCosmetics();
    }, []);
    const removeCosmetics = () => {
        setInventory((prevInventory) => [...prevInventory, ...equippedCosmetics]); // Add equipped cosmetics back to inventory
        setEquippedCosmetics([]); // Clear equipped cosmetics
        AsyncStorage.setItem('equippedCosmetics', JSON.stringify([])); // Clear equipped cosmetics in storage
        AsyncStorage.setItem('inventory', JSON.stringify([...inventory, ...equippedCosmetics])); // Update inventory in storage
    };
    //-----------------------------------------------------------------------------------
    // ---------------------Integrate with game engine's status--------------------------
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
    //-------------------------------------------------------------------------------------
    // Create the physics engine
    const engine = Matter.Engine.create();
    const world = engine.world;
    // Create the pet entity using Matter.js
    const pet = Matter.Bodies.rectangle(10, // X coordinate (adjust to move left/right)
    550, // Y coordinate (adjust to move up/down)
    300, // Width of the pet
    300, // Height of the pet
    { label: character, isStatic: true });
    Matter.World.add(world, [pet]);
    // Function to handle screen touch and refresh the component
    const handleScreenTouch = () => {
        setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-render
        console.log("Touched! Happiness Value:", happinessValue); // Log current happiness value
    };
    const renderMoodIndicator = () => {
        if (happinessValue < 20) {
            return (_jsx(FastImage, { source: require('../../assets/images/AngryMark.gif'), style: { width: 80, height: 80, position: 'absolute', top: 580, left: 90 } }));
        }
        else if (happinessValue > 80) {
            return (_jsx(FastImage, { source: require('../../assets/images/HappyMark.gif'), style: { width: 150, height: 150, position: 'absolute', top: 490, right: 230 } }));
        }
        else {
            return null; // No mood indicator if happiness is between 20 to 80
        }
    };
    // PetRenderer component that receives the correct image based on isFat and character type
    const PetRenderer = ({ position, character, healthValue }) => {
        // Determine the correct image based on character and healthValue
        const petImageSource = character === 'Tiger'
            ? (healthValue < 20
                ? require('../../assets/images/Fat_tiger.gif')
                : require('../../assets/images/tiger_HQ1.gif'))
            : (healthValue < 20
                ? require('../../assets/images/fat_koala.gif')
                : require('../../assets/images/koala_HQ1.gif'));
        return (_jsx(FastImage, { style: {
                position: 'absolute',
                left: position[0],
                top: position[1],
                width: 250,
                height: 250,
            }, source: petImageSource, resizeMode: FastImage.resizeMode.contain }));
    };
    // CosmeticsRenderer Component
    // Define styles for each character
    const stylesByCharacter = {
        Koala: {
            hatStyle: { position: "absolute", top: 370, left: 130 },
            bodyStyle: { position: "absolute", top: 553, left: 121 },
            faceStyle: { position: "absolute", top: 435, left: 140 },
            tallStyle: { position: "absolute", top: 330, left: 115 },
            helmetStyle: { position: "absolute", top: 410, left: 120 },
            highbodyStyle: { position: "absolute", top: 525, left: 120 },
        },
        Tiger: {
            hatStyle: { position: "absolute", top: 415, left: 105 },
            bodyStyle: { position: "absolute", top: 585, left: 93 },
            faceStyle: { position: "absolute", top: 480, left: 115 },
            tallStyle: { position: "absolute", top: 370, left: 100 },
            helmetStyle: { position: "absolute", top: 445, left: 97 },
            highbodyStyle: { position: "absolute", top: 553, left: 90 },
        },
    };
    const CosmeticsRenderer = ({ items = [], character }) => {
        const cosmetics = [
            ...cosmeticHat.filter((item) => items.includes(item.name)),
            ...cosmeticBody.filter((item) => items.includes(item.name)),
            ...cosmeticFace.filter((item) => items.includes(item.name)),
            ...cosmeticTall.filter((item) => items.includes(item.name)),
            ...cosmeticHelmet.filter((item) => items.includes(item.name)),
            ...cosmeticHighBody.filter((item) => items.includes(item.name)),
        ];
        const selectedStyles = stylesByCharacter[character];
        return (_jsx(View, { style: styles.cosmeticsContainer, children: cosmetics.map((item, index) => {
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
                return (_jsx(FastImage, { style: [styles.cosmeticItem, cosmeticStyle], source: item.image, resizeMode: FastImage.resizeMode.contain }, index));
            }) }));
    };
    // Set up the entities for the GameEngine
    const entities = {
        physics: { engine: engine, world: world },
        pet: {
            id: pet,
            body: pet,
            size: [250, 250],
            position: [-100, 400],
            character: character, //character type (Tiger or Koala)
            status: {
                happinessValue: happinessValue,
                energyValue: energyValue,
                hungerValue: hungerValue,
                healthValue: healthValue,
            },
        },
    };
    const FIXED_TIMESTEP = 1000 / 60; // 16.67 ms for 60fps
    // Physics update function
    const physics = (entities, { time }) => {
        let engine = entities['physics'].engine;
        Matter.Engine.update(engine, FIXED_TIMESTEP);
        const pet = entities['pet'];
        return entities;
    };
    //-----------------------------------------------------------------------------------
    // Handle navigation back to the Home screen
    const handleBackToHome = () => {
        navigation.navigate('Home');
    };
    return (_jsx(TouchableWithoutFeedback, { onPress: handleScreenTouch, children: _jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/mainMenuBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsx(Text, { style: styles.headerText, children: "Main Menu" }), _jsxs(Text, { style: styles.subHeaderText, children: ["Welcome, ", petName, " the ", character, "!"] }), oid && _jsx(PetBarStatus, { oid: oid }), oid && _jsx(GetPetStatus, { oid: oid, onEnergyFetch: setEnergyValue, onHappinessFetch: setHappinessValue, onHungerFetch: setHungerValue, onHealthFetch: setHealthValue }), oid ? _jsx(DisplayCoin, { oid: oid }) : _jsx(Text, { children: "Loading..." }), oid ? _jsx(DisplayPoint, { oid: oid }) : _jsx(Text, { children: "Loading..." }), _jsx(CosmeticsRenderer, { items: equippedCosmetics, character: character }), _jsx(PetRenderer, { position: petPosition, character: character, healthValue: healthValue }), renderMoodIndicator(), _jsx(GameEngine, { style: { flex: 1 }, systems: [physics], entities: entities }), _jsx(TouchableOpacity, { style: styles.settingsButton, onPress: () => setSettingsVisible(true), children: _jsx(FastImage, { source: require('../../assets/images/settings_icon.png'), style: styles.iconImage, resizeMode: FastImage.resizeMode.contain }) }), _jsx(Modal, { transparent: true, visible: settingsVisible, animationType: "fade", onRequestClose: () => setSettingsVisible(false), children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.settingModalContent, children: [_jsx(Text, { style: styles.settingModalText, children: "Settings" }), _jsxs(View, { style: styles.iconButtonColumn, children: [_jsx(TouchableOpacity, { style: styles.iconButton, onPress: handleToggleMute, children: _jsx(Text, { style: styles.buttonText, children: isMuted ? 'Unmute' : 'Mute' }) }), _jsxs(View, { style: styles.sliderContainer, children: [_jsx(Text, { style: styles.sliderText, children: "Volume" }), _jsx(Slider, { style: { width: 150, height: 40 }, minimumValue: 0, maximumValue: 1, value: volume, onValueChange: handleVolumeChange, minimumTrackTintColor: "#FFFFFF", maximumTrackTintColor: "#000000" })] }), _jsx(TouchableOpacity, { style: styles.removeButton, onPress: removeCosmetics, children: _jsx(Text, { style: styles.buttonText, children: "Remove Cosmetics" }) }), _jsx(TouchableOpacity, { style: styles.resetbutton, onPress: () => setConfirmResetVisible(true), children: _jsx(Text, { style: styles.resetButtonText, children: "Reset" }) }), _jsx(TouchableOpacity, { style: styles.CloseiconButton, onPress: () => setSettingsVisible(false), children: _jsx(FastImage, { source: require('../../assets/images/Closeicon.jpeg'), style: styles.iconImage, resizeMode: FastImage.resizeMode.contain }) })] })] }) }) }), _jsx(Modal, { transparent: true, visible: confirmResetVisible, animationType: "fade", onRequestClose: () => setConfirmResetVisible(false), children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.confirmResetContent, children: [_jsx(Text, { style: styles.confirmResetText, children: "Are you sure you want to reset?" }), _jsxs(View, { style: styles.confirmButtonsContainer, children: [_jsx(TouchableOpacity, { style: styles.confirmButton, onPress: () => {
                                                setConfirmResetVisible(false);
                                                clearData(); // Proceed with reset
                                            }, children: _jsx(Text, { style: styles.buttonText, children: "Yes" }) }), _jsx(TouchableOpacity, { style: styles.confirmButton, onPress: () => setConfirmResetVisible(false), children: _jsx(Text, { style: styles.buttonText, children: "No" }) })] })] }) }) }), _jsx(TouchableOpacity, { style: styles.menuButton, onPress: () => setMenuVisible(true), children: _jsx(FastImage, { source: require('../../assets/images/menu_icon.png'), style: styles.iconImage, resizeMode: FastImage.resizeMode.contain }) }), _jsx(Modal, { transparent: true, visible: menuVisible, animationType: "fade", onRequestClose: () => setMenuVisible(false), children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.menuModalContent, children: [_jsx(Text, { style: styles.menuModalTitle, children: "Menu" }), _jsxs(View, { style: styles.menuGrid, children: [_jsx(MenuItem, { title: "Task", icon: require('../../assets/images/daily_task.png'), navigation: navigation }), _jsx(MenuItem, { title: "Store", icon: require('../../assets/images/store.png'), navigation: navigation }), _jsx(MenuItem, { title: "Achievement", icon: require('../../assets/images/achievement.png'), navigation: navigation }), _jsx(MenuItem, { title: "StepCounter", icon: require('../../assets/images/step_counter.png'), navigation: navigation }), _jsx(MenuItem, { title: "Gym", icon: require('../../assets/images/gym.png'), navigation: navigation }), _jsx(MenuItem, { title: "Travelling", icon: require('../../assets/images/travelling.png'), navigation: navigation }), _jsx(MenuItem, { title: "Activities", icon: require('../../assets/images/activities.png'), navigation: navigation }), _jsx(MenuItem, { title: "Quiz", icon: require('../../assets/images/daily_quiz.png'), navigation: navigation }), _jsx(MenuItem, { title: "Inventory", icon: require('../../assets/images/inventory.png'), navigation: navigation })] }), _jsx(TouchableOpacity, { style: styles.modalCloseButton, onPress: () => setMenuVisible(false), children: _jsx(Text, { style: styles.buttonText, children: "Close" }) })] }) }) })] }, refreshKey) }));
};
// Menu Item Component
const MenuItem = ({ title, icon, navigation }) => {
    const handlePress = () => {
        navigation.navigate(title); // Navigate to the screen with the same name as the title
    };
    return (_jsxs(TouchableOpacity, { style: styles.menuItem, onPress: handlePress, children: [_jsx(FastImage, { source: icon, style: styles.menuIcon, resizeMode: FastImage.resizeMode.contain }), _jsx(Text, { style: styles.menuItemText, children: title })] }));
};
export default MainMenu;
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
        color: 'white',
        zIndex: 1, // Ensures the text is above the background
    },
    subHeaderText: {
        fontSize: 18,
        marginTop: 10,
        fontFamily: 'joystix monospace',
        zIndex: 1, // Ensures the text is above the background
        color: 'white',
    },
    settingsButton: {
        position: 'absolute',
        top: 70,
        right: 10,
    },
    menuButton: {
        position: 'absolute',
        top: 128,
        right: 10,
    },
    iconImage: {
        width: 50,
        height: 50,
    },
    iconButton: {
        marginHorizontal: 10, // Add horizontal margin for spacing between buttons
    },
    CloseiconButton: {
        bottom: 230, // Add horizontal margin for spacing between buttons
        right: 130,
    },
    iconButtonColumn: {
        flexDirection: 'column', // Arrange buttons in a vertical column
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20, // Add vertical margin for spacing between columns
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuModalContent: {
        width: 320,
        padding: 20,
        backgroundColor: '#f2d3b3',
        borderRadius: 15,
        alignItems: 'center',
    },
    menuModalTitle: {
        fontSize: 22,
        fontFamily: 'joystix monospace',
        marginBottom: 20,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    menuItem: {
        width: 110,
        alignItems: 'center',
        marginBottom: 20,
    },
    menuIcon: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
    menuItemText: {
        fontSize: 10,
        fontFamily: 'joystix monospace',
        color: '#472a0e',
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: '#ffff00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    settingModalContent: {
        width: 320,
        padding: 20,
        backgroundColor: '#f2d3b3',
        borderRadius: 15,
        alignItems: 'center',
    },
    settingModalText: {
        fontSize: 20,
        fontFamily: 'joystix monospace',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 13,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    sliderContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    sliderText: {
        fontSize: 15,
        fontFamily: 'joystix monospace',
    },
    barBackground: {
        height: 5,
        backgroundColor: '#555',
        borderRadius: 5,
        marginVertical: 5,
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    cosmeticsContainer: {
        position: 'absolute',
        top: 100,
        left: 10,
        zIndex: 2,
    },
    cosmeticItem: {
        width: 190,
        height: 190,
        marginBottom: 5,
        resizeMode: 'contain',
    },
    removeButton: {
        backgroundColor: '#ff4d4d',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10, // Add margin to separate from other elements
    },
    hatStyle: {
        // Adjust the position and any other styles for hats
        position: 'absolute',
        top: 340, // Example position
        left: 135, // Example position
    },
    bodyStyle: {
        // Adjust the position and any other styles for body cosmetics
        position: 'absolute',
        top: 515, // Example position
        left: 125, // Example position
    },
    faceStyle: {
        // Adjust the position and any other styles for face cosmetics
        position: 'absolute',
        top: 400, // Example position
        left: 150, // Example position
    },
    tallStyle: {
        // Adjust the position and any other styles for face cosmetics
        position: 'absolute',
        top: 300, // Example position
        left: 125, // Example position
    },
    helmetStyle: {
        // Adjust the position and any other styles for face cosmetics
        position: 'absolute',
        top: 370, // Example position
        left: 127, // Example position
    },
    highbodyStyle: {
        // Adjust the position and any other styles for face cosmetics
        position: 'absolute',
        top: 490, // Example position
        left: 125, // Example position
    },
    resetbutton: {
        backgroundColor: '#ffff00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20, // Add margin to avoid clashing with other elements
        fontFamily: 'joystix monospace',
    },
    resetButtonText: {
        fontSize: 10,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    confirmResetContent: {
        width: 280,
        padding: 20,
        backgroundColor: '#f2d3b3',
        borderRadius: 15,
        alignItems: 'center',
    },
    confirmResetText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        marginBottom: 20,
    },
    confirmButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    confirmButton: {
        backgroundColor: '#ffff00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
});
