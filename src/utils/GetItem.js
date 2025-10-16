import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import axios from 'axios';

const GetItems = ({ oid, item }) => {
    const [items, setItem] = useState(0);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await axios.post(
                    'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne', {
                        dataSource: "Cluster-1",
                        database: "Petiqa",
                        collection: "allItems",
                        filter: { "_id": { $oid: oid } },
                        projection: { [item]: 1 }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
                        }
                    }
                );
                setItem(response.data.document[item]);
            } catch (error) {
                console.error('', error);
            }
        };

        fetchItem();
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