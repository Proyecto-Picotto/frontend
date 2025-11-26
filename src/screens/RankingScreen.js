import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles';

// Local mock ranking generation (sin GET/POST)
export default function RankingScreen(){
  const [items, setItems] = useState([]);

  useEffect(()=>{
    // nombres solicitados
    const names = ['rr','tt','q1q','lucas','lucasss','1'];
    // generar puntajes aleatorios entre 100 y 75
    const list = names.map(n => ({ username: n, score: Math.floor(75 + Math.random() * (100 - 75 + 1)) }));
    // ordenar descendente por score
    list.sort((a,b)=> b.score - a.score);
    setItems(list);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Ranking (local)</Text>
        <FlatList
          data={items}
          keyExtractor={(i,idx)=>String(i.username || idx)}
          renderItem={({item, index})=>{
            const name = item.username;
            const score = item.score;
            return (
              <View style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:8}}>
                <Text>{index+1}. {name}</Text>
                <Text>{score}</Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
