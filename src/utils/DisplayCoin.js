import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import axios from 'axios';

const DisplayCoin = ({ oid }) => {
    const [coin, setCoin] = useState(0);

    useEffect(() => {
        const fetchCoin = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { "coins": 1 }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                setCoin(response.data.document.coins);
            } catch (error) {
                console.error('Error fetching coin data:', error);
            }
        };

        fetchCoin();
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