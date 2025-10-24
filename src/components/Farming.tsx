import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckCoin  from '../utils/CheckCoin';
import { completeTask } from '../utils/TaskManager';
import { checkFarmerAchievement } from '../utils/AchievementManager';
import { updatePetWallet, adjustInventoryItem } from '../utils/LocalDataManager';

const cropImages = [
  require('../assets/images/crop1.png'),
  require('../assets/images/crop2.png'),
  require('../assets/images/crop3.png'),
];

const rewards = ['Wheat', 'Cucumber', 'Onion', 'Potato'];

const FarmingScreen: React.FC = () => {
  const [crops, setCrops] = useState<number[]>([0, 1, 2]);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30); 
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [oid, setOid] = useState<string | null>(null);
  const navigation = useNavigation();

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimer(15);
  };

  useEffect(() => {
    if (gameStarted) {
      const cropMovement = setInterval(() => {
        setCrops((crops) => crops.map(() => Math.random() * 300));
      }, 1500);
      return () => clearInterval(cropMovement);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setGameOver(true);
      assignRandomReward();
    }
  }, [gameStarted, timer]);

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






  const assignRandomReward = async () => {
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    Alert.alert(`You harvested: ${randomReward}!`, 'You earned 10 coins with it!');
    const updatedCoins = userCoins + 10;
    setUserCoins(updatedCoins);
    await updatePetWallet({ coins: updatedCoins });
  };

  const handleWaterCrop = async (cropIndex: number) => {
    if (!gameOver) {
      setScore((prevScore) => prevScore + 1);
      setCrops((crops) =>
        crops.map((crop, index) => (index === cropIndex ? Math.random() * 300 : crop))
      );
      const harvestedCropType = rewards[Math.floor(Math.random() * rewards.length)];

      // Add harvested item to inventory
      await adjustInventoryItem(harvestedCropType, 1);

      // Check achievement
      await checkFarmerAchievement();
    }
    completeTask('Catch fish / Harvest crops once');
  };

  const handleBackButton = async () => {
    const petName = await AsyncStorage.getItem('petName');
    const character = await AsyncStorage.getItem('character');
    if (petName && character) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Activities' as never, params: { petName, character } }],
      });
    } else {
      navigation.navigate('Home' as never);
    }
  };

  return (
    <View style={styles.container}>
      <FastImage
        style={styles.background}
        source={require('../assets/images/farmingBG.jpeg')}
        resizeMode={FastImage.resizeMode.cover}
      />
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
        <Image source={require('../assets/images/back_arrow_icon.png')} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Fetch coins using CheckCoin */}
      {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}

      {!gameStarted ? (
        <View style={styles.introContainer}>
          <Text style={styles.introText}>Harvest as many crops as you can in 15 seconds!</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Farming</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.upperTextContainer}>
            <Text style={styles.headerText}>Farming Game</Text>
            <Text style={styles.timerText}>Time Left: {timer} seconds</Text>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>

          {crops.map((crop, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.crop, { left: crop }]}
              onPress={() => handleWaterCrop(index)}
            >
              <Image source={cropImages[index % cropImages.length]} style={styles.cropImage} />
            </TouchableOpacity>
          ))}

          {gameOver && <Text style={styles.gameOverText}>Game Over! Your score: {score}</Text>}
        </>
      )}
    </View>
  );
};

export default FarmingScreen;

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
  upperTextContainer: {
    position: 'absolute',
    top: 150, // Position text near the top
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'joystix monospace',
    marginBottom: 10,
    color: 'black',
  },
  timerText: {
    fontSize: 18,
    marginBottom: 5,
    color: 'black',
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'black',
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
  crop: {
    position: 'absolute',
    bottom: 100,
    width: 30,
    height: 80,
  },
  cropImage: {
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
  },
  backIcon: {
    width: 30,
    height: 30,
  },
});
