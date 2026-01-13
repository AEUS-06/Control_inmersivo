import React, { useRef, useState } from 'react';
import {
  Animated,
  GestureResponderEvent,
  StyleSheet,
  View,
} from 'react-native';

const COLORS = [
  '#ff2200',
  '#dede26',
  '#ff5fa2',
  '#00ff9d',
  '#ff8800',
];

type Particle = {
  id: number;
  x: number;
  y: number;
  anim: Animated.Value;
  dx: number;
  dy: number;
  size: number;
  rotate: boolean;
  color: string;
};

export default function AnimatedBackground() {
  const particles = useRef<Particle[]>([]);
  const [, forceUpdate] = useState(0);

  const spawnParticles = (
    x: number,
    y: number,
    count: number,
    size: number,
    rotate: boolean
  ) => {
    for (let i = 0; i < count; i++) {
      const anim = new Animated.Value(0);

      particles.current.push({
        id: Date.now() + Math.random(),
        x,
        y,
        anim,
        dx: (Math.random() - 0.5) * 140,
        dy: (Math.random() - 0.5) * 140,
        size,
        rotate,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });

      Animated.timing(anim, {
        toValue: 1,
        duration: rotate ? 800 : 400,
        useNativeDriver: true,
      }).start(() => {
        particles.current = particles.current.filter(p => p.anim !== anim);
        forceUpdate(n => n + 1);
      });
    }

    forceUpdate(n => n + 1);
  };

  // 💎 ROMBOS AL TOCAR
  const onTouchStart = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    spawnParticles(locationX, locationY, 9, 10, true);
  };

  // ✨ DESTELLOS AL DESLIZAR
  const onTouchMove = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    spawnParticles(locationX, locationY, 2, 6, false);
  };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      pointerEvents="auto"
    >
      {particles.current.map(p => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: p.x,
              top: p.y,
              transform: [
                {
                  translateX: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.dx],
                  }),
                },
                {
                  translateY: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.dy],
                  }),
                },
                {
                  scale: p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
                ...(p.rotate ? [{ rotate: '45deg' }] : []),
              ],
              opacity: p.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 3,
  },
});
