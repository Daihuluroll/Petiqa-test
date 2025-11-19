import React from 'react';
import { StackScreenProps } from '@react-navigation/stack';
type RootStackParamList = {
    Home: undefined;
    Inventory: undefined;
    MainGame: {
        petName: string;
        character: string;
    };
    CreateName: undefined;
};
type InventoryScreenProps = StackScreenProps<RootStackParamList, 'Inventory'>;
declare const InventoryScreen: React.FC<InventoryScreenProps>;
export default InventoryScreen;
