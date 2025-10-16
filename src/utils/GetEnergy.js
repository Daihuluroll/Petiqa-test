import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GetEnergy = ({ oid, onEnergyFetch }) => {
    const [energy, setEnergy] = useState(0);

    useEffect(() => {
        const fetchEnergy = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { "energy": 1 }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                const fetchedEnergy = response.data.document.energy;
                setEnergy(fetchedEnergy);

                if (onEnergyFetch) {
                    onEnergyFetch(fetchedEnergy);
                } 
            } catch (error) {
                console.error('Error fetching coin data:', error);
            }
        };

        fetchEnergy();
    }, [oid, onEnergyFetch]); // Added onCoinFetch to dependencies

    return null; // No UI rendering
};

export default GetEnergy;