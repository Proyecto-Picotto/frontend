import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles';
import { apiLogin } from '../api';

export default function LoginScreen({navigation}) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const onLogin = async () => {
    if(!email || !password){
      return Alert.alert('Error','Completa todos los campos');
    }

    try{
      const res = await apiLogin({ email, password });
      if(res && res.token){
        navigation.replace('Home', { user: res.user });
      } else {
        Alert.alert('Error', res.error || 'Login fallido');
      }
    }catch(e){
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <TouchableOpacity style={styles.btn} onPress={onLogin}>
          <Text style={styles.btnText}>Ingresar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('Register')} style={{marginTop:10}}>
          <Text style={{textAlign:'center'}}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
