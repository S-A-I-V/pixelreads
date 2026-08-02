import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet } from 'react-native';
import { colors, fonts, textSizes, spacing } from '../theme';

/**
 * Pixel-art 3x3 grid blinking loader.
 * Props:
 *   message  string
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  const anims = useRef(
    Array.from({ length: 9 }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 0.1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,   duration: 300, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {anims.map((anim, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
        ))}
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 48,
    gap: 4,
  },
  dot: {
    width: 12,
    height: 12,
    backgroundColor: colors.pinkHot,
  },
  message: {
    fontFamily: fonts.pixel,
    fontSize: textSizes.xxs,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
