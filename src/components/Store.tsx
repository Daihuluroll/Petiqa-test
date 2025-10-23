import React, { useState, useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, ScrollView, Animated } from 'react-native';
import FastImage from 'react-native-fast-image';
import CheckCoin from '../utils/CheckCoin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeTask } from '../utils/TaskManager';
import { checkDressUpTimeAchievement, checkCoinSpendingAchievements } from '../utils/AchievementManager';
import CheckPoint from '../utils/CheckPoint';
import { updatePetWallet, adjustInventoryItem } from '../utils/LocalDataManager';

type RootStackParamList = {
  Home: undefined;
  Store: undefined;
  MainGame: { petName: string; character: string };
};

type StoreScreenProps = StackScreenProps<RootStackParamList, 'Store'>;

// Existing Categories
const foodItems = [
  { name: 'Pet Food', icon: require('../assets/images/PetFood.png'), price: 5 },
  { name: 'Treats', icon: require('../assets/images/Treat.png'), price: 10 },
  { name: 'Chocolate Cake', icon: require('../assets/images/ChocolateCake.png'), price: 15 },
  { name: 'Salad', icon: require('../assets/images/Salad.png'), price: 8 },
  { name: 'Sausage', icon: require('../assets/images/Sausage.png'), price: 12 },
  { name: 'Potato Chips', icon: require('../assets/images/Chips.png'), price: 7 },
  { name: 'Pizza', icon: require('../assets/images/Pizza.png'), price: 15 },
  { name: 'Fruits', icon: require('../assets/images/Fruits.png'), price: 6 },
];

const toyItems = [
  { name: 'Gaming Console', icon: require('../assets/images/Gamepad.png'), price: 50 },
  { name: 'Football', icon: require('../assets/images/Football.png'), price: 20 },
  { name: 'Piano', icon: require('../assets/images/Piano.png'), price: 100 },
  { name: 'Darts', icon: require('../assets/images/DartBoard.png'), price: 15 },
  { name: 'Taiko Drum', icon: require('../assets/images/Taiko.png'), price: 60 },
  { name: 'Book', icon: require('../assets/images/Book.png'), price: 10 },
];

const insuranceItems = [
  { name: 'Traveling', icon: require('../assets/images/Briefcase.png'), price: 200 },
  { name: 'Medical', icon: require('../assets/images/Medicine.png'), price: 300 },
  { name: 'Accident', icon: require('../assets/images/Eye.png'), price: 250 },
];

// **New Cosmetics Category**
const cosmeticsItems = [
  { name: 'Top Hat', icon: require('../assets/images/TopHat.png'), price: 25 },
  { name: 'Police Hat', icon: require('../assets/images/PoliceHat.png'), price: 30 },
  { name: 'Soldier Helm', icon: require('../assets/images/MilitaryHelmet.png'), price: 40 },
  { name: 'Bow Tie', icon: require('../assets/images/BowTie.png'), price: 15 },
  { name: 'Suit Tie', icon: require('../assets/images/TieIcon.png'), price: 20 },
  { name: 'Gold Chain', icon: require('../assets/images/GoldChainIcon.png'), price: 35 },
  { name: 'Police Badge', icon: require('../assets/images/PoliceBadgeIcon.png'), price: 18 },
  { name: 'Baseball Cap', icon: require('../assets/images/BaseballCap.png'), price: 12 },
  { name: 'Sunglasses', icon: require('../assets/images/SunglassesIcon.png'), price: 10 },
];

