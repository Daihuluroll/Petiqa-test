import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckItem = ({ oid, item, onItemFetch }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { [item]: 1 }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                const fetchedItem = response.data.document[item]; 
                setItem(fetchedItem);
                
                if (onItemFetch) {
                    onItemFetch(fetchedItem); 
                }

            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        fetchItem();
    }, [oid, item, onItemFetch]);

    return null;
};

export default CheckItem;