import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getInventoryItemQuantity } from './LocalDataManager';

const GetItems = ({ oid, item }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const quantity = await getInventoryItemQuantity(item);
                setItem(quantity);
            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        if (oid) {
            fetchItem();
        }
    }, [oid, item]);

    return (
        <Text style={styles.itemQuantityNumber}>{items}</Text>
    );
};

const styles = StyleSheet.create({
    itemQuantityNumber: {
        fontSize: 16,
        fontFamily: 'joystix monospace',
        color: '#000',
        marginLeft: 4,
    },
});

export default GetItems;
