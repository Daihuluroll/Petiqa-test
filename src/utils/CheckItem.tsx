import React, {useEffect, useState} from 'react';
import {getInventoryItemQuantity} from './LocalDataManager';

type CheckItemProps = {
  oid?: string | null;
  item: string;
  onItemFetch?: (quantity: number) => void;
};

const CheckItem: React.FC<CheckItemProps> = ({oid, item, onItemFetch}) => {
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await getInventoryItemQuantity(item);
        setQuantity(fetchedItem);

        if (onItemFetch) {
          onItemFetch(fetchedItem);
        }

      } catch (error) {
        console.error('Error fetching item:', error);
      }
    };

    if (oid) {
      fetchItem();
    }
  }, [oid, item, onItemFetch]);

  return null;
};

export default CheckItem;
