import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../../config';
import { AppState } from 'react-native';

const CheckCoin = ({ oid, onCoinFetch, refreshTrigger }) => {
    const [coin, setCoin] = useState(0);
    const appState = useRef(AppState.currentState);

    const fetchCoin = async () => {
        try {
            console.log(`[CheckCoin] Fetching coins for oid: ${oid} from ${baseUrl}petiqa/pet/${oid}/wallet`);
            const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/wallet`);
            console.log('[CheckCoin] Response:', JSON.stringify(response.data));
            
            // Backend wraps response in { data: {...} }
            let fetchedCoin = 0;
            if (response.data && response.data.data && response.data.data.coins !== undefined) {
                fetchedCoin = response.data.data.coins;
            } else if (response.data && response.data.coins !== undefined) {
                fetchedCoin = response.data.coins;
            }
            
            console.log(`[CheckCoin] Fetched coin value: ${fetchedCoin}`);
            setCoin(fetchedCoin);

            if (onCoinFetch) {
                onCoinFetch(fetchedCoin);
            }
        } catch (error) {
            console.error('[CheckCoin] Error fetching coin data:', error.message);
            if (error.response) {
                console.error('[CheckCoin] Response data:', error.response.data);
                console.error('[CheckCoin] Response status:', error.response.status);
            }
        }
    };

    useEffect(() => {
        if (oid) {
            fetchCoin();
        }
    }, [oid, onCoinFetch, refreshTrigger]);

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
            // App has come to foreground - refetch coins
            console.log('[CheckCoin] App came to foreground, refetching coins');
            fetchCoin();
        }
        appState.current = nextAppState;
    };

    return null; // No UI rendering
};

export default CheckCoin;