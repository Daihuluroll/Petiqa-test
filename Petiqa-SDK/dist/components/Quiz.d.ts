import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Quiz: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type QuizScreenProps = StackScreenProps<RootStackParamList, 'Quiz'>;
declare const QuizScreen: React.FC<QuizScreenProps>;
export default QuizScreen;
