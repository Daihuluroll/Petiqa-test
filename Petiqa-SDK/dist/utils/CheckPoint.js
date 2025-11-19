import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getRuntimeBaseUrl } from '../setupAxios';
import { joinBasePath } from '../url';

const CheckPoint = ({ oid, onPointFetch }) => {
    const [point, setPoint] = useState(0);

    useEffect(() => {
        const fetchPoint = async () => {
            try {
                const response = await axios.get(joinBasePath(getRuntimeBaseUrl(), `petiqa/pet/${oid}/wallet`));
                const fetchedPoint = response.data.data.points;
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
