import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AppState } from 'react-native';
import { baseUrl } from '../../config';

const CheckPoint = ({ oid, onPointFetch, refreshTrigger }) => {
    const [point, setPoint] = useState(0);
    const appState = useRef(AppState.currentState);

    const fetchPoint = async () => {
        try {
            const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/wallet`);
            const fetchedPoint = response.data.data.points;
            setPoint(fetchedPoint);

            if (onPointFetch) {
                onPointFetch(fetchedPoint);
            }
        } catch (error) {
            console.error('Error fetching point data:', error);
        }
    };

    useEffect(() => {
        if (oid) {
            fetchPoint();
        }
    }, [oid, onPointFetch, refreshTrigger]);

    // Set up app state listener to refetch when app comes back to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [oid]);

    const handleAppStateChange = (nextAppState) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active' &&
            oid
        ) {
            // App has come to foreground - refetch points
            fetchPoint();
        }
        appState.current = nextAppState;
    };

    return null; // No UI rendering
};

export default CheckPoint;
