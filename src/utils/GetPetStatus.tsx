import React, {useEffect, useState} from 'react';
import {getPetData} from './LocalDataManager';

type GetPetStatusProps = {
  oid?: string | null;
  onEnergyFetch?: (energy: number) => void;
  onHappinessFetch?: (happiness: number) => void;
  onHungerFetch?: (hunger: number) => void;
  onHealthFetch?: (health: number) => void;
};

const GetPetStatus: React.FC<GetPetStatusProps> = ({
  oid,
  onEnergyFetch,
  onHappinessFetch,
  onHungerFetch,
  onHealthFetch,
}) => {
  const [energy, setEnergy] = useState<number>(0);
  const [happiness, setHappiness] = useState<number>(0);
  const [hunger, setHunger] = useState<number>(0);
  const [health, setHealth] = useState<number>(0);

  useEffect(() => {
    const fetchPetStatus = async () => {
      try {
        const petData = await getPetData();
        if (petData) {
          const {energy: petEnergy, happiness: petHappiness, hunger: petHunger, health: petHealth} =
            petData.status;

          setEnergy(petEnergy);
          setHappiness(petHappiness);
          setHunger(petHunger);
          setHealth(petHealth);

          if (onEnergyFetch) {
            onEnergyFetch(petEnergy);
          }
          if (onHappinessFetch) {
            onHappinessFetch(petHappiness);
          }
          if (onHungerFetch) {
            onHungerFetch(petHunger);
          }
          if (onHealthFetch) {
            onHealthFetch(petHealth);
          }
        }
      } catch (error) {
        console.error('Error fetching pet status:', error);
      }
    };

    if (oid) {
      fetchPetStatus();
    }
  }, [oid, onEnergyFetch, onHappinessFetch, onHungerFetch, onHealthFetch]);

  return null;
};

export default GetPetStatus;
