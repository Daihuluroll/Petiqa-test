import React, { useState, useEffect } from 'react';
import { getWalletValue } from './LocalDataManager';

const CheckCoin = ({ oid, onCoinFetch }) => {
    const [coin, setCoin] = useState(0);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const fetchedCoin = await getWalletValue('coins');
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