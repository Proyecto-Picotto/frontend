import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles';
import { apiLogin } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({navigation}) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const onLogin = async () => {
    if(!email || !password){
      return Alert.alert('Error','Completa todos los campos');
    }

    try{
      setLoading(true);
      setErrorMessage(null);
      const res = await apiLogin({ email, password });
      console.log('apiLogin response', res);
      if(res && res.token){
        // Guardar token y usuario para uso posterior
        try{
          await AsyncStorage.setItem('token', res.token);
          await AsyncStorage.setItem('user', JSON.stringify(res.user));
        }catch(e){
          console.error('Error saving token', e);
        }
        navigation.replace('Home', { user: res.user });
      } else {
        // Mostrar error de forma visual en la pantalla
        const msg = (res && (res.error || res.message)) || 'Login fallido';
        setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    }catch(e){
      console.error('login error', e);
      setErrorMessage(e.message || String(e));
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {errorMessage ? (
          <Text style={{color:'crimson', textAlign:'center', marginTop:8}}>{errorMessage}</Text>
        ) : null}
        <TouchableOpacity style={styles.btn} onPress={onLogin}>
          <Text style={styles.btnText}>{loading ? 'Ingresando...' : 'Ingresar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('Register')} style={{marginTop:10}}>
          <Text style={{textAlign:'center'}}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
