import React, { useState, useEffect } from 'react';
import { getPetStatusValue } from './LocalDataManager';

const GetEnergy = ({ oid, onEnergyFetch }) => {
    const [energy, setEnergy] = useState(0);

    useEffect(() => {
        const fetchEnergy = async () => {
            try {
                const fetchedEnergy = await getPetStatusValue('energy');
                setEnergy(fetchedEnergy);

                if (onEnergyFetch) {
                    onEnergyFetch(fetchedEnergy);
                }
            } catch (error) {
                console.error('Error fetching energy:', error);
            }
        };

        if (oid) {
            fetchEnergy();
        }
    }, [oid, onEnergyFetch]);

    return null; // No UI rendering
};

export default GetEnergy;
