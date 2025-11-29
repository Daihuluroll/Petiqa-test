import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, AppState } from 'react-native';
import axios from 'axios';
import { baseUrl } from '../../config';

const DisplayCoin = ({ oid, refreshTrigger }) => {
    const [coin, setCoin] = useState(0);
    const appState = useRef(AppState.currentState);

    const fetchCoin = async () => {
        try {
            console.log(`[DisplayCoin] Fetching coins for oid: ${oid} from ${baseUrl}petiqa/pet/${oid}/wallet`);
            const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/wallet`);
            console.log('[DisplayCoin] Response:', JSON.stringify(response.data));
            
            // Backend wraps response in { data: {...} }
            let fetchedCoin = 0;
            if (response.data && response.data.data && response.data.data.coins !== undefined) {
                fetchedCoin = response.data.data.coins;
            } else if (response.data && response.data.coins !== undefined) {
                fetchedCoin = response.data.coins;
            }
            
            console.log(`[DisplayCoin] Fetched coin value: ${fetchedCoin}`);
            setCoin(fetchedCoin);
        } catch (error) {
            console.error('[DisplayCoin] Error fetching coin data:', error.message);
            if (error.response) {
                console.error('[DisplayCoin] Response data:', error.response.data);
                console.error('[DisplayCoin] Response status:', error.response.status);
            }
        }
    };

    useEffect(() => {
        if (oid) {
            fetchCoin();
        }
    }, [oid, refreshTrigger]);

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
            console.log('[DisplayCoin] App came to foreground, refetching coins');
            fetchCoin();
        }
        appState.current = nextAppState;
    };

    return (
        <View style={styles.coinContainer}>
            <Text style={styles.coinsText}>Coins: {coin}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    coinContainer: {
      alignItems: 'center',
    },
    label: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
    },
    coinsText: {
      fontSize: 18,
    },
  });

  export default DisplayCoin;