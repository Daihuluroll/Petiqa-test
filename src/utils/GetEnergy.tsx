import React, {useEffect, useState} from 'react';
import {getPetStatusValue} from './LocalDataManager';

type GetEnergyProps = {
  oid?: string | null;
  onEnergyFetch?: (energy: number) => void;
};

const GetEnergy: React.FC<GetEnergyProps> = ({oid, onEnergyFetch}) => {
  const [energy, setEnergy] = useState<number>(0);

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const fetchedEnergy = await getPetStatusValue('energy');
        setEnergy(fetchedEnergy);

        if (onEnergyFetch) {
          onEnergyFetch(fetchedEnergy);
        }
      } catch (error) {
        console.error('Error fetching energy:', error);
      }
    };

    if (oid) {
      fetchEnergy();
    }
  }, [oid, onEnergyFetch]);

  return null;
};

export default GetEnergy;
