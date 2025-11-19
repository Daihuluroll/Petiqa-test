import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Gym: undefined;
    Weightlifting: undefined;
};
type WeightliftingScreenProps = StackScreenProps<RootStackParamList, 'Weightlifting'>;
declare const WeightliftingGame: React.FC<WeightliftingScreenProps>;
export default WeightliftingGame;
