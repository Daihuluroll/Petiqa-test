import React, { useState, useEffect } from 'react';
import { getInventoryItemQuantity } from './LocalDataManager';

const CheckInsurance = ({ oid, onItemFetch }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const fetchedItem = await getInventoryItemQuantity('Traveling');
                setItem(fetchedItem);

                if (onItemFetch) {
                    onItemFetch(fetchedItem);
                }

            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        if (oid) {
            fetchItem();
        }
    }, [oid, onItemFetch]);

    return null;
};

export default CheckInsurance;