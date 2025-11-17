import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../config';

const UseItem = ({ oid, item, effects = {} }) => {
    useEffect(() => {
        const useItem = async () => {
            try {
                const payload = {
                    item: item,
                    quantity: 1,
                    applyEffects: true
                };
                if (effects) {
                    payload.inc = effects;
                }
                const response = await axios.post(`${baseUrl}petiqa/pet/${oid}/inventory/use`, payload);
                console.log('Item used and status updated:', response.data);
            } catch (error) {
                
            }
        };

        useItem();
    }, [oid, item, effects]);

    return null;
};

export default UseItem;
