import React, { useEffect, useState, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetItems from '../utils/GetItem';
import CheckItem from '../utils/CheckItem';
import UseItem from '../utils/UseItem';
import GetPetStatus from '../utils/GetPetStatus';
import { foodItems, toyItems, insuranceItems, cosmeticsItems } from '../utils/sharedData';
import { completeTask } from '../utils/TaskManager';
import { incrementInsuranceUseCount, checkCleanDietAchievement } from '../utils/AchievementManager';
import { updatePetStatus as updateLocalPetStatus } from '../utils/LocalDataManager';

type RootStackParamList = {
  Home: undefined;
  Inventory: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type InventoryScreenProps = StackScreenProps<RootStackParamList, 'Inventory'>;

const getPetImage = (character: string | undefined) => {
  if (character === 'Koala') {
    return require('../assets/images/koala_eat.gif');
  } else if (character === 'Tiger') {
    return require('../assets/images/tiger_eat.gif');
  }
  return require('../assets/images/tiger_eat.gif'); // Fallback image
};

const InventoryScreen: React.FC<InventoryScreenProps> = ({ navigation }) => {
  const [oid, setOid] = useState<string | null>(null);
  const [itemValue, setItemValue] = useState<number>(0);
  const [energyValue, setEnergyValue] = useState<number>(0);
  const [happinessValue, setHappinessValue] = useState<number>(0);
  const [hungerValue, setHungerValue] = useState<number>(0);
  const [healthValue, setHealthValue] = useState<number>(0);
  const [petName, setPetName] = useState<string | null>(null);
  const [character, setCharacter] = useState<string | undefined>(undefined);
  const [isEating, setIsEating] = useState(false);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [isUsing, setIsUsing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCosmetics, setIsCosmetics] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'food' | 'toy' | 'cosmetics' | 'insurance' | null>(null);
  const [modalItemName, setModalItemName] = useState<string>('');
  const [energyCost, setEnergyCost] = useState<number>(0);
  const [happinessCost, setHappinessCost] = useState<number>(0);
  const [hungerCost, setHungerCost] = useState<number>(0);
  const [healthCost, setHealthCost] = useState<number>(0);
  const [isNotEnoughItemsModalVisible, setIsNotEnoughItemsModalVisible] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [equippedCosmetics, setEquippedCosmetics] = useState<string[]>([]);

  useEffect(() => {
    const fetchOid = async () => {
      try {
        const storedOid = await AsyncStorage.getItem('oid');
        if (storedOid !== null) {
          setOid(storedOid);
        } else {
          console.log('No oid found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching oid from AsyncStorage:', error);
      }
    };

    fetchOid();
  }, []);

  const updatePetStatus = async (newEnergy: number, newHappiness: number, newHunger: number, newHealth: number) => {
    try {
      await updateLocalPetStatus({ energy: newEnergy, happiness: newHappiness, hunger: newHunger, health: newHealth });
      console.log('Pet status updated successfully');
    } catch (error) {
      console.error('Error updating pet status:', error);
    }
  };

  useEffect(() => {
    completeTask('Check your inventory once');
  }, []);

  useEffect(() => {
    const fetchPetData = async () => {
      if (!petName || !character) {
        const storedPetName = await AsyncStorage.getItem('petName');
        const storedCharacter = await AsyncStorage.getItem('character');
        if (storedPetName && storedCharacter) {
          setPetName(storedPetName);
          setCharacter(storedCharacter);
        } else {
          navigation.navigate('CreateName');
        }
      }
    };
    fetchPetData();
  }, [petName, character]);

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

  const handleUseFoodItem = async (itemName: string, energy: number, happiness: number, hunger: number, health: number) => {
    await trackItemUsage(itemName);
    setModalType('food');
    setModalItemName(itemName);
    setEnergyCost(energy);
    setHappinessCost(happiness);
    setHungerCost(hunger);
    setHealthCost(health);
    setIsModalVisible(true);
    completeTask('Feed your pet');
  };

  const handleUseToyItem = (itemName: string, energy: number, happiness: number, hunger: number, health: number) => {
    setModalType('toy');
    setModalItemName(itemName);
    setEnergyCost(energy);
    setHappinessCost(happiness);
    setHungerCost(hunger);
    setHealthCost(health);
    setIsModalVisible(true);
    completeTask('Give your pet a toy');
  };

  const handleUseInsuranceItem = async (itemName: string) => {
    setModalType('insurance');
    setModalItemName(itemName);
    setIsModalVisible(true);
  };

  const handleUseCosmeticsItem = (itemName: string) => {
    setModalType('cosmetics');
    setModalItemName(itemName);
    setIsModalVisible(true);
  };

  const renderItems = useCallback((items: { name: string; icon: any, energy: number, happiness: number, hunger: number, health: number }[], handleUseItem: (itemName: string, energy: number, happiness: number, hunger: number, health: number) => void) => {
    return items.map((item, index) => (
      <TouchableOpacity key={`item-${index}`} style={styles.itemContainer} onPress={() => handleUseItem(item.name, item.energy, item.happiness, item.hunger, item.health)}>
        <Image source={item.icon} style={styles.itemIcon} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemText}>{item.name}</Text>
          <View style={styles.itemQuantityContainer}>
            <Text style={styles.itemQuantity}>x</Text>
            {oid && <GetItems key={`refresh-${refreshToggle}`} oid={oid} item={item.name} />}
          </View>
        </View>
      </TouchableOpacity>
    ));
  }, [oid, refreshToggle]);

  const handleConfirm = async () => {
    setIsModalVisible(false);
    if (modalType === 'food') {
      setSelectedFood(modalItemName);
      if (itemValue > 0 && energyValue > 0) {
        console.log(`Used ${modalItemName}`);
        const updatedEnergy = Math.min(100, Math.max(0, energyValue + energyCost));
        setEnergyValue(updatedEnergy);

        const updatedHappiness = Math.min(100, Math.max(0, happinessValue + happinessCost));
        setHappinessValue(updatedHappiness);

        const updatedHunger = Math.min(100, Math.max(0, hungerValue + hungerCost));
        setHungerValue(updatedHunger);

        const updatedHealth = Math.min(100, Math.max(0, healthValue + healthCost));
        setHealthValue(updatedHealth);


        updatePetStatus(updatedEnergy, updatedHappiness, updatedHunger, updatedHealth);
        setIsEating(true);
      } else {
        showNotEnoughItemsModal();
      }
    } else if (modalType === 'toy') {
      setSelectedItem(modalItemName);
      if (itemValue > 0 && energyValue > 0) {
        console.log(`Used ${modalItemName}`);
        const updatedEnergy = Math.min(100, Math.max(0, energyValue + energyCost));
        setEnergyValue(updatedEnergy);

        const updatedHappiness = Math.min(100, Math.max(0, happinessValue + happinessCost));
        setHappinessValue(updatedHappiness);

        const updatedHunger = Math.min(100, Math.max(0, hungerValue + hungerCost));
        setHungerValue(updatedHunger);

        const updatedHealth = Math.min(100, Math.max(0, healthValue + healthCost));
        setHealthValue(updatedHealth);

        updatePetStatus(updatedEnergy, updatedHappiness, updatedHunger, updatedHealth);
        setIsUsing(true);
      } else {
        showNotEnoughItemsModal();
      }
    } else if (modalType === 'insurance') {
      if (itemValue > 0) {
        console.log(`Used ${modalItemName}`);
        await incrementInsuranceUseCount();
      } else {
        showNotEnoughItemsModal();
      }
    } else if (modalType === 'cosmetics') {
      if (itemValue > 0) {
        const updatedCosmetics = [...equippedCosmetics];
        const index = updatedCosmetics.indexOf(modalItemName);
        if (index > -1) {
          // If item is already equipped, remove it
          updatedCosmetics.splice(index, 1);
        } else {
          // If item is not equipped, add it
          updatedCosmetics.push(modalItemName);
        }
        setEquippedCosmetics(updatedCosmetics);
        await AsyncStorage.setItem('equippedCosmetics', JSON.stringify(updatedCosmetics));
        setIsCosmetics(true);
      } else {
        showNotEnoughItemsModal();
      }
    }
  };

  const showNotEnoughItemsModal = () => {
    setIsNotEnoughItemsModalVisible(true);
  };

  const handleClose = () => {
    setIsEating(false);
    setIsUsing(false);
    setIsCosmetics(false);
    setRefreshToggle(!refreshToggle); // Trigger the refresh
  };

  const trackItemUsage = async (item: string) => {
    try {
        const consecutiveCount = await AsyncStorage.getItem('consecutiveFoodCount') || '0';
        const lastItem = await AsyncStorage.getItem('lastFoodItem');

        // Check if the item is one of the tracked items
        if (item === 'Pet Food' || item === 'Salad' || item === 'Fruits') {
            // If the last item was also a tracked item, increment the count
            if (lastItem === 'Pet Food' || lastItem === 'Salad' || lastItem === 'Fruits') {
                await AsyncStorage.setItem('consecutiveFoodCount', (parseInt(consecutiveCount) + 1).toString());
            } else {
                // If this is the first tracked item used, set the count to 1
                await AsyncStorage.setItem('consecutiveFoodCount', '1');
            }
            // Store the last used item
            await AsyncStorage.setItem('lastFoodItem', item);

            // Check if the achievement should be marked as complete
            checkCleanDietAchievement();
        } else {
            // Reset the counter if a non-qualifying item is used
            await AsyncStorage.setItem('consecutiveFoodCount', '0');
            await AsyncStorage.setItem('lastFoodItem', ''); // Clear last item
        }
    } catch (error) {
        console.error('Error tracking item usage:', error);
    }
};

  return (
    <View style={styles.container}>
      <FastImage 
        style={styles.background} 
        source={require('../assets/images/background5.jpeg')} 
        resizeMode={FastImage.resizeMode.cover} 
      />
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
      <Text style={styles.headerText}>Inventory</Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.sectionHeader}>Food Items</Text>
        {renderItems(foodItems, handleUseFoodItem)}
        <Text style={styles.sectionHeader}>Toy Items</Text>
        {renderItems(toyItems, handleUseToyItem)}
        <Text style={styles.sectionHeader}>Insurance Items</Text>
        {renderItems(insuranceItems, handleUseInsuranceItem)}
        <Text style={styles.sectionHeader}>Cosmetics Items</Text>
        {renderItems(cosmeticsItems, handleUseCosmeticsItem)}
      </ScrollView>
      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {modalType === 'food' && `Eat ${modalItemName}?`}
              {modalType === 'toy' && `Use ${modalItemName}?`}
              {modalType === 'insurance' && `Use ${modalItemName}?`}
              {modalType === 'cosmetics' && `Equip ${modalItemName}?`}
              {oid && <CheckItem oid={oid} item={modalItemName} onItemFetch={setItemValue} />}
              {oid && <GetPetStatus oid={oid} onEnergyFetch={setEnergyValue} onHappinessFetch={setHappinessValue} onHungerFetch={setHungerValue} onHealthFetch={setHealthValue} />}
            </Text>
            <Text style={styles.modalSubText}>
              {modalType === 'food' && `Are you sure you want to eat ${modalItemName}?`}
              {modalType === 'toy' && `Are you sure you want to use ${modalItemName}?`}
              {modalType === 'insurance' && `Are you sure you want to use ${modalItemName}?`}
              {modalType === 'cosmetics' && `Are you sure you want to equip ${modalItemName}?`}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="fade"
        visible={isNotEnoughItemsModalVisible}
        onRequestClose={() => setIsNotEnoughItemsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Not Enough Items</Text>
            <Text style={styles.modalSubText}>
              You don't have enough of this item to use.
            </Text>
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, styles.centerButton]}
                onPress={() => setIsNotEnoughItemsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {isEating && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isEating}
          onRequestClose={() => setIsEating(false)}
        >
          {oid && <UseItem oid={oid} item={modalItemName} />}
          <View style={styles.modalContainer}>
            <FastImage 
              source={getPetImage(character)} 
              style={styles.eatingAnimation} 
              resizeMode={FastImage.resizeMode.contain} 
            />
            <Text style={styles.modalText}>{petName} is eating {selectedFood}!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {isUsing && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isUsing}
          onRequestClose={() => setIsUsing(false)}
        >
          {oid && <UseItem oid={oid} item={modalItemName} />}
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{petName} is using {selectedItem}!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      {isCosmetics && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={isCosmetics}
          onRequestClose={() => setIsCosmetics(false)}
        >
          {oid && <UseItem oid={oid} item={modalItemName} />}
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{petName} looks fabulous!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
  headerText: {
    fontSize: 24,
    fontFamily: 'joystix monospace',
    color: 'black',
    zIndex: 1,
    marginVertical: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
    marginBottom: 30,
  },
  scrollViewContent: {
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: '#fff',
    marginVertical: 10,
    textAlign: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '90%',
  },
  itemIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
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
  itemQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 16,
    fontFamily: 'joystix monospace',
    color: '#000',
  },
  itemQuantityNumber: {
    fontSize: 16,
    fontFamily: 'joystix monospace',
    color: '#000',
    marginLeft: 4,
  },
  backArrowButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backArrowIcon: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  eatingAnimation: {
    width: 200,
    height: 200,
  },
  modalText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: '#fff',
    marginVertical: 20,
  },
  closeButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'joystix monospace',
    color: '#000',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalSubText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    width: '40%',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  confirmButton: {
    backgroundColor: 'green',
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  centerButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  centerButton: {
    width: '50%',
  },
});

export default InventoryScreen;