const StoreScreen: React.FC<StoreScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ name: string; icon: any, price: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCosmeticModal, setShowCosmeticModal] = useState(false); // New modal for cosmetics
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0)); // Initialize animated value for fading
  const [userCoins, setUserCoins] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<number>(0); 
  const [hasEnoughCoins, setHasEnoughCoins] = useState<boolean>(true); // State to track if user has enough coins
  const [oid, setOid] = useState<string | null>(null);

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
        } else {
          console.log('No oid found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching oid from AsyncStorage:', error);
      }
    };

    fetchOid();
  }, []);

  const updateCoins = async (newCoins: number) => {
    try {
      await updatePetWallet({ coins: newCoins });
      console.log('Coins updated successfully');
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  const updatePoints = async (newPoints: number) => {
    try {
      await updatePetWallet({ points: newPoints });
      console.log('Points updated successfully');
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  const updateItems = async (itemName: string) => {
    try {
      await adjustInventoryItem(itemName, 1);
      console.log('Items updated successfully');
    } catch (error) {
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
    } else {
      navigation.navigate('Home');
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedCategory(option);
  };

  const handleItemSelect = (item: { name: string; icon: any, price: number }) => {
    setSelectedItem(item);
    if (selectedCategory === 'Cosmetics') {
      setShowCosmeticModal(true); // Show cosmetic confirmation modal
    } else {
      setShowModal(true); // Show regular purchase modal
    }
  };

  const handlePurchase = async () => {
    if (selectedItem) {
      // Check if the user has enough coins
      if (userCoins >= selectedItem.price) {
        setPurchaseMessage(`You have purchased ${selectedItem.name}!`);

        const updatedCoins = userCoins - selectedItem.price;
        setUserCoins(updatedCoins);
        await updateCoins(updatedCoins);
        await updateItems(selectedItem.name);
        checkCoinSpendingAchievements(selectedItem.price);

        // Check if the purchased item is an insurance product
        if (insuranceItems.some(item => item.name === selectedItem.name)) {
          completeTask('Buy an insurance product');
        }
      } else {
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
        setPurchaseMessage(`You have purchased ${selectedItem.name} for ${selectedItem.price} points!`);
        const updatedPoints = userPoints - selectedItem.price;
        setUserPoints(updatedPoints);
        await updatePoints(updatedPoints);
        await updateItems(selectedItem.name);
        // Logic to update points in the backend would go here
        if (cosmeticsItems.some(item => item.name === selectedItem.name)) {
          checkDressUpTimeAchievement();
        }
      } else {
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
    } else if (selectedCategory === 'Toys and Entertainment') {
      items = toyItems;
    } else if (selectedCategory === 'Insurance Packages') {
      items = insuranceItems; // Ensure this matches exactly
    }
    // **Handle Cosmetics Category**
    else if (selectedCategory === 'Cosmetics') {
      items = cosmeticsItems;
    }

    return items?.map((item) => (
      <TouchableOpacity
        key={item.name}
        style={styles.menuItem}
        onPress={() => handleItemSelect(item)}
      >
        <View style={styles.itemInfoContainer}>
          <Image source={item.icon} style={styles.icon} />
          <Text style={styles.menuText}>{item.name}</Text>
        </View>
        <View style={styles.priceContainer}>
          {/* Conditional rendering for price icon */}
          {selectedCategory === 'Cosmetics' ? (
            <Image source={require('../assets/images/Cash.png')} style={styles.coinIcon} /> // Use Cash.png for cosmetics
          ) : (
            <Image source={require('../assets/images/Coin.png')} style={styles.coinIcon} /> // Use Coin.png for other items
          )}
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.background}
        source={require('../assets/images/storeBG.jpeg')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.headerText}>Store</Text>

      {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}
      {oid && <CheckPoint oid={oid} onPointFetch={setUserPoints} />}

      {!selectedCategory ? (
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => handleOptionSelect('Pet Food')}
          >
            <Image source={require('../assets/images/PetBowl.png')} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>Pet Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => handleOptionSelect('Toys and Entertainment')}
          >
            <Image source={require('../assets/images/Gamepad.png')} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>Toys and Entertainment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => handleOptionSelect('Insurance Packages')}
          >
            <Image source={require('../assets/images/Briefcase.png')} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>Insurance Packages</Text>
          </TouchableOpacity>

          {/* **New Cosmetics Category Button** */}
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => handleOptionSelect('Cosmetics')}
          >
            <Image source={require('../assets/images/Cash.png')} style={styles.categoryIcon} /> 
            <Text style={styles.categoryText}>Cosmetics</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.foodItemsContainer}>
          {/* Back to Store Button */}
          <TouchableOpacity
            style={styles.backToStoreButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={styles.buttonText}>Back to Store Categories</Text>
          </TouchableOpacity>
          {renderItems()}
        </ScrollView>
      )}

      {/* Back arrow button in the top left corner */}
      <TouchableOpacity
        style={styles.backArrowButton}
        onPress={handleBackButton}
      >
        <FastImage
          source={require('../assets/images/back_arrow_icon.png')}
          style={styles.backArrowIcon}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>

      {/* Purchase Confirmation Modal for regular items */}
      {selectedItem && !showCosmeticModal && (
        <Modal transparent={true} visible={showModal} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Buy {selectedItem.name} for {selectedItem.price} Coins?
              </ Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={handlePurchase}>
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Purchase Confirmation Modal for cosmetic items */}
      {selectedItem && showCosmeticModal && (
        <Modal transparent={true} visible={showCosmeticModal} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Would you like to purchase {selectedItem.name} for {selectedItem.price} points?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={handleCosmeticPurchase}>
                  <Text style={styles.buttonText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
                  <Text style={styles.buttonText}>No</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Display purchase message as a bar */}
      {purchaseMessage ? (
        <Animated.View style={[styles.purchaseBar, { opacity: fadeAnim }]}>
          <Text style={styles.purchaseBarText}>{purchaseMessage}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
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
    width: 30,  // Adjust size of the icon as needed
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
