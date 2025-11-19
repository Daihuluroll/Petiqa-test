import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRuntimeBaseUrl } from '../setupAxios';
import { joinBasePath } from '../url';

const GetEnergy = ({ oid, onEnergyFetch }) => {
    const [energy, setEnergy] = useState(0);

    useEffect(() => {
        const fetchEnergy = async () => {
            try {
                const response = await axios.get(joinBasePath(getRuntimeBaseUrl(), `petiqa/pet/${oid}/status`));
                const fetchedEnergy = response.data.data.energy;
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
