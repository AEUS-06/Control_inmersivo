import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 25;

export default function FallingStars() {
    const stars = useRef(
        Array.from({ length: STAR_COUNT }).map(() => ({
            x: Math.random() * width,
            anim: new Animated.Value(Math.random()),
            size: Math.random() * 3 + 1,
        }))
    ).current;

    useEffect(() => {
        stars.forEach(star => {
            Animated.loop(
                Animated.timing(star.anim, {
                    toValue: 1,
                    duration: 9000 + Math.random() * 6000,
                    useNativeDriver: true,
                })
            ).start();
        });
    }, []);

    return (
        <View style={StyleSheet.absoluteFill}>
            {stars.map((star, i) => {
                const translateY = star.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, height + 20],
                });

                return (
                    <Animated.View
                        key={i}
                        style={[
                            styles.star,
                            {
                                width: star.size,
                                height: star.size,
                                left: star.x,
                                transform: [{ translateY }],
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    star: {
        position: 'absolute',
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.7)',
    },
});
