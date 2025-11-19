import AsyncStorage from '@react-native-async-storage/async-storage';
export const loadTaskStatus = async () => {
    try {
        const status = await AsyncStorage.getItem('taskStatus');
        return status ? JSON.parse(status) : {};
    }
    catch (error) {
        console.error('Error loading task status:', error);
        return {};
    }
};
export const saveTaskStatus = async (status) => {
    try {
        await AsyncStorage.setItem('taskStatus', JSON.stringify(status));
    }
    catch (error) {
        console.error('Error saving task status:', error);
    }
};
export const completeTask = async (taskName) => {
    try {
        // Get current daily tasks
        const dailyTasksString = await AsyncStorage.getItem('dailyTasks');
        if (!dailyTasksString)
            return;
        const dailyTasks = JSON.parse(dailyTasksString);
        // Only proceed if the task is in today's tasks
        if (dailyTasks.includes(taskName)) {
            const currentStatus = await loadTaskStatus();
            const updatedStatus = { ...currentStatus, [taskName]: true };
            await saveTaskStatus(updatedStatus);
        }
    }
    catch (error) {
        console.error('Error completing task:', error);
    }
};
export const resetTasks = async () => {
    try {
        await AsyncStorage.removeItem('taskStatus');
    }
    catch (error) {
        console.error('Error resetting tasks:', error);
    }
};
