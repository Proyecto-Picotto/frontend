import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function HomeScreen({navigation, route}) {
  const user = route.params?.user || { username: 'Invitado' };
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Hola, {user.username}</Text>
        <Text>Selecciona un juego</Text>
        <TouchableOpacity style={[styles.btn,{marginTop:12}]} onPress={()=>navigation.navigate('MazeMockup')}>
          <Text style={styles.btnText}>Laberinto (mockup)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
