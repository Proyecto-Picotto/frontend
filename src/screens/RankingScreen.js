import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGetRanking } from '../api';

export default function RankingScreen(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(()=>{
    async function load(){
      try{
        const token = await AsyncStorage.getItem('token');
        const raw = await AsyncStorage.getItem('user');
        const user = raw ? JSON.parse(raw) : null;
        setMe(user?.username);
        if(!token){
          setError('No estás logueado');
          setLoading(false);
          return;
        }
        const res = await apiGetRanking(token);
        // expecting res.ranking or array
        const list = Array.isArray(res) ? res : (res.ranking || []);
        setItems(list);
      }catch(e){
        console.error('Error loading ranking', e);
        setError(String(e));
      }finally{
        setLoading(false);
      }
    }
    load();
  }, []);

  if(loading) return (
    <View style={styles.container}>
      <View style={styles.card}><ActivityIndicator /></View>
    </View>
  );

  if(error) return (
    <View style={styles.container}>
      <View style={styles.card}><Text style={{color:'crimson'}}>{error}</Text></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Ranking</Text>
        <FlatList
          data={items}
          keyExtractor={(i,idx)=>String(i.username || i.name || idx)}
          renderItem={({item})=>{
            const name = item.username || item.name;
            const score = item.score || item.points || item.puntaje;
            const highlight = me && name === me;
            return (
              <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:8}}>
                <Text style={{fontWeight: highlight? '700':'400'}}>{ name }</Text>
                <Text style={{fontWeight: highlight? '700':'400'}}>{ score }</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
