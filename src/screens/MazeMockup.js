
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles';

export default function MazeMockup() {
  return (
    <View style={styles.container}>
      <View style={[styles.card,{alignItems:'center'}]}>
        <Text style={styles.title}>Laberinto (mockup)</Text>
        <View style={{width:'100%',height:360,backgroundColor:'#071129',borderRadius:12,justifyContent:'center',alignItems:'center'}}>
          <View style={{width:40,height:40,borderRadius:20,backgroundColor:'#0ea5a4'}} />
        </View>
        <TouchableOpacity style={[styles.btn,{marginTop:12}]} onPress={()=>alert('Sensores se implementarán en próximos sprints')}>
          <Text style={styles.btnText}>Activar sensores</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
