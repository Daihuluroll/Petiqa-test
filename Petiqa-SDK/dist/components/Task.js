import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadTaskStatus, completeTask } from '../utils/TaskManager';
import CheckCoin from '../utils/CheckCoin';
import axios from 'axios';
import { baseUrl } from '../config';
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
const getRandomTasks = (list, count) => {
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
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, // next day
    0, 0, 0 // midnight
    );
    return midnight.getTime() - now.getTime();
};
const DailyTaskScreen = ({ navigation }) => {
    const [dailyTasks, setDailyTasks] = useState([]);
    const [dateString, setDateString] = useState(null);
    const [taskStatus, setTaskStatus] = useState({});
    const [userCoins, setUserCoins] = useState(0);
    const [oid, setOid] = useState(null);
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
            }
            else {
                generateAndStoreTasks();
            }
        }
        catch (e) {
            console.log('Failed to load tasks', e);
        }
    };
    // Function to generate and store new tasks in AsyncStorage
    const generateAndStoreTasks = async () => {
        const constantTask = 'Daily Check in';
        const remainingTasks = taskList.filter(task => task !== constantTask);
        const randomTasks = getRandomTasks(remainingTasks, 4);
        const newTasks = [constantTask, ...randomTasks];
        const currentDate = getCurrentDateString();
        setDailyTasks(newTasks);
        setDateString(currentDate);
        try {
            await AsyncStorage.setItem('dailyTasks', JSON.stringify(newTasks));
            await AsyncStorage.setItem('taskDate', currentDate);
            await AsyncStorage.removeItem('taskStatus'); // Reset task completion status for new day
            setTaskStatus({}); // Reset local task status state
        }
        catch (e) {
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
        }
        else {
            navigation.navigate('CreateName');
        }
    };
    const renderTask = ({ item }) => (_jsxs(View, { style: styles.taskItem, children: [_jsx(View, { style: styles.taskTextContainer, children: _jsx(Text, { style: styles.taskText, children: item }) }), taskStatus[item] && !taskStatus[`${item}_claimed`] && (_jsx(TouchableOpacity, { style: styles.rewardButton, onPress: () => rewardSystem(item), children: _jsx(Text, { style: styles.rewardButtonText, children: "Claim" }) })), taskStatus[`${item}_claimed`] && (_jsx(TouchableOpacity, { style: styles.rewardButtonDisabled, disabled: true, children: _jsx(Text, { style: styles.rewardButtonText, children: "Claimed" }) }))] }));
    useEffect(() => {
        const fetchOid = async () => {
            try {
                const storedOid = await AsyncStorage.getItem('oid'); // Assuming 'oid' is the key you stored it under
                if (storedOid !== null) {
                    setOid(storedOid); // Set the oid to state
                }
                else {
                    console.log('No oid found in AsyncStorage');
                }
            }
            catch (error) {
                console.error('Error fetching oid from AsyncStorage:', error);
            }
        };
        fetchOid();
    }, []);
    const updateCoins = async (oid, newCoins, reason) => {
        try {
            const response = await axios.patch(`${baseUrl}petiqa/pet/${oid}/wallet`, {
                set: { coins: newCoins },
                reason: reason,
                metadata: { source: 'task' }
            });
            console.log('Coins updated successfully:', response.data);
        }
        catch (error) {
            console.error('Error updating coins:', error);
        }
    };
    const rewardSystem = async (taskName) => {
        if (taskStatus[taskName] && !taskStatus[`${taskName}_claimed`]) {
            setTaskStatus((prevStatus) => {
                const updatedStatus = { ...prevStatus, [`${taskName}_claimed`]: true };
                AsyncStorage.setItem('taskStatus', JSON.stringify(updatedStatus)); // Persist the updated task status
                return updatedStatus;
            });
            await completeTask(taskName);
            const newCoins = userCoins + 15;
            setUserCoins(newCoins);
            if (oid) {
                updateCoins(oid, newCoins, `Task reward: ${taskName}`);
            }
        }
        else {
            Alert.alert('Reward already claimed', 'You have already claimed this reward.');
        }
    };
    return (_jsxs(View, { style: styles.container, children: [_jsx(FastImage, { style: styles.background, source: require('../../assets/images/taskBG.jpeg'), resizeMode: FastImage.resizeMode.cover }), _jsx(Text, { style: styles.headerText, children: "Daily Task" }), oid && _jsx(CheckCoin, { oid: oid, onCoinFetch: setUserCoins }), _jsx(View, { style: styles.taskListContainer, children: _jsx(FlatList, { data: dailyTasks, keyExtractor: (item) => item, renderItem: renderTask }) }), _jsx(TouchableOpacity, { style: styles.backArrowButton, onPress: handleBackButton, children: _jsx(FastImage, { source: require('../../assets/images/back_arrow_icon.png'), style: styles.backArrowIcon, resizeMode: FastImage.resizeMode.contain }) })] }));
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
