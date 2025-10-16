import React, { useEffect, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTaskStatus, completeTask } from '../utils/TaskManager';
import CheckCoin from '../utils/CheckCoin';
import axios from 'axios';

interface TaskStatus {
  [key: string]: boolean;
}

type RootStackParamList = {
  Home: undefined;
  Task: undefined;
  MainGame: { petName: string; character: string };
  CreateName: undefined;
};

type DailyTaskScreenProps = StackScreenProps<RootStackParamList, 'Task'>;

const taskList = [
  'Daily Check in',
  'Feed your pet',
  'Go for walking',
  'Daily quiz',
  'Buy an insurance product',
  'Exercise once at the gym',
  'Go to activity',
  'Go traveling once',
  'Catch fish / Harvest crops once',
  'Give your pet a toy',
  'Check your inventory once',
  'Encounter any random event once',
];

// Helper function to get random tasks
const getRandomTasks = (list: string[], count: number) => {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get the current date in a string format (used for task updates)
const getCurrentDateString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper function to calculate milliseconds until next midnight
const getMillisecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1, // next day
    0, 0, 0 // midnight
  );
  return midnight.getTime() - now.getTime();
};

const DailyTaskScreen: React.FC<DailyTaskScreenProps> = ({ navigation }) => {
  const [dailyTasks, setDailyTasks] = useState<string[]>([]);
  const [dateString, setDateString] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({});
  const [userCoins, setUserCoins] = useState<number>(0);
  const [oid, setOid] = useState<string | null>(null);

  useEffect(() => {
    const loadStatus = async () => {
      const status = await loadTaskStatus();
      setTaskStatus(status);
    };
    loadStatus();
  }, []);

  // Function to load tasks from AsyncStorage
  const loadStoredTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('dailyTasks');
      const storedDate = await AsyncStorage.getItem('taskDate');
      if (storedTasks && storedDate === getCurrentDateString()) {
        setDailyTasks(JSON.parse(storedTasks));
        setDateString(storedDate);
      } else {
        generateAndStoreTasks();
      }
    } catch (e) {
      console.log('Failed to load tasks', e);
    }
  };

  // Function to generate and store new tasks in AsyncStorage
  const generateAndStoreTasks = async () => {
    const newTasks = getRandomTasks(taskList, 5);
    const currentDate = getCurrentDateString();
    setDailyTasks(newTasks);
    setDateString(currentDate);
    try {
      await AsyncStorage.setItem('dailyTasks', JSON.stringify(newTasks));
      await AsyncStorage.setItem('taskDate', currentDate);
      await AsyncStorage.removeItem('taskStatus'); // Reset task completion status for new day
      setTaskStatus({}); // Reset local task status state
    } catch (e) {
      console.log('Failed to save tasks', e);
    }
  };

  // Schedule task update at midnight
  useEffect(() => {
    loadStoredTasks();
    const timeUntilMidnight = getMillisecondsUntilMidnight();
    const timeoutId = setTimeout(() => {
      generateAndStoreTasks();
      setInterval(generateAndStoreTasks, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
    return () => clearTimeout(timeoutId);
  }, []);

  // Function to handle back arrow functionality
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

  const renderTask = ({ item }: { item: string }) => (
    <View style={styles.taskItem}>
           <View style={styles.taskTextContainer}>
        <Text style={styles.taskText}>{item}</Text>
      </View>
      {taskStatus[item] && !taskStatus[`${item}_claimed`] && (
        <TouchableOpacity
          style={styles.rewardButton}
          onPress={() => rewardSystem(item)}
        >
          <Text style={styles.rewardButtonText}>Claim</Text>
        </TouchableOpacity>
      )}
      {taskStatus[`${item}_claimed`] && (
        <TouchableOpacity style={styles.rewardButtonDisabled} disabled>
          <Text style={styles.rewardButtonText}>Claimed</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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


  const updateCoins = async (oid: string, newCoins: number) => {
    try {
      const response = await axios.post(
        'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/updateOne',
        {
          dataSource: "Cluster-1",
          database: "Petiqa",
          collection: "allItems",
          filter: { "_id": { "$oid": oid } }, // Matching document by id
          update: { "$set": { "coins": newCoins } } // Updating the coins field
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

  const rewardSystem = async (taskName: string) => {
    if (taskStatus[taskName] && !taskStatus[`${taskName}_claimed`]) {
      let updatedCoins = userCoins + 15;
      setTaskStatus((prevStatus) => {
        const updatedStatus = { ...prevStatus, [`${taskName}_claimed`]: true };
        AsyncStorage.setItem('taskStatus', JSON.stringify(updatedStatus)); // Persist the updated task status
        return updatedStatus;
      });
      await completeTask(taskName);

      setUserCoins(updatedCoins);
      if (oid) {
        updateCoins(oid, updatedCoins);
      }
    } else {
      Alert.alert('Reward already claimed', 'You have already claimed this reward.');
    }
  };

  return (
    <View style={styles.container}>
      <FastImage 
        style={styles.background} 
        source={require('../assets/images/taskBG.jpeg')} 
        resizeMode={FastImage.resizeMode.cover} 
      />
      <Text style={styles.headerText}>Daily Task</Text>

      {/* Fetch coins using CheckCoin */}
      {oid && <CheckCoin oid={oid} onCoinFetch={setUserCoins} />}

      <View style={styles.taskListContainer}>
        <FlatList
          data={dailyTasks}
          keyExtractor={(item) => item}
          renderItem={renderTask}
        />
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

export default DailyTaskScreen;

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
    marginBottom: 20,
  },
  taskListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    paddingHorizontal: 20,
    maxHeight: 500,

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
  taskItem: {
    backgroundColor: '#FFF',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  taskText: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'joystix monospace',
    resizeMode: 'contain',
  },
  rewardButton: {
    backgroundColor: '#32CD32',
    padding: 5,
    borderRadius: 5,
    resizeMode: 'contain',
  },
  rewardButtonDisabled: {
    backgroundColor: '#A9A9A9',
    padding: 5,
    borderRadius: 5,
  },
  rewardButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'joystix monospace',
  },
});