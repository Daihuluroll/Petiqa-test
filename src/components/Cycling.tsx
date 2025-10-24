import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Easing,
  ImageBackground,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';

// Correctly import the images for use
const wheelImage = require('../assets/images/wheel.png');
const backgroundImage = require('../assets/images/taskBG.jpeg');

// Define RootStackParamList
type RootStackParamList = {
  Gym: undefined;
  Cycling: undefined;
};

// Define props type for the CyclingGame screen
type CyclingScreenProps = StackScreenProps<RootStackParamList, 'Cycling'>;

const CyclingGame: React.FC<CyclingScreenProps> = ({ navigation }) => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // High score tracking
  const [isGameOver, setIsGameOver] = useState(false);
  const [greenZonePosition, setGreenZonePosition] = useState(0.3); // Initial green zone position
  const [greenZoneSize, setGreenZoneSize] = useState(0.2); // Size of the green zone
  const [timeLeft, setTimeLeft] = useState(20); // Game duration in seconds
  const wheelRotation = useRef(new Animated.Value(0)).current;
  const speed = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSpeed = useRef(0);

  // Setting up panResponder for rotating the wheel
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const normalizedVelocity =
        Math.sqrt(gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy) * 100;
      const reducedRotation = normalizedVelocity / 5;

      Animated.timing(wheelRotation, {
        toValue: reducedRotation * 10,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();

      Animated.timing(speed, {
        toValue: reducedRotation / 100,
        duration: 500, // Increased duration for smoother speed decay
        useNativeDriver: false,
        easing: Easing.out(Easing.quad),
      }).start();
    },
  });

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setIsGameOver(true);
      updateHighScore();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  useEffect(() => {
    // Listener to update currentSpeed whenever speed value changes
    const speedListener = speed.addListener(({ value }) => {
      currentSpeed.current = value;

      if (value >= greenZonePosition && value <= greenZonePosition + greenZoneSize) {
        setScore((prev) => prev + 1);
      }
    });
    return () => speed.removeListener(speedListener);
  }, [greenZonePosition, greenZoneSize]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreenZonePosition(Math.random() * 0.7);
      setGreenZoneSize((prev) => Math.max(0.1, prev - 0.02)); // Decrease green zone size
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load high score from AsyncStorage
    const loadHighScore = async () => {
      const storedHighScore = await AsyncStorage.getItem('cyclingHighScore');
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    };
    loadHighScore();
  }, []);

  const updateHighScore = async () => {
    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('cyclingHighScore', score.toString());
    }
  };

  const resetGame = () => {
    setScore(0);
    setGreenZonePosition(0.3);
    setGreenZoneSize(0.2);
    setTimeLeft(20);
    setIsGameOver(false);
    speed.setValue(0);
    wheelRotation.setValue(0);
  };

  const backToGym = () => {
    navigation.goBack(); // Simple back action to return to the previous screen
  };

  const spinInterpolation = wheelRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <View style={styles.opacityLayer} />
      <View style={styles.container}>
        <Text style={styles.headerText}>Cycling Challenge</Text>
        <Text style={styles.timerText}>Time: {timeLeft}s</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
        {!isGameOver && (
          <>
            {/* Speed Meter Bar at the top */}
            <View style={styles.speedMeterContainer}>
              <Animated.View
                style={[
                  styles.speedIndicator,
                  {
                    height: speed.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <View
                style={[
                  styles.greenZone,
                  {
                    bottom: `${greenZonePosition * 100}%`,
                    height: `${greenZoneSize * 100}%`,
                  },
                ]}
              />
            </View>

            {/* Wheel positioned at the bottom */}
            <View {...panResponder.panHandlers} style={styles.wheelContainer}>
              <Animated.Image
                source={wheelImage}
                style={[
                  styles.wheel,
                  {
                    transform: [
                      {
                        rotate: spinInterpolation,
                      },
                    ],
                  },
                ]}
              />
            </View>
          </>
        )}
        {isGameOver && (
          <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText}>Time's up!</Text>
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
  opacityLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Very light opacity layer
  },
  container: {
    flex: 1,
  },
  headerText: {
    fontSize: 32,
    marginTop: 40,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'joystix monospace',
  },
  timerText: {
    fontSize: 24,
    marginTop: 10,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'joystix monospace',
  },
  scoreText: {
    fontSize: 24,
    marginTop: 10,
    textAlign: 'center',
    color: '#000',
    fontFamily: 'joystix monospace',
  },
  speedMeterContainer: {
    width: '80%',
    height: 350,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 20,
    alignSelf: 'center',
    position: 'relative',
  },
  speedIndicator: {
    width: '100%',
    backgroundColor: '#3498db',
    position: 'absolute',
    bottom: 0,
  },
  greenZone: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(46, 204, 113, 0.5)',
  },
  wheelContainer: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 0,
  },
  wheel: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  gameOverText: {
    fontSize: 32,
    color: '#e74c3c',
    marginBottom: 20,
    fontFamily: 'joystix monospace',
  },
  backButton: {
    marginTop: 20,
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

export default CyclingGame;
