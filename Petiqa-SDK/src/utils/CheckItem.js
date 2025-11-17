import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';

const CheckItem = ({ oid, item, onItemFetch }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/inventory`);
                const inventory = response.data.data;
                const fetchedItem = inventory[item] ? inventory[item].quantity : 0;
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
