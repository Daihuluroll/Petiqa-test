import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../config';

const CheckInsurance = ({ oid, onItemFetch }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/inventory`);
                const fetchedItem = response.data.data.Traveling || 0;
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