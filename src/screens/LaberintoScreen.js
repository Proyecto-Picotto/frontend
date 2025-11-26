import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiSendScore } from '../api';

// Laberinto: Juego de tablero con bola que se mueve por acelerómetro (móvil) o teclado WASD (web)
export default function LaberintoScreen({ navigation }) {
  const winWidth = Dimensions.get('window').width;
  const BOARD_SIZE = Math.min(winWidth - 40, 320);
  const BALL_SIZE = 20;
  const GOAL_SIZE = 35;

  // Estado del juego
  const [ballPos, setBallPos] = useState({
    x: BOARD_SIZE / 2 - BALL_SIZE / 2,
    y: BOARD_SIZE / 2 - BALL_SIZE / 2,
  });
  const ballVel = useRef({ x: 0, y: 0 });
  const [gameRunning, setGameRunning] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Posición meta (esquina inferior derecha)
  const goalPos = {
    x: BOARD_SIZE - GOAL_SIZE - 10,
    y: BOARD_SIZE - GOAL_SIZE - 10,
  };

  // Referencias
  const accelSubRef = useRef(null);
  const rafRef = useRef(null);
  const keysPressed = useRef({});

  // Cargar token y usuario
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const t = await AsyncStorage.getItem('token');
        const u = await AsyncStorage.getItem('user');
        setToken(t);
        if (u) setUser(JSON.parse(u));
        if (!t) {
          Alert.alert('Error', 'Necesitas estar logueado para jugar', [
            { text: 'Aceptar', onPress: () => navigation.replace('Login') },
          ]);
        }
      } catch (e) {
        console.error('Error cargando auth', e);
      }
    };
    loadAuth();
  }, [navigation]);

  // Iniciar juego: acelerómetro (si disponible) + RAF loop
  useEffect(() => {
    if (!token) return;

    setStartTime(Date.now());

    // Intentar cargar acelerómetro (móvil)
    let accelSubscription = null;
    try {
      const { Accelerometer } = require('expo-sensors');
      Accelerometer.setUpdateInterval(50);
      accelSubscription = Accelerometer.addListener((data) => {
        const scale = 0.8;
        ballVel.current.x += data.x * scale;
        ballVel.current.y -= data.y * scale; // invertir Y para que la lógica sea intuitiva
      });
    } catch (e) {
      console.log('Acelerómetro no disponible (web)', e.message);
    }
    accelSubRef.current = accelSubscription;

    // Listener de teclado para web (WASD)
    const handleKeyDown = (e) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        keysPressed.current[e.key.toLowerCase()] = true;
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        keysPressed.current[e.key.toLowerCase()] = false;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // RAF loop: integrar velocidad, clampar, colisiones, actualizar tiempo
    let lastTime = Date.now();
    const gameLoop = () => {
      const now = Date.now();
      const dt = Math.max(0.001, (now - lastTime) / 1000); // delta time en segundos
      lastTime = now;

      // Aplicar entrada de teclado (web fallback)
      const keyAccel = 50; // aceleración por tecla
      if (keysPressed.current.w) ballVel.current.y -= keyAccel * dt;
      if (keysPressed.current.s) ballVel.current.y += keyAccel * dt;
      if (keysPressed.current.a) ballVel.current.x -= keyAccel * dt;
      if (keysPressed.current.d) ballVel.current.x += keyAccel * dt;

      // Integrar velocidad en posición
      let newX = ballPos.x + ballVel.current.x * dt * 100;
      let newY = ballPos.y + ballVel.current.y * dt * 100;

      // Damping (fricción)
      ballVel.current.x *= 0.94;
      ballVel.current.y *= 0.94;

      // Clampar a bordes
      newX = Math.max(0, Math.min(newX, BOARD_SIZE - BALL_SIZE));
      newY = Math.max(0, Math.min(newY, BOARD_SIZE - BALL_SIZE));

      setBallPos({ x: newX, y: newY });

      // Actualizar tiempo transcurrido
      if (gameRunning && startTime) {
        setElapsedMs(Date.now() - startTime);
      }

      // Detectar colisión con meta (distancia entre centros)
      const ballCenterX = newX + BALL_SIZE / 2;
      const ballCenterY = newY + BALL_SIZE / 2;
      const goalCenterX = goalPos.x + GOAL_SIZE / 2;
      const goalCenterY = goalPos.y + GOAL_SIZE / 2;
      const dist = Math.sqrt((ballCenterX - goalCenterX) ** 2 + (ballCenterY - goalCenterY) ** 2);
      if (dist < BALL_SIZE / 2 + GOAL_SIZE / 2) {
        // ¡Ganaste!
        handleVictory(Date.now() - (startTime || Date.now()));
        return;
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (accelSubRef.current) {
        accelSubRef.current.remove();
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, gameRunning, startTime]);

  const handleVictory = async (timeMsTotal) => {
    setGameRunning(false);
    if (accelSubRef.current) accelSubRef.current.remove();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const timeSec = Math.max(0.1, timeMsTotal / 1000);
    // Puntaje: cuanto más rápido, mejor (basado en tiempo inverso)
    const score = Math.max(100, Math.round(50000 / timeSec));

    Alert.alert(
      '¡Victoria!',
      `Tiempo: ${timeSec.toFixed(2)}s\nPuntaje: ${score}`,
      [
        {
          text: 'Aceptar',
          onPress: async () => {
            // Enviar puntaje al backend
            try {
              if (token) {
                await apiSendScore(token, { score, time: timeSec });
              }
            } catch (e) {
              console.error('Error enviando puntaje', e);
            }
            // Ir al ranking
            navigation.replace('Ranking');
          },
        },
      ]
    );
  };

  const handleReset = () => {
    setBallPos({ x: BOARD_SIZE / 2 - BALL_SIZE / 2, y: BOARD_SIZE / 2 - BALL_SIZE / 2 });
    ballVel.current = { x: 0, y: 0 };
    setStartTime(Date.now());
    setElapsedMs(0);
    setGameRunning(true);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <Text style={styles.title}>Laberinto</Text>
        <Text style={styles.timer}>Tiempo: {(elapsedMs / 1000).toFixed(2)}s</Text>
      </View>

      {/* Tablero del juego */}
      <View
        style={[
          styles.board,
          {
            width: BOARD_SIZE,
            height: BOARD_SIZE,
          },
        ]}
      >
        {/* Meta (meta amarilla) */}
        <View
          style={[
            styles.goal,
            {
              width: GOAL_SIZE,
              height: GOAL_SIZE,
              left: goalPos.x,
              top: goalPos.y,
            },
          ]}
        />

        {/* Bola (bola roja) */}
        <View
          style={[
            styles.ball,
            {
              width: BALL_SIZE,
              height: BALL_SIZE,
              left: ballPos.x,
              top: ballPos.y,
            },
          ]}
        />
      </View>

      {/* Controles */}
      <View style={styles.controls}>
        <Text style={styles.controlsText}>
          {Platform.OS === 'web' ? 'Usa WASD para mover' : 'Inclina el dispositivo'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  timer: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  board: {
    borderWidth: 3,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 16,
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#ef4444',
    borderRadius: 999,
  },
  goal: {
    position: 'absolute',
    backgroundColor: '#fde68a',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  controls: {
    marginTop: 20,
    alignItems: 'center',
  },
  controlsText: {
    color: '#e2e8f0',
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#0ea5a4',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
