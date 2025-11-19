import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRuntimeBaseUrl } from '../setupAxios';
import { joinBasePath } from '../url';

const CheckCoin = ({ oid, onCoinFetch }) => {
    const [coin, setCoin] = useState(0);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const response = await axios.get(joinBasePath(getRuntimeBaseUrl(), `petiqa/pet/${oid}/wallet`));
                const fetchedCoin = response.data.data.coins;
                setCoin(fetchedCoin);

                if (onCoinFetch) {
                    onCoinFetch(fetchedCoin);
                }
            } catch (error) {
                console.error('Error fetching coin data:', error);
            }
        };

        if (oid) {
            fetchCoin();
        }
    }, [oid, onCoinFetch]);

    return null; // No UI rendering
};

export default CheckCoin;