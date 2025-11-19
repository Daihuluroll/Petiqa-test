import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Travelling: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
    Hollywood: {
        location: string;
        character: string;
    };
    Osaka: {
        location: string;
        character: string;
    };
};
type TravellingScreenProps = StackScreenProps<RootStackParamList, 'Travelling'>;
declare const TravellingScreen: React.FC<TravellingScreenProps>;
export default TravellingScreen;
