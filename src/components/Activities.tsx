import React, { useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePetStatus } from '../utils/LocalDataManager';
import { completeTask } from '../utils/TaskManager';
import GetPetStatus from '../utils/GetPetStatus';

type RootStackParamList = {
  Home: undefined;
  Activities: undefined;
  Fishing: undefined;
  Farming: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type ActivitiesScreenProps = StackScreenProps<RootStackParamList, 'Activities'>;

const activityItems = [
  { name: 'Farming', icon: require('../assets/images/farming.png'), energy: -15, happiness: 20, hunger: -20, health: 0, screen: 'Farming' },
  { name: 'Fishing', icon: require('../assets/images/fishing.png'), energy: -15, happiness: 20, hunger: -20, health: 0, screen: 'Fishing' },
];

const ActivitiesScreen: React.FC<ActivitiesScreenProps> = ({ navigation }) => {
  const [petName, setPetName] = useState<string | null>(null);
  const [oid, setOid] = useState<string | null>(null);
  const [energyValue, setEnergyValue] = useState<number>(0);
  const [happinessValue, setHappinessValue] = useState<number>(0);
  const [hungerValue, setHungerValue] = useState<number>(0);
  const [healthValue, setHealthValue] = useState<number>(0);
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
        } else {
          console.log('No oid found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching oid from AsyncStorage:', error);
      }
    };

    fetchOid();
  }, []);

  useEffect(() => {
    completeTask('Go to activity');
  }, []);



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
          updatePetStatus({ energy: updatedEnergy, happiness: updatedHappiness, hunger: updatedHunger, health: updatedHealth });
          handleNavigation(screen);
        }
    } else {
      setNotEnoughEnergyModalVisible(true);
      console.log(`You don't have enough energy.`);
    }
  };

  // Function to handle navigation to the selected mini-game
  const handleNavigation = (screen: string) => {
    navigation.navigate(screen as any); // Navigate to the respective activity screen
  };

  const renderActivities = () => {
    return activityItems.map((item, index) => (
      <TouchableOpacity
        key={index}
        style={styles.itemContainer}
        onPress={() => handleConsumption(item.energy, item.happiness, item.hunger, item.health, item.screen)} // Navigate to the respective screen
      >
        <Image source={item.icon} style={styles.itemIcon} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemText}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <FastImage 
        style={styles.background} 
        source={require('../assets/images/activitiesBG.jpeg')} 
        resizeMode={FastImage.resizeMode.cover} 
      />
      <Text style={styles.headerText}>Activities</Text>
      {oid && <GetPetStatus oid={oid} onEnergyFetch={setEnergyValue} onHappinessFetch={setHappinessValue} onHungerFetch={setHungerValue} onHealthFetch={setHealthValue} />}

      {/* Back arrow button in the top-left corner */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Image source={require('../assets/images/back_arrow_icon.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={notEnoughEnergyModalVisible}
        onRequestClose={() => setNotEnoughEnergyModalVisible(false)}
      >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>You don't have enough energy to perform this activity!</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => setNotEnoughEnergyModalVisible(false)}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
      </Modal>

      {/* Scrollable activity list */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderActivities()}
      </ScrollView>
    </View> 
  );
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
