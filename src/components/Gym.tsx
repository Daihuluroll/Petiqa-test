import React, { useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import GetPetStatus from '../utils/GetPetStatus';

type RootStackParamList = {
  Home: undefined;
  Gym: undefined;
  Weightlifting: undefined;
  Running: undefined;
  Cycling: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type GymScreenProps = StackScreenProps<RootStackParamList, 'Gym'>;

const gymActivities = [
  { name: 'Weightlifting', icon: require('../assets/images/lightning_bolt.png'), energy: -20, happiness: 15, hunger: -20, health: 20, screen: 'Weightlifting' },
  { name: 'Running', icon: require('../assets/images/lightning_bolt.png'), energy: -20, happiness: 20, hunger: -30, health: 30, screen: 'Running' },
  { name: 'Cycling', icon: require('../assets/images/lightning_bolt.png'), energy: -20, happiness: 15, hunger: -25, health: 25, screen: 'Cycling' },
];

const GymScreen: React.FC<GymScreenProps> = ({ navigation }) => {
  const [petName, setPetName] = useState<string | null>(null);
  const [oid, setOid] = useState<string | null>(null);
  const [energyValue, setEnergyValue] = useState<number>(0);
  const [happinessValue, setHappinessValue] = useState<number>(0);
  const [hungerValue, setHungerValue] = useState<number>(0);
  const [healthValue, setHealthValue] = useState<number>(0);
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
        } else {
          console.log('No oid found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching oid from AsyncStorage:', error);
      }
    };

    fetchOid();
  }, []);

  const updatePetStatus = async (oid: string, newEnergy: number, newHappiness: number, newHunger: number, newHealth: number) => {
    try {
      const response = await axios.post(
        'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/updateOne',
        {
          dataSource: "Cluster-1",
          database: "Petiqa",
          collection: "allItems",
          filter: { "_id": { "$oid": oid } }, // Matching document by id
          update: { "$set": 
            { "energy": newEnergy, "happiness": newHappiness, "hunger": newHunger, "health": newHealth }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
          }
        }
      );
      
      console.log('Energy updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating energy:', error);
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
    } else {
      navigation.navigate('CreateName');
    }
  };

  const handleConsumption = (energy: number, happiness: number, hunger: number, health: number, screen: string) => {
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
    } else {
      setModalVisible(true);
      console.log(`You don't have enough energy.`);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Navigate to the specific activity screen
  const handleNavigation = (screen: string) => {
    navigation.navigate(screen as any); // Navigate to the respective activity screen
  };

  const renderGymOptions = () => {
    return gymActivities.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.itemContainer}
        onPress={() => handleConsumption(item.energy, item.happiness, item.hunger, item.health, item.screen)} // Navigate to the corresponding screen
      >
        <Text style={styles.itemText}>{item.name}</Text>
        <View style={styles.costContainer}>
          <Image source={item.icon} style={styles.lightningIcon} />
          <Text style={styles.costText}>{item.energy}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <FastImage 
        style={styles.background} 
        source={require('../assets/images/gymBG.jpeg')} 
        resizeMode={FastImage.resizeMode.cover} 
      />

      {/* Header and Subheader Container */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Gym</Text>

        {oid && <GetPetStatus oid={oid} onEnergyFetch={setEnergyValue} onHappinessFetch={setHappinessValue} onHungerFetch={setHungerValue} onHealthFetch={setHealthValue} />}

        <Text style={styles.subHeaderText}>
          Workout and stay fit with {petName ? petName : '[pet name]'}!
        </Text>
      </View>

      {/* Back arrow button in the top-left corner */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Image source={require('../assets/images/back_arrow_icon.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Modal for insufficient energy */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={closeModal} // Close modal on back button press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>You don't have enough energy to exercise!</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gym activities */}
      <View style={styles.gymOptionsContainer}>
        {renderGymOptions()}
      </View>
    </View>
  );
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
