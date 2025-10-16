import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';

// Import the background image
const runningBackground = require('../assets/images/running_bg.png');

// Define the RootStackParamList
type RootStackParamList = {
  Gym: undefined;
  Running: undefined;
};

// Define props type for RunningMiniGame screen
type RunningScreenProps = StackScreenProps<RootStackParamList, 'Running'>;

const RunningMiniGame: React.FC<RunningScreenProps> = ({ navigation }) => {
  const [timer, setTimer] = useState(20);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [greenZone, setGreenZone] = useState([0.2, 0.35]);
  const [previousGreenZone, setPreviousGreenZone] = useState(0.2);

  const greenZoneSize = 0.15;
  const speed = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSpeed = useRef(0);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsGameOver(true);
      updateHighScore();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer]);

  useEffect(() => {
    const speedListener = speed.addListener(({ value }) => {
      currentSpeed.current = value;
    });

    return () => {
      speed.removeListener(speedListener);
    };
  }, [speed]);

  useEffect(() => {
    const greenZoneInterval = setInterval(() => {
      let newMin;
      do {
        newMin = Math.random() * (1 - greenZoneSize);
      } while (Math.abs(newMin - previousGreenZone) < 0.3);

      setGreenZone([newMin, newMin + greenZoneSize]);
      setPreviousGreenZone(newMin);
    }, 5000);
    return () => clearInterval(greenZoneInterval);
  }, [previousGreenZone]);

  useEffect(() => {
    const loadHighScore = async () => {
      const storedHighScore = await AsyncStorage.getItem('runningHighScore');
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    };
    loadHighScore();
  }, []);

  const handleTap = () => {
    if (isGameOver) return;

    const baseIncrement = 0.15;
    const newSpeed = Math.min(currentSpeed.current + baseIncrement, 1);

    speed.setValue(newSpeed);

    if (newSpeed >= greenZone[0] && newSpeed <= greenZone[1]) {
      setScore((prevScore) => prevScore + 1);
    }

    startMomentumDecay();
  };

  const startMomentumDecay = () => {
    Animated.timing(speed, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  };

  const handleReset = () => {
    setTimer(20);
    setScore(0);
    setIsGameOver(false);
    speed.setValue(0);
  };

  const updateHighScore = async () => {
    if (score > highScore) {
      setHighScore(score);
      await AsyncStorage.setItem('runningHighScore', score.toString());
    }
  };

  const backToGym = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground source={runningBackground} style={styles.backgroundImage}>
      <View style={styles.container}>
        <Text style={styles.headerText}>Sprint Taps</Text>
        <Text style={styles.timerText}>Time: {timer}s</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
        {!isGameOver && (
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
                  bottom: `${greenZone[0] * 100}%`,
                  height: `${greenZoneSize * 100}%`,
                },
              ]}
            />
          </View>
        )}
        <TouchableOpacity
          style={[styles.tapZone, isGameOver && styles.disabledTapZone]}
          onPress={handleTap}
          disabled={isGameOver}
        >
          <Text style={styles.tapZoneText}>{isGameOver ? 'Game Over' : 'Tap to Run!'}</Text>
        </TouchableOpacity>
        {isGameOver && (
          <View style={styles.gameOverContainer}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Add a slight overlay for readability
  },
  headerText: {
    fontSize: 32,
    marginTop: 55,
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
    height: 300,
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
  tapZone: {
    width: '70%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
    borderRadius: 10,
    alignSelf: 'center',
  },
  disabledTapZone: {
    backgroundColor: '#d3d3d3',
  },
  tapZoneText: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'joystix monospace',
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  gameOverText: {
    fontFamily: 'joystix monospace',
    fontSize: 32,

    color: '#e74c3c',
    marginBottom: 20,
    
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
    fontFamily: 'joystix monospace',
    color: '#fff',
  },
});

export default RunningMiniGame;
