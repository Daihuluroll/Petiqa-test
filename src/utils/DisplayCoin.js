import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getWalletValue } from './LocalDataManager';

const DisplayCoin = ({ oid }) => {
    const [coin, setCoin] = useState(0);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const fetchedCoin = await getWalletValue('coins');
                setCoin(fetchedCoin);
            } catch (error) {
                console.error('Error fetching coin data:', error);
            }
        };

        if (oid) {
            fetchCoin();
        }
    }, [oid]);

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