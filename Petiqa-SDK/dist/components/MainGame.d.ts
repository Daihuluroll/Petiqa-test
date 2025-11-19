import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    CreateName: undefined;
    PetSelection: {
        petName: string;
    };
    MainGame: {
        petName: string;
        character: string;
    };
    Store: undefined;
    Inventory: undefined;
};
type MainMenuProps = StackScreenProps<RootStackParamList, 'MainGame'>;
declare const MainMenu: React.FC<MainMenuProps>;
export default MainMenu;
