import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import FastImage from 'react-native-fast-image';
import { StackScreenProps } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { completeTask } from '../utils/TaskManager';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { Subscription } from 'rxjs';

type RootStackParamList = {
  Home: undefined;
  StepCounter: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type StepCounterScreenProps = StackScreenProps<RootStackParamList, 'StepCounter'>;

const StepCounterScreen: React.FC<StepCounterScreenProps> = ({ navigation, route }) => {
  const { petName: initialPetName, character: initialCharacter } = (route.params || {}) as { petName?: string; character?: string };
  const [petName, setPetName] = useState(initialPetName);
  const [character, setCharacter] = useState(initialCharacter);
  const [steps, setSteps] = useState(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [lastAcceleration, setLastAcceleration] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [fact, setFact] = useState('');

  const funFacts = [
    "Did you know Health insurance can help you pay your medical bills for illness, injuries and pregnancies?",
    "Did you know that Life insurance pays the beneficiary in the event the insured passes away?",
    "Did you know Auto insurance covers car accidents or damage by natural disasters?",
    "Did you know Etiqa has Homeowners insurance that covers the Homeowners in the event of property getting damaged by disasters during property rental? It’s called Houseowner and Householder Insurance!",
    "Did you know that Etiqa's Travel insurance covers the person in the event of flight cancellations or delays and medical? There are add on plans such as covid protection!",
    "Did you know the term “Premium” is a payment that you must make or else your insurance may be cancelled by the company?",
    "Did you know a “Deductible” is an initial payment to be made before your insurance coverage starts paying for your claims?",
    "Beneficiary is the person that receives the payment in the event of an insurance payout.",
    "Riders are additional insurance policies that add onto the existing insurance policy by paying extra.",
    "Policy holder is a person that is responsible for paying the premium for the insurance policy",
    "Did you know that the highest Takaful insurance contributions come from Saudi Arabia?",
    "Did you know that there are 2 types of insurance such as Takaful insurance or Standard insurance? Takaful insurance is introduced in Muslim countries as there is an increased demand for a financial system that aligns with Islamic values.",
    "The common misconception of insurance is that single people don’t need insurance. If you’re young, premiums are cheaper and with insurance coverage, it can help cover student debts or medical bills.",
    "The common misconception of insurance is that it is expensive. There are actually various types of insurance that are affordable.",
    "Did you know that young drivers from the age 16 - 24 have the most expensive car insurance?",
    "Did you know that Life Insurance is rising steadily throughout the years?",
    "Did you know that Etiqa Takaful has been voted the fastest estimated approval time for own damage claims in 2023?",
    "Did you know that Etiqa has been voted for the company that has the most approved claims in 2023?",
    "Did you know that Etiqa has expanded overseas into Singapore, Cambodia, Indonesia and The Philippines?",
    "Did you know that Etiqa’s brand name was launched in 2007 after a merger?",
    "Did you know that Etiqa is the largest insurer for General and Takaful insurance in Malaysia?",
    "Did you know that Etiqa practices Sustainable Development Goals (SDG) for a more sustainable future?",
    "Did you know that Etiqa aims to achieve Net Zero Carbon emissions by 2050 in alignment with Maybank?",
    "Did you know that the line under the eTiQa logo signifies a human smile and the letter “i” in between “T” and “Q” stands for “I Thank You”?",
    // Add more fun facts here
  ];

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

  useEffect(() => {
    completeTask('Go for walking');
  }, []);

  useEffect(() => {
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFact(randomFact);
  }, []);

  useEffect(() => {
    // Set accelerometer update interval to 200ms (5 times per second)
    setUpdateIntervalForType(SensorTypes.accelerometer, 200);

    const newSubscription = accelerometer.subscribe(({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);

      // Detect peaks to approximate steps
      if (lastAcceleration !== null && acceleration > 1.2 && lastAcceleration <= 1.2) {
        setSteps((prevSteps) => prevSteps + 1);
      }

      setLastAcceleration(acceleration);
    });

    setSubscription(newSubscription);

    // Cleanup function to unsubscribe
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [lastAcceleration]);

  const getPetImage = (character: string | undefined) => {
    if (character === 'Koala') {
      return require('../assets/images/KoalaWalking.gif');
    } else if (character === 'Tiger') {
      return require('../assets/images/walk_test.gif');
    }
    return require('../assets/images/walk_test.gif'); // Fallback image
  };

  const handleBackButton = async () => {
    if (petName && character) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainGame', params: { petName, character } }],
      });
    } else {
      navigation.navigate('CreateName');
    }
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.backgroundImage}
        source={require('../assets/images/movingbackground.gif')}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        {/* Step Counter Bar at the Top */}
        <View style={styles.stepCounterBar}>
          <Text style={styles.stepCounterBarText}>Steps: {steps}</Text>
        </View>

        {/* Animation Positioned Above the Button */}
        <View style={styles.animalContainer}>
          <FastImage
            source={getPetImage(character)}
            style={styles.animalImage}
            resizeMode="contain"
          />
        </View>

        {modalVisible && (
        <Modal
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>{fact}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

        {/* Back Arrow Button */}
        <TouchableOpacity
          style={styles.backArrowButton}
          onPress={handleBackButton}
        >
          <Image
            source={require('../assets/images/back_arrow_icon.png')}
            style={styles.backArrowIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default StepCounterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  stepCounterBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    padding: 15,
    position: 'absolute',
    top: 130,
    alignItems: 'center',
    zIndex: 2,
  },
  stepCounterBarText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'joystix monospace',
  },
  animalContainer: {
    flex: 3,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 5,
    marginBottom: 150,
  },
  animalImage: {
    width: 180,
    height: 180,
  },
  backArrowButton: {
    position: 'absolute',
    top: 30,
    left: -100,
    zIndex: 10,
  },
  backArrowIcon: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,  // Adjust padding as needed
    zIndex: 4,  // Keep below back button
  },
  modalContent: {
    backgroundColor: 'rgba(255, 165, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
    maxWidth: '100%',
    alignItems: 'center',
    bottom: 100
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'joystix monospace',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  
});
