import React, { useState, useEffect } from 'react';
import { getPetData } from './LocalDataManager';

const GetPetStatus = ({ oid, onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch }) => {
    const [energy, setEnergy] = useState(0);
    const [happiness, setHappiness] = useState(0);
    const [hunger, setHunger] = useState(0);
    const [health, setHealth] = useState(0);

    useEffect(() => {
        const fetchPetStatus = async () => {
            try {
                const petData = await getPetData();
                if (petData) {
                    setEnergy(petData.status.energy);
                    setHappiness(petData.status.happiness);
                    setHunger(petData.status.hunger);
                    setHealth(petData.status.health);

                    if (onEnergyFetch && onHappinessFetch && onHungerFetch && onHealthFetch) {
                        onEnergyFetch(petData.status.energy);
                        onHappinessFetch(petData.status.happiness);
                        onHungerFetch(petData.status.hunger);
                        onHealthFetch(petData.status.health);
                    }
                }
            } catch (error) {
                console.error('Error fetching pet status:', error);
            }
        };

        if (oid) {
            fetchPetStatus();
        }
    }, [oid, onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch]);

    return null; // No UI rendering
};

export default GetPetStatus;