import React from 'react';
import { PetiqaSDKConfig } from '../types';
export type RootStackParamList = {
    Home: undefined;
    CreateName: undefined;
    PetSelection: {
        petName: string;
    };
    MainGame: {
        petName: string;
        character: string;
    };
};
export declare const PetiqaGame: React.FC<PetiqaSDKConfig>;
