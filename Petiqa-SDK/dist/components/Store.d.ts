import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Store: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
};
type StoreScreenProps = StackScreenProps<RootStackParamList, 'Store'>;
declare const StoreScreen: React.FC<StoreScreenProps>;
export default StoreScreen;
