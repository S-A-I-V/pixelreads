import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { homeColors, radius } from '../../theme';

const SHIMMER_DURATION_MS = 1200;

/**
 * A reusable shimmer skeleton block.
 * Renders a rounded rectangle that pulses opacity to indicate loading.
 */
export function SkeletonShimmer({ width, height, borderRadius = radius.md, style }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: SHIMMER_DURATION_MS, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: homeColors.border,
  },
});

export default SkeletonShimmer;
