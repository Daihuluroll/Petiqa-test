import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Task: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type DailyTaskScreenProps = StackScreenProps<RootStackParamList, 'Task'>;
declare const DailyTaskScreen: React.FC<DailyTaskScreenProps>;
export default DailyTaskScreen;
