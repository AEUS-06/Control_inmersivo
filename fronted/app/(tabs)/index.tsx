import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import FallingStars from '../../components/FallingStars';

const AURORA_COLORS = [
    '#ff003c',
    '#ff7a00',
    '#ffd500',
    '#00ff9d',
    '#0cd144',
    '#7a5cff',
    '#ff4fd8',
];

const MIXED_COLORS = [
    '#ff003c',
    '#ff7a00',
    '#ffd500',
    '#ff4fd8',
    '#00cfff',
    '#7a5cff',
    '#00ffcc',
];

export default function Index() {
    const router = useRouter();

    /* ───────── AUDIO ───────── */
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        const loadSound = async () => {
            await Audio.setAudioModeAsync({
                shouldDuckAndroid: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/tap.wav'),
                { volume: 1.0 }
            );

            soundRef.current = sound;
        };

        loadSound();

        return () => {
            soundRef.current?.unloadAsync();
        };
    }, []);

    const playSound = async () => {
        if (!soundRef.current) return;
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
    };

    /* ───────── AURORA ───────── */
    const particles = useRef<any[]>([]);
    const [, forceUpdate] = useState(0);
    const auroraAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(auroraAnim, {
                toValue: 1,
                duration: 10000,
                useNativeDriver: false,
            })
        ).start();
    }, []);

    const auroraColor = auroraAnim.interpolate({
        inputRange: AURORA_COLORS.map((_, i) => i / (AURORA_COLORS.length - 1)),
        outputRange: AURORA_COLORS,
    });

    const spawnParticles = (
        x: number,
        y: number,
        count: number,
        size: number,
        diamond: boolean
    ) => {
        for (let i = 0; i < count; i++) {
            const anim = new Animated.Value(0);

            particles.current.push({
                id: Math.random(),
                x,
                y,
                anim,
                dx: (Math.random() - 0.5) * 130,
                dy: (Math.random() - 0.5) * 120,
                size,
                diamond,
                color: MIXED_COLORS[Math.floor(Math.random() * MIXED_COLORS.length)],
            });

            Animated.timing(anim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }).start(() => {
                particles.current = particles.current.filter(p => p.anim !== anim);
                forceUpdate(n => n + 1);
            });
        }
        forceUpdate(n => n + 1);
    };

    return (
        <View
            style={styles.container}
            onTouchStart={(e: GestureResponderEvent) => {
                const { locationX, locationY } = e.nativeEvent;
                spawnParticles(locationX, locationY, 8, 10, true);
            }}
            onTouchMove={(e: GestureResponderEvent) => {
                const { locationX, locationY } = e.nativeEvent;
                spawnParticles(locationX, locationY, 3, 6, false);
            }}
        >
            <FallingStars />

            {/* FRANJA SUPERIOR */}
            <Animated.View
                style={[
                    styles.topBar,
                    { backgroundColor: auroraColor },
                ]}
            />

            {/* PARTÍCULAS */}
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
                                ...(p.diamond ? [{ rotate: '45deg' }] : []),
                                {
                                    scale: p.anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 0],
                                    }),
                                },
                            ],
                            opacity: p.anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0],
                            }),
                        },
                    ]}
                />
            ))}

            {/* CENTRO */}
            <View style={styles.center}>
                <Text style={styles.title}>BIENVENIDOS</Text>

                <Pressable
                    style={styles.buttonWrap}
                    onPress={async () => {
                        await playSound();
                        router.push('/home');
                    }}
                >
                    <Animated.View
                        style={[
                            styles.neonRing,
                            {
                                borderColor: auroraColor,
                                shadowColor: auroraColor,
                            },
                        ]}
                    />
                    <View style={styles.buttonCore}>
                        <Text style={styles.buttonText}>INICIAR</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    topBar: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 88,
        opacity: 0.9,
    },

    center: {
        position: 'absolute',
        top: '38%',
        alignSelf: 'center',
        alignItems: 'center',
    },

    title: {
        fontFamily: 'Orbitron',
        fontSize: 27,
        color: '#eaffff',
        letterSpacing: 4,
        marginBottom: 34,
    },

    buttonWrap: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },

    neonRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1.4,
        shadowOpacity: 1,
        shadowRadius: 26,
    },

    buttonCore: {
        width: 94,
        height: 94,
        borderRadius: 47,
        backgroundColor: '#05070b',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        fontFamily: 'Orbitron',
        fontSize: 22,
        letterSpacing: 1,
        color: '#ffffff',
    },

    particle: {
        position: 'absolute',
        borderRadius: 3,
    },
});
