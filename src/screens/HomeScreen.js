import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles';

export default function HomeScreen({navigation, route}) {
  const [user, setUser] = useState(route.params?.user || { username: 'Invitado' });

  useEffect(() => {
    async function loadUser(){
      try{
        const raw = await AsyncStorage.getItem('user');
        if(raw) setUser(JSON.parse(raw));
      }catch(e){
        console.error('Error loading user', e);
      }
    }
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Hola, {user.username}</Text>
        <Text>Selecciona un juego</Text>
        <TouchableOpacity style={[styles.btn,{marginTop:12}]} onPress={()=>navigation.navigate('Laberinto')}>
          <Text style={styles.btnText}>Laberinto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn,{marginTop:12, backgroundColor:'#6366f1'}]} onPress={()=>navigation.navigate('Ranking')}>
          <Text style={styles.btnText}>Ranking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
