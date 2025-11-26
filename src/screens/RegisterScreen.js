import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles';
import { apiRegister } from '../api';

export default function RegisterScreen({navigation}) {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const onRegister = async () => {
    if(!name || !email || !password){
      return Alert.alert('Error','Completa todos los campos');
    }

    try{
      // Envía username en lugar de name
      const res = await apiRegister({ username: name, email, password });
      if(res && res.user){
        Alert.alert('Éxito','Usuario creado');
        navigation.goBack();
      } else {
        Alert.alert('Error', res.error || 'Falló el registro');
      }
    }catch(e){
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        <TextInput placeholder="Nombre" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TouchableOpacity style={styles.btn} onPress={onRegister}>
          <Text style={styles.btnText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
