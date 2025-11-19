import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRuntimeBaseUrl } from '../setupAxios';
import { joinBasePath } from '../url';

const GetPetStatus = ({ oid, onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch }) => {
    const [energy, setEnergy] = useState(0);
    const [happiness, setHappiness] = useState(0);
    const [hunger, setHunger] = useState(0);
    const [health, setHealth] = useState(0);

    useEffect(() => {
        const fetchPetStatus = async () => {
            try {
                const response = await axios.get(joinBasePath(getRuntimeBaseUrl(), `petiqa/pet/${oid}/status`));
                const status = response.data.data;

                setEnergy(status.energy);
                setHappiness(status.happiness);
                setHunger(status.hunger);
                setHealth(status.health);

                if (onEnergyFetch && onHappinessFetch && onHungerFetch && onHealthFetch) {
                    onEnergyFetch(status.energy);
                    onHappinessFetch(status.happiness);
                    onHungerFetch(status.hunger);
                    onHealthFetch(status.health);
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