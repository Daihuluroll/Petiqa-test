import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import axios from 'axios';

// Define  BarRenderer Component
const BarRenderer = ({ value, maxValue, type }) => {
  const width = (value / maxValue) * 100; // Calculate width based on value

  // Bar color logic based on type
  let barColor = '#0F0';
  let labelText = '';
  if (type === 'health') {
    barColor = '#F00';
    labelText = 'Health: ';
  } else if (type === 'hunger') {
    barColor = '#FF0';
    labelText = 'Hunger: ';
  } else if (type === 'energy') {
    barColor = '#00F';
    labelText = 'Energy: ';
  } else if (type === 'sleepiness') {
    barColor = '#AAA';
    labelText = 'Sleepiness: ';
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

// PetBar Component
const PetBar = ({ energy, hunger, sleepiness, health }) => {
  return (
    <View style={styles.container}>
      <BarRenderer value={energy} maxValue={100} type="energy" />
      <BarRenderer value={hunger} maxValue={100} type="hunger" />
      <BarRenderer value={sleepiness} maxValue={100} type="sleepiness" />
      <BarRenderer value={health} maxValue={100} type="health" />
    </View>
  );
};

export default PetBar;

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
