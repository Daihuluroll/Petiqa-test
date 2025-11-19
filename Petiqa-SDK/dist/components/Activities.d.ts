import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Activities: undefined;
    Fishing: undefined;
    Farming: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type ActivitiesScreenProps = StackScreenProps<RootStackParamList, 'Activities'>;
declare const ActivitiesScreen: React.FC<ActivitiesScreenProps>;
export default ActivitiesScreen;
