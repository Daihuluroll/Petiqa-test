import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Gym: undefined;
    Cycling: undefined;
};
type CyclingScreenProps = StackScreenProps<RootStackParamList, 'Cycling'>;
declare const CyclingGame: React.FC<CyclingScreenProps>;
export default CyclingGame;
