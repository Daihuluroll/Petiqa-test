import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, ScrollView, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import CheckCoin from '../utils/CheckCoin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { baseUrl } from '../config';
import { completeTask } from '../utils/TaskManager';
import { checkDressUpTimeAchievement, checkCoinSpendingAchievements } from '../utils/AchievementManager';
import CheckPoint from '../utils/CheckPoint';
// Existing Categories
const foodItems = [
    { name: 'Pet Food', icon: require('../../assets/images/PetFood.png'), price: 5 },
    { name: 'Treats', icon: require('../../assets/images/Treat.png'), price: 10 },
    { name: 'Chocolate Cake', icon: require('../../assets/images/ChocolateCake.png'), price: 15 },
    { name: 'Salad', icon: require('../../assets/images/Salad.png'), price: 8 },
    { name: 'Sausage', icon: require('../../assets/images/Sausage.png'), price: 12 },
    { name: 'Potato Chips', icon: require('../../assets/images/Chips.png'), price: 7 },
    { name: 'Pizza', icon: require('../../assets/images/Pizza.png'), price: 15 },
    { name: 'Fruits', icon: require('../../assets/images/Fruits.png'), price: 6 },
];
const toyItems = [
    { name: 'Gaming Console', icon: require('../../assets/images/Gamepad.png'), price: 50 },
    { name: 'Football', icon: require('../../assets/images/Football.png'), price: 20 },
    { name: 'Piano', icon: require('../../assets/images/Piano.png'), price: 100 },
    { name: 'Darts', icon: require('../../assets/images/DartBoard.png'), price: 15 },
    { name: 'Taiko Drum', icon: require('../../assets/images/Taiko.png'), price: 60 },
    { name: 'Book', icon: require('../../assets/images/Book.png'), price: 10 },
];
const insuranceItems = [
    { name: 'Traveling', icon: require('../../assets/images/Briefcase.png'), price: 200 },
    { name: 'Medical', icon: require('../../assets/images/Medicine.png'), price: 300 },
    { name: 'Accident', icon: require('../../assets/images/Eye.png'), price: 250 },
];
// **New Cosmetics Category**
const cosmeticsItems = [
    { name: 'Top Hat', icon: require('../../assets/images/TopHat.png'), price: 25 },
    { name: 'Police Hat', icon: require('../../assets/images/PoliceHat.png'), price: 30 },
    { name: 'Soldier Helm', icon: require('../../assets/images/MilitaryHelmet.png'), price: 40 },
    { name: 'Bow Tie', icon: require('../../assets/images/BowTie.png'), price: 15 },
    { name: 'Suit Tie', icon: require('../../assets/images/TieIcon.png'), price: 20 },
    { name: 'Gold Chain', icon: require('../../assets/images/GoldChainIcon.png'), price: 35 },
    { name: 'Police Badge', icon: require('../../assets/images/PoliceBadgeIcon.png'), price: 18 },
    { name: 'Baseball Cap', icon: require('../../assets/images/BaseballCap.png'), price: 12 },
    { name: 'Sunglasses', icon: require('../../assets/images/SunglassesIcon.png'), price: 10 },
];
const StoreScreen = ({ navigation }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCosmeticModal, setShowCosmeticModal] = useState(false); // New modal for cosmetics
    const [purchaseMessage, setPurchaseMessage] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0)); // Initialize animated value for fading
    const [userCoins, setUserCoins] = useState(0);
    const [userPoints, setUserPoints] = useState(0);
    const [hasEnoughCoins, setHasEnoughCoins] = useState(true); // State to track if user has enough coins
    const [oid, setOid] = useState(null);
    useEffect(() => {
        if (purchaseMessage) {
            // Start the animation for fading in the message bar
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            const timer = setTimeout(() => {
                // After 3 seconds, fade out the message
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    setPurchaseMessage(''); // Clear the message once the fade-out is done
                });
            }, 3000); // Hide the message after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [purchaseMessage]);
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
    const updateCoins = async (oid, price, currentCoins, currentPoints) => {
        try {
            await axios.patch(`${baseUrl}petiqa/pet/${oid}/wallet`, {
                set: { coins: Math.max(0, currentCoins - price), points: currentPoints },
                reason: 'Purchase',
            });
            console.log('Coins updated successfully');
        }
        catch (error) {
            console.error('Error updating coins:', error);
        }
    };
    const updatePoints = async (oid, price, currentCoins, currentPoints) => {
        try {
            await axios.patch(`${baseUrl}petiqa/pet/${oid}/wallet`, {
                set: { coins: currentCoins, points: Math.max(0, currentPoints - price) },
                reason: 'Purchase',
            });
            console.log('Points updated successfully');
        }
        catch (error) {
            console.error('Error updating points:', error);
        }
    };
    const updateItems = async (oid, itemName, reason = 'Purchase') => {
        try {
            await axios.patch(`${baseUrl}petiqa/pet/${oid}/inventory`, {
                adjustments: [{ item: itemName, delta: 1 }],
                reason,
            });
            console.log('Items updated successfully');
        }
        catch (error) {
            console.error('Error updating items:', error);
        }
    };
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
            navigation.navigate('Home');
        }
    };
    const handleOptionSelect = (option) => {
        setSelectedCategory(option);
    };
    const handleItemSelect = (item) => {
        setSelectedItem(item);
        if (selectedCategory === 'Cosmetics') {
            setShowCosmeticModal(true); // Show cosmetic confirmation modal
        }
        else {
            setShowModal(true); // Show regular purchase modal
        }
    };
    const handlePurchase = async () => {
        if (selectedItem) {
            // Check if the user has enough coins
            if (userCoins >= selectedItem.price) {
                try {
                    if (oid) {
                        await updateCoins(oid, selectedItem.price, userCoins, userPoints);
                        await updateItems(oid, selectedItem.name);
                        checkCoinSpendingAchievements(selectedItem.price);
                        // Check if the purchased item is an insurance product
                        if (insuranceItems.some(item => item.name === selectedItem.name)) {
                            completeTask('Buy an insurance product');
                        }
                    }
                    setPurchaseMessage(`You have purchased ${selectedItem.name}!`);
                    const updatedCoins = userCoins - selectedItem.price;
                    setUserCoins(updatedCoins);
                }
                catch (error) {
                    console.error('Error updating coins:', error);
                    setPurchaseMessage(`Failed to purchase ${selectedItem.name}. Please try again.`);
                }
            }
            else {
                setPurchaseMessage(`You don't have enough coins to buy ${selectedItem.name}.`);
                setHasEnoughCoins(false); // Set flag indicating insufficient coins
            }
            setShowModal(false);
            setSelectedItem(null);
        }
    };
    // New handler for cosmetic purchases
    const handleCosmeticPurchase = async () => {
        if (selectedItem) {
            if (userPoints >= selectedItem.price) {
                try {
                    if (oid) {
                        await updatePoints(oid, selectedItem.price, userCoins, userPoints);
                        await updateItems(oid, selectedItem.name);
                        if (cosmeticsItems.some(item => item.name === selectedItem.name)) {
                            checkDressUpTimeAchievement();
                        }
                    }
                    setPurchaseMessage(`You have purchased ${selectedItem.name} for ${selectedItem.price} points!`);
                    const updatedPoints = userPoints - selectedItem.price;
                    setUserPoints(updatedPoints);
                }
                catch (error) {
                    console.error('Error updating points:', error);
                    setPurchaseMessage(`Failed to purchase ${selectedItem.name}. Please try again.`);
                }
            }
            else {
                setPurchaseMessage(`You don't have enough points to buy ${selectedItem.name}.`);
            }
            setShowCosmeticModal(false);
            setSelectedItem(null);
        }
    };
    const closeModal = () => {
        setShowModal(false);
        setShowCosmeticModal(false); // Close cosmetic modal
        setSelectedItem(null);
    };
    const renderItems = () => {
        let items;
        if (selectedCategory === 'Pet Food') {
            items = foodItems;
        }
        else if (selectedCategory === 'Toys and Entertainment') {
            items = toyItems;
        }
        else if (selectedCategory === 'Insurance Packages') {
            items = insuranceItems; // Ensure this matches exactly
        }
        // **Handle Cosmetics Category**
        else if (selectedCategory === 'Cosmetics') {
            items = cosmeticsItems;
        }
        return items?.map((item) => (_jsxs(TouchableOpacity, { style: styles.menuItem, onPress: () => handleItemSelect(item), children: [_jsxs(View, { style: styles.itemInfoContainer, children: [_jsx(Image, { source: item.icon, style: styles.icon }), _jsx(Text, { style: styles.menuText, children: item.name })] }), _jsxs(View, { style: styles.priceContainer, children: [selectedCategory === 'Cosmetics' ? (_jsx(Image, { source: require('../../assets/images/Cash.png'), style: styles.coinIcon }) // Use Cash.png for cosmetics
                        ) : (_jsx(Image, { source: require('../../assets/images/Coin.png'), style: styles.coinIcon }) // Use Coin.png for other items
                        ), _jsx(Text, { style: styles.priceText, children: item.price })] })] }, item.name)));
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/storeBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsx(Text, { style: styles.headerText, children: "Store" }), oid && _jsx(CheckCoin, { oid: oid, onCoinFetch: setUserCoins }), oid && _jsx(CheckPoint, { oid: oid, onPointFetch: setUserPoints }), !selectedCategory ? (_jsxs(View, { style: styles.menuContainer, children: [_jsxs(TouchableOpacity, { style: styles.categoryButton, onPress: () => handleOptionSelect('Pet Food'), children: [_jsx(Image, { source: require('../../assets/images/PetBowl.png'), style: styles.categoryIcon }), _jsx(Text, { style: styles.categoryText, children: "Pet Food" })] }), _jsxs(TouchableOpacity, { style: styles.categoryButton, onPress: () => handleOptionSelect('Toys and Entertainment'), children: [_jsx(Image, { source: require('../../assets/images/Gamepad.png'), style: styles.categoryIcon }), _jsx(Text, { style: styles.categoryText, children: "Toys and Entertainment" })] }), _jsxs(TouchableOpacity, { style: styles.categoryButton, onPress: () => handleOptionSelect('Insurance Packages'), children: [_jsx(Image, { source: require('../../assets/images/Briefcase.png'), style: styles.categoryIcon }), _jsx(Text, { style: styles.categoryText, children: "Insurance Packages" })] }), _jsxs(TouchableOpacity, { style: styles.categoryButton, onPress: () => handleOptionSelect('Cosmetics'), children: [_jsx(Image, { source: require('../../assets/images/Cash.png'), style: styles.categoryIcon }), _jsx(Text, { style: styles.categoryText, children: "Cosmetics" })] })] })) : (_jsxs(ScrollView, { style: styles.foodItemsContainer, children: [_jsx(TouchableOpacity, { style: styles.backToStoreButton, onPress: () => setSelectedCategory(null), children: _jsx(Text, { style: styles.buttonText, children: "Back to Store Categories" }) }), renderItems()] })), _jsx(TouchableOpacity, { style: styles.backArrowButton, onPress: handleBackButton, children: _jsx(FastImage, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backArrowIcon, resizeMode: FastImage.resizeMode.contain }) }), selectedItem && !showCosmeticModal && (_jsx(Modal, { transparent: true, visible: showModal, animationType: "fade", children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.modalContent, children: [_jsxs(Text, { style: styles.modalText, children: ["Buy ", selectedItem.name, " for ", selectedItem.price, " Coins?"] }), _jsxs(View, { style: styles.modalButtons, children: [_jsx(TouchableOpacity, { style: styles.modalButton, onPress: handlePurchase, children: _jsx(Text, { style: styles.buttonText, children: "Yes" }) }), _jsx(TouchableOpacity, { style: styles.modalButton, onPress: closeModal, children: _jsx(Text, { style: styles.buttonText, children: "No" }) })] })] }) }) })), selectedItem && showCosmeticModal && (_jsx(Modal, { transparent: true, visible: showCosmeticModal, animationType: "fade", children: _jsx(View, { style: styles.modalContainer, children: _jsxs(View, { style: styles.modalContent, children: [_jsxs(Text, { style: styles.modalText, children: ["Would you like to purchase ", selectedItem.name, " for ", selectedItem.price, " points?"] }), _jsxs(View, { style: styles.modalButtons, children: [_jsx(TouchableOpacity, { style: styles.modalButton, onPress: handleCosmeticPurchase, children: _jsx(Text, { style: styles.buttonText, children: "Yes" }) }), _jsx(TouchableOpacity, { style: styles.modalButton, onPress: closeModal, children: _jsx(Text, { style: styles.buttonText, children: "No" }) })] })] }) }) })), purchaseMessage ? (_jsx(Animated.View, { style: [styles.purchaseBar, { opacity: fadeAnim }], children: _jsx(Text, { style: styles.purchaseBarText, children: purchaseMessage }) })) : null] }));
};
export default StoreScreen;
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
        marginBottom: 400,
    },
    menuContainer: {
        zIndex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 20,
        borderRadius: 10,
    },
    foodItemsContainer: {
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        marginTop: 1,
        marginBottom: 20, // Reduce the margin bottom to move the menu up
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FFCC00',
        borderRadius: 5,
        justifyContent: 'space-between', // Aligns name on the left and price on the right
    },
    itemInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    menuText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    coinIcon: {
        width: 18,
        height: 18,
        marginRight: 5,
    },
    priceText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    backArrowButton: {
        position: 'absolute',
        top: 10,
        left: 10,
    },
    backArrowIcon: {
        width: 30, // Adjust size of the icon as needed
        height: 30,
    },
    buttonText: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
        color: '#000',
        fontFamily: 'joystix monospace',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        backgroundColor: '#FFCC00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    purchaseBar: {
        position: 'absolute',
        top: 150,
        left: 0,
        right: 0,
        backgroundColor: '#FFCC00',
        paddingVertical: 50,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensures it's on top of other elements
    },
    purchaseBarText: {
        position: 'absolute',
        bottom: 20,
        fontSize: 18,
        color: 'white',
        fontFamily: 'joystix monospace',
    },
    categoryButton: {
        flexDirection: 'row', // Places icon on the left and text on the right in one line
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FFCC00',
        borderRadius: 5,
    },
    categoryText: {
        fontSize: 18,
        color: '#000',
        fontFamily: 'joystix monospace',
        marginLeft: 10, // Space between the icon and text
    },
    categoryIcon: {
        width: 24,
        height: 24,
    },
    backToStoreButton: {
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#FFCC00',
        borderRadius: 5,
        alignItems: 'center',
    },
});
