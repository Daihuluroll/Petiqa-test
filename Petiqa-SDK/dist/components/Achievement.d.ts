import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Achievement: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type AchievementScreenProps = StackScreenProps<RootStackParamList, 'Achievement'>;
declare const AchievementScreen: React.FC<AchievementScreenProps>;
export default AchievementScreen;
