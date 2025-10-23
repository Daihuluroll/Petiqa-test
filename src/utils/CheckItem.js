import React, { useState, useEffect } from 'react';
import { getInventoryItemQuantity } from './LocalDataManager';

const CheckItem = ({ oid, item, onItemFetch }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const fetchedItem = await getInventoryItemQuantity(item);
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
    }, [oid, item, onItemFetch]);

    return null;
};

export default CheckItem;
