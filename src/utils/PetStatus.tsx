import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {getPetData, updatePetStatus} from './LocalDataManager';
import type {PetStatus} from './LocalDataManager';

type StatusType = 'health' | 'happiness' | 'energy' | 'hunger';

type BarRendererProps = {
  value: number;
  maxValue: number;
  type: StatusType;
};

const BarRenderer: React.FC<BarRendererProps> = ({value, maxValue, type}) => {
  const width = (value / maxValue) * 100;

  let barColor = '#0F0';
  let labelText = '';
  if (type === 'health') {
    barColor = '#F00';
    labelText = 'Health: ';
  } else if (type === 'happiness') {
    barColor = '#FF0';
    labelText = 'Happiness: ';
  } else if (type === 'energy') {
    barColor = '#00F';
    labelText = 'Energy: ';
  } else if (type === 'hunger') {
    barColor = '#AAA';
    labelText = 'Hunger: ';
  }

  return (
    <View style={styles.barContainer}>
      <Text style={styles.barText}>
        {labelText}
        {value.toFixed(0)}
      </Text>
      <View style={{...styles.barBackground, width: '100%'}}>
        <View
          style={{
            ...styles.barFill,
            backgroundColor: barColor,
            width: `${width}%`,
          }}
        />
      </View>
    </View>
);
};

type PetBarStatusProps = {
  oid?: string | null;
};

const PetBarStatus: React.FC<PetBarStatusProps> = ({oid}) => {
  const [energy, setEnergy] = useState<number>(0);
  const [happiness, setHappiness] = useState<number>(0);
  const [hunger, setHunger] = useState<number>(0);
  const [health, setHealth] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentStatsRef = useRef<Pick<PetStatus, 'energy' | 'happiness' | 'hunger'>>({
    energy: 0,
    happiness: 0,
    hunger: 0,
  });

  useEffect(() => {
    const fetchPetStatus = async () => {
      try {
        const petData = await getPetData();
        if (petData) {
          const {energy: petEnergy = 0, happiness: petHappiness = 0, hunger: petHunger = 0, health: petHealth = 0} = petData.status;
          setEnergy(petEnergy);
          setHappiness(petHappiness);
          setHunger(petHunger);
          setHealth(petHealth);
          currentStatsRef.current = {
            energy: petEnergy,
            happiness: petHappiness,
            hunger: petHunger,
          };
        }
      } catch (error) {
        console.error('Error fetching pet status', error);
      }
    };

    if (oid) {
      fetchPetStatus();
    }
  }, [oid]);

  const updatePetStatusLocal = async (energyDelta: number, hungerDelta: number, happinessDelta: number) => {
    try {
      const petData = await getPetData();
      if (petData) {
        const nextEnergy = Math.max(0, Math.min(100, petData.status.energy + energyDelta));
        const nextHunger = Math.max(0, Math.min(100, petData.status.hunger + hungerDelta));
        const nextHappiness = Math.max(0, Math.min(100, petData.status.happiness + happinessDelta));

        await updatePetStatus({
          energy: nextEnergy,
          hunger: nextHunger,
          happiness: nextHappiness,
        });
      }
    } catch (error) {
      console.error('Error updating pet status', error);
    }
  };

  useEffect(() => {
    if (!oid) {
      return;
    }

    intervalRef.current = setInterval(async () => {
      const current = currentStatsRef.current;
      const energyDelta = current.energy < 100 ? 5 : 0;
      const hungerDelta = current.hunger > 0 ? -5 : 0;
      const happinessDelta = current.happiness > 0 ? -10 : 0;

      await updatePetStatusLocal(energyDelta, hungerDelta, happinessDelta);

      const nextEnergy = Math.max(current.energy + energyDelta, 0);
      const nextHunger = Math.max(current.hunger + hungerDelta, 0);
      const nextHappiness = Math.max(current.happiness + happinessDelta, 0);
      currentStatsRef.current = {
        energy: nextEnergy,
        hunger: nextHunger,
        happiness: nextHappiness,
      };
      setEnergy(nextEnergy);
      setHunger(nextHunger);
      setHappiness(nextHappiness);
    }, 30 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [oid]);

  return (
    <View style={styles.container}>
      <BarRenderer value={energy} maxValue={100} type="energy" />
      <BarRenderer value={happiness} maxValue={100} type="happiness" />
      <BarRenderer value={hunger} maxValue={100} type="hunger" />
      <BarRenderer value={health} maxValue={100} type="health" />
    </View>
);
};

export default PetBarStatus;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    top: 70,
    width: '20%',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  barContainer: {
    width: '100%',
    marginBottom: 1,
  },
  barText: {
    marginBottom: 5,
    fontSize: 12,
    color: '#FFF',
    textAlign: 'left',
  },
  barBackground: {
    height: 5,
    backgroundColor: '#555',
    borderRadius: 5,
  },
  barFill: {
    height: 5,
    backgroundColor: '#0F0',
    borderRadius: 5,
  },
});
