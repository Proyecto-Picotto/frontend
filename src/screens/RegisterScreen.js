import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles';
import { apiRegister } from '../api';

export default function RegisterScreen({navigation}) {
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [lastError, setLastError] = useState(null);

  const onRegister = async () => {
    if(!name || !email || !password){
      return Alert.alert('Error','Completa todos los campos');
    }

    try{
      setLoading(true);
      setLastResponse(null);
      setLastError(null);
      // Envía username en lugar de name
      const res = await apiRegister({ username: name, email, password });
      console.log('apiRegister response', res);
      setLastResponse(res);
      if(res && res.user){
        Alert.alert('Éxito','Usuario creado');
        navigation.goBack();
      } else {
        Alert.alert('Error', JSON.stringify(res) || 'Falló el registro');
      }
    }catch(e){
      console.error('register error', e);
      setLastError(String(e));
      Alert.alert('Error', e.message || String(e));
    } finally {
      setLoading(false);
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
          <Text style={styles.btnText}>{loading ? 'Creando...' : 'Crear cuenta'}</Text>
        </TouchableOpacity>
       
      </View>
    </View>
  );
}
