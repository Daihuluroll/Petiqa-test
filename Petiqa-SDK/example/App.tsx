import React from 'react';
import { View, Button } from 'react-native';
import { PetiqaGame, PetData } from '../src/index';

const ExampleApp = () => {
  const [showGame, setShowGame] = React.useState(false);

  if (!showGame) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button 
          title="Play Petiqa" 
          onPress={() => setShowGame(true)} 
        />
      </View>
    );
  }

  return (
    <PetiqaGame
      apiBaseUrl="https://your-api-url.com"
      onExit={() => setShowGame(false)}
      onSave={(gameState: PetData) => {
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

export default ExampleApp;