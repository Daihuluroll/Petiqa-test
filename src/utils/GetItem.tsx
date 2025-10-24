import React, {useEffect, useState} from 'react';
import {StyleSheet, Text} from 'react-native';
import {getInventoryItemQuantity} from './LocalDataManager';

type GetItemsProps = {
  oid?: string | null;
  item: string;
};

const GetItems: React.FC<GetItemsProps> = ({oid, item}) => {
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedQuantity = await getInventoryItemQuantity(item);
        setQuantity(fetchedQuantity);
      } catch (error) {
        console.error('Error fetching item:', error);
      }
    };

    if (oid) {
      fetchItem();
    }
  }, [oid, item]);

  return <Text style={styles.itemQuantityNumber}>{quantity}</Text>;
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
