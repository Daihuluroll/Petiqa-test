import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../config';

const UseItem = ({ oid, item }) => {
    useEffect(() => {
        const useItem = async () => {
            try {
                const response = await axios.post(`${baseUrl}petiqa/pet/${oid}/inventory/use`, {
                    item: item,
                    quantity: 1,
                    applyEffects: true
                });
                console.log('Item used and status updated:', response.data);
            } catch (error) {
                console.error('Error using item:', error);
            }
        };

        useItem();
    }, [oid, item]);

    return null;
};

export default UseItem;
