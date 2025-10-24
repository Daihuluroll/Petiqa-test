import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getPetData, updatePetStatus } from './LocalDataManager';

// Define BarRenderer Component
const BarRenderer = ({ value, maxValue, type }) => {
  const width = (value / maxValue) * 100; // Calculate width based on value

  // Bar color logic based on type
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
      <Text style={styles.barText}>{labelText}{value.toFixed(0)}</Text>
      <View style={{ ...styles.barBackground, width: '100%' }}>
        <View style={{ ...styles.barFill, backgroundColor: barColor, width: `${width}%` }} />
      </View>
    </View>
  );
};

// PetBar Component with MongoDB data fetching
const PetBarStatus = ({ oid }) => {
  const [energy, setEnergy] = useState(0);
  const [happiness, setHappiness] = useState(0);
  const [hunger, setHunger] = useState(0);
  const [health, setHealth] = useState(0);
  const intervalRef = useRef(null);
  const currentStatsRef = useRef({ energy: 0, hunger: 0, happiness: 0 });

  useEffect(() => {
    const fetchPetStatus = async () => {
      try {
        const petData = await getPetData();
        if (petData) {
          const newEnergy = petData.status.energy || 0;
          const newHappiness = petData.status.happiness || 0;
          const newHunger = petData.status.hunger || 0;
          const newHealth = petData.status.health || 0;
          setEnergy(newEnergy);
          setHappiness(newHappiness);
          setHunger(newHunger);
          setHealth(newHealth);
          currentStatsRef.current = { energy: newEnergy, hunger: newHunger, happiness: newHappiness };
        }
      } catch (error) {
        console.error('Error fetching pet status', error);
      }
    };

    if (oid) {
      fetchPetStatus();
    }
  }, [oid]);

  // Function to update pet status locally
  const updatePetStatusLocal = async (energyDelta, hungerDelta, happinessDelta) => {
    try {
      const petData = await getPetData();
      if (petData) {
        const newEnergy = Math.max(0, Math.min(100, petData.status.energy + energyDelta));
        const newHunger = Math.max(0, Math.min(100, petData.status.hunger + hungerDelta));
        const newHappiness = Math.max(0, Math.min(100, petData.status.happiness + happinessDelta));

        await updatePetStatus({
          energy: newEnergy,
          hunger: newHunger,
          happiness: newHappiness
        });
        console.log('Pet status updated successfully');
      }
    } catch (error) {
      console.error('Error updating pet status', error);
    }
  };

  // Deplete hunger and happiness, regenerate energy every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      // Calculate deltas based on current ref state
      const current = currentStatsRef.current;
      const energyDelta = current.energy < 100 ? 5 : 0;
      const hungerDelta = current.hunger > 0 ? -5 : 0;
      const happinessDelta = current.happiness > 0 ? -10 : 0;

      // Update the database with the deltas
      await updatePetStatusLocal(energyDelta, hungerDelta, happinessDelta);

      // Calculate new values and update ref and local state
      const newEnergy = Math.max(current.energy + energyDelta, 0);
      const newHunger = Math.max(current.hunger + hungerDelta, 0);
      const newHappiness = Math.max(current.happiness + happinessDelta, 0);
      currentStatsRef.current = { energy: newEnergy, hunger: newHunger, happiness: newHappiness };
      setEnergy(newEnergy);
      setHunger(newHunger);
      setHappiness(newHappiness);
    }, 30 * 1000); // 30 seconds in milliseconds

    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [oid]); // Remove dependencies to prevent re-setting interval

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
