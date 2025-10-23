// AchievementManager.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInventoryItemQuantity } from './LocalDataManager';

export const incrementAppOpenCount = async () => {
  try {
    const currentCount = await AsyncStorage.getItem('appOpenCount');
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
    await AsyncStorage.setItem('appOpenCount', newCount.toString());
    checkVisitPetAchievement(newCount);
  } catch (error) {
    console.error('Error incrementing app open count:', error);
  }
};

export const addVisitedLocation = async (location: string) => {
  try {
    const visitedLocations = await AsyncStorage.getItem('visitedLocations');
    let locations = visitedLocations ? JSON.parse(visitedLocations) : [];
    if (!locations.includes(location)) {
      locations.push(location);
      await AsyncStorage.setItem('visitedLocations', JSON.stringify(locations));
      checkTravelAllLocationsAchievement(locations);
    }
  } catch (error) {
    console.error('Error adding visited location:', error);
  }
};

export const incrementInsuranceUseCount = async () => {
  try {
    const currentCount = await AsyncStorage.getItem('insuranceUseCount');
    const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
    await AsyncStorage.setItem('insuranceUseCount', newCount.toString());
    checkUseInsuranceAchievement(newCount);
  } catch (error) {
    console.error('Error incrementing insurance use count:', error);
  }
};

export const updateStepCount = async (steps: number) => {
  try {
    const currentSteps = await AsyncStorage.getItem('totalSteps');
    const newTotalSteps = currentSteps ? parseInt(currentSteps) + steps : steps;
    await AsyncStorage.setItem('totalSteps', newTotalSteps.toString());
    checkWalkMillionStepsAchievement(newTotalSteps);
  } catch (error) {
    console.error('Error updating step count:', error);
  }
};

const checkVisitPetAchievement = async (count: number) => {
  if (count >= 100) {
    await markAchievementComplete('Missed you!');
  }
  if (count >= 200) {
    await markAchievementComplete('Welcome back!');
  }
  if (count >= 300) {
    await markAchievementComplete('You’re a regular!');
  }
};

const checkTravelAllLocationsAchievement = async (locations: string[]) => {
  const allLocations = ['Hollywood', 'Osaka'];
  if (allLocations.every(location => locations.includes(location))) {
    await markAchievementComplete('Traveller');
  }
};

const checkUseInsuranceAchievement = async (count: number) => {
  if (count >= 10) {
    await markAchievementComplete('Smart Decisions');
  }
  if (count >= 50) {
    await markAchievementComplete('Protected');
  }
  if (count >= 100) {
    await markAchievementComplete('Worry free');
  }
};

const checkWalkMillionStepsAchievement = async (steps: number) => {
  if (steps >= 1000000) {
    await markAchievementComplete('Light walk');
  }
  if (steps >= 2000000) {
    await markAchievementComplete('Heavy walker');
  }
  if (steps >= 3000000) {
    await markAchievementComplete('Marathon runner');
  }
};

const markAchievementComplete = async (achievementName: string) => {
  try {
    const achievements = await AsyncStorage.getItem('achievements');
    if (achievements) {
      const parsedAchievements = JSON.parse(achievements);
      const updatedAchievements = parsedAchievements.map((achievement: any) => {
        if (achievement.achievement === achievementName) {
          return { ...achievement, completed: true };
        }
        return achievement;
      });
      await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    }
  } catch (error) {
    console.error('Error marking achievement complete:', error);
  }
};

export const checkCleanDietAchievement = async () => {
  try {
    const consecutiveCount = await AsyncStorage.getItem('consecutiveFoodCount');
    if (consecutiveCount !== null && parseInt(consecutiveCount) >= 3) {
      await markAchievementComplete('Clean diet');
    }
  } catch (error) {
    console.error('Error checking clean diet achievement:', error);
  }
};

export const checkFishermanAchievement = async () => {
  try {
    const salmon = await getInventoryItemQuantity('Salmon');
    const tuna = await getInventoryItemQuantity('Tuna');
    const shrimp = await getInventoryItemQuantity('Shrimp');
    const crab = await getInventoryItemQuantity('Crab');
    if (salmon > 0 && tuna > 0 && shrimp > 0 && crab > 0) {
      await markAchievementComplete('Fisherman');
    }
  } catch (error) {
    console.error('Error checking fisherman achievement:', error);
  }
};

