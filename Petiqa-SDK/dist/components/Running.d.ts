import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Gym: undefined;
    Running: undefined;
};
type RunningScreenProps = StackScreenProps<RootStackParamList, 'Running'>;
declare const RunningMiniGame: React.FC<RunningScreenProps>;
export default RunningMiniGame;
