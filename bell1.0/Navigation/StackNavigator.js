import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "../Screen/HomeScreen";
import EditTimeTable from "../Components/EditTimeTable";
import CreateTimeTable from "../Components/CreateTimeTable";

const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <>
      <StatusBar style="light" hidden />
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditTimeTable" component={EditTimeTable} options={{ headerShown: false }} />
        <Stack.Screen name="CreateTimeTable" component={CreateTimeTable} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </>
  );
}
