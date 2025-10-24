import React, {useEffect, useState} from 'react';
import {getInventoryItemQuantity} from './LocalDataManager';

type CheckInsuranceProps = {
  oid?: string | null;
  onItemFetch?: (quantity: number) => void;
};

const CheckInsurance: React.FC<CheckInsuranceProps> = ({oid, onItemFetch}) => {
  const [quantity, setQuantity] = useState<number>(0);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const fetchedItem = await getInventoryItemQuantity('Traveling');
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
  }, [oid, onItemFetch]);

  return null;
};

export default CheckInsurance;
