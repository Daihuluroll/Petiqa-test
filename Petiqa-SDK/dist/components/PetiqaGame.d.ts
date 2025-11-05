import React from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
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
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;
export declare const PetiqaGame: React.FC<PetiqaSDKConfig>;
