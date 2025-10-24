import React, {useEffect, useState} from 'react';
import {getWalletValue} from './LocalDataManager';

type CheckCoinProps = {
  oid?: string | null;
  onCoinFetch?: (coins: number) => void;
};

const CheckCoin: React.FC<CheckCoinProps> = ({oid, onCoinFetch}) => {
  const [coin, setCoin] = useState<number>(0);

  useEffect(() => {
    const fetchCoin = async () => {
      try {
        const fetchedCoin = await getWalletValue('coins');
        setCoin(fetchedCoin);

        if (onCoinFetch) {
          onCoinFetch(fetchedCoin);
        }
      } catch (error) {
        console.error('Error fetching coin data:', error);
      }
    };

    if (oid) {
      fetchCoin();
    }
  }, [oid, onCoinFetch]);

  return null;
};

export default CheckCoin;
