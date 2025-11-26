import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { Accelerometer } from "expo-sensors";
import { TouchableOpacity } from "react-native-web";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiSendScore } from '../api';
import { Platform } from 'react-native';

export default function Game({ navigation }) {
  const BOARD_SIZE = 360;
  const BALL_SIZE = 20;

  const ballVel = useRef({ x: 0, y: 0 });
  const accData = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(null);

  const [isPaused, setIsPaused] = useState(false); // Auto-start
  const isPausedRef = useRef(isPaused);
  const victoryRef = useRef(false);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  const mazeMap = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,1],
    [1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1],
  ];

  const cellSize = BOARD_SIZE / mazeMap.length;

  // place ball centered inside cell (1,1)
  const initialPos = {
    x: 1 * cellSize + (cellSize - BALL_SIZE) / 2,
    y: 1 * cellSize + (cellSize - BALL_SIZE) / 2,
  };

  // goal in opposite corner: inner bottom-right cell (len-2, len-2)
  const goalRow = mazeMap.length - 2;
  const goalCol = mazeMap[0].length - 2;
  const goalPos = {
    x: goalCol * cellSize,
    y: goalRow * cellSize,
  };

  const posRef = useRef(initialPos);
  const [ballPos, setBallPos] = useState(initialPos);

  const resetGame = () => {
    ballVel.current = { x: 0, y: 0 };
    posRef.current = { ...initialPos };
    setBallPos({ ...initialPos });
    setSeconds(0);
    setIsPaused(true);
    victoryRef.current = false;

    // Stop timer
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleVictory = async () => {
    if (victoryRef.current) return;
    victoryRef.current = true;
    setIsPaused(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const score = Math.max(1, Math.round(1000 / (seconds + 1)));
      let resp = null;
      if (token) {
        resp = await apiSendScore(token, { score, time: seconds });
      }

      const message = `¡Ganaste! Tiempo: ${seconds}s\nScore: ${score}` + (resp && resp.message ? `\n${resp.message}` : '');
      if (Platform && Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Victoria', message);
      }

      // navegar al ranking si recibimos token
      if (navigation) navigation.navigate('Ranking');
    } catch (err) {
      const msg = err?.message || String(err);
      if (Platform && Platform.OS === 'web') window.alert('Error al enviar score: ' + msg);
      else Alert.alert('Error', 'Error al enviar score: ' + msg);
    }
  };


  // ⌨️ WASD Controls — siempre activos
  useEffect(() => {
    const handleKeyDown = (e) => {
      const speed = 1.5;
      if (e.key === "w" || e.key === "W") { ballVel.current.y -= speed; e.preventDefault(); }
      if (e.key === "s" || e.key === "S") { ballVel.current.y += speed; e.preventDefault(); }
      if (e.key === "a" || e.key === "A") { ballVel.current.x -= speed; e.preventDefault(); }
      if (e.key === "d" || e.key === "D") { ballVel.current.x += speed; e.preventDefault(); }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  // ⏱️ Timer
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);


  // 🎮 Accelerometer (only mobile)
  useEffect(() => {
    Accelerometer.setUpdateInterval(16);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      accData.current = { x, y };
    });

    return () => subscription && subscription.remove();
  }, []);


  // 🎱 Physics Loop
  // Physics loop: use refs for position so keyboard input and accel apply immediately
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const accMult = 0.5;

    const update = () => {
      if (!isPausedRef.current) {
        ballVel.current.x += accData.current.x * accMult;
        ballVel.current.y -= accData.current.y * accMult;

        // Fricción
        ballVel.current.x *= 0.95;
        ballVel.current.y *= 0.95;

        let newX = posRef.current.x + ballVel.current.x;
        let newY = posRef.current.y + ballVel.current.y;

        // Clampar a bordes
        newX = Math.max(0, Math.min(newX, BOARD_SIZE - BALL_SIZE));
        newY = Math.max(0, Math.min(newY, BOARD_SIZE - BALL_SIZE));

        const col = Math.floor((newX + BALL_SIZE / 2) / cellSize);
        const row = Math.floor((newY + BALL_SIZE / 2) / cellSize);

        // Verificar colisión con paredes y meta
        if (row >= 0 && row < mazeMap.length && col >= 0 && col < mazeMap[0].length) {
          // Si llegamos a la meta
          if (row === goalRow && col === goalCol) {
            const goalCenterX = goalCol * cellSize + (cellSize - BALL_SIZE) / 2;
            const goalCenterY = goalRow * cellSize + (cellSize - BALL_SIZE) / 2;
            posRef.current = { x: goalCenterX, y: goalCenterY };
            setBallPos({ x: goalCenterX, y: goalCenterY });
            handleVictory();
          } else if (mazeMap[row][col] === 1) {
            ballVel.current.x *= -0.2;
            ballVel.current.y *= -0.2;
          } else {
            posRef.current = { x: newX, y: newY };
            setBallPos({ x: newX, y: newY });
          }
        } else {
          // fuera de rango, actualizar posición
          posRef.current = { x: newX, y: newY };
          setBallPos({ x: newX, y: newY });
        }
      }

      animationFrameId.current = requestAnimationFrame(update);
    };

    animationFrameId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{seconds}s</Text>

      <View style={styles.board}>
        {mazeMap.map((row, r) =>
          row.map((cell, c) =>
            cell === 1 && (
              <View
                key={`${r}-${c}`}
                style={[
                  styles.wall,
                  { left: c * cellSize, top: r * cellSize, width: cellSize, height: cellSize },
                ]}
              />
            )
          )
        )}

        {/* Goal square */}
        <View
          style={[
            styles.goal,
            { left: goalPos.x, top: goalPos.y, width: cellSize, height: cellSize },
          ]}
        />

        <View
          style={[
            styles.ball,
            { left: ballPos.x, top: ballPos.y, width: BALL_SIZE, height: BALL_SIZE },
          ]}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsPaused(!isPaused)}
      >
        <Text style={styles.buttonText}>{isPaused ? "START" : "PAUSE"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={resetGame}>
        <Text style={styles.buttonText}>RESET</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15 },
  board: { width: 360, height: 360, backgroundColor: "#fff", borderWidth: 3, borderColor: "#000" },
  ball: { position: "absolute", borderRadius: 20, backgroundColor: "red" },
  wall: { position: "absolute", backgroundColor: "black" },
  goal: { position: "absolute", backgroundColor: "yellow", borderWidth: 2, borderColor: '#aa8800' },
  button: { backgroundColor: "#0066ff", padding: 10, width: 120, alignItems: "center", borderRadius: 8 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  timer: { fontSize: 24, fontWeight: "bold" },
});
