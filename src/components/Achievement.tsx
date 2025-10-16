import React, { useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckPoint from '../utils/CheckPoint';
import axios from 'axios';

type RootStackParamList = {
  Home: undefined;
  Achievement: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type AchievementScreenProps = StackScreenProps<RootStackParamList, 'Achievement'>;

interface Achievement {
  achievement: string;
  description: string;
  completed: boolean;
  reward: number;
  checkCompletion: () => Promise<boolean>;
  threshold?: number;
}

const achievementsList: Achievement[] = [
  { 
    achievement: 'Missed you!', 
    description: 'Visit your pet 100 times',
    completed: false, 
    reward: 10,
    threshold: 100,
    checkCompletion: async () => {
      const visits = await AsyncStorage.getItem('petVisits');
      return visits !== null && parseInt(visits) >= 100;
    }
  },
  { 
    achievement: 'Welcome back!', 
    description: 'Visit your pet 200 times',
    completed: false, 
    reward: 20,
    threshold: 200,
    checkCompletion: async () => {
      const visits = await AsyncStorage.getItem('petVisits');
      return visits !== null && parseInt(visits) >= 200;
    }
  },
  { 
    achievement: 'You’re a regular!', 
    description: 'Visit your pet 300 times',
    completed: false, 
    reward: 30,
    threshold: 300,
    checkCompletion: async () => {
      const visits = await AsyncStorage.getItem('petVisits');
      return visits !== null && parseInt(visits) >= 300;
    }
  },
  { 
    achievement: 'Traveller', 
    description: 'Visit all travel locations',
    completed: false, 
    reward: 10,
    checkCompletion: async () => {
      const visitedLocations = await AsyncStorage.getItem('visitedLocations');
      const allLocations = ['Hollywood', 'Osaka']; // Add all your locations here
      return visitedLocations !== null && 
             JSON.parse(visitedLocations).length === allLocations.length;
    }
  },
  { 
    achievement: 'Smart Decisions', 
    description: 'Use any insurance 10 times',
    completed: false, 
    reward: 20,
    checkCompletion: async () => {
      const insuranceUses = await AsyncStorage.getItem('insuranceUses');
      return insuranceUses !== null && parseInt(insuranceUses) >= 10;
    }
  },
  { 
    achievement: 'Protected', 
    description: 'Use any insurance 50 times',
    completed: false, 
    reward: 30,
    checkCompletion: async () => {
      const insuranceUses = await AsyncStorage.getItem('insuranceUses');
      return insuranceUses !== null && parseInt(insuranceUses) >= 50;
    }
  },
  { 
    achievement: 'Worry free', 
    description: 'Use any insurance 100 times',
    completed: false, 
    reward: 40,
    checkCompletion: async () => {
      const insuranceUses = await AsyncStorage.getItem('insuranceUses');
      return insuranceUses !== null && parseInt(insuranceUses) >= 100;
    }
  },
  { 
    achievement: 'Light walk', 
    description: 'Walk 1,000,000 steps',
    completed: false, 
    reward: 20,
    checkCompletion: async () => {
      const steps = await AsyncStorage.getItem('totalSteps');
      return steps !== null && parseInt(steps) >= 1000000;
    }
    
  },
  { 
    achievement: 'Heavy walker',
    description: 'Walk 2,000,000 steps',
    completed: false, 
    reward: 30,
    checkCompletion: async () => {
      const steps = await AsyncStorage.getItem('totalSteps');
      return steps !== null && parseInt(steps) >= 2000000;
    }
  },
  { 
    achievement: 'Marathon runner',
    description: 'Walk 3,000,000 steps',
    completed: false, 
    reward: 40,
    checkCompletion: async () => {
      const steps = await AsyncStorage.getItem('totalSteps');
      return steps !== null && parseInt(steps) >= 3000000;
    }
  },
  {
    achievement: 'Clean diet',
    description: 'Eat healthy foods 10 times in a row',
    completed: false,
    reward: 10,
    checkCompletion: async () => {
      const consecutiveCount = await AsyncStorage.getItem('consecutiveFoodCount');
      return consecutiveCount !== null && parseInt(consecutiveCount) >= 3;
    }
  },
  { 
    achievement: 'Fisherman', 
    description: 'Caught all types of fish',
    completed: false, 
    reward: 10,
    checkCompletion: async () => {
      const caughtFish = await AsyncStorage.getItem('caughtFish');
      const allFishTypes = ['Salmon', 'Tuna', 'Shrimp', 'Crab']; // Replace with actual fish types
      return caughtFish !== null && 
             allFishTypes.every(type => JSON.parse(caughtFish).includes(type));
    }
  },
  { 
    achievement: 'Farmer', 
    description: 'Harvested every type of crop',
    completed: false, 
    reward: 10,
    checkCompletion: async () => {
      const harvestedCrops = await AsyncStorage.getItem('harvestedCrops');
      const allCropTypes = ['Wheat', 'Cucumber', 'Onion', 'Potato']; // Replace with actual crop types
      return harvestedCrops !== null && 
             allCropTypes.every(type => JSON.parse(harvestedCrops).includes(type));
    }
  },
  { 
    achievement: 'Accident prone', 
    description: 'Encountered 50 bad random events',
    completed: false, 
    reward: 30,
    checkCompletion: async () => {
      const lostLuggageEvents = await AsyncStorage.getItem('lostLuggageEvents');
      return lostLuggageEvents !== null && parseInt(lostLuggageEvents) >= 50;
    }
  },
  { 
    achievement: 'Dress up time', 
    description: 'Buy any cosmetic item for the first time',
    completed: false, 
    reward: 10,
    checkCompletion: async () => {
      const boughtCosmetics = await AsyncStorage.getItem('boughtCosmetics');
      return boughtCosmetics !== null && parseInt(boughtCosmetics) > 0;
    }
  },
  { 
    achievement: 'Student', 
    description: 'Get full marks on the quiz 10 times',
    completed: false, 
    reward: 10,
    checkCompletion: async () => {
      const perfectScores = await AsyncStorage.getItem('perfectQuizScores');
      return perfectScores !== null && parseInt(perfectScores) >= 10;
    }
  },
  { 
    achievement: 'Knowledgeable', 
    description: 'Get full marks on the quiz 30 times',
    completed: false, 
    reward: 20,
    checkCompletion: async () => {
      const perfectScores = await AsyncStorage.getItem('perfectQuizScores');
      return perfectScores !== null && parseInt(perfectScores) >= 30;
    }
  },
  { 
    achievement: 'Quiz Master', 
    description: 'Get full marks on the quiz 60 times',
    completed: false, 
    reward: 30,
    checkCompletion: async () => {
      const perfectScores = await AsyncStorage.getItem('perfectQuizScores');
      return perfectScores !== null && parseInt(perfectScores) >= 60;
    }
  },
  { 
    achievement: 'Disposable income', 
    description: 'Spend 10,000 coins',
    completed: false, 
    reward: 10,
    checkCompletion: async () => {
      const totalCoinsSpent = await AsyncStorage.getItem('totalCoinsSpent');
      return totalCoinsSpent !== null && parseInt(totalCoinsSpent) >= 10000;
    }
  },
  { 
    achievement: 'Big spender', 
    description: 'Spend 20,000 coins',
    completed: false, 
    reward: 20,
    checkCompletion: async () => {
      const totalCoinsSpent = await AsyncStorage.getItem('totalCoinsSpent');
      return totalCoinsSpent !== null && parseInt(totalCoinsSpent) >= 20000;
    }
  },
  { 
    achievement: 'Coin fountain', 
    description: 'Spend 30,000 coins',
    completed: false, 
    reward: 30,
    checkCompletion: async () => {
      const totalCoinsSpent = await AsyncStorage.getItem('totalCoinsSpent');
      return totalCoinsSpent !== null && parseInt(totalCoinsSpent) >= 30000;
    }
  },
  {
    achievement: 'Back in shape', 
    description: 'Got your pet back to healthy shape from fat',
    completed: false, 
    reward: 10, // You can set any reward value you prefer
    checkCompletion: async () => {
      // Logic will be handled by AchievementManager
      return false; // default to false; it will be updated dynamically
    }
  },
];

const AchievementScreen: React.FC<AchievementScreenProps> = ({ navigation }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsList);
  const [oid, setOid] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0); // New state for user's points


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

  const updatePoints = async (oid: string, newPoints: number) => {
    try {
      const response = await axios.post(
        'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/updateOne',
        {
          dataSource: "Cluster-1",
          database: "Petiqa",
          collection: "allItems",
          filter: { "_id": { "$oid": oid } }, // Matching document by id
          update: { "$set": { "points": newPoints } } // Updating the coins field
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
          }
        }
      );
      
      console.log('Coins updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating coins:', error);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const storedAchievements = await AsyncStorage.getItem('achievements');
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      } else {
        checkAchievements();
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const checkAchievements = async () => {
    const updatedAchievements = await Promise.all(
      achievements.map(async (achievement) => {
        const completed = await achievement.checkCompletion();
  
        // If the achievement is newly completed, add reward coins
        if (completed && !achievement.completed) {
          await updateReward(achievement.reward);
        }
  
        return { ...achievement, completed };
      })
    );
  
    setAchievements(updatedAchievements);
    await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));
  };
  

  const updateReward = async (reward: number) => {
    const updatedPoints = userPoints + reward;
    setUserPoints(updatedPoints);
    if (oid) {
      updatePoints(oid, updatedPoints);
    }
  };
  

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

  return (
    <View style={styles.container}>
      <FastImage 
        style={styles.background} 
        source={require('../assets/images/mainMenuBG2.jpeg')} 
        resizeMode={FastImage.resizeMode.cover} 
      />
      <View style={styles.achievementBox}>
        <Text style={styles.headerText}>Achievement</Text>

        {oid && <CheckPoint oid={oid} onPointFetch={setUserPoints} />}

        <FastImage
          source={require('../assets/images/achievement.png')}
          style={styles.trophyIcon}
          resizeMode={FastImage.resizeMode.contain}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.achievementListContainer}>
          {achievements.map((item, index) => (
            <View key={index} style={styles.achievementItem}>
            <View style={styles.textContainer}>
              <Text style={styles.achievementText}>{item.achievement}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>
              {item.completed ? (
                <FastImage
                  source={require('../assets/images/check.png')}
                  style={styles.checkIcon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              ) : (
                <View style={styles.rewardContainer}>
                  <FastImage
                    source={require('../assets/images/Cash.png')}
                    style={styles.coinIcon}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <Text style={styles.rewardText}>{item.reward}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

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
    </View>
  );
};

export default AchievementScreen;

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
  achievementBox: {
    backgroundColor: 'rgba(255, 165, 0, 0.7)', // Light orange transparent background
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'joystix monospace',
    color: 'black',
    marginBottom: 10,
  },
  trophyIcon: {
    width: 40,
    height: 40,
    marginBottom: 20,
  },
  achievementListContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementItem: {
    flexDirection: 'row', // Keep row direction for main container
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to top
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    width: '100%',
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column', // Stack text vertically
    marginRight: 10, // Add some space between text and reward/check
  },
  achievementText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'joystix monospace',
    marginBottom: 4, // Add space between achievement name and description
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center', // Center reward vertically
  },
  checkIcon: {
    width: 25,
    height: 25,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  rewardText: {
    fontSize: 18,
    fontFamily: 'joystix monospace',
    color: '#000',
  },
  backArrowButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  backArrowIcon: {
    width: 30,  // Adjust size of the icon as needed
    height: 30,
  },
  scrollView: {
    width: '100%',
    maxHeight: '70%', // Adjust this value to control the height of the scrollable area
  },
  descriptionText: {
    fontSize: 12,
    color: '#4B4B4B',
    fontFamily: 'joystix monospace',
  },
});
