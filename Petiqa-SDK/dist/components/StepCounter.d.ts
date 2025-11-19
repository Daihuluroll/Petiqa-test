import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    StepCounter: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type StepCounterScreenProps = StackScreenProps<RootStackParamList, 'StepCounter'>;
declare const StepCounterScreen: React.FC<StepCounterScreenProps>;
export default StepCounterScreen;
