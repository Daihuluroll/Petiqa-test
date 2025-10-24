import React, {useEffect, useState} from 'react';
import {getWalletValue} from './LocalDataManager';

type CheckPointProps = {
  oid?: string | null;
  onPointFetch?: (points: number) => void;
};

const CheckPoint: React.FC<CheckPointProps> = ({oid, onPointFetch}) => {
  const [point, setPoint] = useState<number>(0);

  useEffect(() => {
    const fetchPoint = async () => {
      try {
        const fetchedPoint = await getWalletValue('points');
        setPoint(fetchedPoint);

        if (onPointFetch) {
          onPointFetch(fetchedPoint);
        }
      } catch (error) {
        console.error('Error fetching point data:', error);
      }
    };

    if (oid) {
      fetchPoint();
    }
  }, [oid, onPointFetch]);

  return null;
};

export default CheckPoint;
