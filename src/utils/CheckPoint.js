import React, { useState, useEffect } from 'react';
import { getWalletValue } from './LocalDataManager';

const CheckPoint = ({ oid, onPointFetch }) => {
    const [point, setPoint] = useState(0);

    useEffect(() => {
        const fetchPoint = async () => {
            try {
                const fetchedPoint = await getWalletValue('points');
                setPoint(fetchedPoint);

                if (onPointFetch) {
                    onPointFetch(fetchedPoint);
                }
            } catch (error) {
                console.error('Error fetching point data:', error);
            }
        };

        if (oid) {
            fetchPoint();
        }
    }, [oid, onPointFetch]); // Added onPointFetch to dependencies

    return null; // No UI rendering
};

export default CheckPoint;
