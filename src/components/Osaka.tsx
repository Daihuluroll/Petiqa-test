// OsakaScreen.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Modal, Text } from 'react-native';
import FastImage, { ImageStyle as FastImageStyle } from 'react-native-fast-image';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cosmeticHat, cosmeticBody, cosmeticFace, cosmeticTall, cosmeticHelmet, cosmeticHighBody } from '../utils/sharedData';
import { completeTask } from '../utils/TaskManager';
import { addVisitedLocation } from '../utils/AchievementManager';
import { checkAccidentProneAchievement } from '../utils/AchievementManager';
import CheckInsurance from '../utils/CheckInsurance';
import CheckCoin from '../utils/CheckCoin';
import GetPetStatus from '../utils/GetPetStatus';
import { updatePetWallet, adjustInventoryItem, adjustPetStatus } from '../utils/LocalDataManager';

type RootStackParamList = {
  Home: undefined;
  Travelling: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
  Osaka: { location: string; character: string };
};

type OsakaScreenProps = {
  route: RouteProp<RootStackParamList, 'Osaka'>;
  navigation: StackNavigationProp<RootStackParamList, 'Osaka'>;
};

type PetEntity = {
  name: string;
  image: any;
};

type CosmeticItem = {
  name: string;
  image: any;
};

// Back button handler
const handleBackButton = async (navigation: StackNavigationProp<RootStackParamList, 'Osaka'>) => {
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

// OsakaScreen component
const OsakaScreen: React.FC<OsakaScreenProps> = ({ route, navigation }) => {
  const { character } = route.params;
  const [pet, setPet] = useState<PetEntity | null>(null);
  const [cosmeticItems, setCosmeticItems] = useState<CosmeticItem[]>([]);

  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [insuranceModalVisible, setInsuranceModalVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [insuranceMessage, setInsuranceMessage] = useState('');
  const [oid, setOid] = useState<string | null>(null);
  const [itemValue, setItemValue] = useState<number>(0);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [energyValue, setEnergyValue] = useState<number>(0);

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



  const getBackgroundImage = () => require('../assets/images/osakaBG.jpeg');

  // Load cosmetic items from AsyncStorage
  const loadCosmeticItems = async () => {
    try {
      const storedCosmetics = await AsyncStorage.getItem('equippedCosmetics');
      if (storedCosmetics) {
        const equippedNames: string[] = JSON.parse(storedCosmetics);
        const equippedItems: CosmeticItem[] = [
          ...cosmeticHat,
          ...cosmeticBody,
          ...cosmeticFace,
          ...cosmeticTall,
          ...cosmeticHelmet,
          ...cosmeticHighBody,
        ].filter(item => equippedNames.includes(item.name));
        setCosmeticItems(equippedItems);
      }
    } catch (error) {
      console.error('Error loading cosmetics:', error);
    }
  };

  // Load the pet entity based on the character
  const loadPetEntity = async () => {
    if (character === 'Tiger') {
      setPet({ name: 'Tiger', image: require('../assets/images/tiger_HQ1.gif') });
    } else if (character === 'Koala') {
      setPet({ name: 'Koala', image: require('../assets/images/koala_HQ1.gif') });
    }
  };

  // Check for random events
  const checkForRandomEvents = async () => {
    try {
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
      } else if (randomEvent < 1) { // 10% chance for friend encounter
        setModalVisible(true);
        setMessage("You have encountered a friend while travelling, how nice! You gain +10 energy");
        completeTask('Encounter any random event once');
        await adjustPetStatus({ energy: 10 });
        setEnergyValue((prev) => Math.min(100, prev + 10));
      }
      // 80% chance for nothing to happen (do nothing)
    } catch (error) {
      console.error('Error in checkForRandomEvents:', error);
    }
  };

  // Handle modal close and check for insurance
  const handleModalClose = () => {
    setModalVisible(false);
    if (message === "Oh no! The airport lost your luggage...") {
      // Check for insurance
      if (itemValue > 0) {
        setInsuranceModalVisible(true);
        setInsuranceMessage("Luckily you have travelling insurance! You don't have to pay since the insurance company will cover the cost of the lost luggage.");
        if (oid) {
          adjustInventoryItem('Traveling', -1);
        }
      } else {
        setInsuranceModalVisible(true);
        setInsuranceMessage("Sadly you don't have travelling insurance... you will have to cover the cost of the lost luggage yourself. You lost 50 coins");
        const updatedCoins = userCoins - 50;
        if (oid) {
          updatePetWallet({ coins: updatedCoins });
        }
      }
    }
  };

  useEffect(() => {
    loadCosmeticItems();
    loadPetEntity();
    checkForRandomEvents();
  }, []);

  useEffect(() => {
    addVisitedLocation('Osaka');
  }, []);

  // Render the cosmetic items based on the character
  const renderCosmetics = () => {
    const stylesByCharacter: Record<string, Record<string, FastImageStyle>> = {
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

    return (
      <View style={styles.cosmeticsContainer}>
        {cosmeticItems.map((item, index) => {
          let cosmeticStyle: FastImageStyle | undefined;

          if (cosmeticHat.some(hat => hat.name === item.name)) {
            cosmeticStyle = selectedStyles.hatStyle;
          } else if (cosmeticBody.some(body => body.name === item.name)) {
            cosmeticStyle = selectedStyles.bodyStyle;
          } else if (cosmeticFace.some(face => face.name === item.name)) {
            cosmeticStyle = selectedStyles.faceStyle;
          } else if (cosmeticTall.some(tall => tall.name === item.name)) {
            cosmeticStyle = selectedStyles.tallStyle;
          } else if (cosmeticHelmet.some(helmet => helmet.name === item.name)) {
            cosmeticStyle = selectedStyles.helmetStyle;
          } else if (cosmeticHighBody.some(highbody => highbody.name === item.name)) {
            cosmeticStyle = selectedStyles.highbodyStyle;
          }

          console.log(`Item: ${item.name}, Assigned Style:`, cosmeticStyle);
          console.log(`Current Character: ${character}`);
          console.log(`Cosmetic Items:`, cosmeticItems);

          return cosmeticStyle ? (
            <FastImage
              key={index}
              style={cosmeticStyle}
              source={item.image}
              resizeMode={FastImage.resizeMode.contain}
            />
          ) : null;
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.background}
        source={getBackgroundImage()}
        resizeMode={FastImage.resizeMode.cover}
      />
      {pet && (
        <FastImage
          style={styles.petImage}
          source={pet.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      )}
      {oid && <CheckInsurance oid={oid} onItemFetch={setItemValue} />}
      {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}
      {oid && <GetPetStatus oid={oid} onEnergyFetch={setEnergyValue} onHappinessFetch={() => {}} onHungerFetch={() => {}} onHealthFetch={() => {}} />}

      {renderCosmetics()}
      <TouchableOpacity style={styles.backButton} onPress={() => handleBackButton(navigation)}>
        <Image source={require('../assets/images/back_arrow_icon.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Modals */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => handleModalClose()}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => handleModalClose()}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={insuranceModalVisible}
        onRequestClose={() => setInsuranceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{insuranceMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setInsuranceModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
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