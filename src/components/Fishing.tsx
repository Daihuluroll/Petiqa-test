import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, GestureResponderEvent } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CheckCoin from '../utils/CheckCoin';
import { completeTask } from '../utils/TaskManager';
import { checkFishermanAchievement } from '../utils/AchievementManager';
import { updatePetWallet, adjustInventoryItem } from '../utils/LocalDataManager';

const fishImages = [
  require('../assets/images/fish1.png'),
  require('../assets/images/fish2.png'),
  require('../assets/images/fish3.png'),
];

const rewards = ['Salmon', 'Tuna', 'Shrimp', 'Crab'];

const FishingScreen: React.FC = () => {
  const [fishes, setFishes] = useState<number[]>([0, 1, 2]);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30); // 30 seconds to catch fish
  const [gameStarted, setGameStarted] = useState(false); // Track if game started
  const [gameOver, setGameOver] = useState(false); // Track if game is over 
  const [userCoins, setUserCoins] = useState<number>(0);
  const [oid, setOid] = useState<string | null>(null);

  // Start game function
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimer(15);
  };


  // Handle fish movement
  useEffect(() => {
    if (gameStarted) {
      const fishMovement = setInterval(() => {
        setFishes((fishes) => fishes.map(() => Math.random() * 300));
      }, 1000);

      return () => clearInterval(fishMovement);
    }
  }, [gameStarted]);

  // Countdown timer
  useEffect(() => {
    if (gameStarted && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setGameOver(true);
      assignRandomReward(); // Give reward on game over
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






    // Assign a random reward
    const assignRandomReward = async () => {
      const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
      Alert.alert(`You caught: ${randomReward}!`, 'You earned 10 coins with it!');
      const updatedCoins = userCoins + 10;
      setUserCoins(updatedCoins);
      await updatePetWallet({ coins: updatedCoins });
    };

  // Handle fishing rod action (catching a fish)
  const handleFishCatch = async (fishIndex: number) => {
    if (!gameOver) {
      setScore((prevScore) => prevScore + 1);
      setFishes((fishes) =>
        fishes.map((fish, index) => (index === fishIndex ? Math.random() * 300 : fish))
      );
      const caughtFishType = rewards[Math.floor(Math.random() * rewards.length)];

      // Add caught item to inventory
      await adjustInventoryItem(caughtFishType, 1);

      // Check achievement
      await checkFishermanAchievement();
    }
    completeTask('Catch fish / Harvest crops once');
  };



  const navigation = useNavigation();
  // Function to handle back button functionality
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
        source={require('../assets/images/fishingBG.jpeg')}
        resizeMode={FastImage.resizeMode.cover}
      />
      {/* Back arrow button in the top-left corner */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
      <Image source={require('../assets/images/back_arrow_icon.png')} style={styles.backIcon} />
      </TouchableOpacity>
      
      {/* Fetch coins using CheckCoin */}
      {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}

      {!gameStarted ? (
        <View style={styles.introContainer}>
          <Text style={styles.introText}>Catch as many fish as you can in 15 seconds!</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start Fishing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
        <View style={styles.upperTextContainer}>
          <Text style={styles.headerText}>Fishing Game</Text>
          <Text style={styles.timerText}>Time Left: {timer} seconds</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

          {fishes.map((fish, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.fish, { left: fish }]}
              onPress={() => handleFishCatch(index)}
            >
              <Image source={fishImages[index % fishImages.length]} style={styles.fishImage} />
            </TouchableOpacity>
          ))}

          {gameOver && <Text style={styles.gameOverText}>Game Over! Your score: {score}</Text>}
        </>
      )}
    </View>
  );

};

export default FishingScreen;

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
  headerText: {
    fontSize: 24,
    fontFamily: 'joystix monospace',
    marginBottom: 10,
    color: 'black',
  },
  timerText: {
    fontSize: 18,
    marginBottom: 10,
    color: 'black',
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'black',
  },
  fish: {
    position: 'absolute',
    bottom: 100,
    width: 90,
    height: 70,
  },
  fishImage: {
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
    backgroundColor: 'transparent',
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  upperTextContainer: {
    position: 'absolute',
    top: 150,
    alignItems: 'center',
    width: '100%',
  },
});