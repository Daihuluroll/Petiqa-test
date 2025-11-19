import React from 'react';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
};
type HollywoodScreenProps = {
    route: RouteProp<RootStackParamList, 'Hollywood'>;
    navigation: StackNavigationProp<RootStackParamList, 'Hollywood'>;
};
declare const HollywoodScreen: React.FC<HollywoodScreenProps>;
export default HollywoodScreen;
