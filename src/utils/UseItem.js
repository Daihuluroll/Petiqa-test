import React, { useState, useEffect } from 'react';
import { adjustInventoryItem, adjustPetStatus } from './LocalDataManager';

const UseItem = ({ oid, item }) => {
    useEffect(() => {
        const useItem = async () => {
            try {
                // Define effects for different items (using sharedData values, adjusted for toys)
                const itemEffects = {
                    'Pet Food': { energy: 5, hunger: 20, happiness: 10, health: 20 },
                    'Treats': { energy: 10, hunger: 15, happiness: 15, health: -10 },
                    'Chocolate Cake': { energy: 10, hunger: 15, happiness: 25, health: -20 },
                    'Salad': { energy: 5, hunger: 20, happiness: 5, health: 25 },
                    'Sausage': { energy: 20, hunger: 15, happiness: 20, health: -10 },
                    'Potato Chips': { energy: 5, hunger: 10, happiness: 20, health: -15 },
                    'Pizza': { energy: 20, hunger: 25, happiness: 25, health: -25 },
                    'Fruits': { energy: 15, hunger: 15, happiness: 15, health: 15 },
                    'Gaming Console': { energy: -15, hunger: -5, happiness: 35, health: 0 },
                    'Football': { energy: -20, hunger: -10, happiness: 25, health: 0 },
                    'Piano': { energy: -10, hunger: -5, happiness: 15, health: 0 },
                    'Darts': { energy: -5, hunger: -5, happiness: 10, health: 0 },
                    'Taiko Drum': { energy: -15, hunger: -5, happiness: 20, health: 0 },
                    'Book': { energy: -5, hunger: -5, happiness: 5, health: 0 },
                };

                const effects = itemEffects[item];
                if (effects) {
                    // Apply status effects
                    await adjustPetStatus(effects);
                    // Decrease item quantity
                    await adjustInventoryItem(item, -1);
                    console.log('Item used and status adjusted locally');
                } else {
                    console.log('No effects defined for item:', item);
                }
            } catch (error) {
                console.error('Error using item:', error);
            }
        };

        useItem();
    }, [oid, item]);

    return null;
};

export default UseItem;
