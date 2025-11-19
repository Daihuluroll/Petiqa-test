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
    Osaka: {
        location: string;
        character: string;
    };
};
type OsakaScreenProps = {
    route: RouteProp<RootStackParamList, 'Osaka'>;
    navigation: StackNavigationProp<RootStackParamList, 'Osaka'>;
};
declare const OsakaScreen: React.FC<OsakaScreenProps>;
export default OsakaScreen;
