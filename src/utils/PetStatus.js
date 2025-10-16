import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import axios from 'axios';

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

  useEffect(() => {
    const fetchPetStatus = async () => {
      try {
        const response = await axios.post(
          'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/findOne',
          {
            dataSource: "Cluster-1",
            database: "Petiqa",
            collection: "allItems",
            filter: { "_id": { $oid: oid } }, // Use the oid to filter the data
            projection: { energy: 1, happiness: 1, hunger: 1, health: 1 } // Fetch relevant fields
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0' // Use your actual API key
            }
          }
        );

        const petData = response.data.document;
        setEnergy(petData.energy || 0);
        setHappiness(petData.happiness || 0);
        setHunger(petData.hunger || 0);
        setHealth(petData.health || 0);
      } catch (error) {
        console.error('Error fetching pet status', error);
      }
    };

    fetchPetStatus();
  }, [oid]);

  // Function to update pet status in MongoDB
  const updatePetStatus = async (updatedEnergy, updatedHunger, updatedHappiness) => {
    try {
      await axios.post(
        'https://data.mongodb-api.com/app/data-wqzvrvg/endpoint/data/v1/action/updateOne',
        {
          dataSource: "Cluster-1",
          database: "Petiqa",
          collection: "allItems",
          filter: { "_id": { $oid: oid } },
          update: {
            $set: {
              "energy": updatedEnergy,
              "hunger": updatedHunger,
              "happiness": updatedHappiness
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'apiKey': 'MbLpt0MgPLbBLcCTjT9ocdTERiq3rWqEm0DkAwqgm8ITkU4EKeLsb5bLOP4jfdz0'
          }
        }
      );
      console.log('Pet status updated successfully');
    } catch (error) {
      console.error('Error updating pet status', error);
    }
  };

  // Deplete hunger and sleepiness every 30 minutes
  useEffect(() => {
    const petStatusOvertime = setInterval(() => {
      setEnergy(prev => {
        if (prev < 100) {
            const updatedEnergy = Math.max(prev + 5, 0);
            updatePetStatus(updatedEnergy, hunger, happiness); 
            return updatedEnergy;
        }
        return prev;
      });

      setHunger(prev => {
        if (prev > 0) {
            const updatedHunger = Math.max(prev - 5, 0);
            updatePetStatus(energy, updatedHunger, happiness);
            return updatedHunger;
        }
        return prev;
      });

      setHappiness(prev => {
        if (prev > 0) {
            const updatedHappiness = Math.max(prev - 10, 0);
            updatePetStatus(energy, hunger, updatedHappiness);
            return updatedHappiness;
        }
        return prev;
      });
    }, 30 * 1000); // 0.5 minutes in milliseconds

    // Cleanup interval on component unmount
    return () => clearInterval(petStatusOvertime);
  }, [energy, hunger, happiness, oid]);

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
