import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getWalletValue } from './LocalDataManager';

const DisplayPoint = ({ oid }) => {
    const [point, setPoint] = useState(0);

    useEffect(() => {
        const fetchPoint = async () => {
            try {
                const fetchedPoint = await getWalletValue('points');
                setPoint(fetchedPoint);
            } catch (error) {
                console.error('Error fetching point data:', error);
            }
        };

        if (oid) {
            fetchPoint();
        }
    }, [oid]);

    return (
        <View style={styles.coinContainer}>
            <Text style={styles.coinsText}>Points: {point}</Text>
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

  export default DisplayPoint;