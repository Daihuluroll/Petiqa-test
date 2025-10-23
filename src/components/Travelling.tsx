import React, { useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeTask } from '../utils/TaskManager';
import GetPetStatus from '../utils/GetPetStatus';
import CheckCoin from '../utils/CheckCoin';
import { updatePetStatus, updatePetWallet, adjustInventoryItem } from '../utils/LocalDataManager';

type RootStackParamList = {
  Home: undefined;
  Travelling: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
  Hollywood: { location: string; character: string };
  Osaka: { location: string; character: string };
};

type TravellingScreenProps = StackScreenProps<RootStackParamList, 'Travelling'>;

const travelItems = [
  { name: 'Hollywood', icon: require('../assets/images/clapperboard.png'), energy: -30, happiness: 30, hunger: -25, health: 0, price: 10 },
  { name: 'Osaka', icon: require('../assets/images/osaka_flower.png'), energy: -30, happiness: 30, hunger: -25, health: 0, price: 10 },
];

const TravellingScreen: React.FC<TravellingScreenProps> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [character, setCharacter] = useState<string | undefined>(undefined);
  const [oid, setOid] = useState<string | null>(null);
  const [energyValue, setEnergyValue] = useState<number>(0);
  const [happinessValue, setHappinessValue] = useState<number>(0);
  const [hungerValue, setHungerValue] = useState<number>(0);
  const [healthValue, setHealthValue] = useState<number>(0);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [notEnoughEnergyModalVisible, setNotEnoughEnergyModalVisible] = useState(false);

  // Load character from AsyncStorage when the component mounts
  useEffect(() => {
    const loadCharacter = async () => {
      const storedCharacter = await AsyncStorage.getItem('character');
      setCharacter(storedCharacter || undefined);
    };

    loadCharacter();
  }, []);

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



  const handleBackButton = async () => {
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

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setModalVisible(true);
  };

  const confirmTravel = () => {
    const selectedItem = travelItems.find(item => item.name === selectedLocation);
    
    if (selectedItem && energyValue >= 30) {
      const updatedEnergy = Math.min(100, Math.max(0, energyValue + selectedItem.energy));
      setEnergyValue(updatedEnergy);
  
      const updatedHappiness = Math.min(100, Math.max(0, happinessValue + selectedItem.happiness));
      setHappinessValue(updatedHappiness);
  
      const updatedHunger = Math.min(100, Math.max(0, hungerValue + selectedItem.hunger));
      setHungerValue(updatedHunger);
  
      const updatedHealth = Math.min(100, Math.max(0, healthValue + selectedItem.health));
      setHealthValue(updatedHealth);
  
      const updatedCoins = userCoins - selectedItem.price;
  
      if (oid) {
        updatePetStatus({ energy: updatedEnergy, happiness: updatedHappiness, hunger: updatedHunger, health: updatedHealth });
        updatePetWallet({ coins: updatedCoins });
      }
  
      navigateToLocation(selectedLocation);
    } else {
      setModalVisible(false);
      setNotEnoughEnergyModalVisible(true);
      console.log("You don't have enough energy.");
    }
  };
  

  const navigateToLocation = (location: string) => {
    if (character) {
      if (location === 'Hollywood') {
        navigation.navigate('Hollywood', { location, character });
      } else if (location === 'Osaka') {
        navigation.navigate('Osaka', { location, character });
      }
    } else {
      console.error("Character is undefined. Cannot navigate.");
    }
    completeTask('Go traveling once');
  };

  const renderTravellingOptions = () => {
    return travelItems.map((item, index) => (
      <TouchableOpacity key={index} onPress={() => handleSelectLocation(item.name)}>
        <View style={styles.itemContainer}>
          <Image source={item.icon} style={styles.itemIcon} />
          <Text style={styles.itemText}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Image source={require('../assets/images/Coin.png')} style={styles.coinIcon} />
            <Text style={styles.priceText}>{item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.background}
        source={require('../assets/images/travelBG.jpeg')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <Text style={styles.headerText}>Travelling</Text>
      <Text style={styles.subHeaderText}>Take your pet around the world!</Text>

      {oid && <GetPetStatus oid={oid} onEnergyFetch={setEnergyValue} onHappinessFetch={setHappinessValue} onHungerFetch={setHungerValue} onHealthFetch={setHealthValue} />}
      {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}


      {/* Back arrow button in the top-left corner */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Image source={require('../assets/images/back_arrow_icon.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Travelling options */}
      <View style={styles.travelOptionsContainer}>
        {renderTravellingOptions()}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={notEnoughEnergyModalVisible}
        onRequestClose={() => setNotEnoughEnergyModalVisible(false)}
      >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Text style={styles.modalText}>You don't have enough energy to travel!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setNotEnoughEnergyModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to travel to {selectedLocation}?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={confirmTravel}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TravellingScreen;

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
    marginTop: 80,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: 'black',
    zIndex: 1,
    marginBottom: 40,
    textAlign: 'center',
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
  travelOptionsContainer: {
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
    justifyContent: 'space-between', // Aligns name on the left and price on the right
  },
  itemIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  itemText: {
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
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#FFCC00',
    padding: 10,
    borderRadius: 5,
    width: '40%',
  },
  modalButtonText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: 'black',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FFCC00',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    left: 85,
  },
});