import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import axios from 'axios';
import { baseUrl } from '../config';

const GetItems = ({ oid, item }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.get(`${baseUrl}petiqa/pet/${oid}/inventory`);
                const inventory = response.data.data;
                const itemData = inventory[item];
                setItem(itemData ? itemData.quantity : 0);
            } catch (error) {
                console.error('Error fetching item:', error);
            }
        };

        if (oid) {
            fetchItem();
        }
    }, [oid, item]);

    return (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{items}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
      alignItems: 'center',
    },
    label: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
    },
    itemText: {
        fontSize: 18,
        fontFamily: 'joystix monospace',
        color: '#000',
        marginLeft: 'auto',
    },
});

export default GetItems;
