import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckPoint = ({ oid, onPointFetch }) => {
    const [point, setPoint] = useState(0);

    useEffect(() => {
        const fetchPoint = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { "points": 1 }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                const fetchedPoint = response.data.document.points;
                setPoint(fetchedPoint);

                if (onPointFetch) {
                    onPointFetch(fetchedPoint);
                } 
            } catch (error) {
                console.error('Error fetching point data:', error);
            }
        };

        fetchPoint();
    }, [oid, onPointFetch]); // Added onPointFetch to dependencies

    return null; // No UI rendering
};

export default CheckPoint;