import React from 'react';
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
    Store: undefined;
    Inventory: undefined;
    Achievement: undefined;
    Activities: undefined;
    Quiz: undefined;
    Task: undefined;
    Gym: undefined;
    StepCounter: undefined;
    Travelling: undefined;
    Weightlifting: undefined;
    Running: undefined;
    Cycling: undefined;
    Farming: undefined;
    Fishing: undefined;
    Hollywood: {
        location: string;
        character: string;
    };
    Osaka: {
        location: string;
        character: string;
    };
};
interface PetiqaGameProps {
    userId?: string;
    apiUrl?: string;
    petName?: string;
    character?: string;
}
declare const App: React.FC<PetiqaGameProps>;
export declare const PetiqaGame: React.FC<PetiqaGameProps>;
export default App;
