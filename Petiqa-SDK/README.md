# Petiqa SDK

A React Native SDK for integrating the Petiqa game into any React Native application.

## Installation

```bash
# First, install the SDK
npm install ./petiqa-sdk

# Install peer dependencies if you haven't already
npm install @react-native-async-storage/async-storage @react-navigation/native @react-navigation/stack react-native-safe-area-context react-native-screens react-native-gesture-handler
```

## Usage

```typescript
import React from 'react';
import { View, Button } from 'react-native';
import { PetiqaGame } from 'petiqa-sdk';

const YourApp = () => {
  const [showGame, setShowGame] = React.useState(false);

  if (!showGame) {
    return (
      <View>
        <Button 
          title="Play Petiqa" 
          onPress={() => setShowGame(true)} 
        />
      </View>
    );
  }

  return (
    <PetiqaGame
      apiBaseUrl="YOUR_API_URL"
      onExit={() => setShowGame(false)}
      onSave={(gameState) => {
        console.log('Game state saved:', gameState);
      }}
      theme={{
        primary: '#ffff00',
        secondary: '#000000',
        background: '#ffffff',
        text: '#000000',
        button: '#ffff00',
        buttonText: '#000000',
      }}
    />
  );
};

export default YourApp;
```

## Required Setup

1. Make sure your React Native project has React Navigation set up properly:

```javascript
// At the top of your entry file (e.g., App.js or index.js)
import 'react-native-gesture-handler';
```

2. Wrap your app with NavigationContainer if you haven't already:

```typescript
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <YourApp />
    </NavigationContainer>
  );
}
```

## Props

- `apiBaseUrl` (required): URL of your Petiqa backend server
- `onExit` (optional): Callback function when user exits the game
- `onSave` (optional): Callback function when game state is saved
- `theme` (optional): Custom theme object for styling

## Customization

You can customize the appearance using the theme prop:

```typescript
const theme = {
  primary: '#ffff00',    // Primary color
  secondary: '#000000',  // Secondary color
  background: '#ffffff', // Background color
  text: '#000000',      // Text color
  button: '#ffff00',    // Button background color
  buttonText: '#000000' // Button text color
};
```

## Requirements

- React Native >= 0.74.2
- React >= 18.2.0
- @react-navigation/native >= 6.1.0
- @react-navigation/stack >= 6.4.0
- react-native-safe-area-context >= 4.0.0
- react-native-screens >= 3.0.0
- react-native-gesture-handler >= 2.0.0

## Troubleshooting

If you encounter any installation issues:

1. Make sure all peer dependencies are installed
2. Try installing with the --legacy-peer-deps flag:
   ```bash
   npm install ./petiqa-sdk --legacy-peer-deps
   ```
3. Clean your build:
   ```bash
   cd android && ./gradlew clean
   cd ios && pod install
   ```