export const checkFarmerAchievement = async () => {
  try {
    const wheat = await getInventoryItemQuantity('Wheat');
    const cucumber = await getInventoryItemQuantity('Cucumber');
    const onion = await getInventoryItemQuantity('Onion');
    const potato = await getInventoryItemQuantity('Potato');
    if (wheat > 0 && cucumber > 0 && onion > 0 && potato > 0) {
      await markAchievementComplete('Farmer');
    }
  } catch (error) {
    console.error('Error checking farmer achievement:', error);
  }
};

export const checkAccidentProneAchievement = async () => {
  try {
    const lostLuggageEvents = await AsyncStorage.getItem('lostLuggageEvents');
    if (lostLuggageEvents !== null && parseInt(lostLuggageEvents) >= 50) {
      await markAchievementComplete('Accident prone');
    }
  } catch (error) {
    console.error('Error checking accident prone achievement:', error);
  }
};

export const checkDressUpTimeAchievement = async () => {
  try {
    const boughtCosmetics = await AsyncStorage.getItem('boughtCosmetics');
    if (boughtCosmetics !== null && parseInt(boughtCosmetics) > 0) {
      await markAchievementComplete('Dress up time');
    }
  } catch (error) {
    console.error('Error checking dress up time achievement:', error);
  }
};

export const checkQuizAchievements = async () => {
  const perfectScores = await AsyncStorage.getItem('perfectQuizScores');
  if (perfectScores !== null) {
    const count = parseInt(perfectScores);
    
    if (count >= 10) {
      await markAchievementComplete('Student');
    }
    if (count >= 30) {
      await markAchievementComplete('Knowledgeable');
    }
    if (count >= 60) {
      await markAchievementComplete('Quiz Master');
    }
  }
};

export const checkCoinSpendingAchievements = async (coinsSpent: number) => {
  try {
    const totalCoinsSpent = await AsyncStorage.getItem('totalCoinsSpent');
    const newTotalCoinsSpent = totalCoinsSpent ? parseInt(totalCoinsSpent) + coinsSpent : coinsSpent;
    await AsyncStorage.setItem('totalCoinsSpent', newTotalCoinsSpent.toString());

    if (newTotalCoinsSpent >= 10) {
      await markAchievementComplete('Disposable income');
    }
    if (newTotalCoinsSpent >= 20) {
      await markAchievementComplete('Big spender');
    }
    if (newTotalCoinsSpent >= 30) {
      await markAchievementComplete('Coin fountain');
    }
  } catch (error) {
    console.error('Error checking coin spending achievements:', error);
  }
};

export const checkBackInShapeAchievement = async (previousHealthValue: number, currentHealthValue: number) => {
  try {
    // Check if health was below threshold previously
    const wasBelowThreshold = await AsyncStorage.getItem('wasBelowHealthThreshold');

    if (previousHealthValue < 20 && currentHealthValue >= 20 && wasBelowThreshold === 'true') {
      // Health went above 20 after being below it: mark achievement as complete
      const achievements = await AsyncStorage.getItem('achievements');
      if (achievements) {
        const parsedAchievements = JSON.parse(achievements);
        const updatedAchievements = parsedAchievements.map((achievement: any) => {
          if (achievement.achievement === 'Back in shape' && !achievement.completed) {
            achievement.completed = true;
            console.log("Achievement 'Back in shape' completed!");
          }
          return achievement;
        });

        // Update achievements in AsyncStorage
        await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));
        // Reset the flag since achievement is now complete
        await AsyncStorage.removeItem('wasBelowHealthThreshold');
      }
    }

    // If health goes below 20, store the flag for later checking
    if (currentHealthValue < 20) {
      await AsyncStorage.setItem('wasBelowHealthThreshold', 'true');
    }
  } catch (error) {
    console.error('Error checking Back in shape achievement:', error);
  }
};


