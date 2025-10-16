import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckCoin = ({ oid, onCoinFetch }) => {
    const [coin, setCoin] = useState(0);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { "coins": 1 }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                const fetchedCoin = response.data.document.coins;
                setCoin(fetchedCoin);

                if (onCoinFetch) {
                    onCoinFetch(fetchedCoin);
                } 
            } catch (error) {
                console.error('Error fetching coin data:', error);
            }
        };

        fetchCoin();
    }, [oid, onCoinFetch]); // Added onCoinFetch to dependencies

    return null; // No UI rendering
};

export default CheckCoin;