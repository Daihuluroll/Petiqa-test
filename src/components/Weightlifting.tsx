import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';

// Import the background image
const weightBg = require('../assets/images/gymBG.jpeg');

// Define the RootStackParamList
type RootStackParamList = {
  Gym: undefined;
  Weightlifting: undefined;
};

// Define props type for WeightliftingGame screen
type WeightliftingScreenProps = StackScreenProps<RootStackParamList, 'Weightlifting'>;

const WeightliftingGame: React.FC<WeightliftingScreenProps> = ({ navigation }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // High score tracking
  const [isGameOver, setIsGameOver] = useState(false);
  const [windowSize, setWindowSize] = useState(0.2); // Initial window size
  const [progressSpeed, setProgressSpeed] = useState(1500); // Initial speed (slower)
  const [windowPosition, setWindowPosition] = useState(0.4); // Initial window position
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load high score from AsyncStorage
    const loadHighScore = async () => {
      const storedHighScore = await AsyncStorage.getItem('weightliftingHighScore');
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    if (isHolding && !isGameOver) {
      Animated.timing(progress, {
        toValue: 1,
        duration: progressSpeed,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && isHolding) {
          handleGameOver();
        }
      });
    } else {
      progress.stopAnimation();
    }
  }, [isHolding, progressSpeed, isGameOver]);

  const handlePressIn = () => {
    if (isGameOver) return;
    setIsHolding(true);
    progress.setValue(0);
  };

  const handlePressOut = () => {
    if (isGameOver) return;
    setIsHolding(false);
    progress.stopAnimation((value) => {
      // Check if the lift is successful (within the green window)
      const success = value >= windowPosition && value <= windowPosition + windowSize;

      if (success) {
        setScore((prev) => prev + 1);
        setWindowSize((prev) => Math.max(0.05, prev - 0.01)); // Reduce window size
        setProgressSpeed((prev) => Math.max(500, prev - 100)); // Increase speed
        updateWindowPosition();
        progress.setValue(0); // Reset progress bar for next level
      } else {
        handleGameOver();
      }
    });
  };

  const updateWindowPosition = () => {
    const newPosition = Math.random() * (1 - windowSize); // Adjust to ensure window stays within bounds
    setWindowPosition(newPosition);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    updateHighScore();
  };

  const resetGame = () => {
    setScore(0);
    setWindowSize(0.2);
    setProgressSpeed(1500); // Reset to slower speed
    setWindowPosition(0.4);
    setIsGameOver(false);
    progress.setValue(0);
  };

  const updateHighScore = async () => {
    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('weightliftingHighScore', score.toString());
    }
  };

  const backToGym = () => {
    navigation.goBack(); // Simple back action to return to the previous screen
  };

  return (
    <ImageBackground source={weightBg} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Weightlifting Challenge</Text>
        <Text style={styles.scoreText}>Perfect Lifts: {score}</Text>
        {!isGameOver && (
          <>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <View
                style={[
                  styles.targetWindow,
                  {
                    left: `${windowPosition * 100}%`,
                    width: `${windowSize * 100}%`,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={[styles.holdButton, isHolding && styles.holdButtonActive]}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isGameOver}
            >
              <Text style={styles.buttonText}>{isHolding ? 'Lifting...' : 'Hold to Lift'}</Text>
            </TouchableOpacity>
          </>
        )}
        {isGameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Game Over!</Text>
            <Text style={styles.scoreText}>High Score: {highScore}</Text>
            <TouchableOpacity style={styles.backButton} onPress={backToGym}>
              <Text style={styles.backButtonText}>Back To Gym</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(240, 240, 240, 0.2)', // Semi-transparent to let the background show through
  },
  headerText: {
    fontSize: 26,
    marginTop: 105,
    textAlign: 'center',
    color: '#e7d93c', // Set to black
    fontFamily: 'joystix monospace',
  },
  
  scoreText: {
    fontSize: 24,
    marginTop: 28,
    marginRight: 10,
    textAlign: 'center',
    color: '#e74c3c',
    fontFamily: 'joystix monospace',
  },
  progressBarContainer: {
    width: '80%',
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 40,
    alignSelf: 'center',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  targetWindow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 204, 113, 0.5)',
  },
  holdButton: {
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: '#3c94e7',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 160, // Position adjusted
  },
  holdButtonActive: {
    backgroundColor: '#3c94e7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'joystix monospace',
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f70000',
    marginBottom: 20,
    fontFamily: 'joystix monospace',
  },
  backButton: {
    marginTop: 130,
    paddingVertical: 15,
    paddingHorizontal: 30,
    backgroundColor: '#3498db',
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'joystix monospace',
  },
});

export default WeightliftingGame;
