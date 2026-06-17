import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PantallaPrincipal from './PantallaPrincipal.js';
import PantallaNota from './PantallaNota.js';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
<Stack.Screen 
  name="Inicio" 
  component={PantallaPrincipal} 
  options={{ 
    title: 'NoteNote',
    headerStyle: {
      backgroundColor: '#fdd835',
    },
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 20,
    },
  }} 
/>

<Stack.Screen 
  name="Nota" 
  component={PantallaNota} 
  options={{ 
    title: 'Detalle de Nota',
    headerStyle: {
      backgroundColor: '#fdd835',
    },
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 20,
    },
  }} 
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
