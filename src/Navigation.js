
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import MazeMockup from './screens/MazeMockup';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{title:'Registro'}} />
      <Stack.Screen name="Home" component={HomeScreen} options={{title:'Inicio'}} />
      <Stack.Screen name="MazeMockup" component={MazeMockup} options={{title:'Laberinto (mockup)'}} />
    </Stack.Navigator>
  );
}
