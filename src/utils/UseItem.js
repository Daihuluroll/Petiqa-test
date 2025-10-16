import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UseItem = ({ oid, item }) => {
    useEffect(() => {
        const updateItem = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/updateOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        update: { $inc: { [item]: -1 } }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                console.log('Item deducted:', response.data);
            } catch (error) {
                console.error('Error deducting item:', error);
            }
        };

        updateItem();
    }, [oid, item]);

    return null;
};

export default UseItem;