import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Gym: undefined;
    Weightlifting: undefined;
    Running: undefined;
    Cycling: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type GymScreenProps = StackScreenProps<RootStackParamList, 'Gym'>;
declare const GymScreen: React.FC<GymScreenProps>;
export default GymScreen;
