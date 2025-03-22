import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Screen/HomeScreen.js';
import EditTimeTable from './Components/EditTimeTable.js';
import StackNavigator from './Navigation/StackNavigator.js';

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
      
  );
}
