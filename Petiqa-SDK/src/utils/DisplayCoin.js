import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import axios from 'axios';
import { baseUrl } from '../config';

const DisplayCoin = ({ oid }) => {
    const [coin, setCoin] = useState(0);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/wallet`);
                setCoin(response.data.data.coins);
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