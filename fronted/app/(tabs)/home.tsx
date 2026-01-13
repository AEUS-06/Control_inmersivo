import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    GestureResponderEvent,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import FallingStars from '../../components/FallingStars';

const { width } = Dimensions.get('window');

/* ───────── COLORES ───────── */
const WARM_COLORS = ['#ff4d4d', '#ff8c42', '#ffd93d', '#ff6fd8'];
const COOL_COLORS = ['#00e5ff', '#4d7cff', '#7a5cff'];

export default function Home() {

    /* ───────── AUDIO ───────── */
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadSound = async () => {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/tap.wav')
            );

            if (mounted) soundRef.current = sound;
        };

        loadSound();

        return () => {
            mounted = false;
            soundRef.current?.unloadAsync();
        };
    }, []);

    const playSound = async () => {
        try {
            if (!soundRef.current) return;
            await soundRef.current.setPositionAsync(0);
            await soundRef.current.playAsync();
        } catch (e) {
            console.log('Error sonido', e);
        }
    };

    /* ───────── AURORA ───────── */
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(colorAnim, {
                toValue: 1,
                duration: 8000,
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const rainbowColor = colorAnim.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ['#ff004c', '#ffb300', '#00ffd5', '#5f7cff', '#ff4fd8'],
    });

    /* ───────── PARTÍCULAS ───────── */
    const [particles, setParticles] = useState<any[]>([]);

    const spawnParticle = (
        x: number,
        y: number,
        type: 'warm' | 'cool'
    ) => {
        const id = Math.random().toString();
        const anim = new Animated.Value(0);

        const color =
            type === 'warm'
                ? WARM_COLORS[Math.floor(Math.random() * WARM_COLORS.length)]
                : COOL_COLORS[Math.floor(Math.random() * COOL_COLORS.length)];

        const size = type === 'warm' ? 14 : 6;

        setParticles(p => [...p, { id, x, y, anim, color, type, size }]);

        Animated.timing(anim, {
            toValue: 1,
            duration: type === 'warm' ? 900 : 500,
            useNativeDriver: true,
        }).start(() => {
            setParticles(p => p.filter(pt => pt.id !== id));
        });
    };

    /* ───────── TAP GLOBAL (CUADRADOS) ───────── */
    const onTapScreen = (e: GestureResponderEvent) => {
        const { pageX, pageY } = e.nativeEvent;
        for (let i = 0; i < 6; i++) {
            spawnParticle(
                pageX + Math.random() * 20 - 10,
                pageY + Math.random() * 20 - 10,
                'warm'
            );
        }
    };

    /* ───────── SLIDE (DESTELLOS FRÍOS) ───────── */
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, g) => {
                spawnParticle(g.moveX, g.moveY, 'cool');
            },
        })
    ).current;

    /* ───────── BOTÓN CYBERPUNK ───────── */
    const CyberButton = ({ label }: { label: string }) => {
        const scale = useRef(new Animated.Value(1)).current;

        const onPress = async () => {
            playSound();
            Animated.sequence([
                Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }),
                Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]).start();
        };

        return (
            <Pressable
                onPressIn={playSound}
                onPress={onPress}
            >

                <Animated.View
                    style={[
                        styles.button,
                        { borderColor: rainbowColor, transform: [{ scale }] },
                    ]}
                >
                    <Text style={styles.buttonText}>{label}</Text>
                </Animated.View>
            </Pressable>
        );
    };

    return (
        <View
            style={styles.container}
            {...panResponder.panHandlers}
            onTouchStart={onTapScreen}
        >
            <FallingStars />

            {/* Partículas */}
            {particles.map(p => {
                const translateY = p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.type === 'warm' ? -40 : -20],
                });

                const scale = p.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                });

                const rotate =
                    p.type === 'warm'
                        ? p.anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '45deg'],
                        })
                        : '0deg';

                return (
                    <Animated.View
                        key={p.id}
                        style={[
                            styles.particle,
                            {
                                width: p.size,
                                height: p.size,
                                left: p.x - p.size / 2,
                                top: p.y - p.size / 2,
                                backgroundColor: p.color,
                                transform: [{ translateY }, { scale }, { rotate }],
                            },
                        ]}
                    />
                );
            })}

            <Animated.View style={[styles.topBar, { backgroundColor: rainbowColor }]} />

            <View style={styles.content}>
                <Text style={styles.title}>CONFIGURACIONES</Text>

                <CyberButton label="Sensores de Luz" />
                <CyberButton label="Movimiento Corporal" />
                <CyberButton label="Escenas" />
                <CyberButton label="Calibración" />
                <CyberButton label="Conexión" />
            </View>
        </View>
    );
}

/* ───────── ESTILOS ───────── */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    topBar: {
        height: 88,
        width: '100%',
        position: 'absolute',
        top: 0,
        opacity: 0.85,
    },
    content: {
        marginTop: 140,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        color: '#eaf6ff',
        fontFamily: 'Orbitron',
        letterSpacing: 3,
        marginBottom: 40,
    },
    button: {
        width: width * 0.82,
        paddingVertical: 18,
        marginVertical: 12,
        borderWidth: 2,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    buttonText: {
        color: '#eaf6ff',
        fontSize: 16,
        fontFamily: 'Orbitron',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    particle: {
        position: 'absolute',
        borderRadius: 3,
    },
});
