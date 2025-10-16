import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GetPetStatus = ({ oid, onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch }) => {
    const [energy, setEnergy] = useState(0);
    const [happiness, setHappiness] = useState(0);
    const [hunger, setHunger] = useState(0);
    const [health, setHealth] = useState(0);

    useEffect(() => {
        const fetchPetStatus = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { energy: 1, happiness: 1, hunger: 1, health: 1 }
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
                const fetchedHappiness = response.data.document.happiness;
                const fetchedHunger = response.data.document.hunger;
                const fetchedHealth = response.data.document.health;

                setEnergy(fetchedEnergy);
                setHappiness(fetchedHappiness);
                setHunger(fetchedHunger);
                setHealth(fetchedHealth);

                if (onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch) {
                    onEnergyFetch(fetchedEnergy);
                    onHappinessFetch(fetchedHappiness);
                    onHungerFetch(fetchedHunger);
                    onHealthFetch(fetchedHealth);
                } 
            } catch (error) {
                console.error('Error fetching pet status:', error);
            }
        };

        fetchPetStatus();
    }, [oid, onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch]); // Added onCoinFetch to dependencies

    return null; // No UI rendering
};

export default GetPetStatus;